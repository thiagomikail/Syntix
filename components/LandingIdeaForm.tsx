"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { VoiceInput } from "@/components/VoiceInput";
import { AuthModal } from "@/components/AuthModal";

export function LandingIdeaForm() {
    const [ideaText, setIdeaText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { status } = useSession();
    const router = useRouter();

    const handleTranscript = (text: string) => {
        setIdeaText((prev) => (prev ? prev + " " + text : text));
    };

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ideaText.trim()) return;

        if (status === "authenticated") {
            router.push(`/app/idea/new?ideaText=${encodeURIComponent(ideaText)}`);
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <form onSubmit={handleStart} className="relative">
                <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-xl p-2 border border-primary/20 shadow-xl shadow-primary/5">
                    <VoiceInput
                        onTranscript={handleTranscript}
                        className="shrink-0"
                    />

                    <input
                        type="text"
                        name="idea"
                        value={ideaText}
                        onChange={(e) => setIdeaText(e.target.value)}
                        placeholder="Describe your business idea..."
                        className="flex-1 bg-transparent px-2 py-4 text-base focus:outline-none placeholder:text-slate-500 text-white min-w-0"
                    />
                    <button
                        type="submit"
                        disabled={!ideaText.trim()}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all shrink-0 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-lg">bolt</span>
                        START
                    </button>
                </div>
            </form>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => router.push(`/app/idea/new?ideaText=${encodeURIComponent(ideaText)}`)}
                title="Who's pitching this idea?"
                description="Sign in as a founder or continue as a guest to enter the lab instantly."
            />
        </>
    );
}
