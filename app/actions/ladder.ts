"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveLadder(userId: string, name: string, nodes: any[], edges: any[], ladderId?: string) {
    try {
        const nodesJson = JSON.stringify(nodes);
        const edgesJson = JSON.stringify(edges);
        const strengthScore = calculateStrength(nodes, edges);

        if (ladderId) {
            const updated = await prisma.ladder.update({
                where: { id: ladderId },
                data: { name, nodesJson, edgesJson, strengthScore }
            });
            revalidatePath("/app/ladder");
            return { success: true, ladder: updated };
        } else {
            const created = await prisma.ladder.create({
                data: { userId, name, nodesJson, edgesJson, strengthScore }
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
    // A naive implementation to award points based on length and connectivity
    // If we have 3 nodes connected, that's better than 1 node.
    let score = nodes.length * 10;
    score += edges.length * 15;
    return Math.min(score, 100);
}
