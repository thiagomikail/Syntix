"use client";

import { useState } from "react";
import { submitComment } from "@/app/actions/comment";
import { cn } from "@/lib/utils";

interface CommentFormProps {
    ideaId: string;
    onCommentAdded?: () => void;
    className?: string;
}

export function CommentForm({ ideaId, onCommentAdded, className }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await submitComment(ideaId, content);
            setContent("");
            onCommentAdded?.();
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Leave a comment..."
                className="flex-1 bg-[#222222] text-white placeholder:text-slate-500 border border-primary/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/30 transition-colors min-w-0"
            />
            <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-primary text-white px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-all shadow-lg shadow-primary/25 hover:shadow-glow-primary shrink-0"
            >
                {isSubmitting ? (
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                ) : (
                    <span className="material-symbols-outlined text-sm">send</span>
                )}
            </button>
        </form>
    );
}
