import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

/** Verify user owns the document OR has an active (non-revoked, non-expired) share. */
export async function requireVaultAccess(documentId: string): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const doc = await prisma.vaultDocument.findUnique({
    where: { id: documentId },
    select: { ownerId: true },
  });
  if (!doc) throw new Error("Not found");

  if (doc.ownerId === session.user.id) return session.user.id;

  // Check for active share
  const share = await prisma.vaultDocumentShare.findFirst({
    where: {
      documentId,
      sharedToUserId: session.user.id,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  if (!share) throw new Error("Not found");

  return session.user.id;
}

/** Verify user has a verified agent profile. */
export async function requireAgentProfile(): Promise<{
  userId: string;
  agentProfileId: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verified: true },
  });
  if (!profile || !profile.verified) throw new Error("Agent profile required");

  return { userId: session.user.id, agentProfileId: profile.id };
}

/** Verify user owns the document. */
export async function requireDocumentOwnership(
  documentId: string
): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const doc = await prisma.vaultDocument.findUnique({
    where: { id: documentId },
    select: { ownerId: true },
  });
  if (!doc || doc.ownerId !== session.user.id) throw new Error("Not found");

  return session.user.id;
}
