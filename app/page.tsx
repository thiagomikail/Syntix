"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Bell,
  Users,
  Share2,
  Scale,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";

const features = [
  { icon: Lock, key: "encrypt" },
  { icon: Bell, key: "reminders" },
  { icon: Users, key: "family" },
  { icon: Share2, key: "share" },
  { icon: Scale, key: "compliance" },
  { icon: Clock, key: "processing" },
] as const;

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background-dark vault-grid">
      {/* Header */}
      <nav className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">TravelVault</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === "en" ? "pt" : "en")}
            className="text-xs font-bold uppercase text-slate-500 hover:text-primary"
          >
            {language === "en" ? "PT" : "EN"}
          </button>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {t.nav.login}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-glow-primary">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            {t.landing.hero}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            {t.landing.subtitle}
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-glow-primary transition-all hover:bg-primary-dark hover:gap-3"
          >
            {t.landing.cta}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="rounded-xl border border-border bg-background-card p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-white">
                {(t.landing.features as Record<string, string>)[key]}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {(t.landing.features as Record<string, string>)[`${key}Desc`]}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-xs text-slate-600">
        <p>TravelVault — Secure Travel Document Management</p>
        <p className="mt-1">LGPD (Brazil) / GDPR (EU) / CCPA (US) Compliant</p>
      </footer>
    </div>
  );
}
