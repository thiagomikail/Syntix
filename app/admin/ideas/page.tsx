import { prisma } from "@/lib/prisma";
import IdeaTableClient from "./IdeaTableClient";

export default async function AdminIdeasPage() {
    const ideas = await prisma.idea.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } }
        }
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Idea Management</h1>
                <p className="text-slate-400">Review and moderate all generated businesses.</p>
            </div>
            <IdeaTableClient initialIdeas={ideas} />
        </div>
    );
}
