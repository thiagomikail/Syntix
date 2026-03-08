"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/components/LanguageContext";
import { AuthModal } from "@/components/AuthModal";

export function Header() {
    const { data: session } = useSession();
    const { t, language, setLanguage } = useLanguage();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 flex flex-col border-b border-primary/10 bg-background-dark/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <Link href="/app" className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-white hover:text-black transition-colors">
                            <span className="material-symbols-outlined text-xl">account_tree</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">SYNTIX</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Toggle */}
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
                        className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors hidden sm:block"
                    >
                        {language === 'en' ? 'PT' : 'EN'}
                    </button>

                    {/* Nav Links */}
                    <Link href="/arena" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors hidden sm:block">
                        {t.dashboard.arena}
                    </Link>

                    {/* User Avatar */}
                    {session?.user ? (
                        <div className="relative" ref={profileRef}>
                            <div
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex size-8 items-center justify-center rounded-full bg-primary text-black text-sm font-bold shadow-glow-primary cursor-pointer border border-primary/50 hover:bg-white transition-colors"
                            >
                                {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                            </div>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-primary/10 bg-[#1A1A1A] p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-3 py-2 border-b border-primary/10 mb-2">
                                        <p className="text-sm font-bold text-white truncate">{session.user.name || "User"}</p>
                                        <p className="text-xs text-slate-400 truncate">{session.user.email || ""}</p>
                                    </div>
                                    <Link
                                        href="/app"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">dashboard</span>
                                        {t.dashboard.myLab}
                                    </Link>

                                    {session.user.role === "ADMIN" && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fuchsia-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-500 transition-colors mt-1"
                                        >
                                            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                            Admin Panel
                                        </Link>
                                    )}

                                    {session.user.name?.startsWith("Guest-") && (
                                        <button
                                            onClick={async () => {
                                                const newCallsign = prompt("Enter your desired Callsign to claim this account and save your ideas permanently:");
                                                if (newCallsign) {
                                                    const { claimGuestAccount } = await import('@/app/actions/claim-account');
                                                    const res = await claimGuestAccount(newCallsign);
                                                    if (res.error) alert(res.error);
                                                    if (res.requiresRelogin) {
                                                        alert(res.message);
                                                        signOut({ callbackUrl: "/" });
                                                    }
                                                }
                                            }}
                                            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">verified_user</span>
                                            Claim Account
                                        </button>
                                    )}

                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors mt-1"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-glow-primary transition-all"
                        >
                            Sign In
                        </button>
                    )}

                    {/* Mobile Menu Icon */}
                    <span
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="material-symbols-outlined cursor-pointer text-slate-400 sm:hidden hover:text-primary transition-colors"
                    >
                        {isMobileOpen ? "close" : "menu"}
                    </span>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileOpen && (
                <div className="sm:hidden border-t border-primary/10 bg-[#1A1A1A] px-4 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                    <Link href="/arena" onClick={() => setIsMobileOpen(false)} className="text-sm font-medium text-slate-300 hover:text-primary transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">hub</span>
                        {t.dashboard.arena}
                    </Link>
                    {session?.user?.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setIsMobileOpen(false)} className="text-sm font-medium text-fuchsia-400 hover:text-fuchsia-500 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                            Admin Panel
                        </Link>
                    )}
                    <button
                        onClick={() => { setLanguage(language === 'en' ? 'pt' : 'en'); setIsMobileOpen(false); }}
                        className="text-sm font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2 w-fit mt-2"
                    >
                        <span className="material-symbols-outlined text-base">language</span>
                        Change to {language === 'en' ? 'PT' : 'EN'}
                    </button>
                </div>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </nav>
    );
}
