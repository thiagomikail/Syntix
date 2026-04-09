"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "./LanguageContext";
import {
  Shield,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useVaultPassphrase } from "./VaultPassphraseContext";

export function VaultHeader() {
  const { data: session } = useSession();
  const { t, language, setLanguage } = useLanguage();
  const { masterKey, lock } = useVaultPassphrase();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background-dark/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link href="/vault" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            TravelVault
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "pt" : "en")}
          className="hidden text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-primary sm:block"
        >
          {language === "en" ? "PT" : "EN"}
        </button>

        {/* Lock vault button */}
        {masterKey && (
          <button
            onClick={lock}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-400 transition-colors hover:bg-background-card hover:text-warning"
            title={t.passphrase.lock}
          >
            <Lock className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Notifications */}
        {session && (
          <Link
            href="/vault/notifications"
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-background-card hover:text-primary"
          >
            <Bell className="h-5 w-5" />
          </Link>
        )}

        {/* Profile dropdown */}
        {session ? (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition-colors hover:bg-background-card"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">{session.user?.name || "User"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-background-card py-1 shadow-lg">
                <Link
                  href="/vault/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-background-surface"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t.nav.settings}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-background-surface"
                >
                  <LogOut className="h-4 w-4" />
                  {t.nav.logout}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {t.nav.login}
          </Link>
        )}
      </div>
    </nav>
  );
}
