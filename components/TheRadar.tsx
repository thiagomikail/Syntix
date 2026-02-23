"use client";

import React from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { useLanguage } from "./LanguageContext";
import { motion } from "framer-motion";
import { RadarDataPoint } from "@/types/analysis";

interface TheRadarProps {
    data: RadarDataPoint[];
}

export function TheRadar({ data }: TheRadarProps) {
    const { t } = useLanguage();

    return (
        <div className="w-full h-[400px] border border-border bg-secondary/10 rounded-xl p-4 flex flex-col items-center justify-center relative backdrop-blur-sm">
            <h3 className="absolute top-4 left-4 font-mono font-bold uppercase tracking-wider text-sm text-muted">
                {t.radar.title}
            </h3>

            <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar
                            name="Project Alpha"
                            dataKey="A"
                            stroke="#00FF41"
                            strokeWidth={2}
                            fill="#00FF41"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
