"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface IRLScoreProps {
    score: number;
    label: string;
}

export function IRLScore({ score, label }: IRLScoreProps) {
    // Determine color based on score
    const getColor = (s: number) => {
        if (s < 40) return "text-red-500 border-red-500";
        if (s < 75) return "text-yellow-500 border-yellow-500";
        return "text-primary border-primary";
    };

    const colorClass = getColor(score);
    const ringColor = score < 40 ? "stroke-red-500" : score < 75 ? "stroke-yellow-500" : "stroke-[#00FF41]";

    // Circle properties
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6 border border-border bg-secondary/30 rounded-xl backdrop-blur-sm">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-secondary/50"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        className={cn("transition-all duration-500", ringColor)}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-5xl font-mono font-bold tracking-tighter"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {score}
                    </motion.span>
                    <span className="text-xs uppercase tracking-widest text-muted mt-1">/ 100</span>
                </div>
            </div>

            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted">
                {label}
            </h3>
        </div>
    );
}
