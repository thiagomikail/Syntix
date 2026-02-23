import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "./LanguageContext";

interface MetricCardProps {
    label: string;
    score: number;
    description?: string;
    color?: string; // Hex color
    onClick?: () => void;
}

export function MetricCard({ label, score, description, color = "#00FF41", onClick }: MetricCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "w-full bg-secondary/10 border border-border rounded-xl p-4 flex flex-col gap-2 backdrop-blur-sm transition-all duration-300 group",
                onClick ? "cursor-pointer hover:bg-secondary/20 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30" : ""
            )}
        >
            <div className="flex justify-between items-center">
                <h4 className="font-mono text-xs uppercase tracking-wider text-muted font-bold">
                    {label}
                </h4>
                <span className="font-mono text-lg font-bold text-foreground">
                    {score}/100
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>

            {description && (
                <p className="text-[10px] text-muted leading-tight mt-1">
                    {description}
                </p>
            )}
        </div>
    );
}
