"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function submitComment(ideaId: string, content: string, authorName?: string) {
    if (!content.trim()) throw new Error("Comment cannot be empty");
    if (content.length > 2000) throw new Error("Comment is too long (max 2000 characters)");

    const session = await getServerSession(authOptions);

    // Sanitize optional anonymous author name
    const safeAuthorName = authorName
        ? authorName.trim().substring(0, 100).replace(/[<>]/g, '')
        : undefined;

    const comment = await prisma.comment.create({
        data: {
            ideaId,
            userId: session?.user?.id || null,
            authorName: session?.user?.name || safeAuthorName || "Anonymous",
            content: content.trim(),
        },
    });

    return comment;
}

export async function getComments(ideaId: string, limit: number = 10) {
    // Verify the idea is public before returning comments
    const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
        select: { isPublic: true },
    });

    if (!idea?.isPublic) {
        // If not public, only return comments if the caller owns the idea
        const session = await getServerSession(authOptions);
        const ownedIdea = await prisma.idea.findUnique({
            where: { id: ideaId },
            select: { userId: true },
        });
        if (!session?.user?.id || ownedIdea?.userId !== session.user.id) {
            throw new Error("Forbidden");
        }
    }

    const comments = await prisma.comment.findMany({
        where: { ideaId },
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100),
        select: {
            id: true,
            authorName: true,
            content: true,
            createdAt: true,
            user: {
                select: { name: true, image: true },
            },
        },
    });

    return comments;
}
