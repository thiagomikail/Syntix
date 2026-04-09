"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Trash2,
  Share2,
  Bell,
  FileText,
  Shield,
  Calendar,
  User,
} from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";
import { VaultPassphraseGate } from "@/components/vault/VaultPassphraseGate";
import { useVaultPassphrase } from "@/components/vault/VaultPassphraseContext";
import { getDocumentById, deleteDocument } from "@/app/actions/vault/documents";
import { unwrapKey, decryptDocument } from "@/lib/vault-crypto";

type DocDetail = {
  id: string;
  ownerId: string;
  documentType: string;
  label: string;
  fileName: string;
  encryptedKeyBlob: string;
  expiryDate: string | null;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
  familyMember: { name: string; relationship: string } | null;
  shares: Array<{
    id: string;
    accessLevel: string;
    sharedTo: { name: string | null; email: string | null };
  }>;
  reminders: Array<{ id: string; daysBefore: number; sentAt: string | null }>;
};

function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const { masterKey } = useVaultPassphrase();
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDocumentById(id);
        setDoc(data as unknown as DocDetail);
      } catch (error) {
        console.error("[DocDetail] Load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDownload() {
    if (!doc || !masterKey) return;
    setDownloading(true);
    try {
      // 1. Unwrap the document key
      const docKey = await unwrapKey(doc.encryptedKeyBlob, masterKey);

      // 2. Fetch the encrypted blob
      const res = await fetch(`/api/vault/download/${doc.id}`);
      if (!res.ok) throw new Error("Download failed");
      const encryptedBuffer = await res.arrayBuffer();

      // 3. Extract IV (first 12 bytes) and ciphertext
      const combined = new Uint8Array(encryptedBuffer);
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);

      // 4. Decrypt
      const plaintext = await decryptDocument(ciphertext.buffer, iv, docKey);

      // 5. Create download link
      const blob = new Blob([plaintext], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[DocDetail] Download error:", error);
      alert("Failed to decrypt document. Check your passphrase.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (!doc) return;
    if (!confirm(`Delete "${doc.label}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteDocument(doc.id);
      router.push("/vault");
    } catch (error) {
      console.error("[DocDetail] Delete error:", error);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Shield className="mr-2 h-5 w-5 animate-pulse" />
        {t.common.loading}
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="py-20 text-center text-slate-400">
        Document not found.
      </div>
    );
  }

  const typeIcons: Record<string, string> = {
    PASSPORT: "🛂",
    VISA: "📋",
    INSURANCE: "🛡️",
    VACCINATION: "💉",
    OTHER: "📄",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/vault" className="rounded-lg p-2 text-slate-400 hover:bg-background-card">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">
            {typeIcons[doc.documentType]} {doc.label}
          </h1>
          <p className="text-sm text-slate-500">
            {(t.vault.documentTypes as Record<string, string>)[doc.documentType]}
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border bg-background-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">File</p>
            <p className="flex items-center gap-1 text-sm text-white">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              {doc.fileName}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Size</p>
            <p className="text-sm text-white">
              {(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {doc.expiryDate && (
            <div>
              <p className="text-xs text-slate-500">{t.upload.expiryDate}</p>
              <p className="flex items-center gap-1 text-sm text-white">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {new Date(doc.expiryDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {doc.familyMember && (
            <div>
              <p className="text-xs text-slate-500">{t.upload.assignTo}</p>
              <p className="flex items-center gap-1 text-sm text-white">
                <User className="h-3.5 w-3.5 text-slate-500" />
                {doc.familyMember.name}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500">Uploaded</p>
            <p className="text-sm text-white">
              {new Date(doc.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Encryption badge */}
        <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 p-2 text-xs text-accent">
          <Shield className="h-3.5 w-3.5" />
          End-to-end encrypted (AES-256-GCM)
        </div>
      </div>

      {/* Active shares */}
      {doc.shares.length > 0 && (
        <div className="rounded-xl border border-border bg-background-card p-5">
          <h3 className="mb-3 text-sm font-medium text-white flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            Shared with
          </h3>
          <div className="space-y-2">
            {doc.shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{share.sharedTo.name || share.sharedTo.email}</span>
                <span className="text-xs text-slate-500">{share.accessLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders */}
      {doc.reminders.length > 0 && (
        <div className="rounded-xl border border-border bg-background-card p-5">
          <h3 className="mb-3 text-sm font-medium text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-warning" />
            {t.reminders.title}
          </h3>
          <div className="space-y-2">
            {doc.reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  {r.daysBefore} {t.reminders.daysBefore}
                </span>
                <span className="text-xs text-slate-500">
                  {r.sentAt ? "Sent" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? t.common.loading : t.common.download}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center gap-2 rounded-lg border border-danger/30 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {t.common.delete}
        </button>
      </div>
    </motion.div>
  );
}

export default function DocumentPage() {
  return (
    <VaultPassphraseGate>
      <DocumentDetail />
    </VaultPassphraseGate>
  );
}
