"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Share2, FileText, User } from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";
import { VaultPassphraseGate } from "@/components/vault/VaultPassphraseGate";
import { getSharedWithMe } from "@/app/actions/vault/sharing";

type Share = Awaited<ReturnType<typeof getSharedWithMe>>[number];

function SharedContent() {
  const { t } = useLanguage();
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSharedWithMe()
      .then(setShares)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <Share2 className="h-5 w-5 text-primary" /> {t.sharing.title}
      </h1>

      {shares.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Share2 className="mb-3 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">{t.sharing.noShares}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map((share) => (
            <Link
              key={share.id}
              href={`/vault/document/${share.document.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-background-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium text-white">{share.document.label}</h3>
                  <p className="text-xs text-slate-500">
                    {(t.vault.documentTypes as Record<string, string>)[share.document.documentType]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <User className="h-3 w-3" />
                  {t.sharing.sharedBy}: {share.sharedBy.name || share.sharedBy.email}
                </p>
                <p className="text-[10px] text-slate-600">{share.accessLevel}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SharedWithMePage() {
  return (
    <VaultPassphraseGate>
      <SharedContent />
    </VaultPassphraseGate>
  );
}
