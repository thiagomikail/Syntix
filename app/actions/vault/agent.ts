"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireAgentProfile } from "@/lib/auth-guards";

export async function createAgentProfile(agencyName: string, licenseNumber?: string) {
  const session = await requireSession();

  const existing = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) return existing;

  return prisma.agentProfile.create({
    data: {
      userId: session.user.id,
      agencyName: agencyName.trim(),
      licenseNumber: licenseNumber?.trim() || null,
      verified: false,
    },
  });
}

export async function addProcessingTime(data: {
  documentType: string;
  country: string;
  consulateCity?: string;
  processingDays: number;
  source: string;
}) {
  const { agentProfileId } = await requireAgentProfile();

  return prisma.vaultProcessingTime.create({
    data: {
      agentProfileId,
      documentType: data.documentType,
      country: data.country.toUpperCase(),
      consulateCity: data.consulateCity?.trim() || null,
      processingDays: data.processingDays,
      source: data.source,
    },
  });
}

export async function getProcessingTimes(filters?: {
  documentType?: string;
  country?: string;
}) {
  return prisma.vaultProcessingTime.findMany({
    where: {
      ...(filters?.documentType && { documentType: filters.documentType }),
      ...(filters?.country && { country: filters.country.toUpperCase() }),
    },
    orderBy: { reportedAt: "desc" },
    take: 100,
  });
}

export async function giftCredits(recipientEmail: string, amount: number) {
  const { agentProfileId } = await requireAgentProfile();

  const profile = await prisma.agentProfile.findUnique({
    where: { id: agentProfileId },
    select: { creditsBalance: true },
  });

  if (!profile || profile.creditsBalance < amount) {
    throw new Error("Insufficient credits");
  }

  await prisma.$transaction([
    prisma.agentProfile.update({
      where: { id: agentProfileId },
      data: { creditsBalance: { decrement: amount } },
    }),
    prisma.agentCreditGift.create({
      data: {
        agentProfileId,
        recipientEmail: recipientEmail.toLowerCase(),
        creditAmount: amount,
      },
    }),
  ]);
}

export async function claimCredits(giftId: string) {
  const session = await requireSession();

  const gift = await prisma.agentCreditGift.findUnique({
    where: { id: giftId },
  });

  if (!gift || gift.claimedAt) throw new Error("Invalid or already claimed");
  if (gift.recipientEmail !== session.user.email?.toLowerCase()) {
    throw new Error("Not your gift to claim");
  }

  await prisma.$transaction([
    prisma.agentCreditGift.update({
      where: { id: giftId },
      data: { claimedAt: new Date(), recipientId: session.user.id },
    }),
    prisma.vaultSubscription.upsert({
      where: { userId: session.user.id },
      update: {
        tier: "PREMIUM",
        expiresAt: new Date(Date.now() + gift.creditAmount * 24 * 60 * 60 * 1000), // days
      },
      create: {
        userId: session.user.id,
        tier: "PREMIUM",
        expiresAt: new Date(Date.now() + gift.creditAmount * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
}
