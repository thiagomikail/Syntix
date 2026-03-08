"use client";

interface IRLScoreProps {
    score: number;
    label?: string;
}

export function IRLScore({ score, label = "IRL Score" }: IRLScoreProps) {
    const getGrade = (s: number) => {
        if (s >= 90) return { grade: "S", color: "#7f0df2" };
        if (s >= 75) return { grade: "A", color: "#00f5ff" };
        if (s >= 60) return { grade: "B", color: "#22c55e" };
        if (s >= 40) return { grade: "C", color: "#eab308" };
        return { grade: "D", color: "#ef4444" };
    };

    const { grade, color } = getGrade(score);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative size-28">
                <svg className="size-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
                    <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 314} 314`}
                        style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{grade}</span>
                </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
        </div>
    );
}
