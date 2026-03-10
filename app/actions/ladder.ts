"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-guards";

export async function saveLadder(name: string, nodes: any[], edges: any[], ladderId?: string) {
    const session = await requireSession();
    const userId = session.user.id;

    if (!Array.isArray(nodes) || nodes.length > 500) throw new Error("Invalid nodes");
    if (!Array.isArray(edges) || edges.length > 1000) throw new Error("Invalid edges");
    if (!name?.trim()) throw new Error("Ladder name is required");

    try {
        const nodesJson = JSON.stringify(nodes);
        const edgesJson = JSON.stringify(edges);
        const strengthScore = calculateStrength(nodes, edges);

        if (ladderId) {
            const existing = await prisma.ladder.findUnique({ where: { id: ladderId }, select: { userId: true } });
            if (!existing) throw new Error("Not found");
            if (existing.userId !== userId) throw new Error("Forbidden");

            const updated = await prisma.ladder.update({
                where: { id: ladderId },
                data: { name: name.trim(), nodesJson, edgesJson, strengthScore }
            });
            revalidatePath("/app/ladder");
            return { success: true, ladder: updated };
        } else {
            const created = await prisma.ladder.create({
                data: { userId, name: name.trim(), nodesJson, edgesJson, strengthScore }
            });
            revalidatePath("/app/ladder");
            return { success: true, ladder: created };
        }
    } catch (error) {
        console.error("Failed to save Ladder:", error);
        return { success: false, error: "Failed to save ladder" };
    }
}

function calculateStrength(nodes: any[], edges: any[]): number {
    let score = nodes.length * 10;
    score += edges.length * 15;
    return Math.min(score, 100);
}
