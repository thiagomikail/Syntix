"use client";

import { useState } from "react";
import { IdeationTab } from "@/components/IdeationTab";
import { InceptionTab } from "@/components/InceptionTab";
import { PitchReadyDashboard } from "@/components/PitchReadyDashboard";
import { cn } from "@/lib/utils";
import { InceptionAnalysis } from "@/types/inception";

type Tab = "ideation" | "refinement" | "stress-test";

const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "ideation", label: "Ideação", icon: "science" },
    { id: "refinement", label: "Análise e Refino", icon: "rocket_launch" },
    { id: "stress-test", label: "Stress Test", icon: "hub" },
];

export function WorkspaceClient({
    idea,
    user,
    autoIgnite
}: {
    idea: any,
    user: string,
    autoIgnite?: string
}) {
    const [activeTab, setActiveTab] = useState<Tab>("ideation");
    const [transferredContext, setTransferredContext] = useState<{ text: string, analysis?: InceptionAnalysis } | null>(null);
    const [generatedIdea, setGeneratedIdea] = useState<string>(idea.rawText || "");

    const handleTransferToPitch = (text: string, analysis: InceptionAnalysis) => {
        setTransferredContext({ text, analysis });
        setActiveTab("stress-test");
    };

    const handleIdeaGenerated = (text: string) => {
        setGeneratedIdea(text);
        setActiveTab("refinement");
    };

    return (
        <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex justify-center border-b border-primary/10 bg-[#0A0A0A]/80 backdrop-blur-md z-50 sticky top-0">
                <div className="flex gap-1 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wide rounded-lg transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "text-slate-400 hover:text-primary hover:bg-primary/5"
                            )}
                        >
                            <span className="material-symbols-outlined text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className={cn("h-full w-full", activeTab === "ideation" ? "block" : "hidden")}>
                    <IdeationTab ideaId={idea.id} onIdeaGenerated={handleIdeaGenerated} autoIgnite={autoIgnite} />
                </div>
                <div className={cn("h-full w-full", activeTab === "refinement" ? "block" : "hidden")}>
                    <InceptionTab
                        ideaId={idea.id}
                        onPitch={handleTransferToPitch}
                        initialValue={generatedIdea}
                        key={generatedIdea}
                        isActive={activeTab === "refinement"}
                    />
                </div>
                <div className={cn("h-full w-full", activeTab === "stress-test" ? "block" : "hidden")}>
                    <PitchReadyDashboard
                        ideaId={idea.id}
                        isPublic={idea.isPublic}
                        user={user}
                        initialContext={transferredContext}
                        initialTitle={idea.title}
                        thumbnailUrl={idea.thumbnailUrl}
                    />
                </div>
            </div>
        </div>
    );
}
