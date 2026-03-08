"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function updateUserRole(userId: string, newRole: "USER" | "ADMIN") {
    try {
        await requireAdmin();
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to update role" };
    }
}

export async function updateUserCallsign(userId: string, newCallsign: string) {
    try {
        if (!newCallsign || newCallsign.trim() === "") {
            throw new Error("Callsign cannot be empty");
        }
        await requireAdmin();
        const email = `${newCallsign.trim()}@syntix.local`;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId) {
            return { error: "Callsign is already in use by another user." };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { name: newCallsign.trim(), email }
        });

        // Clear sessions to force re-login
        await prisma.session.deleteMany({
            where: { userId }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to update callsign" };
    }
}

export async function deleteUser(userId: string) {
    try {
        await requireAdmin();
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to delete user" };
    }
}
