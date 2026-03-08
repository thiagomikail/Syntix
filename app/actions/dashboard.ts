"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getUserIdeas() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return [];

        const ideas = await prisma.idea.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: "desc" },
        });

        return ideas;
    } catch (error) {
        console.error("Failed to fetch user ideas:", error);
        return [];
    }
}
