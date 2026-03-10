"use server";
import { prisma } from "@/lib/prisma";
import { requireOwnership } from "@/lib/auth-guards";

export async function saveIdeaText(id: string, text: string) {
    await requireOwnership(id);
    return await prisma.idea.update({
        where: { id },
        data: { rawText: text }
    });
}
