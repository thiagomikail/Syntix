"use client";

import { useState } from "react";
import { deleteIdea } from "@/app/actions/admin-ideas";
import { Trash2, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

type IdeaData = {
    id: string;
    title: string | null;
    status: string;
    isPublic: boolean;
    createdAt: Date;
    user: {
        name: string | null;
        email: string | null;
    };
};

export default function IdeaTableClient({ initialIdeas }: { initialIdeas: IdeaData[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const filteredIdeas = initialIdeas.filter(i =>
        i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function handleDelete(ideaId: string, ideaTitle: string | null) {
        if (!confirm(`Are you absolutely sure you want to delete "${ideaTitle || "this idea"}"? This action cannot be undone.`)) return;
        setIsUpdating(ideaId);
        const res = await deleteIdea(ideaId);
        if (res.error) alert(res.error);
        setIsUpdating(null);
    }

    return (
        <div className="bg-[#1A1A1A] border border-primary/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-primary/10 bg-black/40 flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search ideas or authors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111] border border-primary/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>
                <div className="text-sm text-slate-400 font-medium">
                    {filteredIdeas.length} Ideas
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#111] text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Idea</th>
                            <th className="px-6 py-4 font-semibold">Author</th>
                            <th className="px-6 py-4 font-semibold">Status / Vis</th>
                            <th className="px-6 py-4 font-semibold">Created</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {filteredIdeas.map(idea => (
                            <tr key={idea.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-white max-w-[200px] truncate" title={idea.title || "Untitled"}>{idea.title || "Untitled"}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-300">{idea.user.name || "Anonymous"}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                            {idea.status}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {idea.isPublic ? "Public" : "Private"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    {new Date(idea.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                        <Link
                                            href={idea.isPublic ? `/arena/${idea.id}` : `/app/idea/${idea.id}`}
                                            className="p-2 bg-slate-800 hover:bg-primary/20 text-slate-400 hover:text-primary rounded-lg transition-colors tooltip tooltip-top"
                                            data-tip="View Idea"
                                        >
                                            <ExternalLink className="size-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(idea.id, idea.title)}
                                            disabled={isUpdating === idea.id}
                                            className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors tooltip tooltip-top"
                                            data-tip="Delete Idea"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredIdeas.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No ideas found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
