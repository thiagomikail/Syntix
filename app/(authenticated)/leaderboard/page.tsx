import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getLeaders(type: "BP" | "CP") {
    const aggregated = await prisma.pointsLedger.groupBy({
        by: ['userId'],
        where: { type },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
    });

    const userIds = aggregated.map(a => a.userId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, image: true }
    });

    return aggregated.map(agg => {
        const user = users.find(u => u.id === agg.userId);
        return {
            user: user || { name: "Anonymous", image: null },
            points: agg._sum.amount || 0
        };
    }).sort((a, b) => b.points - a.points);
}

import { LeaderboardClient } from "./LeaderboardClient";

export default async function LeaderboardPage() {
    const [topBuilders, topCollaborators] = await Promise.all([
        getLeaders("BP"),
        getLeaders("CP")
    ]);

    return (
        <LeaderboardClient
            topBuilders={topBuilders}
            topCollaborators={topCollaborators}
        />
    );
}
