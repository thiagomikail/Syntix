"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-guards";

const ALLOWED_TYPES = ["Technical Suggestion", "Risk Flag", "GTM Connection"] as const;

export async function submitCollaboration(ideaId: string, type: string, feedback: string) {
    const session = await requireSession();

    if (!ALLOWED_TYPES.includes(type as any)) {
        throw new Error("Invalid collaboration type");
    }
    if (!feedback.trim()) throw new Error("Feedback cannot be empty");
    if (feedback.length > 2000) throw new Error("Feedback is too long (max 2000 characters)");

    try {
        await prisma.collaboration.create({
            data: {
                ideaId,
                fromUserId: session.user.id,
                type,
                content: feedback.trim(),
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
