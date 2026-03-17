import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArenaIdeaCard } from "./ArenaIdeaCard";

export default async function ArenaPage() {
    const ideas = await prisma.idea.findMany({
        where: { isPublic: true },
        orderBy: { updatedAt: "desc" },
        include: {
            user: { select: { name: true, image: true } },
            votes: { select: { score: true } },
            comments: {
                orderBy: { createdAt: "desc" },
                take: 3,
                select: {
                    id: true,
                    authorName: true,
                    content: true,
                    createdAt: true,
                    user: { select: { name: true, image: true } },
                },
            },
        },
    });

    // Group by archetype for Netflix-style rows
    const archetypeGroups: Record<string, typeof ideas> = {};
    const archetypeLabels: Record<string, string> = {
        "cash_cow": "💰 Cash Cow",
        "cash_farm": "🌾 Cash Farm",
        "new_meat": "🚀 New Meat",
        "ozempics": "🧬 Ozempics",
        "dead_end": "⚠️ Dead End",
    };

    // Parse JSON strings for SQLite compatibility
    const processedIdeas = ideas.map(idea => ({
        ...idea,
        refinementJson: typeof idea.refinementJson === 'string' ? JSON.parse(idea.refinementJson) : idea.refinementJson,
        irlJson: typeof idea.irlJson === 'string' ? JSON.parse(idea.irlJson) : idea.irlJson,
    }));

    // Also create an "All" row and a "Top Rated" row
    const topRated = [...processedIdeas].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 10);

    for (const idea of processedIdeas) {
        const archetype = idea.archetype || "unclassified";
        if (!archetypeGroups[archetype]) archetypeGroups[archetype] = [];
        archetypeGroups[archetype].push(idea);
    }

    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined text-xl">account_tree</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight">SYNTIX</span>
                    </Link>
                    <div className="h-4 w-px bg-slate-700" />
                    <h1 className="text-sm font-bold uppercase tracking-widest text-primary">Arena</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/app" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">
                        My Lab →
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="py-8 space-y-10">
                {ideas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
                        <span className="material-symbols-outlined text-5xl text-primary/30">public</span>
                        <h2 className="text-2xl font-bold">The Arena is Empty</h2>
                        <p className="text-sm text-slate-400 max-w-md">
                            Be the first to publish your idea and let the community judge it.
                        </p>
                        <Link href="/app" className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all">
                            Start Building →
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Top Rated Row */}
                        {topRated.length > 0 && (
                            <NetflixRow title="⭐ Top Rated" ideas={topRated} />
                        )}

                        {/* By Archetype */}
                        {Object.entries(archetypeGroups).map(([archetype, groupIdeas]) => (
                            <NetflixRow
                                key={archetype}
                                title={archetypeLabels[archetype] || archetype}
                                ideas={groupIdeas}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

function NetflixRow({ title, ideas }: { title: string; ideas: any[] }) {
    return (
        <div className="px-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-4">{title}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {ideas.map((idea) => (
                    <ArenaIdeaCard key={idea.id} idea={idea} />
                ))}
            </div>
        </div>
    );
}
