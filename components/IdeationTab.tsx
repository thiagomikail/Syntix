"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { generateChannelIdeas } from "@/app/actions/ideation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";
import { VoiceInput } from "@/components/VoiceInput";
import { ArenaCarousel } from "@/components/ArenaCarousel";

interface IdeationTabProps {
    ideaId: string;
    onIdeaGenerated: (text: string) => void;
    autoIgnite?: string;
}

function AutoResizeTextarea({ value, onChange, placeholder, className, disabled }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = ref.current.scrollHeight + "px";
        }
    }, [value]);
    return (
        <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            rows={1}
        />
    );
}

const authorSuggestions: Record<string, { name: string; focus: string }[]> = {
    pain: [
        { name: "Clayton Christensen", focus: "Disruptive Innovation" },
        { name: "Eric Ries", focus: "Lean Startup" },
        { name: "Steve Blank", focus: "Customer Development" },
    ],
    technology: [
        { name: "Peter Thiel", focus: "Zero to One / Monopoly" },
        { name: "Pieter Levels", focus: "Indie Hacking" },
        { name: "Sam Altman", focus: "AI-First Ventures" },
    ],
    market: [
        { name: "Bill Aulet", focus: "Disciplined Entrepreneurship" },
        { name: "Alexander Osterwalder", focus: "Business Model Canvas" },
        { name: "Clayton Christensen", focus: "Jobs-to-be-Done" },
    ],
    shocks: [
        { name: "Nassim Taleb", focus: "Antifragile / Black Swan" },
        { name: "Reid Hoffman", focus: "Blitzscaling" },
        { name: "Peter Diamandis", focus: "Bold / Exponential Thinking" },
    ],
};

