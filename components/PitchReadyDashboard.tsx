"use client";

import { useState, useEffect, useRef } from "react";
import { IRLScore } from "@/components/IRLScore";
import { TheAuditor } from "@/components/TheAuditor";
import { TheAIBoard } from "@/components/TheAIBoard";
import { MetricCard } from "@/components/MetricCard";
import { MetricDetailModal } from "@/components/MetricDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeIdea } from "@/app/actions/analyze-idea";
import { togglePublishIdea, saveImpulseThesis, saveIdeaTitle, saveIRLScore } from "@/app/actions/publish";
import { generateIdeaThumbnail } from "@/app/actions/generate-image";
import { AnalysisResult, Message } from "@/types/analysis";
import { InceptionAnalysis } from "@/types/inception";
import { generateAlphaReport, generateBetaReport } from "@/lib/pdf-generator";
import { AchievementScale } from "@/components/AchievementScale";

import { cn } from "@/lib/utils";

interface PitchReadyDashboardProps {
    ideaId: string;
    isPublic?: boolean;
    user: string | null;
    initialContext?: { text: string, analysis?: InceptionAnalysis } | null;
    initialTitle?: string | null;
    thumbnailUrl?: string | null;
}

export function PitchReadyDashboard({ ideaId, isPublic = false, user, initialContext, initialTitle, thumbnailUrl }: PitchReadyDashboardProps) {

    const [ideaText, setIdeaText] = useState(initialContext?.text || "");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<{ label: string, score: number, description: string, detail: string, color: string } | null>(null);

    const [published, setPublished] = useState(isPublic);
    const [isPublishing, setIsPublishing] = useState(false);

    const [title, setTitle] = useState(initialTitle || "Untitled Venture");
    const [isSavingTitle, setIsSavingTitle] = useState(false);

    const contextRef = useRef<InceptionAnalysis | undefined>(initialContext?.analysis);

    useEffect(() => {
        if (initialContext) {
            const c = initialContext.analysis;
            let compositeText = initialContext.text;
            if (c) {
                try {
                    compositeText += `\n\n[INCEPTION ANALYSIS - ${c.classification?.label?.toUpperCase() || "UNKNOWN"}]\n`;
                    compositeText += `Reasoning: ${c.classification?.reasoning || "N/A"}\n`;
                    compositeText += `\nMARKET RESEARCH:\n- TAM: ${c.marketResearch?.tam || "N/A"}\n- SAM: ${c.marketResearch?.sam || "N/A"}\n- SOM: ${c.marketResearch?.som || "N/A"}\n`;
                    compositeText += `\nSTRATEGIC ROADMAP:\n- Month 1: ${c.strategy?.sales1M?.join(', ') || "N/A"}\n- Month 6: ${c.strategy?.sales6M?.join(', ') || "N/A"}\n`;
                } catch (e) { console.error("Error formatting inception context:", e); }
            }
            setIdeaText(compositeText);
            contextRef.current = initialContext.analysis;
            setTimeout(() => { handleAudit(compositeText); }, 500);
        }
    }, [initialContext]);

    const handlePublishToggle = async () => {
        setIsPublishing(true);
        try {
            const newState = !published;
            await togglePublishIdea(ideaId, newState);
            setPublished(newState);
        } catch (error) { console.error("Failed to toggle publish", error); }
        finally { setIsPublishing(false); }
    };

    const handleAudit = async (idea: string) => {
        setIdeaText(idea); setAnalyzing(true); setResult(null); setChatMessages([]);
        try {
            await saveImpulseThesis(ideaId, idea);
            const data = await analyzeIdea(idea, "en");
            setResult(data);

            // Save the IRL score to the database immediately to display on Arena cards
            if (data && data.score) {
                try {
                    await saveIRLScore(ideaId, data);
                } catch (scoreErr) {
                    console.error("Failed to persist IRL score:", scoreErr);
                }
            }

            // Auto-Title feature
            if (data.title && title === "Untitled Venture") {
                setTitle(data.title);
                saveIdeaTitle(ideaId, data.title).catch(err => console.error("Auto-title save failed", err));
            }

            // Conceptual Poster Auto-Generation (Nano Banana API)
            if (data.imagePrompt) {
                // Fire and forget so we don't block the UI rendering
                generateIdeaThumbnail(ideaId, data.imagePrompt).catch(err => console.error("Image gen failed", err));
            }

        } catch (error) { console.error("Analysis failed", error); }
        finally { setAnalyzing(false); }
    };

    const handleTitleBlur = async () => {
        if (title === initialTitle) return;
        setIsSavingTitle(true);
        try {
            await saveIdeaTitle(ideaId, title);
        } catch (error) {
            console.error("Failed to save title", error);
        } finally {
            setIsSavingTitle(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-primary/10">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary/50 text-xl">edit_note</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        placeholder="Name your venture..."
                        className="bg-transparent border-none text-xl font-bold tracking-tight text-white focus:outline-none focus:ring-0 w-64 md:w-96 placeholder:text-slate-600 transition-opacity"
                    />
                    {isSavingTitle && <span className="text-xs text-primary animate-pulse">Saving...</span>}
                </div>
                <button
                    onClick={handlePublishToggle}
                    disabled={isPublishing}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50",
                        published
                            ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-primary"
                    )}
                >
                    <span className="material-symbols-outlined text-sm">{published ? "public" : "lock"}</span>
                    {isPublishing ? "Saving..." : published ? "Unpublish from Arena" : "Publish to Arena"}
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden p-4 gap-4 grid grid-cols-12 h-[calc(100vh-180px)]">
                {/* LEFT: Thesis Editor */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-3 h-full overflow-y-auto">
                    <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-5 flex flex-col gap-3 h-full text-white">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Impulse Thesis</h2>
                        <TheAuditor
                            onSubmit={handleAudit}
                            isAnalyzing={analyzing}
                            title="Edit Thesis"
                            initialValue={ideaText}
                        />
                    </div>
                </div>

                {/* MIDDLE: Analysis */}
                <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 h-full overflow-y-auto scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 pb-20">
                                {/* Summary */}
                                <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6 text-white relative overflow-hidden">
                                    {/* Thumbnail Backdrop */}
                                    {thumbnailUrl && (
                                        <div
                                            className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none mask-image-gradient-to-l"
                                            style={{
                                                backgroundImage: `url(${thumbnailUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                                                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                                            }}
                                        />
                                    )}
                                    <div className="relative z-10 flex justify-between items-start mb-6">
                                        <h2 className="text-2xl font-bold tracking-tight">Analysis Complete</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => generateAlphaReport(ideaText, result)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">description</span>
                                                Report
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 items-center">
                                        <div className="flex justify-center">
                                            <IRLScore score={result.score} label="IRL Score" />
                                        </div>
                                        <div className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                                            &ldquo;{result.feedback}&rdquo;
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-3">
                                    <MetricCard label="Logic" score={result.detailedScores?.logicalCoherence || 0} color="#7f0df2" description="Problem-solution coherence" onClick={() => setSelectedMetric({ label: "Logic", score: result.detailedScores?.logicalCoherence || 0, description: "Clarity of the problem-solution fit.", detail: result.metricDetails?.logicalCoherence || "", color: "#7f0df2" })} />
                                    <MetricCard label="Market" score={result.detailedScores?.marketDepth || 0} color="#00f5ff" description="TAM/SAM accessibility" onClick={() => setSelectedMetric({ label: "Market", score: result.detailedScores?.marketDepth || 0, description: "Market size and accessibility.", detail: result.metricDetails?.marketDepth || "", color: "#00f5ff" })} />
                                    <MetricCard label="Economics" score={result.detailedScores?.unitEconomics || 0} color="#eab308" description="Unit economics potential" onClick={() => setSelectedMetric({ label: "Economics", score: result.detailedScores?.unitEconomics || 0, description: "Potential for per-unit profitability.", detail: result.metricDetails?.unitEconomics || "", color: "#eab308" })} />
                                </div>

                                {/* Achievement Scale */}
                                <AchievementScale
                                    currentStage="idea"
                                    archetype={contextRef.current?.classification?.path}
                                />
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 p-8 text-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    <span className="material-symbols-outlined text-3xl text-primary">analytics</span>
                                </div>
                                <h3 className="text-lg font-bold mb-1 text-white">Analysis Station Ready</h3>
                                <p className="text-sm text-slate-400 max-w-xs">Review and format your Impulse Thesis on the left to start the audit.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: Chat */}
                <div className="col-span-12 lg:col-span-3 flex flex-col h-full overflow-hidden">
                    <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] h-full flex flex-col overflow-hidden text-white">
                        <TheAIBoard
                            key={result ? `analysis-${result.score}` : 'empty'}
                            initialMessages={(() => {
                                const archetype = contextRef.current?.classification?.path || "default";
                                const msgs: Message[] = [];
                                const now = new Date();

                                if (archetype === "cash_cow") {
                                    msgs.push({ id: "init1", role: "ai", persona: "cfo", content: "Como CFO, vejo que estamos lidando com um Cash Cow. Nosso foco total deve ser em otimizar a margem operacional desde o dia 1.", timestamp: now });
                                    msgs.push({ id: "init2", role: "ai", persona: "builder", content: "Exato. Tecnicamente o MVP tem que ser enxuto e usar ferramentas No-Code para não queimar caixa construindo do zero.", timestamp: now });
                                } else if (archetype === "cash_farm") {
                                    msgs.push({ id: "init1", role: "ai", persona: "cfo", content: "Sendo um Cash Farm, o modelo depende de especialistas. Como vamos remunerá-los sem quebrar nossa própria margem?", timestamp: now });
                                    msgs.push({ id: "init2", role: "ai", persona: "growth", content: "O grande desafio aqui será aquisição duplo-lado (experts e clientes). Precisamos de um GTM focado em comunidade.", timestamp: now });
                                } else if (archetype === "new_meat") {
                                    msgs.push({ id: "init1", role: "ai", persona: "skeptic", content: "Isso é um 'New Meat'. Altíssimo risco e necessidade de capital intensivo. Temos certeza que os fundadores têm capacidade de levantar funding?", timestamp: now });
                                    msgs.push({ id: "init2", role: "ai", persona: "builder", content: "Para provar o valor, a arquitetura técnica inicial (o MVP) precisa focar na inovação core, isolando o que é comoditizado.", timestamp: now });
                                } else if (archetype === "ozempics") {
                                    msgs.push({ id: "init1", role: "ai", persona: "skeptic", content: "Isso muda um paradigma comportamental (Ozempics). As pessoas dizem que querem mudar, mas na prática a fricção mata o negócio.", timestamp: now });
                                    msgs.push({ id: "init2", role: "ai", persona: "growth", content: "Verdade. O custo de aquisição (CAC) para educar esse mercado vai ser altíssimo nas primeiras semanas. O foco tem que ser em viralidade.", timestamp: now });
                                } else if (archetype === "dead_end") {
                                    msgs.push({ id: "init1", role: "ai", persona: "skeptic", content: "Este conceito soa como um 'Dead End'. É uma solução procurando um problema, ou o mercado não é grande o suficiente.", timestamp: now });
                                    msgs.push({ id: "init2", role: "ai", persona: "cfo", content: "Concordo. Nossa recomendação é iterar severamente na tese original antes de alocar capital ou escrever qualquer linha de código.", timestamp: now });
                                } else {
                                    msgs.push({ id: "init1", role: "ai", persona: "skeptic", content: "Antes de mais nada, precisamos entender se há um problema real sendo resolvido aqui.", timestamp: now });
                                    msgs.push({ id: "init2", role: "ai", persona: "cfo", content: "De acordo. E se houver, precisamos ver se alguém está disposto a pagar por isso.", timestamp: now });
                                }
                                return msgs;
                            })()}
                            onMessagesChange={setChatMessages}
                            showBetaReport={!!result && chatMessages.length > 0}
                            onBetaReport={() => result && generateBetaReport(ideaText, result, chatMessages)}
                        />
                    </div>
                </div>
            </main>

            {/* Metric Modal */}
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
        </div>
    );
}
