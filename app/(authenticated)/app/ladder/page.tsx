import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { LadderClient } from "./LadderClient";
import { redirect } from "next/navigation";

export default async function LadderPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/");

    const userIdeas = await prisma.idea.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, rawText: true, archetype: true, refinementJson: true }
    });

    const ladder = await prisma.ladder.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="h-full w-full">
            <LadderClient ideas={userIdeas} initialLadder={ladder} user={session.user} />
        </div>
    );
}
