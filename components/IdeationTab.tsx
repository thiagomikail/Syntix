"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useGamification } from "@/components/GamificationContext";
import { Target, Search, Monitor, Zap, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateConcept } from "@/app/actions/ideation";
import { cn } from "@/lib/utils";

interface IdeationTabProps {
    onIdeaGenerated?: (idea: string) => void;
}

export function IdeationTab({ onIdeaGenerated }: IdeationTabProps) {
    const { t, language } = useLanguage();
    const { addXP } = useGamification();
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const channels = [
        {
            id: "Market Pull",
            icon: Search,
            color: "blue",
            title: t.ideation.channels.marketPull.title,
            description: t.ideation.channels.marketPull.description,
            prompt: t.ideation.channels.marketPull.prompt
        },
        {
            id: "Pain-Storming",
            icon: Target,
            color: "red",
            title: t.ideation.channels.painStorming.title,
            description: t.ideation.channels.painStorming.description,
            prompt: t.ideation.channels.painStorming.prompt
        },
        {
            id: "Tech Push",
            icon: Monitor,
            color: "purple",
            title: t.ideation.channels.techPush.title,
            description: t.ideation.channels.techPush.description,
            prompt: t.ideation.channels.techPush.prompt
        },
        {
            id: "External Shocks",
            icon: Zap,
            color: "yellow",
            title: t.ideation.channels.externalShocks.title,
            description: t.ideation.channels.externalShocks.description,
            prompt: t.ideation.channels.externalShocks.prompt
        }
    ];

    const handleIgnite = async (channelId?: string, customInput?: string) => {
        const activeChannel = channelId || selectedChannel || "Direct Feed";
        const activeInput = customInput || input;

        if (!activeInput.trim()) return;

        console.log("Igniting concept...", { activeChannel, activeInput, language });
        setIsGenerating(true);
        try {
            const result = await generateConcept(activeChannel, activeInput, language);
            console.log("Concept generation result:", result);

            if (result && !result.startsWith("Error:")) {
                addXP(50, "Ignited Idea"); // Award XP
                if (onIdeaGenerated) {
                    onIdeaGenerated(result);
                } else {
                    console.warn("onIdeaGenerated callback is missing!");
                }
            } else {
                alert(`The Input Manifold failed to ignite: ${result || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to generate concept", error);
            alert("Connection error. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };



    return (
        <div className="flex flex-col h-full overflow-y-auto p-6 gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700 scrollbar-hide relative pb-20">
            <div className="text-center py-8">
                <h1 className="text-4xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-4">
                    {t.ideation.title}
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    {t.ideation.subtitle}
                </p>
            </div>

            {/* Direct Input (Open Topic) */}
            <div className="w-full max-w-2xl mx-auto mb-8 relative z-20">
                <div className="bg-secondary/10 border border-primary/20 p-1 rounded-xl shadow-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                    <AutoResizeTextarea
                        value={selectedChannel === null ? input : ""}
                        onChange={(e) => {
                            setSelectedChannel(null); // Clear channel selection if typing here
                            setInput(e.target.value);
                        }}
                        placeholder={language === 'pt' ? "Descreva uma ideia livremente ou selecione um canal abaixo..." : "Describe an idea freely or select a channel below..."}
                        className="w-full bg-transparent border-none text-lg p-4 focus:ring-0 placeholder:text-muted-foreground/50 min-h-[80px]"
                    />
                    <div className="flex justify-between items-center px-4 pb-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                            {language === 'pt' ? "Entrada Livre" : "Direct Feed"}
                        </span>
                        <button
                            onClick={() => handleIgnite("Direct Feed", input)}
                            disabled={!input.trim() || !!selectedChannel || isGenerating}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
                        >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {channels.map((channel) => {
                    const isSelected = selectedChannel === channel.id;
                    const isOtherSelected = selectedChannel !== null && !isSelected;

                    return (
                        <motion.div
                            key={channel.id}
                            layout
                            onClick={() => {
                                setSelectedChannel(isSelected ? null : channel.id);
                                if (!isSelected) setInput(""); // Clear input when switching channels
                            }}
                            className={cn(
                                "bg-secondary/10 border p-6 rounded-xl transition-all cursor-pointer group relative overflow-hidden",
                                isSelected ? "border-primary bg-secondary/20 ring-2 ring-primary/20 col-span-1 md:col-span-2" : "border-border hover:bg-secondary/20",
                                isOtherSelected ? "opacity-50 scale-95" : "opacity-100"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={cn(
                                        "p-3 rounded-xl transition-colors",
                                        `bg-${channel.color}-500/10 text-${channel.color}-400 group-hover:text-${channel.color}-300`
                                    )}>
                                        <channel.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{channel.title}</h3>
                                        {!isSelected && (
                                            <p className="text-sm text-muted-foreground mt-1">{channel.description}</p>
                                        )}
                                    </div>
                                </div>
                                {isSelected && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedChannel(null); }}
                                        className="text-muted-foreground hover:text-foreground text-sm"
                                    >
                                        {t.common.close}
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 border-t border-white/5 pt-4"
                                    >
                                        <label className="text-sm font-mono uppercase tracking-wider text-muted-foreground block mb-3">
                                            {channel.prompt}
                                        </label>
                                        <AutoResizeTextarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={t.inception.placeholder}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                                            autoFocus
                                        />
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleIgnite(); }}
                                                disabled={!input.trim() || isGenerating}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        {t.ideation.synthesizing}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4" />
                                                        {t.ideation.ignite}
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

const AutoResizeTextarea = ({ value, onChange, placeholder, className, autoFocus }: { value: string, onChange: (e: any) => void, placeholder: string, className?: string, autoFocus?: boolean }) => {
    return (
        <textarea
            value={value}
            onChange={(e) => {
                onChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onClick={(e) => e.stopPropagation()}
            className={cn("resize-none overflow-hidden", className)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={3}
            style={{ height: 'auto' }}
        />
    );
};
