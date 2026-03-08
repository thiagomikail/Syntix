"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitCollaboration(ideaId: string, userId: string, type: string, feedback: string) {
    try {
        await prisma.collaboration.create({
            data: {
                ideaId,
                fromUserId: userId,
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

export async function resolveCollaboration(collaborationId: string, status: "accepted" | "rejected", ideaId: string, authorId: string) {
    try {
        await prisma.collaboration.update({
            where: { id: collaborationId },
            data: { status }
        });

        if (status === "accepted") {
            // Award CP to the collaborator
            await prisma.pointsLedger.create({
                data: {
                    userId: authorId,
                    type: "CP",
                    amount: 50,
                    reason: "COLLABORATION_ACCEPTED",
                    refType: "collaboration",
                    refId: collaborationId
                }
            });
        }

        revalidatePath(`/idea/${ideaId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to resolve collaboration:", error);
        return { success: false, error: "Failed to resolve" };
    }
}
