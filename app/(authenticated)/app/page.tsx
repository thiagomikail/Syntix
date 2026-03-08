"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/LanguageContext";
import { getUserIdeas } from "@/app/actions/dashboard";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { t } = useLanguage();
    // Assuming ideas are fetched client-side or passed as props if converted back from async
    // Since we can't use `async` with `"use client"`, we'll simulate fetching for the sake of this UI update
    // In a real scenario, we'd use SWR, React Query, or a server component passing data down.
    // For this refactor, I'll mock the data fetching to keep the `"use client"` directive needed for `useLanguage`.
    const [ideas, setIdeas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getUserIdeas().then((data) => {
            setIdeas(data || []);
            setIsLoading(false);
        });
    }, []);

    const statusIcon: Record<string, string> = {
        ideation: "science",
        refinement: "rocket_launch",
        impulse: "hub",
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.myLab}</h1>
                    <p className="text-sm text-slate-400 mt-1">{t.dashboard.manageVentures}</p>
                </div>
                <a
                    href="/app/idea/new"
                    className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    {t.dashboard.newProject}
                </a>
            </div>

            {/* Grid */}
            {/* Grid */}
            {isLoading ? (
                <div className="w-full py-12 flex justify-center">
                    <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
            ) : ideas.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 p-16 text-center bg-surface/50">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4 text-primary shadow-glow-primary">
                        <span className="material-symbols-outlined text-3xl">science</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t.dashboard.noVenturesYet}</h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-xs">{t.dashboard.startFirstProject}</p>
                    <Link href="/app/idea/new" className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all hover:scale-105">
                        {t.landing.startBuilding}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ideas.map((idea) => (
                        <Link key={idea.id} href={`/app/idea/${idea.id}`}>
                            <div
                                className="group flex flex-col rounded-2xl border border-primary/10 bg-surface/80 backdrop-blur-sm p-5 transition-all hover:border-primary/50 hover:shadow-glow-primary h-full cursor-pointer relative overflow-hidden"
                                style={idea.thumbnailUrl ? { backgroundImage: `linear-gradient(to top, rgba(26,26,26,0.95) 0%, rgba(26,26,26,0.5) 100%), url("${idea.thumbnailUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                <div className="absolute inset-0 bg-background-dark/40 pointer-events-none z-0"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent pointer-events-none z-0"></div>
                                <div className="flex items-center justify-between mb-3 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                            <span className="material-symbols-outlined text-base">{statusIcon[idea.status] || "science"}</span>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary">{idea.status}</span>
                                    </div>
                                    {idea.isPublic && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary border border-primary/20">
                                            <span className="material-symbols-outlined text-xs">public</span>
                                            {t.dashboard.arena}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold tracking-tight mb-1 line-clamp-2 text-white relative z-10">{idea.title || t.dashboard.untitledVenture}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2 flex-1 relative z-10">{idea.rawText}</p>
                                <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between relative z-10">
                                    <span className="text-xs text-slate-500">{t.dashboard.updatedAt ? new Date(idea.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                    <span className="material-symbols-outlined text-base text-slate-500 group-hover:text-primary transition-colors">arrow_forward</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
