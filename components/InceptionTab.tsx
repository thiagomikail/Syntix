"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Target, TrendingUp, AlertTriangle, Send, Loader2 } from "lucide-react";
import { classifyIdea } from "@/app/actions/classify-idea";
import { InceptionAnalysis, InceptionPath } from "@/types/inception";
import { cn } from "@/lib/utils";

import { useGamification } from "@/components/GamificationContext";

interface InceptionTabProps {
    onPitch?: (idea: string, analysis: InceptionAnalysis) => void;
    initialValue?: string;
    isActive?: boolean;
}

export function InceptionTab({ onPitch, initialValue, isActive }: InceptionTabProps) {
    const { t, language } = useLanguage();
    const { addXP } = useGamification();
    const [idea, setIdea] = useState(initialValue || "");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<InceptionAnalysis | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isActive && inputRef.current) {
            // Small timeout to allow transition/visibility to settle
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isActive]);

    const handleClassify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idea.trim()) return;

        setAnalyzing(true);
        setResult(null);
        try {
            const data = await classifyIdea(idea, language);
            setResult(data);
            addXP(100, "Analyzed Idea");
        } catch (error) {
            console.error("Classification error", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const paths: {
        id: InceptionPath;
        label: string;
        icon: string;
        description: string;
        authors: string;
        examples: string;
    }[] = [
            {
                id: 'micro',
                label: t.inception.paths.micro.label,
                icon: "🌱",
                description: t.inception.paths.micro.description,
                authors: "Pieter Levels, Justin Jackson",
                examples: "NomadList, Bannerbear"
            },
            {
                id: 'specialist',
                label: t.inception.paths.specialist.label,
                icon: "🔬",
                description: t.inception.paths.specialist.description,
                authors: "Eric Ries, Bill Aulet",
                examples: "Salesforce (early), Hubspot"
            },
            {
                id: 'venture',
                label: t.inception.paths.venture.label,
                icon: "🚀",
                description: t.inception.paths.venture.description,
                authors: "Paul Graham, Sam Altman",
                examples: "Airbnb, Stripe, DoorDash"
            },
            {
                id: 'paradigm',
                label: t.inception.paths.paradigm.label,
                icon: "🌌",
                description: t.inception.paths.paradigm.description,
                authors: "Peter Thiel, Reid Hoffman",
                examples: "SpaceX, Tesla, Google"
            },
            {
                id: 'dead_end',
                label: t.inception.paths.dead_end.label,
                icon: "💀",
                description: t.inception.paths.dead_end.description,
                authors: "Common Sense",
                examples: "Another To-Do List, Uber for Pet Rock"
            },
        ];

    return (
        <div className="flex flex-col h-full overflow-y-auto p-6 gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700 scrollbar-hide">

            {/* Input Section */}
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8 py-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        {t.inception.title}
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg font-light">
                        {t.inception.subtitle}
                    </p>
                </div>

                <div className="w-full max-w-2xl relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-1000 rounded-full" />
                    <div className="relative flex items-center bg-secondary/50 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-white/20 focus-within:bg-secondary">
                        <input
                            ref={inputRef}
                            type="text"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleClassify(e)}
                            placeholder={t.inception.placeholder}
                            disabled={analyzing}
                            autoFocus
                            className="flex-1 bg-transparent px-6 py-4 outline-none text-lg text-foreground placeholder:text-muted-foreground/50 w-full"
                        />
                        <button
                            onClick={handleClassify}
                            disabled={!idea.trim() || analyzing}
                            className="bg-primary hover:bg-white/90 text-black p-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {analyzing ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <ArrowRight className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-12 gap-6 pb-20"
                    >
                        {/* Spectrum Visualization (Full Width) */}
                        <motion.div variants={itemVariants} className="col-span-12">
                            <div className="bg-card border border-border rounded-2xl p-8 backdrop-blur-md">
                                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-8 text-center opacity-50">
                                    {t.inception.spectrum}
                                </div>
                                <div className="flex flex-col md:flex-row justify-between gap-4 overflow-x-visible pb-4 mb-4 relative z-10">
                                    {paths.map(path => {
                                        const isMatch = result.classification.path === path.id;
                                        return (
                                            <div
                                                key={path.id}
                                                className={cn(
                                                    "relative group flex-1 p-6 rounded-xl border transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-default",
                                                    isMatch
                                                        ? "bg-primary/10 border-primary shadow-sm z-20"
                                                        : "bg-secondary/40 border-transparent hover:bg-secondary hover:border-white/5 opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{path.icon}</div>
                                                <div className={cn("text-sm font-medium", isMatch ? "text-primary" : "text-muted-foreground")}>
                                                    {path.label.split(": ")[1]}
                                                </div>

                                                {/* Tooltip (Balloon Style) */}
                                                <div className="absolute bottom-[calc(100%+1rem)] left-1/2 -translate-x-1/2 w-64 p-4 bg-popover text-popover-foreground text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-border">
                                                    <div className="font-semibold mb-2 text-base border-b border-border/50 pb-2">{path.label.split(": ")[1]}</div>
                                                    <p className="text-muted-foreground mb-3 leading-relaxed">{path.description}</p>
                                                    <div className="space-y-1 bg-secondary/30 p-2 rounded-lg">
                                                        <div className="flex gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">Authors</div>
                                                        <div className="font-medium text-foreground mb-2">{path.authors}</div>
                                                        <div className="flex gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">Examples</div>
                                                        <div className="font-medium text-foreground">{path.examples}</div>
                                                    </div>
                                                    {/* Arrow */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-4 h-4 bg-popover border-r border-b border-border rotate-45 transform"></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Reasoning Display (New) */}
                                <div className="text-center px-4 md:px-12 mt-8">
                                    <blockquote className="text-xl font-medium text-foreground/80 border-l-2 border-primary/50 pl-6 py-2 italic text-left max-w-4xl mx-auto">
                                        "{result.classification.reasoning}"
                                    </blockquote>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 2: Market Research (Left Col) */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 flex flex-col gap-6">
                            <div className="bg-secondary/5 border border-border rounded-xl p-6 h-full backdrop-blur-sm hover:bg-secondary/10 transition-colors">
                                <div className="flex items-center gap-2 mb-6">
                                    <Target className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t.inception.sections.marketResearch}</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid gap-4">
                                        <div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">{t.inception.sections.tam}</div>
                                            <div className="text-sm font-medium text-foreground">{result?.marketResearch?.tam || "N/A"}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">{t.inception.sections.sam}</div>
                                            <div className="text-sm font-medium text-foreground">{result?.marketResearch?.sam || "N/A"}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">{t.inception.sections.som}</div>
                                            <div className="text-sm font-medium text-foreground">{result?.marketResearch?.som || "N/A"}</div>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-border/50">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">{t.inception.sections.niche}</div>
                                        <p className="text-sm leading-relaxed text-foreground/80">{result?.marketResearch?.niche || "No niche strategy available."}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3: Execution Strategy (Right Col) */}
                        <motion.div variants={itemVariants} className="col-span-12 md:col-span-8 flex flex-col gap-6">
                            <div className="bg-secondary/5 border border-border rounded-xl p-6 h-full backdrop-blur-sm hover:bg-secondary/10 transition-colors relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{t.inception.sections.strategicRoadmap}</h3>
                                    </div>

                                    {/* Create Pitch Button */}
                                    <button
                                        onClick={() => onPitch && onPitch(idea, result)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-background hover:bg-primary/90 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-lg shadow-primary/20"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        {t.common.pitchThis}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    {/* Month 1 */}
                                    <div>
                                        <div className="flex items-center gap-2 text-primary mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <h4 className="text-xs font-bold uppercase tracking-widest">
                                                {t.common.month1}: {t.inception.sections.validation}
                                            </h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {result?.strategy?.sales1M?.map((step, i) => (
                                                <li key={i} className="text-sm text-foreground/80 leading-relaxed pl-4 border-l border-border/50">
                                                    {step}
                                                </li>
                                            )) || <li className="text-sm text-muted-foreground">No steps available.</li>}
                                        </ul>
                                    </div>

                                    {/* Month 6 */}
                                    <div>
                                        <div className="flex items-center gap-2 text-primary mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                {t.common.month6}: {t.inception.sections.systems}
                                            </h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {result?.strategy?.sales6M?.map((step, i) => (
                                                <li key={i} className="text-sm text-foreground/80 leading-relaxed pl-4 border-l border-border/50">
                                                    {step}
                                                </li>
                                            )) || <li className="text-sm text-muted-foreground">No steps available.</li>}
                                        </ul>
                                    </div>
                                </div>

                                {/* First 3 Steps & What Else */}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                                            <Target className="w-3 h-3" />
                                            {t.common.immediateActions}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {result?.execution?.first3Steps?.map((step, i) => (
                                                <div key={i} className="p-3 bg-secondary/30 rounded-lg border border-white/5 text-sm font-medium text-foreground/90 flex gap-3">
                                                    <span className="text-muted-foreground font-mono text-xs">{i + 1}</span>
                                                    {step}
                                                </div>
                                            )) || <div className="text-sm text-muted-foreground">No immediate actions available.</div>}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            {result.classification.path === 'dead_end' ? t.common.realityCheck : t.common.theEdge}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                                            "{result.execution.whatElse}"
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
