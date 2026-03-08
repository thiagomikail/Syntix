"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { classifyIdea } from "@/app/actions/classify-idea";
import { motion, AnimatePresence } from "framer-motion";
import { InceptionAnalysis } from "@/types/inception";
import { VoiceInput } from "@/components/VoiceInput";

interface InceptionTabProps {
    ideaId: string;
    onPitch?: (text: string, analysis: InceptionAnalysis) => void;
    initialValue?: string;
    isActive?: boolean;
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const archetypeConfig: Record<string, { icon: string; color: string; description: string }> = {
    "cash_cow": { icon: "savings", color: "#22c55e", description: "Low scale, high margin" },
    "cash_farm": { icon: "agriculture", color: "#3b82f6", description: "Scale through specialists" },
    "new_meat": { icon: "rocket_launch", color: "#a855f7", description: "VC-backed, high risk/return" },
    "ozempics": { icon: "biotech", color: "#f59e0b", description: "Deep tech, behavior change" },
    "dead_end": { icon: "dangerous", color: "#ef4444", description: "No return, even with risk" },
};

const archetypeLabels: Record<string, string> = {
    "cash_cow": "Cash Cow",
    "cash_farm": "Cash Farm",
    "new_meat": "New Meat",
    "ozempics": "Ozempics",
    "dead_end": "Dead End",
};

export function InceptionTab({ ideaId, onPitch, initialValue = "", isActive }: InceptionTabProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [idea, setIdea] = useState(initialValue);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<InceptionAnalysis | null>(null);

    useEffect(() => { if (initialValue) setIdea(initialValue); }, [initialValue]);
    useEffect(() => { if (isActive && inputRef.current && !result) inputRef.current.focus(); }, [isActive, result]);

    useEffect(() => {
        if (initialValue && !result && isActive) {
            handleClassify();
        }
    }, [initialValue, isActive]);

    const handleClassify = async () => {
        if (!idea.trim() || analyzing) return;
        setAnalyzing(true);
        setResult(null);
        try {
            const data = await classifyIdea(ideaId, idea);
            setResult(data);
        } catch (error) {
            console.error("Classification failed:", error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 text-white">
            {/* Input Section */}
            {!result && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8 py-12">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            <span className="text-primary">Análise</span> e Refino
                        </h1>
                        <p className="text-slate-400 max-w-md mx-auto text-sm">
                            Classify your idea into a business archetype and get deep strategic intelligence.
                        </p>
                    </div>

                    <div className="w-full max-w-xl relative">
                        <div className="relative flex items-center bg-[#1A1A1A] rounded-xl p-2 border border-primary/10">
                            <input
                                ref={inputRef}
                                type="text"
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleClassify()}
                                placeholder="Paste or type your idea..."
                                className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-slate-500 text-white"
                            />
                            <VoiceInput
                                onTranscript={(t) => setIdea(prev => prev ? prev + " " + t : t)}
                                disabled={analyzing}
                            />
                            <button
                                onClick={handleClassify}
                                disabled={!idea.trim() || analyzing}
                                className="bg-primary text-white p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-glow-primary ml-1"
                            >
                                {analyzing ? (
                                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-xl">search</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {/* 5 Archetype Spectrum */}
                        <motion.div variants={itemVariants}>
                            <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 text-center">
                                    Business Archetype Classification
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {Object.entries(archetypeConfig).map(([key, config]) => {
                                        const isMatch = result.classification?.path === key;
                                        return (
                                            <div
                                                key={key}
                                                className={cn(
                                                    "p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all",
                                                    isMatch
                                                        ? "ring-2 bg-opacity-10"
                                                        : "bg-[#222222] opacity-40"
                                                )}
                                                style={isMatch ? {
                                                    backgroundColor: config.color + "15",
                                                    border: `2px solid ${config.color}`,
                                                    boxShadow: `0 0 20px ${config.color}20`
                                                } : undefined}
                                            >
                                                <span
                                                    className="material-symbols-outlined text-2xl"
                                                    style={{ color: isMatch ? config.color : "#64748b" }}
                                                >
                                                    {config.icon}
                                                </span>
                                                <span
                                                    className="text-xs font-bold"
                                                    style={{ color: isMatch ? config.color : "#64748b" }}
                                                >
                                                    {archetypeLabels[key]}
                                                </span>
                                                <span className="text-[10px] text-slate-500">{config.description}</span>
                                                {isMatch && (
                                                    <span className="text-[10px] text-slate-300 mt-1">{result.classification?.reasoning}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        {/* Strategic Map: 3 Sections */}
                        <div className="grid grid-cols-12 gap-4">
                            {/* Market Research */}
                            <motion.div variants={itemVariants} className="col-span-12 md:col-span-4">
                                <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6 h-full">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="material-symbols-outlined text-primary">target</span>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Pesquisa de Mercado</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: "TAM", value: result.marketResearch?.tam },
                                            { label: "SAM", value: result.marketResearch?.sam },
                                            { label: "SOM", value: result.marketResearch?.som },
                                        ].map((item) => (
                                            <div key={item.label}>
                                                <span className="text-xs font-bold text-slate-400 uppercase">{item.label}</span>
                                                <p className="text-sm mt-0.5">{item.value || "N/A"}</p>
                                            </div>
                                        ))}
                                        <div className="pt-3 border-t border-primary/10">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Persona</span>
                                            <p className="text-sm mt-0.5">{result.marketResearch?.persona || "N/A"}</p>
                                        </div>
                                        {result.marketResearch?.competitors && result.marketResearch.competitors.length > 0 && (
                                            <div className="pt-3 border-t border-primary/10">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Competitors</span>
                                                <ul className="mt-1 space-y-1">
                                                    {result.marketResearch.competitors.map((c, i) => (
                                                        <li key={i} className="text-sm flex items-start gap-1.5">
                                                            <span className="material-symbols-outlined text-xs text-red-400 mt-0.5">group</span>
                                                            {c}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.marketResearch?.leveragePoints && result.marketResearch.leveragePoints.length > 0 && (
                                            <div className="pt-3 border-t border-primary/10">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Leverage Points</span>
                                                <ul className="mt-1 space-y-1">
                                                    {result.marketResearch.leveragePoints.map((l, i) => (
                                                        <li key={i} className="text-sm flex items-start gap-1.5">
                                                            <span className="material-symbols-outlined text-xs text-accent-cyan mt-0.5">trending_up</span>
                                                            {l}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Strategy */}
                            <motion.div variants={itemVariants} className="col-span-12 md:col-span-4">
                                <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6 h-full">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="material-symbols-outlined text-primary">route</span>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Estratégia</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {result.strategy?.monetization && result.strategy.monetization.length > 0 && (
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase">Monetization</span>
                                                <ul className="mt-1 space-y-1">
                                                    {result.strategy.monetization.map((m, i) => (
                                                        <li key={i} className="text-sm flex items-start gap-1.5">
                                                            <span className="material-symbols-outlined text-xs text-green-400 mt-0.5">payments</span>
                                                            {m}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.strategy?.distribution && result.strategy.distribution.length > 0 && (
                                            <div className="pt-3 border-t border-primary/10">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Distribution</span>
                                                <ul className="mt-1 space-y-1">
                                                    {result.strategy.distribution.map((d, i) => (
                                                        <li key={i} className="text-sm flex items-start gap-1.5">
                                                            <span className="material-symbols-outlined text-xs text-blue-400 mt-0.5">share</span>
                                                            {d}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.strategy?.moat && (
                                            <div className="pt-3 border-t border-primary/10">
                                                <span className="text-xs font-bold text-slate-400 uppercase">MOAT</span>
                                                <p className="text-sm mt-0.5">{result.strategy.moat}</p>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-primary/10 grid grid-cols-2 gap-3">
                                            <div className="rounded-lg bg-[#222222] p-3">
                                                <h4 className="text-[10px] font-bold text-primary mb-2">Month 1</h4>
                                                <ul className="space-y-1">
                                                    {result.strategy?.sales1M?.map((item, i) => (
                                                        <li key={i} className="text-[11px] flex items-start gap-1">
                                                            <span className="material-symbols-outlined text-[10px] text-accent-cyan mt-0.5">check_circle</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="rounded-lg bg-[#222222] p-3">
                                                <h4 className="text-[10px] font-bold text-primary mb-2">Month 6</h4>
                                                <ul className="space-y-1">
                                                    {result.strategy?.sales6M?.map((item, i) => (
                                                        <li key={i} className="text-[11px] flex items-start gap-1">
                                                            <span className="material-symbols-outlined text-[10px] text-accent-cyan mt-0.5">check_circle</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Execution Plan */}
                            <motion.div variants={itemVariants} className="col-span-12 md:col-span-4">
                                <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6 h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">engineering</span>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Plano de Execução</h3>
                                        </div>
                                        <button
                                            onClick={() => onPitch && onPitch(idea, result)}
                                            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                            Stress Test
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {/* 30 / 90 / 180 day plan */}
                                        {[
                                            { label: "30 Days", items: result.execution?.plan30d, color: "text-green-400" },
                                            { label: "90 Days", items: result.execution?.plan90d, color: "text-blue-400" },
                                            { label: "180 Days", items: result.execution?.plan180d, color: "text-purple-400" },
                                        ].map((plan) => (
                                            plan.items && plan.items.length > 0 && (
                                                <div key={plan.label}>
                                                    <span className="text-xs font-bold text-slate-400 uppercase">{plan.label}</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {plan.items.map((item, i) => (
                                                            <li key={i} className="text-sm flex items-start gap-1.5">
                                                                <span className={cn("material-symbols-outlined text-xs mt-0.5", plan.color)}>schedule</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )
                                        ))}

                                        {/* Team Competences */}
                                        {result.execution?.teamCompetences && result.execution.teamCompetences.length > 0 && (
                                            <div className="pt-3 border-t border-primary/10">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Team Needed</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {result.execution.teamCompetences.map((c, i) => (
                                                        <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Partnership Suggestions */}
                                        {result.execution?.partnershipSuggestions && result.execution.partnershipSuggestions.length > 0 && (
                                            <div className="pt-3 border-t border-primary/10">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Partnerships</span>
                                                <ul className="mt-1 space-y-1">
                                                    {result.execution.partnershipSuggestions.map((p, i) => (
                                                        <li key={i} className="text-sm flex items-start gap-1.5">
                                                            <span className="material-symbols-outlined text-xs text-amber-400 mt-0.5">handshake</span>
                                                            {p}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Domain Insight */}
                                        {result.execution?.whatElse && (
                                            <div className="pt-3 border-t border-primary/10 rounded-lg bg-primary/5 p-3">
                                                <span className="text-xs font-bold text-primary uppercase">Insight</span>
                                                <p className="text-sm mt-1 text-slate-300">{result.execution.whatElse}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
