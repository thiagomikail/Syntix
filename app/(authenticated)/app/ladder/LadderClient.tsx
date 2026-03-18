"use client";

import { useState } from "react";
import { saveLadder } from "@/app/actions/ladder";
import { ArrowRight, Save, Plus, X, Layers, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LadderClientProps {
    ideas: any[]; // Prisma Idea subset
    initialLadder: any; // Prisma Ladder
    user: any;
}

export function LadderClient({ ideas, initialLadder, user }: LadderClientProps) {
    // We represent the graph as a simple linear array of idea IDs for the MVP
    const [sequence, setSequence] = useState<string[]>(
        initialLadder ? (initialLadder.nodesJson as any[]).map((n: any) => n.id) : []
    );
    const [strength, setStrength] = useState<number>(initialLadder?.strengthScore || 0);
    const [isSaving, setIsSaving] = useState(false);

    const availableIdeas = ideas.filter(i => !sequence.includes(i.id));

    const addToSequence = (id: string) => {
        setSequence([...sequence, id]);
    };

    const removeFromSequence = (id: string) => {
        setSequence(sequence.filter(s => s !== id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Convert linear sequence to robust nodes/edges format for future graph extension
        const nodes = sequence.map((id, index) => ({
            id,
            position: { x: index * 300, y: 100 }
        }));
        const edges = sequence.slice(0, -1).map((id, index) => ({
            id: `e-${id}-${sequence[index + 1]}`,
            source: id,
            target: sequence[index + 1]
        }));

        const result = await saveLadder("Main Ladder", nodes, edges, initialLadder?.id);
        if (result.success && result.ladder?.strengthScore) {
            setStrength(result.ladder.strengthScore);
        }
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col h-full font-sans animate-in fade-in duration-500 overflow-hidden">

            {/* Top Toolbar */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-background">
                <div>
                    <h1 className="text-2xl font-black heading-font uppercase tracking-tight">Venture Ladder</h1>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Map your long-term strategic sequencing (Idea A → Idea B)</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block">Ladder Strength</span>
                        <span className={cn("text-2xl font-black", strength > 50 ? "text-green-600" : strength > 0 ? "text-amber-500" : "text-muted-foreground")}>
                            {strength}%
                        </span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || sequence.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm rounded-full shadow-[0_4px_0_0_hsl(var(--primary)/0.5)] active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all hover:bg-primary/90"
                    >
                        {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Ladder
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* Left Panel: Available Core Ideas */}
                <div className="w-1/3 border-r border-border bg-secondary/5 p-6 overflow-y-auto flex flex-col gap-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Lab Arsenal
                    </h3>

                    {availableIdeas.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm font-medium">
                            No available ideas left to sequence.
                        </div>
                    )}

                    {availableIdeas.map((idea) => {
                        let archetypeLabel = idea.archetype || "Venture";
                        let badgeColor = "#383838";
                        if (idea.refinementJson) {
                            try {
                                const parsed = idea.refinementJson as any;
                                archetypeLabel = parsed.classification?.label || archetypeLabel;
                                badgeColor = parsed.classification?.badgeColor || badgeColor;
                            } catch (e) { }
                        }

                        return (
                            <div
                                key={idea.id}
                                className="bg-card border-2 border-border border-b-[4px] p-4 rounded-xl flex flex-col gap-3 group transition-all hover:border-primary/40 cursor-pointer"
                                onClick={() => addToSequence(idea.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm text-white"
                                        style={{ backgroundColor: badgeColor }}
                                    >
                                        {archetypeLabel}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary p-1 rounded-full">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-wider truncate">{idea.title || "Untitled Venture"}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium">{idea.rawText}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Panel: The Sequence Board */}
                <div className="flex-1 bg-background p-12 overflow-x-auto relative flex items-center">

                    {sequence.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                            <div className="max-w-md space-y-4">
                                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border">
                                    <ArrowRight className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-wider">Map Your Journey</h2>
                                <p className="text-sm text-muted-foreground font-medium pb-8">
                                    Click on concepts in your Arsenal to add them to your Venture Ladder timeline. Synthesize step-by-step progress.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 min-w-max pb-8 px-8">
                        {sequence.map((id, index) => {
                            const idea = ideas.find(i => i.id === id);
                            if (!idea) return null;

                            let archetypeLabel = idea.archetype || "Venture";
                            let badgeColor = "#EC5C39";
                            if (idea.refinementJson) {
                                const parsed = idea.refinementJson as any;
                                archetypeLabel = parsed.classification?.label || archetypeLabel;
                                badgeColor = parsed.classification?.badgeColor || badgeColor;
                            }

                            return (
                                <div key={id} className="flex items-center gap-4 group">
                                    <div className="w-72 bg-card border-2 border-border border-b-[6px] shadow-sm p-6 rounded-3xl relative animate-in zoom-in-95 overflow-hidden group-hover:border-primary/50 transition-colors">

                                        {/* Remove Action */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFromSequence(id); }}
                                            className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 bg-secondary/50 rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="mb-4">
                                            <span
                                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
                                                style={{ backgroundColor: badgeColor }}
                                            >
                                                {archetypeLabel}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-lg uppercase tracking-tight line-clamp-1 mb-2">
                                            {idea.title || "Untitled Venture"}
                                        </h4>
                                        <p className="text-xs text-muted-foreground line-clamp-3 font-medium">
                                            {idea.rawText}
                                        </p>

                                        <div className="absolute -top-6 -left-6 text-9xl font-black text-foreground/5 pointer-events-none z-0 select-none">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Sequential Arrow Generator */}
                                    {index < sequence.length - 1 && (
                                        <div className="flex items-center text-border">
                                            <div className="h-1 w-8 bg-border"></div>
                                            <ArrowRight className="w-8 h-8 -ml-1 text-border" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </div>
    );
}
