
"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import { useGamification } from "./GamificationContext";
import { useDevice } from "./DeviceContext";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone, Globe, Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export function Header() {
    const { language, setLanguage } = useLanguage();
    const { xp, level, title } = useGamification();
    const { isMobileView, toggleMobileView } = useDevice();

    const toggleLanguage = () => {
        setLanguage(language === "pt" ? "en" : "pt");
    };


    return (
        <header className="w-full border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                            <Monitor className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-white">SYNTIX</span>
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-2" />

                    <div className="flex items-center gap-3">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <div className="flex flex-col items-end cursor-help group">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                                            Level {level}
                                            <Info className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                        <div className="w-24 h-1.5 bg-secondary/20 rounded-full overflow-hidden mt-1">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,255,157,0.5)]"
                                                style={{ width: `${(xp % 100) / 100 * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-[100] bg-popover border border-white/10 text-popover-foreground px-4 py-3 rounded-xl shadow-xl max-w-xs animate-in fade-in zoom-in-95 duration-200" sideOffset={5}>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-primary text-sm uppercase tracking-widest">{title}</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Earn XP by creating ideas, analyzing data, and sharing your journey.
                                                <br />
                                                <span className="text-white/80 mt-1 block">Next Title Unlock: Level {level + 1}</span>
                                            </p>
                                        </div>
                                        <Tooltip.Arrow className="fill-popover" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>

                        <div className="w-8 h-8 rounded-full border border-primary/20 bg-secondary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {level}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleMobileView}
                        className={cn(
                            "flex items-center gap-2 text-xs font-medium transition-colors uppercase tracking-wider px-3 py-1.5 rounded-full",
                            isMobileView ? "text-primary bg-primary/10 border border-primary/20" : "text-muted-foreground hover:bg-white/5"
                        )}
                        title={isMobileView ? "Switch to Desktop View" : "Switch to Mobile View"}
                    >
                        {isMobileView ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                        {isMobileView ? "Desktop" : "Mobile"}
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider hover:bg-white/5 px-3 py-1.5 rounded-full"
                    >
                        <Globe className="w-4 h-4" />
                        {language}
                    </button>
                    {/* User Profile Hook (Placeholder) */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 shadow-lg" />
                </div>
            </div>
        </header>
    );
}

