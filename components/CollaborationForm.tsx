"use client";

import { useState } from "react";
import { submitCollaboration } from "@/app/actions/collaborate";
import { useSession } from "next-auth/react";

export function CollaborationForm({ ideaId }: { ideaId: string }) {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;

    const [type, setType] = useState("market");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !userId) return;

        setIsSubmitting(true);
        try {
            await submitCollaboration(ideaId, type, content);
            setSuccess(true);
            setContent("");
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to submit collaboration:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-primary/20 bg-[#1A1A1A] p-6 shadow-lg shadow-black mx-auto relative z-10 w-full mb-12">
            <h3 className="text-xl font-bold text-white mb-2">Contribute to this Venture</h3>
            <p className="text-sm text-slate-400 mb-6">Found an angle the creator missed? Submit structured feedback to earn Collab Points (CP).</p>

            <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
                {[
                    { id: "market", label: "Market / Go-To-Market", icon: "trending_up" },
                    { id: "execution", label: "Execution / Operations", icon: "rocket_launch" },
                    { id: "tech", label: "Tech / Product", icon: "memory" },
                    { id: "unit_econ", label: "Unit Economics", icon: "payments" },
                    { id: "moat", label: "Defensibility / Moat", icon: "shield" },
                ].map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${type === t.id
                            ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-[inset_0_0_10px_rgba(0,245,255,0.1)]"
                            : "bg-black border-slate-700 text-slate-400 hover:border-slate-500"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your suggestion... Ensure it is actionable."
                className="w-full h-32 bg-black border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder:text-slate-600 resize-none transition-all mb-4"
                disabled={isSubmitting}
            />

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent-cyan text-slate-900 font-bold text-sm rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shadow-lg shadow-accent-cyan/20 cursor-pointer w-full md:w-auto justify-center"
                >
                    {isSubmitting ? (
                        <>
                            <div className="size-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
                            Submitting...
                        </>
                    ) : success ? (
                        <>
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Submitted!
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">send</span>
                            Submit Feedback
                        </>
                    )}
                </button>
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </form>
    );
}
