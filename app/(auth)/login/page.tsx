"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield, LogIn } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/vault/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    await signIn("credentials", { username, callbackUrl: "/vault" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-dark px-4 vault-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">TravelVault</h1>
          <p className="mt-1 text-sm text-slate-400">{t.vault.subtitle}</p>
        </div>

        {/* Google sign-in */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/vault" })}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background-card py-3 text-sm font-medium text-white transition-colors hover:bg-background-surface"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Demo/Credentials login */}
        <form onSubmit={handleCredentials} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (demo)"
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? t.common.loading : t.nav.login}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600">
          End-to-end encrypted. LGPD &amp; GDPR compliant.
        </p>
      </motion.div>
    </div>
  );
}
