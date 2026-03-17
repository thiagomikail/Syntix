"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit } from "@/lib/rate-limit";

export async function submitVote(ideaId: string, score: number) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Must be logged in to vote");

    if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new Error("Score must be an integer between 1 and 5");
    }

    await checkRateLimit(session.user.id, "vote", 10, 60_000);

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new Error("Not found");
    if (!idea.isPublic && idea.userId !== session.user.id) {
        throw new Error("Forbidden");
    }

    // Use a transaction to prevent race conditions on averageRating
    const result = await prisma.$transaction(async (tx) => {
        await tx.vote.upsert({
            where: { userId_ideaId: { userId: session.user.id, ideaId } },
            update: { score },
            create: { userId: session.user.id, ideaId, score },
        });

        const aggregate = await tx.vote.aggregate({
            where: { ideaId },
            _avg: { score: true },
        });

        const averageRating = aggregate._avg.score || 0;

        await tx.idea.update({
            where: { id: ideaId },
            data: { averageRating },
        });

        return { averageRating };
    });

    return result;
}

export async function getUserVote(ideaId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const vote = await prisma.vote.findUnique({
        where: { userId_ideaId: { userId: session.user.id, ideaId } },
    });

    return vote?.score || null;
}
