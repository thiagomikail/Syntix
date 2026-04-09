"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  XCircle,
  Share2,
  Upload,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";
import { ConsentGate } from "@/components/vault/ConsentGate";
import { VaultPassphraseGate } from "@/components/vault/VaultPassphraseGate";
import { getDocumentStats, getMyDocuments } from "@/app/actions/vault/documents";
import { checkDueReminders } from "@/app/actions/vault/reminders";

type Stats = {
  total: number;
  expiringSoon: number;
  expired: number;
  sharedCount: number;
  tier: string;
  limit: number;
};

type Document = {
  id: string;
  documentType: string;
  label: string;
  fileName: string;
  expiryDate: Date | null;
  createdAt: Date;
  familyMember: { name: string; relationship: string } | null;
  _count: { shares: number; reminders: number };
};

function getExpiryStatus(expiryDate: Date | null): "safe" | "warning" | "danger" | "expired" | "none" {
  if (!expiryDate) return "none";
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return "expired";
  if (days < 30) return "danger";
  if (days < 90) return "warning";
  return "safe";
}

const statusColors = {
  safe: "text-accent bg-accent/10 border-accent/20",
  warning: "text-warning bg-warning/10 border-warning/20",
  danger: "text-danger bg-danger/10 border-danger/20",
  expired: "text-danger/70 bg-danger/5 border-danger/10",
  none: "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

const typeIcons: Record<string, string> = {
  PASSPORT: "🛂",
  VISA: "📋",
  INSURANCE: "🛡️",
  VACCINATION: "💉",
  OTHER: "📄",
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background-card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, docsData] = await Promise.all([
          getDocumentStats(),
          getMyDocuments(),
        ]);
        setStats(statsData);
        setDocuments(docsData as Document[]);
        // Check-on-login: process due reminders
        await checkDueReminders();
      } catch (error) {
        console.error("[Dashboard] Load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="h-5 w-5 animate-pulse" />
          <span>{t.common.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.vault.title}</h1>
          <p className="text-sm text-slate-400">{t.vault.subtitle}</p>
        </div>
        <Link
          href="/vault/upload"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Upload className="h-4 w-4" />
          {t.vault.uploadDocument}
        </Link>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={FileText}
            label={t.vault.totalDocuments}
            value={stats.total}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={AlertTriangle}
            label={t.vault.expiringSoon}
            value={stats.expiringSoon}
            color="bg-warning/10 text-warning"
          />
          <StatCard
            icon={XCircle}
            label={t.vault.expired}
            value={stats.expired}
            color="bg-danger/10 text-danger"
          />
          <StatCard
            icon={Share2}
            label={t.vault.sharedDocuments}
            value={stats.sharedCount}
            color="bg-accent/10 text-accent"
          />
        </div>
      )}

      {/* Tier info */}
      {stats && stats.tier === "FREE" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-slate-300">
          <span className="font-medium text-primary">{t.tiers.free}</span>
          {" — "}
          {stats.limit - stats.total > 0
            ? `${stats.limit - stats.total} ${t.tiers.documentsLeft}`
            : t.tiers.limitReached}
        </div>
      )}

      {/* Document grid */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="mb-3 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">{t.vault.noDocuments}</p>
          <Link
            href="/vault/upload"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {t.vault.uploadDocument}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, i) => {
            const status = getExpiryStatus(doc.expiryDate ? new Date(doc.expiryDate) : null);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/vault/document/${doc.id}`}
                  className="block rounded-xl border border-border bg-background-card p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeIcons[doc.documentType] || "📄"}</span>
                      <div>
                        <h3 className="font-medium text-white">{doc.label}</h3>
                        <p className="text-xs text-slate-500">
                          {(t.vault.documentTypes as Record<string, string>)[doc.documentType]}
                        </p>
                      </div>
                    </div>
                    {status !== "none" && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColors[status]}`}
                      >
                        {(t.vault.status as Record<string, string>)[status]}
                      </span>
                    )}
                  </div>

                  {doc.familyMember && (
                    <p className="mt-2 text-xs text-slate-500">
                      👤 {doc.familyMember.name}
                    </p>
                  )}

                  {doc.expiryDate && (
                    <p className="mt-2 text-xs text-slate-500">
                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2 text-[10px] text-slate-600">
                    {doc._count.shares > 0 && (
                      <span>📤 {doc._count.shares} shared</span>
                    )}
                    {doc._count.reminders > 0 && (
                      <span>🔔 {doc._count.reminders} reminders</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function VaultDashboardClient({ hasConsented }: { hasConsented: boolean }) {
  return (
    <ConsentGate hasConsented={hasConsented}>
      <VaultPassphraseGate>
        <DashboardContent />
      </VaultPassphraseGate>
    </ConsentGate>
  );
}
