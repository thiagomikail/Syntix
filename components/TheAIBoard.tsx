"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { Send, TrendingUp, ShieldAlert, BadgeDollarSign, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Message, Persona } from "@/types/analysis";
import { chatWithBoard } from "@/app/actions/chat-board";

interface TheAIBoardProps {
    onMessagesChange?: (messages: Message[]) => void;
    onBetaReport?: () => void;
    showBetaReport?: boolean;
}

export function TheAIBoard({ onMessagesChange, onBetaReport, showBetaReport }: TheAIBoardProps) {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Notify parent of message changes
    useEffect(() => {
        onMessagesChange?.(messages);
    }, [messages, onMessagesChange]);

    // Initial greeting removed to fix "Skeptic always there" issue
    // The parent component controls the chat state or we wait for interaction.

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
            const aiMsg = await chatWithBoard(messages, input, language);
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Failed to get AI response", error);
        } finally {
            setIsTyping(false);
        }
    };

    const getPersonaIcon = (persona?: Persona) => {
        switch (persona) {
            case "skeptic": return <ShieldAlert className="w-4 h-4 text-red-500" />;
            case "growth": return <TrendingUp className="w-4 h-4 text-[#00FF41]" />;
            case "cfo": return <BadgeDollarSign className="w-4 h-4 text-blue-500" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const getPersonaName = (persona?: Persona) => {
        switch (persona) {
            case "skeptic": return t.board.skeptic;
            case "growth": return t.board.growth;
            case "cfo": return t.board.cfo;
            default: return "User";
        }
    };

    return (
        <div className="w-full flex flex-col h-full border-none bg-transparent">
            <div className="p-3 border-b border-border bg-secondary/10 flex flex-col xl:flex-row items-center justify-between gap-2 shrink-0">
                <div className="flex flex-col gap-1 w-full xl:w-auto">
                    <h3 className="font-mono font-bold uppercase tracking-wider text-sm whitespace-nowrap">
                        {t.board.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted">
                        <span className="flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded border border-border/50"><ShieldAlert className="w-3 h-3 text-red-400" /> {t.board.skeptic}</span>
                        <span className="flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded border border-border/50"><TrendingUp className="w-3 h-3 text-green-400" /> {t.board.growth}</span>
                        <span className="flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded border border-border/50"><BadgeDollarSign className="w-3 h-3 text-blue-400" /> {t.board.cfo}</span>
                    </div>
                </div>

                {/* Beta Report Button - Integrated */}
                {showBetaReport && onBetaReport && (
                    <button
                        onClick={onBetaReport}
                        className="flex items-center gap-2 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap self-end xl:self-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                        Beta Report
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-4">
                        <User className="w-8 h-8 mb-2" />
                        <p className="text-xs font-mono">Board is waiting for topics...</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex gap-3 max-w-[90%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-border mt-1",
                            msg.role === "user" ? "bg-primary text-background" : "bg-secondary"
                        )}>
                            {msg.role === "user" ? <User className="w-3 h-3" /> : getPersonaIcon(msg.persona)}
                        </div>

                        <div className={cn(
                            "p-2.5 rounded-lg text-xs leading-relaxed border",
                            msg.role === "user"
                                ? "bg-primary/10 border-primary/20 text-foreground rounded-tr-none"
                                : "bg-secondary/10 border-border rounded-tl-none"
                        )}>
                            {msg.role !== "user" && (
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                                    {getPersonaName(msg.persona)}
                                </div>
                            )}
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex gap-3 max-w-[80%] mr-auto">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-border bg-secondary">
                            <LoaderDots />
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-border bg-secondary/10 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the board..."
                    className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors min-w-0"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-foreground text-background p-2 rounded-md hover:bg-foreground/80 disabled:opacity-50 transition-colors shrink-0"
                >
                    <Send className="w-3 h-3" />
                </button>
            </form>
        </div>
    );
}

const LoaderDots = () => (
    <div className="flex space-x-1">
        <div className="w-1 h-1 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1 h-1 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1 h-1 bg-muted rounded-full animate-bounce"></div>
    </div>
);
