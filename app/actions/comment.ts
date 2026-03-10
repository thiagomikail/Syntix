"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function submitComment(ideaId: string, content: string, authorName?: string) {
    if (!content.trim()) throw new Error("Comment cannot be empty");
    if (content.length > 2000) throw new Error("Comment is too long (max 2000 characters)");

    const session = await getServerSession(authOptions);

    // Allow anonymous comments but track user if logged in
    const comment = await prisma.comment.create({
        data: {
            ideaId,
            userId: session?.user?.id || null,
            authorName: session?.user?.name || authorName || "Anonymous",
            content: content.trim(),
        },
    });

    return comment;
}

export async function getComments(ideaId: string, limit: number = 10) {
    const comments = await prisma.comment.findMany({
        where: { ideaId },
        orderBy: { createdAt: "desc" },
        take: limit,
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
