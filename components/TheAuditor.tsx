"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface TheAuditorProps {
    onSubmit: (idea: string) => void;
    isAnalyzing: boolean;
    title?: string;
    initialValue?: string;
}

export function TheAuditor({ onSubmit, isAnalyzing, title, initialValue }: TheAuditorProps) {
    const { t } = useLanguage();
    const [idea, setIdea] = useState(initialValue || "");

    React.useEffect(() => {
        if (initialValue) {
            setIdea(initialValue);
        }
    }, [initialValue]);

    const displayTitle = title || t.auditor.title;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onSubmit(idea);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-primary">
          // {displayTitle}
                </h2>
                {isAnalyzing && (
                    <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t.auditor.analyzing}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative group">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder={t.auditor.placeholder}
                    disabled={isAnalyzing}
                    className="w-full min-h-[150px] p-6 bg-secondary/50 border border-white/10 rounded-xl text-base focus:outline-none focus:border-white/20 focus:bg-secondary focus:ring-0 transition-all resize-none placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed font-sans leading-relaxed"
                />

                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={!idea.trim() || isAnalyzing}
                        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold text-sm tracking-wide rounded-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {isAnalyzing ? t.auditor.processing : t.auditor.submit}
                    </button>
                </div>
            </form>
        </div>
    );
}
