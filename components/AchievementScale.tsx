"use client";

import { cn } from "@/lib/utils";

interface AchievementScaleProps {
    currentStage?: string; // "idea" | "conception" | "mvp" | "first_payers" | "sustainable"
    archetype?: string;
    className?: string;
}

const stages = [
    { id: "idea", label: "Ideia", icon: "lightbulb", color: "#7f0df2" },
    { id: "conception", label: "Concepção", icon: "architecture", color: "#3b82f6" },
    { id: "mvp", label: "MVP", icon: "rocket_launch", color: "#22c55e" },
    { id: "first_payers", label: "Primeiros Pagantes", icon: "payments", color: "#eab308" },
    { id: "sustainable", label: "Negócio Sustentável", icon: "verified", color: "#f97316" },
];

const archetypeAdvice: Record<string, string> = {
    "cash_cow": "Cash Cow is your launchpad. Build profitability first, then consider evolving into a Cash Farm.",
    "cash_farm": "Cash Farm scales through experts. Consider building a Cash Cow first for stable revenue before scaling.",
    "new_meat": "New Meat requires significant funding. Having a Cash Farm as a foundation dramatically increases your chances.",
    "ozempics": "Ozempics ventures change paradigms. Build a Cash Cow or Cash Farm to sustain yourself while pursuing breakthrough innovation.",
    "dead_end": "Pivot. Look at the other archetypes for viable paths forward.",
};

export function AchievementScale({ currentStage = "idea", archetype, className }: AchievementScaleProps) {
    const currentIndex = stages.findIndex(s => s.id === currentStage);

    return (
        <div className={cn("rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6", className)}>
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">emoji_events</span>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Escala de Conquista</h3>
            </div>

            {/* Scale visualization */}
            <div className="flex items-center gap-1 mb-6">
                {stages.map((stage, i) => {
                    const isReached = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    return (
                        <div key={stage.id} className="flex-1 flex flex-col items-center gap-2">
                            {/* Node */}
                            <div
                                className={cn(
                                    "size-10 rounded-full flex items-center justify-center transition-all",
                                    isCurrent
                                        ? "ring-2 ring-offset-2 ring-offset-[#1A1A1A]"
                                        : "",
                                    isReached ? "shadow-lg" : "bg-slate-800 opacity-40"
                                )}
                                style={isReached ? {
                                    backgroundColor: stage.color + "20",
                                    borderColor: stage.color,
                                    boxShadow: isCurrent ? `0 0 15px ${stage.color}40` : undefined,
                                    ...(isCurrent ? { ringColor: stage.color } : {})
                                } : undefined}
                            >
                                <span
                                    className="material-symbols-outlined text-sm"
                                    style={{ color: isReached ? stage.color : "#64748b" }}
                                >
                                    {stage.icon}
                                </span>
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-[9px] font-bold uppercase tracking-wider text-center leading-tight",
                                    isReached ? "text-white" : "text-slate-600"
                                )}
                            >
                                {stage.label}
                            </span>

                            {/* Connector line */}
                            {i < stages.length - 1 && (
                                <div
                                    className={cn(
                                        "absolute h-0.5 w-[calc(100%/5)]",
                                        isReached ? "bg-primary/30" : "bg-slate-800"
                                    )}
                                    style={{ display: "none" }} // Hidden for vertical layout
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
                />
            </div>

            {/* Archetype-specific advice */}
            {archetype && archetypeAdvice[archetype] && (
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-primary mt-0.5">tips_and_updates</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {archetypeAdvice[archetype]}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
