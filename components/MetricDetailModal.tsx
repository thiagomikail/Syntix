"use client";

interface MetricDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    label: string;
    score: number;
    description: string;
    detailedExplanation: string;
    color: string;
}

export function MetricDetailModal({ isOpen, onClose, label, score, description, detailedExplanation, color }: MetricDetailModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-md mx-4 rounded-2xl border border-primary/20 bg-[#1A1A1A] text-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Score */}
                <div className="text-center mb-6">
                    <div className="text-5xl font-bold mb-1" style={{ color }}>{score}</div>
                    <h3 className="text-lg font-bold">{label}</h3>
                    <p className="text-sm text-slate-400">{description}</p>
                </div>

                {/* Explanation */}
                <div className="rounded-xl bg-[#222222] border border-primary/10 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Analysis</h4>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{detailedExplanation}</p>
                </div>
            </div>
        </div>
    );
}
