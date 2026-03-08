"use client";

import { useState } from "react";
import { submitCollaboration } from "@/app/actions/collaborate";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollaborationFormClientProps {
    ideaId: string;
    userId: string;
}

export function CollaborationFormClient({ ideaId, userId }: CollaborationFormClientProps) {
    const [type, setType] = useState("Technical Suggestion");
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setIsSubmitting(true);
        const result = await submitCollaboration(ideaId, userId, type, feedback);
        if (result.success) {
            setFeedback("");
        } else {
            alert("Failed to send collaboration.");
        }
        setIsSubmitting(false);
    };

    const types = ["Technical Suggestion", "Risk Flag", "GTM Connection"];

    return (
        <form onSubmit={handleSubmit} className="bg-card border-2 border-border border-b-[6px] p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xl font-black heading-font uppercase tracking-tight">Suggest an angle</h3>

            <div className="flex flex-wrap gap-2">
                {types.map(t => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all",
                            type === t
                                ? "border-primary bg-primary text-primary-foreground shadow-[0_3px_0_hsl(var(--primary)/0.5)] -translate-y-1"
                                : "border-border bg-secondary text-secondary-foreground hover:bg-black/5"
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive, high-signal feedback to the builder..."
                className="w-full bg-secondary/30 border border-border p-4 rounded-xl min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-colors placeholder:text-muted-foreground/60 resize-none font-sans font-medium"
                disabled={isSubmitting}
            />

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !feedback.trim()}
                    className="flex items-center gap-2 px-8 py-3 bg-foreground text-background font-black uppercase tracking-widest text-sm rounded-full shadow-[0_4px_0_0_hsl(var(--foreground)/0.3)] active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all hover:bg-foreground/90"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    Send Signal
                </button>
            </div>
        </form>
    );
}