export function IdeationTab({ ideaId, onIdeaGenerated, autoIgnite }: IdeationTabProps) {
    const { t } = useLanguage();
    const [input, setInput] = useState(autoIgnite || "");
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedText, setGeneratedText] = useState<string | null>(null);

    const channels = [
        {
            id: "pain",
            title: "Pain-Storming",
            icon: "mood_bad",
            description: "Turn frustrations into business opportunities. Describe a problem you've faced.",
            topics: ["Healthcare access", "Remote work fatigue", "Food waste", "Financial literacy", "Supply chain delays"],
        },
        {
            id: "technology",
            title: "Technology",
            icon: "biotech",
            description: "Explore cutting-edge tech: AI world models, nanotech, swarm robotics, quantum computing.",
            topics: ["AI world models", "Swarm robotics", "Nanotechnology", "Quantum computing", "Brain-computer interfaces"],
        },
        {
            id: "market",
            title: "Demandas de Mercado",
            icon: "trending_up",
            description: "Open innovation bids, FINEP calls, DoE opportunities, and untapped market demands.",
            topics: ["Open innovation RFPs", "FINEP public calls", "US DoE grants", "EU Horizon Europe", "Climate tech tenders"],
        },
        {
            id: "shocks",
            title: "Choques Externos",
            icon: "bolt",
            description: "Major disruptions happening now. How can you ride the wave?",
            topics: ["AI workforce shift", "De-globalization", "Energy transition", "Aging populations", "Post-pandemic behaviors"],
        },
    ];

    const handleIgnite = useCallback(async (channelId?: string, text?: string) => {
        const finalInput = text || input;
        if (!finalInput.trim() || isGenerating) return null;
        setIsGenerating(true);
        setGeneratedText(null);

        try {
            const result = await generateChannelIdeas(ideaId, channelId || selectedChannel || "direct", finalInput);
            setGeneratedText(result);
            return result;
        } catch (error) {
            console.error("Generation failed:", error);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [input, selectedChannel, isGenerating, ideaId]);

    const autoIgniteFired = useRef(false);
    useEffect(() => {
        if (autoIgnite && !autoIgniteFired.current) {
            autoIgniteFired.current = true;
            handleIgnite("direct", autoIgnite).then((res) => {
                if (res) {
                    onIdeaGenerated(res);
                }
            });
        }
    }, [autoIgnite, handleIgnite, onIdeaGenerated]);

    const handleProceed = () => {
        if (generatedText) {
            onIdeaGenerated(generatedText);
        }
    };

    const handleVoiceTranscript = useCallback((transcript: string) => {
        setInput(prev => prev ? prev + " " + transcript : transcript);
    }, []);

    const activeAuthors = selectedChannel ? authorSuggestions[selectedChannel] || [] : [];

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 text-white">
            {/* Hero Input */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[#1A1A1A] p-6 md:p-8">
                <div className="absolute -top-20 -right-20 size-40 rounded-full bg-primary/10 blur-[60px]"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                        <span className="text-primary">INPUT</span> YOUR IDEA
                    </h1>
                    <p className="text-sm text-slate-400 mb-6">Describe your concept, then ignite the engine.</p>

                    <div className="bg-black/50 rounded-xl p-2 border border-primary/10">
                        <AutoResizeTextarea
                            value={selectedChannel === null ? input : ""}
                            onChange={(e) => { if (selectedChannel === null) setInput(e.target.value); }}
                            placeholder="Describe your business idea..."
                            disabled={!!selectedChannel || isGenerating}
                            className="w-full bg-transparent text-white resize-none p-4 text-base placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => handleIgnite("direct", input)}
                            disabled={!input.trim() || !!selectedChannel || isGenerating}
                            className={cn(
                                "flex h-12 flex-1 md:flex-none items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all",
                                (!input.trim() || !!selectedChannel || isGenerating)
                                    ? "bg-primary/50 cursor-not-allowed"
                                    : "bg-primary hover:shadow-glow-primary"
                            )}
                        >
                            {isGenerating ? (
                                <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Generating...</>
                            ) : (
                                <><span className="material-symbols-outlined text-lg">bolt</span> IGNITE</>
                            )}
                        </button>
                        <VoiceInput
                            onTranscript={handleVoiceTranscript}
                            disabled={!!selectedChannel || isGenerating}
                        />
                    </div>
                </div>
            </div>

            {/* Arena Carousel - Moved up here for immediate visibility */}
            <div className="mt-8 mb-8">
                <ArenaCarousel />
            </div>

            {/* Channel Grid */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Or explore a channel</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {channels.map((channel) => {
                        const isSelected = selectedChannel === channel.id;
                        return (
                            <motion.div
                                key={channel.id}
                                layout
                                onClick={() => {
                                    if (isSelected) { setSelectedChannel(null); }
                                    else { setSelectedChannel(channel.id); setInput(""); }
                                }}
                                className={cn(
                                    "group flex flex-col rounded-2xl border p-5 transition-all cursor-pointer text-white",
                                    isSelected
                                        ? "border-primary bg-primary/5 col-span-1 sm:col-span-2 ring-2 ring-primary"
                                        : "border-primary/10 bg-[#1A1A1A] hover:bg-[#222222] hover:border-primary/50",
                                    selectedChannel && !isSelected ? "opacity-40 pointer-events-none" : ""
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined">{channel.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold tracking-tight">{channel.title}</h3>
                                            {!isSelected && <p className="text-xs text-slate-400">{channel.description}</p>}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedChannel(null); }}
                                            className="text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                                        >
                                            CLOSE
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 space-y-3"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Hot Topics</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {channel.topics.map((topic, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={(e) => { e.stopPropagation(); setInput((prev) => prev ? prev + " " + topic : topic); }}
                                                            className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                                                        >
                                                            {topic}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <AutoResizeTextarea
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    placeholder={`Describe your ${channel.title.toLowerCase()} idea...`}
                                                    disabled={isGenerating}
                                                    className="flex-1 bg-black/50 text-white border border-primary/10 rounded-xl p-4 resize-none text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                                <VoiceInput
                                                    onTranscript={handleVoiceTranscript}
                                                    disabled={isGenerating}
                                                    className="self-end"
                                                />
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleIgnite(); }}
                                                disabled={!input.trim() || isGenerating}
                                                className={cn(
                                                    "flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all",
                                                    (!input.trim() || isGenerating) ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:shadow-glow-primary"
                                                )}
                                            >
                                                {isGenerating ? (
                                                    <><span className="material-symbols-outlined animate-spin">progress_activity</span> Generating...</>
                                                ) : (
                                                    <><span className="material-symbols-outlined">bolt</span> IGNITE</>
                                                )}
                                            </button>

                                            {/* Author Suggestions */}
                                            {activeAuthors.length > 0 && (
                                                <div className="mt-2 pt-3 border-t border-primary/10">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Thought Leaders in this Space</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeAuthors.map((author, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[10px] text-slate-300 border border-slate-700">
                                                                <span className="material-symbols-outlined text-xs text-primary">person</span>
                                                                <span className="font-semibold">{author.name}</span>
                                                                <span className="text-slate-500">· {author.focus}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Generated Result */}
            <AnimatePresence>
                {generatedText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="rounded-2xl border border-primary/30 bg-[#1A1A1A] p-6 shadow-glow-primary"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Generated Concept</h3>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-6 text-white">{generatedText}</p>
                        <button
                            onClick={handleProceed}
                            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all"
                        >
                            <span className="material-symbols-outlined">arrow_forward</span>
                            Proceed to Refino
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Arena Carousel was moved up */}
        </div>
    );
}
