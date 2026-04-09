"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guards";

export async function getNotifications(limit = 20) {
  const session = await requireSession();
  return prisma.vaultNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(): Promise<number> {
  const session = await requireSession();
  return prisma.vaultNotification.count({
    where: { userId: session.user.id, readAt: null },
  });
}

export async function markAsRead(notificationId: string) {
  const session = await requireSession();
  await prisma.vaultNotification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { readAt: new Date() },
  });
}

export async function markAllRead() {
  const session = await requireSession();
  await prisma.vaultNotification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
}
