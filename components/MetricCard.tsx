"use client";

interface MetricCardProps {
    label: string;
    score: number;
    color: string;
    description: string;
    onClick?: () => void;
}

export function MetricCard({ label, score, color, description, onClick }: MetricCardProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 rounded-2xl border border-primary/10 bg-[#1A1A1A] text-white p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 cursor-pointer text-center w-full"
        >
            <div
                className="text-3xl font-bold"
                style={{ color }}
            >
                {score}
            </div>
            <div className="text-sm font-bold">{label}</div>
            <div className="text-xs text-slate-400">{description}</div>
        </button>
    );
}
