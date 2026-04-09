import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Cron endpoint: find all due reminders, create notifications, mark as sent. */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const secret = process.env.VAULT_CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const dueReminders = await prisma.vaultReminder.findMany({
    where: {
      reminderDate: { lte: now },
      sentAt: null,
      dismissedAt: null,
    },
    include: {
      document: { select: { label: true, documentType: true, expiryDate: true } },
    },
    take: 100, // Process in batches
  });

  let processed = 0;

  for (const reminder of dueReminders) {
    try {
      await prisma.$transaction([
        prisma.vaultNotification.create({
          data: {
            userId: reminder.userId,
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
      processed++;
    } catch (error) {
      console.error(`[Cron] Failed to process reminder ${reminder.id}:`, error);
    }
  }

  return NextResponse.json({
    processed,
    total: dueReminders.length,
    timestamp: now.toISOString(),
  });
}
