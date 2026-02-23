"use client";

import React, { useState } from "react";
import { Download, FileText, Loader2, Share2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export function AlphaReportButton() {
    const [generating, setGenerating] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setDownloaded(true);
            // Simulate download
            alert("Alpha Report Downloaded (Mock)");
        }, 2000);
    };

    return (
        <div className="w-full flex gap-2">
            <button
                onClick={handleDownload}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/50 text-foreground py-3 rounded-lg transition-all text-sm font-bold uppercase tracking-wider"
            >
                {generating ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        Generating...
                    </>
                ) : (
                    <>
                        <FileText className="w-4 h-4 text-primary" />
                        Alpha Report
                    </>
                )}
            </button>

            <button className="flex items-center justify-center gap-2 bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/50 text-foreground px-4 rounded-lg transition-all">
                <Share2 className="w-4 h-4" />
            </button>
        </div>
    );
}
