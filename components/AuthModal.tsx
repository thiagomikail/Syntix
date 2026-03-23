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
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = callsign.trim();
        if (!name) return;

        if (name.length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }

        setError("");
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                username: name,
                redirect: false,
            });

            if (result?.error) {
                console.error("Login failed:", result.error);
                setError("Login failed. Please try a different name (letters, numbers, hyphens allowed).");
            } else {
                window.location.reload(); // Force full reload for session stability
                if (onSuccess) onSuccess();
                else onClose();
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError("");
        setIsLoading(true);
        try {
            const guestSign = `Guest-${Math.floor(Math.random() * 1000000)}`;
            const result = await signIn("credentials", {
                username: guestSign,
                redirect: false,
            });

            if (result?.error) {
                console.error("Guest login failed:", result.error);
                setError("Guest login failed. Please try again.");
            } else {
                window.location.reload(); // Force full reload for session stability
                if (onSuccess) onSuccess();
                else onClose();
            }
        } catch (error) {
            console.error("Guest login error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/app" });
        } catch (error) {
            console.error("Google login error:", error);
            setError("Google sign-in failed. Try another method.");
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

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">error</span>
                                {error}
                            </div>
                        )}

                        {/* Google Sign-In */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-black px-4 py-3 font-medium text-white transition-all hover:bg-slate-900 hover:border-slate-600 disabled:opacity-50"
                        >
                            <svg className="size-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="my-5 flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-800" />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">or</span>
                            <div className="flex-1 h-px bg-slate-800" />
                        </div>

                        {/* Callsign Login */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-300">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={callsign}
                                    onChange={(e) => { setCallsign(e.target.value); setError(""); }}
                                    placeholder="e.g. Daniel, Maverick, José..."
                                    className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <p className="mt-1.5 text-xs text-slate-600">
                                    Letters, numbers, hyphens, spaces — 2 to 30 characters.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !callsign.trim()}
                                className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isLoading ? "Connecting..." : "Enter the Lab"}
                            </button>
                        </form>

                        <div className="mt-5 border-t border-slate-800 pt-5 text-center">
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
