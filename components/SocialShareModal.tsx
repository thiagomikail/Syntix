"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Linkedin, Instagram, Download, Check, Copy } from "lucide-react";
import { toPng } from "html-to-image";
import { useGamification } from "@/components/GamificationContext";

interface SocialShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    ideaText: string;
    score: number;
    title: string;
}

export function SocialShareModal({ isOpen, onClose, ideaText, score, title }: SocialShareModalProps) {
    const { shareToSocial } = useGamification();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const linkedInText = `Just audited my startup idea on Syntix. Score: ${score}/100.\n\n"The Auditor" says: ${title}\n\n#Syntix #Startup #AI #Founder`;
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedInText)}`;
    // Note: LinkedIn share-offsite often ignores text param now, but we'll try. Fallback is copy-paste.

    const handleCopyText = () => {
        navigator.clipboard.writeText(linkedInText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLinkedIn = () => {
        shareToSocial('linkedin');
        window.open(linkedInUrl, '_blank');
    };

    const handleInstagram = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `syntix-score-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            setDownloaded(true);
            shareToSocial('instagram');
            setTimeout(() => setDownloaded(false), 3000);
        } catch (err) {
            console.error("Failed to generate image", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-md shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                The Hype Engine
                            </h3>
                            <button onClick={onClose} className="text-muted-foreground hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">

                            {/* Visual Card Preview (Hidden off-screen usually, but here we show it for "The Flex") */}
                            <div className="flex justify-center">
                                <div
                                    ref={cardRef}
                                    className="w-[300px] h-[400px] bg-gradient-to-br from-[#0f172a] to-[#000] border border-white/10 p-6 flex flex-col items-center justify-between rounded-md relative overflow-hidden shadow-2xl"
                                >
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 blur-[50px] rounded-full" />

                                    {/* Logo */}
                                    <div className="z-10 w-full flex justify-between items-center opacity-70">
                                        <span className="font-bold text-xs tracking-widest text-white">SYNTIX</span>
                                        <div className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString()}</div>
                                    </div>

                                    {/* Score */}
                                    <div className="z-10 flex flex-col items-center gap-2">
                                        <div className="text-[80px] font-bold text-primary leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,157,0.5)]">
                                            {score}
                                        </div>
                                        <div className="text-xs uppercase tracking-[0.3em] text-white/60">IRL Score</div>
                                    </div>

                                    {/* Idea Snippet */}
                                    <div className="z-10 w-full text-center">
                                        <p className="text-white/80 text-sm font-medium line-clamp-3 italic">
                                            "{ideaText}"
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="z-10 w-full pt-4 border-t border-white/10 flex justify-between items-center">
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] text-muted-foreground uppercase">Analysis By</span>
                                            <span className="text-xs font-bold text-white">THE AUDITOR</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                            <Share2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* LinkedIn */}
                                <div className="col-span-2 space-y-2">
                                    <button
                                        onClick={handleLinkedIn}
                                        className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        Share on LinkedIn (+500 XP)
                                    </button>
                                    <button
                                        onClick={handleCopyText}
                                        className="w-full py-2 bg-secondary/10 hover:bg-secondary/20 text-xs text-muted-foreground hover:text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copied ? "Copied to Clipboard" : "Copy Caption Text"}
                                    </button>
                                </div>

                                {/* Instagram / Image */}
                                <button
                                    onClick={handleInstagram}
                                    disabled={isGenerating}
                                    className="col-span-2 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                                >
                                    {isGenerating ? (
                                        <span className="animate-pulse">Generating...</span>
                                    ) : (
                                        <>
                                            <Instagram className="w-4 h-4" />
                                            {downloaded ? "Image Downloaded!" : "Share to Stories (+500 XP)"}
                                        </>
                                    )}
                                </button>
                                <p className="col-span-2 text-center text-[10px] text-muted-foreground">
                                    *Downloads image. Upload to Stories manually from your gallery.
                                </p>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
