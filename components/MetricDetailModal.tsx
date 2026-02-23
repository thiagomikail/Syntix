"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    label: string;
    score: number;
    description?: string;
    detailedExplanation: string;
    color: string;
}

export function MetricDetailModal({
    isOpen,
    onClose,
    label,
    score,
    description,
    detailedExplanation,
    color,
}: MetricDetailModalProps) {
    if (!isOpen) return null;

    const getIcon = (score: number) => {
        if (score >= 80) return <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
        if (score >= 50) return <TrendingUp className="w-12 h-12 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />;
        return <AlertTriangle className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />;
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "EXCEPTIONAL";
        if (score >= 60) return "STRONG";
        if (score >= 40) return "MODERATE";
        return "CRITICAL RISK";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header Gradient */}
                        <div
                            className="absolute top-0 left-0 w-full h-1"
                            style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }}
                        />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-muted-foreground hover:text-white" />
                        </button>

                        <div className="p-8 flex flex-col items-center text-center space-y-6">
                            {/* Score Ring */}
                            <div className="relative">
                                {getIcon(score)}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">
                                    {label}
                                </h2>
                                <div className="inline-block px-3 py-1 rounded-full bg-secondary/30 border border-white/10 text-xs font-mono tracking-widest text-muted-foreground">
                                    SCORE: {score}/100 • {getScoreLabel(score)}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden relative group">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full rounded-full relative"
                                    style={{ backgroundColor: color }}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]" />
                                </motion.div>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                            {/* Simple Description (Tooltip) */}
                            {description && (
                                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                                    {description}
                                </p>
                            )}

                            {/* Main Explanation */}
                            <div className="bg-secondary/10 border border-white/5 rounded-xl p-5 text-left w-full relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full opacity-50" style={{ backgroundColor: color }} />
                                <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                                    The Auditor's Analysis
                                </h4>
                                <p className="text-sm leading-relaxed text-foreground/90 font-light">
                                    {detailedExplanation || "No specific details available for this metric."}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-secondary/20 border-t border-border flex justify-center">
                            <button
                                onClick={onClose}
                                className="text-xs text-muted-foreground hover:text-white transition-colors uppercase tracking-widest font-mono"
                            >
                                Close Analysis
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
