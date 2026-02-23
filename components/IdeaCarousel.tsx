"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Play, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_IDEAS = [
    { id: 1, title: "Quantum Logistics", category: "Deep Tech", score: 88, image: "bg-blue-900" },
    { id: 2, title: "Urban Hydroponics", category: "AgriTech", score: 72, image: "bg-green-900" },
    { id: 3, title: "AI Legal Assistant", category: "SaaS", score: 91, image: "bg-purple-900" },
    { id: 4, title: "P2P Energy Trade", category: "CleanTech", score: 85, image: "bg-yellow-900" },
    { id: 5, title: "Bio-printed Organs", category: "BioTech", score: 65, image: "bg-red-900" },
    { id: 6, title: "Space Mining Ops", category: "Deep Tech", score: 45, image: "bg-slate-800" },
    { id: 7, title: "Decentralized ID", category: "Web3", score: 78, image: "bg-indigo-900" },
];

interface CarouselItem {
    id: number;
    title: string;
    category: string;
    score: number;
    image?: string;
}

interface IdeaCarouselProps {
    items?: any[]; // Using any to match SavedIdea structure loosely or update interface
    onSelect?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function IdeaCarousel({ items, onSelect, onDelete }: IdeaCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter out items without ID if necessary, or just map. 
    // MOCK_IDEAS use number IDs, SavedIdea uses string. Handling both for safety.
    const displayItems = items && items.length > 0 ? items : [];

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            direction === "left"
                ? current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
                : current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (displayItems.length === 0) {
        return <div className="text-center text-muted-foreground text-sm py-4">No ideas saved yet. Start ideating!</div>;
    }

    return (
        <div className="w-full relative group">
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                {/* Carousel Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 md:px-0 snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {displayItems.map((idea) => (
                        <motion.div
                            key={idea.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "min-w-[220px] h-[140px] rounded-lg shrink-0 snap-start flex flex-col justify-between p-4 cursor-pointer relative overflow-hidden border border-white/5 bg-secondary/10 hover:bg-secondary/20 transition-colors",
                                // idea.image -- removed for cleaner UI
                            )}
                        >
                            {/* Delete Button (Hover Only) */}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(idea.id.toString());
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-md transition-colors z-30 opacity-0 group-hover:opacity-100"
                                    title="Delete Idea"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}

                            {/* Click Area */}
                            <div className="absolute inset-0 z-10" onClick={() => onSelect?.(idea.id.toString())} />

                            <div>
                                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                                    {idea.analysis?.classification?.path ? idea.analysis.classification.path.replace('_', ' ') : 'Unclassified'}
                                </span>
                                <h4 className="font-bold text-foreground text-sm leading-snug line-clamp-2">
                                    {idea.text || idea.title}
                                </h4>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {new Date(idea.timestamp || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
}
