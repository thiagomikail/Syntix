"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, title = "Sign In to Syntix", description = "Access your idea lab, save your progress, and join the arena.", onSuccess }: AuthModalProps) {
    const [callsign, setCallsign] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!callsign.trim()) return;

        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                username: callsign.trim(),
                redirect: false,
            });

            if (result?.error) {
                console.error("Login failed:", result.error);
                alert("Login failed. Please try again.");
            } else {
                router.refresh(); // Refresh server components to get the new session
                if (onSuccess) onSuccess();
                else onClose();
            }
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setIsLoading(true);
        try {
            const guestSign = `Guest-${Math.floor(Math.random() * 1000000)}`;
            const result = await signIn("credentials", {
                username: guestSign,
                redirect: false,
            });

            if (result?.error) {
                console.error("Guest login failed:", result.error);
            } else {
                router.refresh();
                if (onSuccess) onSuccess();
                else onClose();
            }
        } catch (error) {
            console.error("Guest login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-md rounded-2xl border border-primary/20 bg-[#1A1A1A] p-6 shadow-2xl shadow-primary/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                                <span className="material-symbols-outlined text-2xl">account_circle</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">{title}</h2>
                            <p className="mt-2 text-sm text-slate-400">{description}</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">
                                    Callsign (Username)
                                </label>
                                <input
                                    type="text"
                                    value={callsign}
                                    onChange={(e) => setCallsign(e.target.value)}
                                    placeholder="e.g. Maverick"
                                    className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !callsign.trim()}
                                className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isLoading ? "Connecting..." : "Enter the Lab"}
                            </button>
                        </form>

                        <div className="mt-6 border-t border-slate-800 pt-6 text-center">
                            <button
                                onClick={handleGuestLogin}
                                disabled={isLoading}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors underline underline-offset-4"
                            >
                                Continue as Guest (Start without saving)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
