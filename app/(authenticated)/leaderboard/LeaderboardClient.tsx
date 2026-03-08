"use client";

import { useLanguage } from "@/components/LanguageContext";

interface Leader {
    user: { name: string | null; image: string | null };
    points: number;
}

interface LeaderboardClientProps {
    topBuilders: Leader[];
    topCollaborators: Leader[];
}

export function LeaderboardClient({ topBuilders, topCollaborators }: LeaderboardClientProps) {
    const { t, language } = useLanguage();
    const rankColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 mb-4">
                    <span className="material-symbols-outlined text-3xl text-primary">emoji_events</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                    {t.dashboard?.pantheon || "The Pantheon"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    {language === 'en' ? "Top builders and strategists in the Arena." : "Principais construtores e estrategistas da Arena."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Builders */}
                <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-primary/10">
                        <span className="material-symbols-outlined text-primary">bolt</span>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {language === 'en' ? "Top Builders" : "Principais Construtores"}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {language === 'en' ? "Builder Points (BP)" : "Pontos de Construtor (BP)"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {topBuilders.map((leader, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
                                <span className={`text-lg font-bold w-6 text-center ${rankColors[i] || "text-slate-500"}`}>#{i + 1}</span>
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {leader.user.name?.[0]?.toUpperCase() || "A"}
                                </div>
                                <span className="flex-1 font-bold text-sm truncate text-white">{leader.user.name || "Anonymous"}</span>
                                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white">{leader.points} BP</span>
                            </div>
                        ))}
                        {topBuilders.length === 0 && (
                            <div className="text-center py-6 text-sm text-slate-400 italic border border-dashed border-primary/10 rounded-xl">
                                {language === 'en' ? "No BP awarded yet." : "Nenhum BP concedido ainda."}
                            </div>
                        )}
                    </div>
                </div>

                {/* Collaborators */}
                <div className="rounded-2xl border border-primary/10 bg-[#1A1A1A] p-6">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-primary/10">
                        <span className="material-symbols-outlined text-accent-cyan">handshake</span>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {language === 'en' ? "Top Allies" : "Principais Aliados"}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {language === 'en' ? "Collab Points (CP)" : "Pontos de Colaboração (CP)"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {topCollaborators.map((leader, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
                                <span className={`text-lg font-bold w-6 text-center ${rankColors[i] || "text-slate-500"}`}>#{i + 1}</span>
                                <div className="size-8 rounded-full bg-accent-cyan/10 flex items-center justify-center text-xs font-bold text-accent-cyan">
                                    {leader.user.name?.[0]?.toUpperCase() || "A"}
                                </div>
                                <span className="flex-1 font-bold text-sm truncate text-white">{leader.user.name || "Anonymous"}</span>
                                <span className="rounded-full bg-accent-cyan px-2.5 py-0.5 text-[10px] font-bold text-slate-900">{leader.points} CP</span>
                            </div>
                        ))}
                        {topCollaborators.length === 0 && (
                            <div className="text-center py-6 text-sm text-slate-400 italic border border-dashed border-primary/10 rounded-xl">
                                {language === 'en' ? "No alliances yet." : "Nenhuma aliança ainda."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
