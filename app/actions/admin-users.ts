"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

const RESERVED_CALLSIGNS = ["admin", "root", "support", "syntix", "moderator", "staff"];
const CALLSIGN_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session?.user as any)?.role !== "ADMIN") {
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
        console.error("updateUserRole error:", e);
        return { error: "Failed to update role" };
    }
}

export async function updateUserCallsign(userId: string, newCallsign: string) {
    try {
        await requireAdmin();

        if (!newCallsign?.trim()) throw new Error("Callsign cannot be empty");

        const trimmed = newCallsign.trim();
        if (!CALLSIGN_REGEX.test(trimmed) || RESERVED_CALLSIGNS.includes(trimmed.toLowerCase())) {
            return { error: "Invalid callsign format or reserved name." };
        }

        const email = `${trimmed}@syntix.local`;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId) {
            return { error: "Callsign is already in use." };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { name: trimmed, email }
        });

        await prisma.session.deleteMany({ where: { userId } });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        console.error("updateUserCallsign error:", e);
        return { error: "Failed to update callsign" };
    }
}

export async function deleteUser(userId: string) {
    try {
        await requireAdmin();

        // Prevent self-deletion
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.id === userId) {
            return { error: "You cannot delete your own account." };
        }

        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        console.error("deleteUser error:", e);
        return { error: "Failed to delete user" };
    }
}
