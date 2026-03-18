import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { StarRating } from "@/components/StarRating";
import { CommentList } from "@/components/CommentList";
import { CommentForm } from "@/components/CommentForm";

const archetypeLabels: Record<string, string> = {
    "cash_cow": "💰 Cash Cow",
    "cash_farm": "🌾 Cash Farm",
    "new_meat": "🚀 New Meat",
    "ozempics": "🧬 Ozempics",
    "dead_end": "⚠️ Dead End",
};

const CUID_REGEX = /^c[a-z0-9]{24,}$/i;

export default async function PublicIdeaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // CRIT-5: Reject non-CUID IDs before hitting the database
    if (!CUID_REGEX.test(id)) return notFound();

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const idea = await prisma.idea.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, image: true } },
            comments: {
                include: { user: { select: { name: true, image: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!idea || !idea.isPublic) return notFound();

    const isOwner = userId === idea.userId;
    const archetypeLabel = idea.archetype ? (archetypeLabels[idea.archetype] || idea.archetype) : "Unclassified";

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-white">
            {/* Nav */}
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-dark/90 px-4 py-3 backdrop-blur-md">
                <Link href="/arena" className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined text-xl">account_tree</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">SYNTIX</span>
                </Link>
                <div className="flex gap-2">
                    {isOwner && (
                        <Link href={`/app/idea/${idea.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit in Lab
                        </Link>
                    )}
                    {!session && (
                        <Link href="/api/auth/signin" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-xs font-bold text-white shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all">
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>

            <main className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8">
                {/* Header */}
                <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-4">
                        {archetypeLabel}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">{idea.title || "Untitled Venture"}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {idea.user?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                            <span>{idea.user?.name || "Anonymous"}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(idea.updatedAt).toLocaleDateString()}</span>

                        {/* Rating Display */}
                        {idea.averageRating !== null && idea.averageRating > 0 && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    {idea.averageRating.toFixed(1)}
                                </div>
                            </>
                        )}

                        {/* IRL Score */}
                        {idea.irlJson && (() => {
                            try {
                                const irl = idea.irlJson as any;
                                return (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1 text-accent-cyan font-bold">
                                            <span className="material-symbols-outlined text-sm">analytics</span>
                                            IRL {irl.score || 0}
                                        </div>
                                    </>
                                );
                            } catch { return null; }
                        })()}
                    </div>

                    {idea.thumbnailUrl && /^data:image\/(jpeg|png|webp|svg\+xml);base64,/.test(idea.thumbnailUrl) && (
                        <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mt-8 relative border border-primary/20 shadow-lg shadow-black/50">
                            <img src={idea.thumbnailUrl} alt={idea.title || "Business Thumbnail"} className="object-cover w-full h-full" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="rounded-3xl border border-primary/10 bg-[#1A1A1A] p-6 shadow-xl shadow-black/50">
                    <p className="whitespace-pre-wrap leading-relaxed text-base text-slate-300">
                        {idea.thesisText || idea.rawText}
                    </p>
                </div>

                {/* Social Area */}
                <div className="rounded-3xl border border-primary/10 bg-[#1A1A1A] p-6 space-y-8">
                    {/* Rate Idea */}
                    <div className="flex flex-col items-center justify-center py-4 border-b border-primary/10">
                        <h3 className="text-sm font-bold text-slate-300 mb-2">Rate this Idea</h3>
                        <p className="text-xs text-slate-500 mb-4 text-center max-w-sm">
                            {session ? "Click a star to cast your vote." : "Sign in to vote on this idea."}
                        </p>
                        {/* Interactive rating using the client component 
                            Note: The client component needs ideaId and session info, 
                            so we'll render a simple read-only one and let Arena handle the voting,
                            OR we can make a wrapper. We've used StarRating in ArenaIdeaCard. */}
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined text-lg">hotel_class</span>
                            Go to <Link href="/arena" className="underline hover:text-white">Arena</Link> to vote and review!
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined">forum</span>
                            Community Feedback ({idea.comments.length})
                        </h2>

                        {/* New Comment */}
                        <div className="mb-6">
                            {session ? (
                                <CommentForm ideaId={idea.id} />
                            ) : (
                                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-center text-sm text-slate-400">
                                    <Link href="/api/auth/signin" className="text-primary hover:underline font-bold">Sign in</Link> to join the discussion.
                                </div>
                            )}
                        </div>

                        {/* Comment List */}
                        <CommentList ideaId={idea.id} initialComments={idea.comments} maxVisible={10} />
                    </div>
                </div>
            </main>
        </div>
    );
}
