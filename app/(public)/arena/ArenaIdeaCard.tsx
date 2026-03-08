"use client";

import { useState } from "react";
import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { CommentList } from "@/components/CommentList";
import { CommentForm } from "@/components/CommentForm";
import { submitVote } from "@/app/actions/vote";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const archetypeConfig: Record<string, { color: string; icon: string }> = {
    "cash_cow": { color: "#22c55e", icon: "savings" },
    "cash_farm": { color: "#3b82f6", icon: "agriculture" },
    "new_meat": { color: "#a855f7", icon: "rocket_launch" },
    "ozempics": { color: "#f59e0b", icon: "biotech" },
    "dead_end": { color: "#ef4444", icon: "dangerous" },
};

export function ArenaIdeaCard({ idea }: { idea: any }) {
    const { data: session } = useSession();
    const [rating, setRating] = useState(idea.averageRating || 0);
    const [showComments, setShowComments] = useState(false);
    const [commentKey, setCommentKey] = useState(0);

    const archetype = archetypeConfig[idea.archetype] || { color: "#64748b", icon: "help" };

    const handleVote = async (score: number) => {
        if (!session?.user) {
            alert("Please sign in to vote");
            return;
        }
        try {
            const result = await submitVote(idea.id, score);
            setRating(result.averageRating);
        } catch (error) {
            console.error("Vote failed:", error);
        }
    };

    return (
        <div className="min-w-[300px] max-w-[320px] snap-start rounded-2xl border border-primary/10 bg-[#1A1A1A] overflow-hidden flex flex-col shrink-0 transition-all hover:border-primary/30 hover:shadow-lg">
            {/* Thumbnail / Header */}
            <div
                className="h-32 relative flex items-end p-4"
                style={idea.thumbnailUrl
                    ? { backgroundImage: `linear-gradient(to top, rgba(26,26,26,1) 0%, rgba(26,26,26,0.2) 100%), url("${idea.thumbnailUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: `linear-gradient(135deg, ${archetype.color}15, ${archetype.color}05)` }
                }
            >
                {/* Archetype badge */}
                <div
                    className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ backgroundColor: archetype.color + "20", color: archetype.color }}
                >
                    <span className="material-symbols-outlined text-xs">{archetype.icon}</span>
                    {idea.archetype?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Unclassified"}
                </div>

                {/* IRL Score badge */}
                {idea.irlJson && (() => {
                    try {
                        const irl = JSON.parse(idea.irlJson);
                        return (
                            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-accent-cyan backdrop-blur-sm">
                                <span className="material-symbols-outlined text-xs">analytics</span>
                                IRL {irl.score || 0}
                            </div>
                        );
                    } catch { return null; }
                })()}

                {/* Title */}
                <Link href={`/idea/${idea.id}`} className="relative z-10">
                    <h3 className="text-lg font-bold text-white leading-tight hover:text-primary transition-colors line-clamp-2">
                        {idea.title || "Untitled"}
                    </h3>
                </Link>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {idea.rawText || idea.thesisText || "No description"}
                </p>

                {/* Author */}
                <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-primary">person</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{idea.user?.name || "Anonymous"}</span>
                </div>

                {/* Star Rating */}
                <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                    <StarRating
                        rating={rating}
                        onRate={handleVote}
                        readonly={!session?.user}
                        size="sm"
                    />
                </div>

                {/* Comments Toggle */}
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-xs">chat_bubble</span>
                    {showComments ? "Hide" : `${idea.comments?.length || 0} comments`}
                </button>

                {/* Comments section */}
                {showComments && (
                    <div className="space-y-2 border-t border-primary/10 pt-2">
                        <CommentList
                            key={commentKey}
                            ideaId={idea.id}
                            initialComments={idea.comments}
                            maxVisible={3}
                        />
                        <CommentForm
                            ideaId={idea.id}
                            onCommentAdded={() => setCommentKey(k => k + 1)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
