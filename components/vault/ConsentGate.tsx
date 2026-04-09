"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { recordConsent } from "@/app/actions/vault/compliance";

export function ConsentGate({
  children,
  hasConsented: initialConsented,
}: {
  children: React.ReactNode;
  hasConsented: boolean;
}) {
  const { t } = useLanguage();
  const [hasConsented, setHasConsented] = useState(initialConsented);
  const [checks, setChecks] = useState({
    dataProcessing: false,
    crossBorder: false,
    terms: false,
  });
  const [submitting, setSubmitting] = useState(false);

  if (hasConsented) return <>{children}</>;

  const allChecked = checks.dataProcessing && checks.crossBorder && checks.terms;

  async function handleAccept() {
    if (!allChecked) return;
    setSubmitting(true);
    try {
      await recordConsent("VAULT_TOS", true, "1.0");
      await recordConsent("DATA_PROCESSING", true, "1.0");
      await recordConsent("CROSS_BORDER_TRANSFER", true, "1.0");
      setHasConsented(true);
    } catch (error) {
      console.error("[ConsentGate] Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl border border-border bg-background-card p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">{t.consent.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{t.consent.description}</p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={checks.dataProcessing}
              onChange={(e) =>
                setChecks((prev) => ({ ...prev, dataProcessing: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 rounded accent-primary"
            />
            <span className="text-sm text-slate-300">{t.consent.dataProcessing}</span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={checks.crossBorder}
              onChange={(e) =>
                setChecks((prev) => ({ ...prev, crossBorder: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 rounded accent-primary"
            />
            <span className="text-sm text-slate-300">{t.consent.crossBorder}</span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={checks.terms}
              onChange={(e) =>
                setChecks((prev) => ({ ...prev, terms: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 rounded accent-primary"
            />
            <span className="text-sm text-slate-300">{t.consent.terms}</span>
          </label>
        </div>

        {!allChecked && (
          <p className="mt-3 text-xs text-slate-500">{t.consent.required}</p>
        )}

        <button
          onClick={handleAccept}
          disabled={!allChecked || submitting}
          className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            t.common.loading
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              {t.consent.accept}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
