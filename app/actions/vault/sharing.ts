"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireDocumentOwnership } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";

export async function shareDocument(data: {
  documentId: string;
  recipientEmail: string;
  encryptedKey: string;
  accessLevel: "VIEW" | "DOWNLOAD";
  expiresAt?: string;
}) {
  const userId = await requireDocumentOwnership(data.documentId);

  // Check tier (FREE can't share)
  const sub = await prisma.vaultSubscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  if (!sub || sub.tier === "FREE") {
    throw new Error("TIER_LIMIT_REACHED");
  }

  // Find recipient
  const recipient = await prisma.user.findUnique({
    where: { email: data.recipientEmail },
    select: { id: true },
  });
  if (!recipient) throw new Error("Recipient not found");
  if (recipient.id === userId) throw new Error("Cannot share with yourself");

  // Check recipient has a key pair
  const keyPair = await prisma.vaultKeyPair.findUnique({
    where: { userId: recipient.id },
  });
  if (!keyPair) throw new Error("Recipient has not set up their vault");

  const share = await prisma.vaultDocumentShare.create({
    data: {
      documentId: data.documentId,
      sharedByUserId: userId,
      sharedToUserId: recipient.id,
      encryptedKey: data.encryptedKey,
      accessLevel: data.accessLevel,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  // Notify recipient
  const doc = await prisma.vaultDocument.findUnique({
    where: { id: data.documentId },
    select: { label: true },
  });
  await prisma.vaultNotification.create({
    data: {
      userId: recipient.id,
      type: "SHARE_RECEIVED",
      title: "Document shared with you",
      body: `A document "${doc?.label}" has been shared with you.`,
      refType: "share",
      refId: share.id,
    },
  });

  // Audit log
  await prisma.vaultAuditLog.create({
    data: {
      userId,
      action: "SHARE",
      resource: "document",
      resourceId: data.documentId,
      metadata: { recipientId: recipient.id, accessLevel: data.accessLevel },
    },
  });

  revalidatePath("/vault");
  return share;
}

export async function revokeShare(shareId: string) {
  const session = await requireSession();

  const share = await prisma.vaultDocumentShare.findUnique({
    where: { id: shareId },
    select: { sharedByUserId: true, sharedToUserId: true, documentId: true },
  });

  if (!share || share.sharedByUserId !== session.user.id) {
    throw new Error("Not found");
  }

  await prisma.vaultDocumentShare.update({
    where: { id: shareId },
    data: { revokedAt: new Date() },
  });

  // Notify recipient
  await prisma.vaultNotification.create({
    data: {
      userId: share.sharedToUserId,
      type: "SHARE_REVOKED",
      title: "Document access revoked",
      body: "A document that was shared with you has been revoked.",
      refType: "document",
      refId: share.documentId,
    },
  });

  // Audit log
  await prisma.vaultAuditLog.create({
    data: {
      userId: session.user.id,
      action: "REVOKE",
      resource: "share",
      resourceId: shareId,
    },
  });

  revalidatePath("/vault");
}

export async function getSharedWithMe() {
  const session = await requireSession();
  return prisma.vaultDocumentShare.findMany({
    where: {
      sharedToUserId: session.user.id,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      document: {
        select: { id: true, label: true, documentType: true, expiryDate: true, fileName: true },
      },
      sharedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipientPublicKey(email: string): Promise<string | null> {
  await requireSession();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return null;

  const keyPair = await prisma.vaultKeyPair.findUnique({
    where: { userId: user.id },
    select: { publicKeyJwk: true },
  });

  return keyPair?.publicKeyJwk || null;
}
