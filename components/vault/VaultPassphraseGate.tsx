"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useVaultPassphrase } from "./VaultPassphraseContext";
import { useLanguage } from "./LanguageContext";

export function VaultPassphraseGate({ children }: { children: React.ReactNode }) {
  const { masterKey, hasPassphrase, isUnlocking, createPassphrase, unlock } =
    useVaultPassphrase();
  const { t } = useLanguage();
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  // Vault is already unlocked
  if (masterKey) return <>{children}</>;

  const isCreating = !hasPassphrase;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (isCreating) {
      if (passphrase.length < 8) {
        setError("Passphrase must be at least 8 characters");
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setError(t.passphrase.mismatch);
        return;
      }
      await createPassphrase(passphrase);
    } else {
      const success = await unlock(passphrase);
      if (!success) {
        setError("Failed to unlock vault. Please try again.");
      }
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-background-card p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-white">
            {isCreating ? t.passphrase.setTitle : t.passphrase.title}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isCreating ? t.passphrase.setDescription : t.passphrase.description}
          </p>
        </div>

        {isCreating && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-warning/90">{t.passphrase.warning}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              {isCreating ? t.passphrase.set : t.passphrase.enter}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type={showPass ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={t.passphrase.placeholder}
                className="w-full rounded-lg border border-border bg-background-surface py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isCreating && (
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                {t.passphrase.confirm}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder={t.passphrase.placeholder}
                  className="w-full rounded-lg border border-border bg-background-surface py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={isUnlocking || !passphrase}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {isUnlocking
              ? t.common.loading
              : isCreating
                ? t.passphrase.set
                : t.passphrase.unlock}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
