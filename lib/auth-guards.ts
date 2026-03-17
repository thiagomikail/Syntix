import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session;
}

export async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

/**
 * Verifies the calling user owns the given idea.
 * Returns the userId on success, throws on failure.
 */
export async function requireOwnership(ideaId: string): Promise<string> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
        select: { userId: true },
    });
    if (!idea) throw new Error("Not found");
    if (idea.userId !== session.user.id) throw new Error("Not found");

    return session.user.id;
}
