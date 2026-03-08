"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Message, Persona } from "@/types/analysis";
import { chatWithBoard } from "@/app/actions/chat-board";

interface TheAIBoardProps {
    onMessagesChange?: (messages: Message[]) => void;
    onBetaReport?: () => void;
    showBetaReport?: boolean;
    initialMessages?: Message[];
}

export function TheAIBoard({ onMessagesChange, onBetaReport, showBetaReport, initialMessages = [] }: TheAIBoardProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => { onMessagesChange?.(messages); }, [messages, onMessagesChange]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const aiMsg = await chatWithBoard(messages, input, "en");
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Failed to get AI response", error);
        } finally {
            setIsTyping(false);
        }
    };

    const getPersonaIcon = (persona?: Persona) => {
        switch (persona) {
            case "skeptic": return "shield";
            case "growth": return "trending_up";
            case "cfo": return "attach_money";
            case "builder": return "construction";
            default: return "person";
        }
    };

    const getPersonaColor = (persona?: Persona) => {
        switch (persona) {
            case "skeptic": return "text-red-400";
            case "growth": return "text-accent-cyan";
            case "cfo": return "text-blue-400";
            case "builder": return "text-amber-400";
            default: return "text-slate-400";
        }
    };

    const getPersonaName = (persona?: Persona) => {
        switch (persona) {
            case "skeptic": return "Cético";
            case "growth": return "Growth";
            case "cfo": return "Financeiro";
            case "builder": return "Builder";
            default: return "User";
        }
    };

    return (
        <div className="w-full flex flex-col h-full">
            {/* Header */}
            <div className="p-3 border-b border-primary/10 flex items-center justify-between shrink-0">
                <div>
                    <h3 className="font-bold uppercase tracking-widest text-xs">AI Board</h3>
                    <div className="flex gap-2 mt-1">
                        {(["skeptic", "growth", "cfo", "builder"] as Persona[]).map((p) => (
                            <span key={p} className="flex items-center gap-0.5 text-[10px]">
                                <span className={cn("material-symbols-outlined text-xs", getPersonaColor(p))}>{getPersonaIcon(p)}</span>
                                <span className="text-slate-500">{getPersonaName(p)}</span>
                            </span>
                        ))}
                    </div>
                </div>
                {showBetaReport && onBetaReport && (
                    <button
                        onClick={onBetaReport}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-[10px] font-bold text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xs">description</span>
                        Beta Report
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-4">
                        <span className="material-symbols-outlined text-3xl mb-2">forum</span>
                        <p className="text-xs">Board is waiting for topics...</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-2 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
                    >
                        <div className={cn(
                            "size-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                            msg.role === "user" ? "bg-primary text-white" : "bg-slate-700 text-white"
                        )}>
                            <span className={cn("material-symbols-outlined text-xs", msg.role !== "user" && getPersonaColor(msg.persona))}>
                                {msg.role === "user" ? "person" : getPersonaIcon(msg.persona)}
                            </span>
                        </div>
                        <div className={cn(
                            "p-2.5 rounded-xl text-xs leading-relaxed border",
                            msg.role === "user"
                                ? "bg-primary/10 border-primary/20 rounded-tr-none"
                                : "bg-slate-800/50 border-primary/10 rounded-tl-none"
                        )}>
                            {msg.role !== "user" && (
                                <div className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", getPersonaColor(msg.persona))}>
                                    {getPersonaName(msg.persona)}
                                </div>
                            )}
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex gap-2 mr-auto">
                        <div className="size-6 rounded-full bg-slate-700 flex items-center justify-center">
                            <LoaderDots />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-primary/10 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the board..."
                    className="flex-1 bg-[#222222] text-white placeholder:text-slate-500 border border-primary/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/30 transition-colors min-w-0"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-primary text-white p-2 rounded-lg disabled:opacity-50 transition-colors shadow-lg shadow-primary/25 hover:shadow-glow-primary shrink-0"
                >
                    <span className="material-symbols-outlined text-sm">send</span>
                </button>
            </form>
        </div>
    );
}

const LoaderDots = () => (
    <div className="flex space-x-0.5">
        <div className="size-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="size-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="size-1 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
);
