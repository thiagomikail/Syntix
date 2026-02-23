"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// import { toast } from "sonner";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
}

interface GamificationState {
    xp: number;
    level: number;
    title: string;
    streak: number;
    achievements: Achievement[];
    socialSharesToday: number;
    addXP: (amount: number, reason: string) => void;
    unlockAchievement: (id: string) => void;
    shareToSocial: (platform: 'linkedin' | 'instagram') => void;
}

const GamificationContext = createContext<GamificationState | undefined>(undefined);

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

const TITLES = [
    { level: 1, title: "Novice" },
    { level: 2, title: "Tinkerer" },
    { level: 3, title: "Builder" },
    { level: 4, title: "Visionary" },
    { level: 5, title: "Unicorn" },
];

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [xp, setXP] = useState(0);
    const [level, setLevel] = useState(1);
    const [streak, setStreak] = useState(0);
    const [socialSharesToday, setSocialSharesToday] = useState(0);
    const [lastShareDate, setLastShareDate] = useState<string | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([
        { id: "first_idea", title: "Visionary", description: "Created your first idea", icon: "💡" },
        { id: "inception_master", title: "Architect", description: "Completed an Inception analysis", icon: "🏗️" },
        { id: "pitch_perfect", title: "Deal Maker", description: "Generated a full Pitch", icon: "🤝" },
        { id: "social_butterfly", title: "The Hype Engine", description: "Shared on social media", icon: "🚀" },
        { id: "streak_3", title: "On Fire", description: "3-day streak", icon: "🔥" },
    ]);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem("syntix_gamification");
        if (saved) {
            const parsed = JSON.parse(saved);
            setXP(parsed.xp || 0);
            setLevel(parsed.level || 1);
            setStreak(parsed.streak || 0);
            setSocialSharesToday(parsed.socialSharesToday || 0);
            setLastShareDate(parsed.lastShareDate || null);

            // Reset daily shares if new day
            const today = new Date().toDateString();
            if (parsed.lastShareDate !== today) {
                setSocialSharesToday(0);
                setLastShareDate(today);
            }

            // Merge achievements to keep new definitions but load unlocked status
            if (parsed.achievements) {
                setAchievements(prev => prev.map(a => {
                    const savedA = parsed.achievements.find((sa: Achievement) => sa.id === a.id);
                    return savedA ? { ...a, unlockedAt: savedA.unlockedAt } : a;
                }));
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("syntix_gamification", JSON.stringify({
            xp, level, streak, achievements, socialSharesToday, lastShareDate
        }));
    }, [xp, level, streak, achievements, socialSharesToday, lastShareDate]);

    const getTitle = () => {
        const found = TITLES.slice().reverse().find(t => level >= t.level);
        return found ? found.title : TITLES[0].title;
    };

    const addXP = (amount: number, reason: string) => {
        setXP(prev => {
            const newXP = prev + amount;

            // Check level up
            const nextLevelThreshold = LEVEL_THRESHOLDS[level];
            if (newXP >= nextLevelThreshold) {
                setLevel(l => l + 1);
                console.log("LEVEL UP!", level + 1);
            }

            return newXP;
        });
        console.log(`+${amount} XP: ${reason}`);
    };

    const unlockAchievement = (id: string) => {
        setAchievements(prev => prev.map(a => {
            if (a.id === id && !a.unlockedAt) {
                console.log(`Achievement Unlocked: ${a.title}`);
                addXP(50, `Achievement: ${a.title}`);
                return { ...a, unlockedAt: new Date() };
            }
            return a;
        }));
    };

    const shareToSocial = (platform: 'linkedin' | 'instagram') => {
        const today = new Date().toDateString();

        // Reset if needed (though useEffect handles load, this handles active session rollover)
        if (lastShareDate !== today) {
            setSocialSharesToday(0);
            setLastShareDate(today);
        }

        if (socialSharesToday < 5) { // Cap at 5 shares/day for XP
            addXP(500, `Shared on ${platform}`); // 500 XP as per plan
            setSocialSharesToday(prev => prev + 1);
            unlockAchievement("social_butterfly");
        } else {
            console.log("Daily share limit reached for XP.");
        }
    };

    return (
        <GamificationContext.Provider value={{
            xp, level, title: getTitle(), streak, achievements, socialSharesToday,
            addXP, unlockAchievement, shareToSocial
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) throw new Error("useGamification must be used within a GamificationProvider");
    return context;
}
