"use server";
import { prisma } from "@/lib/prisma";

export async function saveIdeaText(id: string, text: string) {
    return await prisma.idea.update({
        where: { id },
        data: { rawText: text }
    });
}
