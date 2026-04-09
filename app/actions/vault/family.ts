"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";

export async function createFamilyGroup(name: string) {
  const session = await requireSession();

  const existing = await prisma.vaultFamilyGroup.findUnique({
    where: { ownerId: session.user.id },
  });
  if (existing) return existing;

  const group = await prisma.vaultFamilyGroup.create({
    data: {
      ownerId: session.user.id,
      name: name.trim() || "My Family",
    },
  });

  revalidatePath("/vault/family");
  return group;
}

export async function addFamilyMember(name: string, relationship: string) {
  const session = await requireSession();

  let group = await prisma.vaultFamilyGroup.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!group) {
    group = await prisma.vaultFamilyGroup.create({
      data: { ownerId: session.user.id },
    });
  }

  // Check tier limit (FREE = 1 member)
  const sub = await prisma.vaultSubscription.findUnique({
    where: { userId: session.user.id },
    select: { tier: true },
  });
  const tier = sub?.tier || "FREE";

  if (tier === "FREE") {
    const memberCount = await prisma.vaultFamilyMember.count({
      where: { familyGroupId: group.id },
    });
    if (memberCount >= 1) throw new Error("TIER_LIMIT_REACHED");
  }

  const member = await prisma.vaultFamilyMember.create({
    data: {
      familyGroupId: group.id,
      name: name.trim(),
      relationship,
    },
  });

  revalidatePath("/vault/family");
  return member;
}

export async function removeFamilyMember(memberId: string) {
  const session = await requireSession();

  const member = await prisma.vaultFamilyMember.findUnique({
    where: { id: memberId },
    include: { familyGroup: { select: { ownerId: true } } },
  });

  if (!member || member.familyGroup.ownerId !== session.user.id) {
    throw new Error("Not found");
  }

  await prisma.vaultFamilyMember.delete({ where: { id: memberId } });
  revalidatePath("/vault/family");
}

export async function getFamilyOverview() {
  const session = await requireSession();

  const group = await prisma.vaultFamilyGroup.findUnique({
    where: { ownerId: session.user.id },
    include: {
      members: {
        include: {
          documents: {
            select: {
              id: true,
              documentType: true,
              label: true,
              expiryDate: true,
            },
            orderBy: { expiryDate: "asc" },
          },
        },
      },
    },
  });

  // Also get user's own documents (not assigned to a family member)
  const ownDocuments = await prisma.vaultDocument.findMany({
    where: { ownerId: session.user.id, familyMemberId: null },
    select: {
      id: true,
      documentType: true,
      label: true,
      expiryDate: true,
    },
    orderBy: { expiryDate: "asc" },
  });

  return { group, ownDocuments };
}
