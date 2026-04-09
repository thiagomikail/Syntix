"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guards";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function recordConsent(
  consentType: string,
  granted: boolean,
  version: string
) {
  const session = await requireSession();
  await prisma.vaultConsentLog.create({
    data: {
      userId: session.user.id,
      consentType,
      granted,
      version,
    },
  });
}

export async function getConsentStatus(): Promise<boolean> {
  const session = await requireSession();
  const required = ["VAULT_TOS", "DATA_PROCESSING", "CROSS_BORDER_TRANSFER"];

  const consents = await prisma.vaultConsentLog.findMany({
    where: {
      userId: session.user.id,
      consentType: { in: required },
      granted: true,
    },
    select: { consentType: true },
    orderBy: { createdAt: "desc" },
  });

  const grantedTypes = new Set(consents.map((c) => c.consentType));
  return required.every((r) => grantedTypes.has(r));
}

export async function getConsentHistory() {
  const session = await requireSession();
  return prisma.vaultConsentLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function requestDeletion() {
  const session = await requireSession();
  const userId = session.user.id;

  // Delete all Supabase Storage files
  const documents = await prisma.vaultDocument.findMany({
    where: { ownerId: userId },
    select: { storagePath: true },
  });

  if (documents.length > 0) {
    const paths = documents.map((d) => d.storagePath);
    await getSupabaseAdmin().storage.from("vault-documents").remove(paths);
  }

  // Cascade delete all vault data (Prisma cascades handle relations)
  await prisma.$transaction([
    prisma.vaultDocumentShare.deleteMany({
      where: { OR: [{ sharedByUserId: userId }, { sharedToUserId: userId }] },
    }),
    prisma.vaultReminder.deleteMany({ where: { userId } }),
    prisma.vaultDocument.deleteMany({ where: { ownerId: userId } }),
    prisma.vaultNotification.deleteMany({ where: { userId } }),
    prisma.vaultFamilyGroup.deleteMany({ where: { ownerId: userId } }),
    prisma.vaultKeyPair.deleteMany({ where: { userId } }),
    prisma.vaultSubscription.deleteMany({ where: { userId } }),
    prisma.vaultConsentLog.deleteMany({ where: { userId } }),
    prisma.vaultAuditLog.create({
      data: {
        userId,
        action: "DELETE",
        resource: "account",
        metadata: { reason: "user_requested" },
      },
    }),
  ]);
}

export async function exportUserData() {
  const session = await requireSession();
  const userId = session.user.id;

  const [documents, family, shares, reminders, consents, subscription] =
    await Promise.all([
      prisma.vaultDocument.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          documentType: true,
          label: true,
          fileName: true,
          storagePath: true,
          expiryDate: true,
          createdAt: true,
        },
      }),
      prisma.vaultFamilyGroup.findFirst({
        where: { ownerId: userId },
        include: { members: true },
      }),
      prisma.vaultDocumentShare.findMany({
        where: { sharedByUserId: userId },
        select: {
          documentId: true,
          sharedToUserId: true,
          accessLevel: true,
          createdAt: true,
          revokedAt: true,
        },
      }),
      prisma.vaultReminder.findMany({
        where: { userId },
        select: { documentId: true, daysBefore: true, reminderDate: true },
      }),
      prisma.vaultConsentLog.findMany({
        where: { userId },
        select: { consentType: true, granted: true, version: true, createdAt: true },
      }),
      prisma.vaultSubscription.findFirst({ where: { userId } }),
    ]);

  // Log the export
  await prisma.vaultAuditLog.create({
    data: { userId, action: "EXPORT", resource: "account" },
  });

  return {
    exportedAt: new Date().toISOString(),
    user: { id: userId },
    subscription: subscription
      ? { tier: subscription.tier, expiresAt: subscription.expiresAt }
      : null,
    documents,
    family,
    shares,
    reminders,
    consents,
  };
}
