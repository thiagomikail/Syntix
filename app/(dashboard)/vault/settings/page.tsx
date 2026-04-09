"use client";

import { useState } from "react";
import { Settings, Download, Trash2, Shield, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";
import { VaultPassphraseGate } from "@/components/vault/VaultPassphraseGate";
import { exportUserData, requestDeletion } from "@/app/actions/vault/compliance";

function SettingsContent() {
  const { t } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `travelvault-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await requestDeletion();
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" /> {t.settings.title}
      </h1>

      {/* Export data */}
      <div className="rounded-xl border border-border bg-background-card p-5 space-y-3">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Download className="h-4 w-4 text-accent" /> {t.settings.exportData}
        </h3>
        <p className="text-xs text-slate-400">{t.settings.exportDescription}</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg bg-accent/10 border border-accent/20 px-4 py-2 text-sm text-accent hover:bg-accent/20 disabled:opacity-50"
        >
          {exporting ? t.common.loading : t.settings.exportData}
        </button>
      </div>

      {/* DPO Contact */}
      <div className="rounded-xl border border-border bg-background-card p-5 space-y-2">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> {t.settings.dpo}
        </h3>
        <p className="text-xs text-slate-400">{t.settings.dpoContact}</p>
      </div>

      {/* Delete vault */}
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-5 space-y-3">
        <h3 className="text-sm font-medium text-danger flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> {t.settings.deleteAccount}
        </h3>
        <p className="text-xs text-slate-400">{t.settings.deleteDescription}</p>
        <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-background-dark p-2 text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Type &quot;DELETE&quot; to confirm
        </div>
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder='Type "DELETE"'
          className="w-full rounded-lg border border-danger/20 bg-background-surface px-3 py-2 text-sm text-white focus:border-danger focus:outline-none"
        />
        <button
          onClick={handleDelete}
          disabled={deleteConfirm !== "DELETE" || deleting}
          className="rounded-lg bg-danger px-4 py-2 text-sm text-white hover:bg-danger/80 disabled:opacity-50"
        >
          {deleting ? t.common.loading : t.settings.deleteAccount}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <VaultPassphraseGate>
      <SettingsContent />
    </VaultPassphraseGate>
  );
}
