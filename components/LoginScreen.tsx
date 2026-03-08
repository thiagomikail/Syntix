"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

interface LoginScreenProps {
    onLogin?: (username: string) => void;
    onClose?: () => void;
}

export function LoginScreen({ onLogin, onClose }: LoginScreenProps) {
    const { t } = useLanguage();
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        const result = await signIn("credentials", {
            username: username.trim(),
            redirect: false,
        });

        if (result?.ok) {
            window.location.reload();
        } else {
            setIsLoading(false);
            console.error(t.auth.loginFailed);
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        signIn("google");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/95 backdrop-blur-xl">
            <div className="relative w-full max-w-sm mx-4 overflow-hidden rounded-2xl border border-primary/30 bg-surface/90 p-8 shadow-2xl">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 size-48 rounded-full bg-primary/30 blur-[80px]"></div>
                <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-primary/10 blur-[80px]"></div>

                {/* Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 flex size-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-black border border-primary/20 text-primary mb-6 shadow-glow-primary">
                        <span className="material-symbols-outlined text-4xl">account_tree</span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">{t.auth.joinSyntix}</h1>
                    <p className="text-sm font-medium text-slate-400 mb-8">{t.auth.buildSyntix}</p>

                    {/* Google */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex h-14 items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                    >
                        <svg className="size-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {t.auth.continueWithGoogle}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center w-full my-8">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t.auth.orCallsign}</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* Callsign */}
                    <form onSubmit={handleCredentialsLogin} className="w-full space-y-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t.auth.enterCallsign}
                            className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-4 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-600 transition-all shadow-inner"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!username.trim() || isLoading}
                            className="w-full flex h-14 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:shadow-[0_0_30px_rgba(255,107,0,0.6)] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                        >
                            {isLoading ? t.auth.authenticating : t.auth.initializeSession}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
