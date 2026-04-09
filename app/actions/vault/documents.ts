"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireDocumentOwnership } from "@/lib/auth-guards";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const TIER_LIMITS: Record<string, number> = {
  FREE: 5,
  PREMIUM: Infinity,
  AGENT: Infinity,
};

async function getUserTier(userId: string): Promise<string> {
  const sub = await prisma.vaultSubscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  return sub?.tier || "FREE";
}

export async function createDocument(data: {
  documentType: string;
  label: string;
  fileName: string;
  storagePath: string;
  encryptedKeyBlob: string;
  metadataEncrypted?: string;
  expiryDate?: string;
  fileSizeBytes: number;
  mimeType: string;
  familyMemberId?: string;
}) {
  const session = await requireSession();
  const userId = session.user.id;

  // Check tier limit
  const tier = await getUserTier(userId);
  const limit = TIER_LIMITS[tier] ?? 5;
  const count = await prisma.vaultDocument.count({ where: { ownerId: userId } });
  if (count >= limit) {
    throw new Error("TIER_LIMIT_REACHED");
  }

  const doc = await prisma.vaultDocument.create({
    data: {
      ownerId: userId,
      documentType: data.documentType,
      label: data.label,
      fileName: data.fileName,
      storagePath: data.storagePath,
      encryptedKeyBlob: data.encryptedKeyBlob,
      metadataEncrypted: data.metadataEncrypted,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      fileSizeBytes: data.fileSizeBytes,
      mimeType: data.mimeType,
      familyMemberId: data.familyMemberId || null,
    },
  });

  // Audit log
  await prisma.vaultAuditLog.create({
    data: {
      userId,
      action: "UPLOAD",
      resource: "document",
      resourceId: doc.id,
      metadata: { documentType: data.documentType, fileName: data.fileName },
    },
  });

  // Auto-create 30-day reminder if expiry is set (free tier gets 30-day only)
  if (data.expiryDate) {
    const expiry = new Date(data.expiryDate);
    const reminderDate = new Date(expiry);
    reminderDate.setDate(reminderDate.getDate() - 30);

    if (reminderDate > new Date()) {
      await prisma.vaultReminder.create({
        data: {
          documentId: doc.id,
          userId,
          daysBefore: 30,
          reminderDate,
        },
      });
    }
  }

  revalidatePath("/vault");
  return doc;
}

export async function getMyDocuments() {
  const session = await requireSession();
  return prisma.vaultDocument.findMany({
    where: { ownerId: session.user.id },
    include: {
      familyMember: { select: { name: true, relationship: true } },
      _count: { select: { shares: true, reminders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDocumentById(id: string) {
  const session = await requireSession();

  const doc = await prisma.vaultDocument.findUnique({
    where: { id },
    include: {
      familyMember: { select: { name: true, relationship: true } },
      shares: {
        where: { revokedAt: null },
        include: { sharedTo: { select: { name: true, email: true } } },
      },
      reminders: true,
    },
  });

  if (!doc) throw new Error("Not found");

  // Check ownership or active share
  if (doc.ownerId !== session.user.id) {
    const share = await prisma.vaultDocumentShare.findFirst({
      where: {
        documentId: id,
        sharedToUserId: session.user.id,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!share) throw new Error("Not found");
  }

  // Audit log
  await prisma.vaultAuditLog.create({
    data: {
      userId: session.user.id,
      action: "VIEW",
      resource: "document",
      resourceId: id,
    },
  });

  return doc;
}

export async function deleteDocument(id: string) {
  const userId = await requireDocumentOwnership(id);

  const doc = await prisma.vaultDocument.findUnique({
    where: { id },
    select: { storagePath: true },
  });

  if (doc) {
    // Delete file from Supabase Storage
    await getSupabaseAdmin().storage.from("vault-documents").remove([doc.storagePath]);

    // Delete DB record (cascades to shares, reminders)
    await prisma.vaultDocument.delete({ where: { id } });

    // Audit log
    await prisma.vaultAuditLog.create({
      data: {
        userId,
        action: "DELETE",
        resource: "document",
        resourceId: id,
      },
    });
  }

  revalidatePath("/vault");
}

export async function getDocumentStats() {
  const session = await requireSession();
  const userId = session.user.id;
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 90);

  const [total, expiringSoon, expired, sharedCount, tier] = await Promise.all([
    prisma.vaultDocument.count({ where: { ownerId: userId } }),
    prisma.vaultDocument.count({
      where: {
        ownerId: userId,
        expiryDate: { gt: now, lte: soon },
      },
    }),
    prisma.vaultDocument.count({
      where: {
        ownerId: userId,
        expiryDate: { lte: now },
      },
    }),
    prisma.vaultDocumentShare.count({
      where: { sharedByUserId: userId, revokedAt: null },
    }),
    getUserTier(userId),
  ]);

  const limit = TIER_LIMITS[tier] ?? 5;

  return { total, expiringSoon, expired, sharedCount, tier, limit };
}
