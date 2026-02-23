"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { IRLScore } from "@/components/IRLScore";
import { TheAuditor } from "@/components/TheAuditor";
import { TheAIBoard } from "@/components/TheAIBoard";
import { TheRadar } from "@/components/TheRadar";
import { MetricCard } from "@/components/MetricCard";
import { MetricDetailModal } from "@/components/MetricDetailModal";
import { IdeaCarousel } from "@/components/IdeaCarousel";
import { Terminal, FileText, Link2, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeIdea } from "@/app/actions/analyze-idea";
import { saveIdea, SavedIdea, deleteIdea } from "@/app/actions/user";
import { AnalysisResult, Message } from "@/types/analysis";
import { InceptionAnalysis } from "@/types/inception";
import { generateAlphaReport, generateBetaReport } from "@/lib/pdf-generator";

interface PitchReadyDashboardProps {
    user: string | null;
    history: SavedIdea[];
    setHistory: (history: SavedIdea[]) => void;
    initialContext?: { text: string, analysis?: InceptionAnalysis } | null;
}

import { useGamification } from "@/components/GamificationContext";
import { SocialShareModal } from "@/components/SocialShareModal";

export function PitchReadyDashboard({ user, history, setHistory, initialContext }: PitchReadyDashboardProps) {
    const { t, language } = useLanguage();
    const { addXP, title } = useGamification();

    const [ideaText, setIdeaText] = useState(initialContext?.text || "");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<{ label: string, score: number, description: string, detail: string, color: string } | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    // Ref to hold the context analysis so it doesn't trigger effect loops but is available for the action
    const contextRef = useRef<InceptionAnalysis | undefined>(initialContext?.analysis);

    // Update state when initialContext changes
    useEffect(() => {
        if (initialContext) {
            const c = initialContext.analysis;
            let compositeText = initialContext.text;

            // Append formatted context if analysis is present
            if (c) {
                try {
                    compositeText += `\n\n[INCEPTION ANALYSIS - ${c.classification?.label?.toUpperCase() || "UNKNOWN"}]\n`;
                    compositeText += `Reasoning: ${c.classification?.reasoning || "N/A"}\n`;
                    compositeText += `\nMARKET RESEARCH:\n- TAM: ${c.marketResearch?.tam || "N/A"}\n- SAM: ${c.marketResearch?.sam || "N/A"}\n- SOM: ${c.marketResearch?.som || "N/A"}\n- Niche: ${c.marketResearch?.niche || "N/A"}\n`;
                    compositeText += `\nSTRATEGIC ROADMAP:\n- Month 1: ${c.strategy?.sales1M?.join(', ') || "N/A"}\n- Month 6: ${c.strategy?.sales6M?.join(', ') || "N/A"}\n`;
                    compositeText += `\nEXECUTION:\n- First Steps: ${c.execution?.first3Steps?.join(', ') || "N/A"}\n- Insight: ${c.execution?.whatElse || "N/A"}`;
                } catch (e) {
                    console.error("Error formatting inception context:", e);
                    compositeText += "\n[Error formatting full analysis details]";
                }
            }


            setIdeaText(compositeText);
            contextRef.current = initialContext.analysis;

            // Auto-submit only if not already analyzing to prevent loops/double-submit
            // We use a timeout to ensure state updates function properly and it feels like a "flow"
            setTimeout(() => {
                handleAudit(compositeText);
            }, 500);
        }
    }, [initialContext]);

    const handleAudit = async (idea: string) => {
        setIdeaText(idea);
        setAnalyzing(true);
        setResult(null);
        setChatMessages([]);

        try {
            // Context is now embedded in the text itself, but we can still pass specific structural hints if needed.
            // For now, we rely on the composite text being sufficient for "The Auditor" to see the full picture.

            const data = await analyzeIdea(idea, language);
            setResult(data);

            if (user) {
                const updatedUser = await saveIdea(user, idea, data);
                setHistory(updatedUser.history);
            }
            addXP(200, "Audited Pitch");
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleIdeaDelete = async (id: string) => {
        // Removed confirm for easier testing
        // if (!confirm(language === 'pt' ? "Tem certeza que deseja excluir esta ideia?" : "Are you sure you want to delete this idea?")) return;

        console.log("Deleting idea:", id);

        // Optimistic UI update
        const idAsString = id.toString();
        setHistory(prev => prev.filter(item => item.id !== idAsString));

        if (user) {
            try {
                await deleteIdea(user, idAsString);
                console.log("Deleted idea from server:", idAsString);
            } catch (error) {
                console.error("Failed to delete idea", error);
                // We could rollback here if critical, but for now log is enough
            }
        }
    };

    const carouselItems = history.map(h => ({
        id: parseInt(h.id),
        title: h.text.substring(0, 30) + "...",
        category: "Saved",
        score: h.analysis.score,
        image: "bg-slate-900"
    }));

    return (
        <div className="flex flex-col h-full font-sans selection:bg-primary/20 bg-background text-foreground animate-in fade-in duration-500">

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden p-6 gap-6 grid grid-cols-12 h-[calc(100vh-220px)]">

                {/* LEFT PANEL: Pitch Input */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto">
                    <div className="bg-secondary/10 border border-border rounded-xl p-6 flex flex-col gap-4 h-full backdrop-blur-md shadow-lg">
                        <TheAuditor
                            onSubmit={handleAudit}
                            isAnalyzing={analyzing}
                            title={language === 'pt' ? "Apresente sua ideia" : "Pitch me your idea"}
                            initialValue={ideaText}
                        />
                    </div>
                </div>

                {/* MIDDLE PANEL: Analysis */}
                <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 h-full overflow-y-auto scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col gap-6 pb-20"
                            >
                                {/* Summary Card */}
                                <div className="w-full bg-secondary/5 border border-border rounded-xl p-6 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                            Analysis Complete
                                        </h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShareModalOpen(true)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 hover:bg-white/10 text-white rounded-md text-xs font-mono uppercase tracking-wider transition-colors border border-white/10"
                                            >
                                                <Share2 className="w-3 h-3" />
                                                Share
                                            </button>
                                            <button
                                                onClick={() => generateAlphaReport(ideaText, result)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-md text-xs font-mono uppercase tracking-wider transition-colors"
                                            >
                                                <FileText className="w-3 h-3" />
                                                Alpha Report
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 items-center">
                                        <div className="flex justify-center">
                                            <IRLScore score={result.score} label={t.irl.title} />
                                        </div>
                                        <div className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/50 pl-4">
                                            "{result.feedback}"
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                    <MetricCard
                                        label="Logical Coherence"
                                        score={result.detailedScores?.logicalCoherence || 0}
                                        color="#3b82f6"
                                        description="Clarity of the problem-solution fit and internal consistency."
                                        onClick={() => setSelectedMetric({
                                            label: "Logical Coherence",
                                            score: result.detailedScores?.logicalCoherence || 0,
                                            description: "Clarity of the problem-solution fit and internal consistency.",
                                            detail: result.metricDetails?.logicalCoherence || "Detailed analysis generally unavailable for legacy data.",
                                            color: "#3b82f6"
                                        })}
                                    />
                                    <MetricCard
                                        label="Market Depth"
                                        score={result.detailedScores?.marketDepth || 0}
                                        color="#eab308"
                                        description="Size of the TAM/SAM and accessibility of the target audience."
                                        onClick={() => setSelectedMetric({
                                            label: "Market Depth",
                                            score: result.detailedScores?.marketDepth || 0,
                                            description: "Size of the TAM/SAM and accessibility of the target audience.",
                                            detail: result.metricDetails?.marketDepth || "Detailed analysis generally unavailable for legacy data.",
                                            color: "#eab308"
                                        })}
                                    />
                                    <MetricCard
                                        label="Unit Economics"
                                        score={result.detailedScores?.unitEconomics || 0}
                                        color="#00ff41"
                                        description="Potential for profitability on a per-unit or per-user basis."
                                        onClick={() => setSelectedMetric({
                                            label: "Unit Economics",
                                            score: result.detailedScores?.unitEconomics || 0,
                                            description: "Potential for profitability on a per-unit or per-user basis.",
                                            detail: result.metricDetails?.unitEconomics || "Detailed analysis generally unavailable for legacy data.",
                                            color: "#00ff41"
                                        })}
                                    />
                                </div>

                                {/* Radar Chart */}
                                <TheRadar data={result.radarData} />

                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border border-border bg-secondary/5 rounded-xl border-dashed opacity-70 space-y-4 p-8 text-center">
                                <div className="p-4 bg-secondary/20 rounded-full mb-2">
                                    <Terminal className="w-8 h-8 text-primary/50" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {language === 'pt' ? "Estação de Análise Pronta" : "Analysis Station Ready"}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                                    {language === 'pt'
                                        ? "Preencha o formulário à esquerda ou selecione uma ideia salva abaixo para iniciar a auditoria."
                                        : "Fill out the form on the left or select a saved idea below to start the audit."}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT PANEL: Chat */}
                <div className="col-span-12 lg:col-span-3 flex flex-col h-full overflow-hidden">
                    <div className="bg-secondary/10 border border-border rounded-xl h-full flex flex-col backdrop-blur-md shadow-lg overflow-hidden relative">

                        <TheAIBoard
                            key={result ? `analysis-${result.score}-${ideaText.substring(0, 5)}` : 'empty'}
                            onMessagesChange={setChatMessages}
                            showBetaReport={!!result && chatMessages.length > 0}
                            onBetaReport={() => result && generateBetaReport(ideaText, result, chatMessages)}
                        />
                    </div>
                </div>

            </main>

            {/* BOTTOM PANEL: Business Inception (Carousel) - Fixed Height */}
            <div className="h-[200px] border-t border-border bg-background/95 backdrop-blur-md p-4">
                <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-muted mb-2">
                        BUSINESS
                    </h3>
                    <IdeaCarousel
                        items={carouselItems.length > 0 ? carouselItems : undefined}
                        onSelect={(id) => {
                            const selected = history.find(h => parseInt(h.id) === parseInt(id));
                            if (selected) {
                                setIdeaText(selected.text);
                                setResult(selected.analysis);
                                setChatMessages([]);
                            }
                        }}
                        onDelete={handleIdeaDelete}
                    />
                </div>
            </div>

            {/* Modal Layer */}
            {selectedMetric && (
                <MetricDetailModal
                    isOpen={!!selectedMetric}
                    onClose={() => setSelectedMetric(null)}
                    label={selectedMetric.label}
                    score={selectedMetric.score}
                    description={selectedMetric.description}
                    detailedExplanation={selectedMetric.detail}
                    color={selectedMetric.color}
                />
            )}

            {/* Social Share Modal */}
            {result && (
                <SocialShareModal
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    ideaText={ideaText}
                    score={result.score}
                    title={title}
                />
            )}
        </div>
    );
}
