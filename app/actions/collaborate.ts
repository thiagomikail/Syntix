"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-guards";

export async function submitCollaboration(ideaId: string, type: string, feedback: string) {
    const session = await requireSession();

    try {
        await prisma.collaboration.create({
            data: {
                ideaId,
                fromUserId: session.user.id,
                type,
                content: feedback,
                status: "pending"
            }
        });

        revalidatePath(`/idea/${ideaId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to submit collaboration:", error);
        return { success: false, error: "Failed to submit" };
    }
}

export async function resolveCollaboration(collaborationId: string, status: "accepted" | "rejected") {
    const session = await requireSession();

    try {
        // Fetch the collaboration and verify the caller owns the idea
        const collaboration = await prisma.collaboration.findUnique({
            where: { id: collaborationId },
            include: { idea: { select: { userId: true } } }
        });

        if (!collaboration) throw new Error("Not found");
        if (collaboration.idea.userId !== session.user.id) throw new Error("Forbidden");

        await prisma.collaboration.update({
            where: { id: collaborationId },
            data: { status }
        });

        if (status === "accepted") {
            // Award CP to the collaborator (fromUserId), derived from DB — not client input
            await prisma.pointsLedger.create({
                data: {
                    userId: collaboration.fromUserId,
                    type: "CP",
                    amount: 50,
                    reason: "COLLABORATION_ACCEPTED",
                    refType: "collaboration",
                    refId: collaborationId
                }
            });
        }

        revalidatePath(`/idea/${collaboration.ideaId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to resolve collaboration:", error);
        return { success: false, error: "Failed to resolve" };
    }
}
