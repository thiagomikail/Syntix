"use server";
import { prisma } from "@/lib/prisma";
import { requireOwnership } from "@/lib/auth-guards";

export async function togglePublishIdea(id: string, isPublic: boolean) {
    await requireOwnership(id);
    return await prisma.idea.update({
        where: { id },
        data: { isPublic }
    });
}

export async function saveImpulseThesis(id: string, thesis: string) {
    await requireOwnership(id);
    return await prisma.idea.update({
        where: { id },
        data: { thesisText: thesis }
    });
}

export async function saveIdeaTitle(id: string, title: string) {
    await requireOwnership(id);
    return await prisma.idea.update({
        where: { id },
        data: { title }
    });
}

export async function saveIRLScore(id: string, irlJson: string) {
    await requireOwnership(id);
    return await prisma.idea.update({
        where: { id },
        data: { irlJson }
    });
}

export async function getTopArenaProjects() {
    return await prisma.idea.findMany({
        where: { isPublic: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
            user: {
                select: { name: true, image: true }
            }
        }
    });
}
