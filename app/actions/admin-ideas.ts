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

export async function deleteIdea(ideaId: string) {
    try {
        await requireAdmin();
        await prisma.idea.delete({
            where: { id: ideaId }
        });
        revalidatePath("/admin/ideas");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to delete idea" };
    }
}
