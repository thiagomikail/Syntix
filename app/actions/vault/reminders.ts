"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireDocumentOwnership } from "@/lib/auth-guards";

const ALLOWED_DAYS = [30, 60, 90, 180];

export async function setReminder(documentId: string, daysBefore: number) {
  if (!ALLOWED_DAYS.includes(daysBefore)) {
    throw new Error("Invalid reminder interval");
  }

  const userId = await requireDocumentOwnership(documentId);

  const doc = await prisma.vaultDocument.findUnique({
    where: { id: documentId },
    select: { expiryDate: true },
  });

  if (!doc?.expiryDate) {
    throw new Error("Document has no expiry date");
  }

  // Check tier for non-30-day reminders
  if (daysBefore !== 30) {
    const sub = await prisma.vaultSubscription.findUnique({
      where: { userId },
      select: { tier: true },
    });
    if (!sub || sub.tier === "FREE") {
      throw new Error("TIER_LIMIT_REACHED");
    }
  }

  const reminderDate = new Date(doc.expiryDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);

  await prisma.vaultReminder.upsert({
    where: {
      documentId_daysBefore: { documentId, daysBefore },
    },
    update: { reminderDate, sentAt: null, dismissedAt: null },
    create: { documentId, userId, daysBefore, reminderDate },
  });
}

export async function dismissReminder(reminderId: string) {
  const session = await requireSession();
  await prisma.vaultReminder.updateMany({
    where: { id: reminderId, userId: session.user.id },
    data: { dismissedAt: new Date() },
  });
}

export async function getActiveReminders() {
  const session = await requireSession();
  return prisma.vaultReminder.findMany({
    where: {
      userId: session.user.id,
      dismissedAt: null,
      reminderDate: { lte: new Date() },
    },
    include: {
      document: {
        select: { id: true, label: true, documentType: true, expiryDate: true },
      },
    },
    orderBy: { reminderDate: "asc" },
  });
}

/** Called by check-on-login to process due reminders for current user. */
export async function checkDueReminders() {
  const session = await requireSession();
  const userId = session.user.id;
  const now = new Date();

  const dueReminders = await prisma.vaultReminder.findMany({
    where: {
      userId,
      reminderDate: { lte: now },
      sentAt: null,
      dismissedAt: null,
    },
    include: {
      document: { select: { label: true, documentType: true, expiryDate: true } },
    },
  });

  for (const reminder of dueReminders) {
    await prisma.$transaction([
      prisma.vaultNotification.create({
        data: {
          userId,
          type: "EXPIRY_REMINDER",
          title: `${reminder.document.label} expires soon`,
          body: `Your ${reminder.document.documentType.toLowerCase()} "${reminder.document.label}" expires on ${reminder.document.expiryDate?.toLocaleDateString()}.`,
          refType: "document",
          refId: reminder.documentId,
        },
      }),
      prisma.vaultReminder.update({
        where: { id: reminder.id },
        data: { sentAt: now },
      }),
    ]);
  }

  return dueReminders.length;
}
