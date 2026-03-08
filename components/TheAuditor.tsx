"use client";

import React, { useState } from "react";

interface TheAuditorProps {
    onSubmit: (idea: string) => void;
    isAnalyzing: boolean;
    title?: string;
    initialValue?: string;
}

export function TheAuditor({ onSubmit, isAnalyzing, title = "Edit Thesis", initialValue }: TheAuditorProps) {
    const [idea, setIdea] = useState(initialValue || "");

    React.useEffect(() => {
        if (initialValue) setIdea(initialValue);
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) onSubmit(idea);
    };

    return (
        <div className="w-full space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
                    {title}
                </h2>
                {isAnalyzing && (
                    <div className="flex items-center gap-1 text-xs text-primary animate-pulse">
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        Analyzing...
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Write your thesis..."
                    disabled={isAnalyzing}
                    className="flex-1 min-h-[150px] p-4 bg-[#222222] text-white border border-primary/10 rounded-xl text-sm focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all resize-none placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
                />
                <button
                    type="submit"
                    disabled={!idea.trim() || isAnalyzing}
                    className="flex items-center justify-center gap-2 h-10 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-primary/25 hover:shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isAnalyzing ? (
                        <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Processing</>
                    ) : (
                        <><span className="material-symbols-outlined text-sm">send</span> Audit</>
                    )}
                </button>
            </form>
        </div>
    );
}
