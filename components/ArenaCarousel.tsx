"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTopArenaProjects } from "@/app/actions/publish";
import { IRLScore } from "@/components/IRLScore";

export function ArenaCarousel() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getTopArenaProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch arena projects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="w-full py-12 flex justify-center">
                <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (projects.length === 0) return null;

    return (
        <section className="relative w-full py-12 overflow-hidden border-t border-b border-primary/5 bg-[#0a0a0a]">
            <div className="flex items-center gap-2 px-6 md:px-12 mb-6">
                <span className="material-symbols-outlined text-primary text-xl">local_fire_department</span>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase">Trending in public Arena</h2>
            </div>

            {/* Carousel Container */}
            <div className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-8 snap-x snap-mandatory hide-scrollbar">
                {projects.map((idea) => (
                    <Link
                        key={idea.id}
                        href={`/idea/${idea.id}`}
                        className="group relative flex flex-col shrink-0 w-72 md:w-80 h-48 rounded-2xl border border-primary/10 p-5 transition-all hover:border-primary/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 snap-start cursor-pointer overflow-hidden"
                        style={idea.thumbnailUrl
                            ? { backgroundImage: `linear-gradient(to top, rgba(26,26,26,0.95) 0%, rgba(26,26,26,0.3) 100%), url("${idea.thumbnailUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : { backgroundColor: '#1A1A1A' }
                        }
                    >
                        {/* Glow Effect / Backdrop */}
                        <div className="absolute inset-0 bg-background-dark/60 pointer-events-none z-0"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent pointer-events-none z-0"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>

                        <div className="flex items-center justify-between mb-3 relative z-10">
                            {idea.archetype && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                    {idea.archetype}
                                </span>
                            )}
                            {idea.irlJson && JSON.parse(idea.irlJson).score && (
                                <div className="scale-[0.4] origin-right -mt-8 -mb-10 -mr-4">
                                    <IRLScore score={JSON.parse(idea.irlJson).score} label="" />
                                </div>
                            )}
                            <div className="flex size-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden">
                                {idea.user?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-white mb-2 line-clamp-2 relative z-10">
                            {idea.title || "Untitled Venture"}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-3 relative z-10">
                            {idea.rawText}
                        </p>
                    </Link>
                ))}
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
