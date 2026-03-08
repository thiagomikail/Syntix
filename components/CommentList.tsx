"use client";

import { useState, useEffect } from "react";
import { getComments } from "@/app/actions/comment";
import { cn } from "@/lib/utils";

interface Comment {
    id: string;
    authorName: string | null;
    content: string;
    createdAt: Date | string;
    user: { name: string | null; image: string | null } | null;
}

interface CommentListProps {
    ideaId: string;
    initialComments?: Comment[];
    maxVisible?: number;
    className?: string;
}

export function CommentList({ ideaId, initialComments, maxVisible = 3, className }: CommentListProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments || []);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(!initialComments);

    useEffect(() => {
        if (!initialComments) {
            loadComments();
        }
    }, [ideaId, initialComments]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const data = await getComments(ideaId, 20);
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const visibleComments = showAll ? comments : comments.slice(0, maxVisible);

    if (loading) {
        return (
            <div className="text-xs text-slate-500 animate-pulse p-2">Loading comments...</div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-xs text-slate-600 p-2 text-center italic">No comments yet</div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {visibleComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#222222]">
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-xs text-primary">person</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-300">
                                {comment.user?.name || comment.authorName || "Anonymous"}
                            </span>
                            <span className="text-[9px] text-slate-600">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{comment.content}</p>
                    </div>
                </div>
            ))}
            {comments.length > maxVisible && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-[10px] font-bold text-primary hover:text-white transition-colors w-full text-center py-1"
                >
                    {showAll ? "Show less" : `View all ${comments.length} comments`}
                </button>
            )}
        </div>
    );
}
