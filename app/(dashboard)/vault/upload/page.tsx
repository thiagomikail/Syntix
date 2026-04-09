"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/vault/LanguageContext";
import { useVaultPassphrase } from "@/components/vault/VaultPassphraseContext";
import { VaultPassphraseGate } from "@/components/vault/VaultPassphraseGate";
import {
  generateDocumentKey,
  encryptDocument,
  wrapKey,
  encryptMetadata,
} from "@/lib/vault-crypto";
import { createDocument } from "@/app/actions/vault/documents";

const DOC_TYPES = ["PASSPORT", "VISA", "INSURANCE", "VACCINATION", "OTHER"] as const;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function UploadForm() {
  const { t } = useLanguage();
  const { masterKey } = useVaultPassphrase();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("PASSPORT");
  const [label, setLabel] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [step, setStep] = useState<"form" | "encrypting" | "uploading" | "done" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");

  function handleFileSelect(f: File) {
    if (f.size > MAX_FILE_SIZE) {
      setErrorMsg(t.upload.maxSize);
      return;
    }
    setFile(f);
    setErrorMsg("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !masterKey || !label.trim()) return;

    try {
      setStep("encrypting");

      // 1. Generate per-document key
      const docKey = await generateDocumentKey();

      // 2. Encrypt the file
      const fileBuffer = await file.arrayBuffer();
      const { ciphertext, iv } = await encryptDocument(fileBuffer, docKey);

      // 3. Wrap doc key with master key
      const encryptedKeyBlob = await wrapKey(docKey, masterKey);

      // 4. Encrypt metadata
      const metadata = JSON.stringify({
        expiryDate: expiryDate || null,
        originalName: file.name,
        originalType: file.type,
      });
      const metadataEncrypted = await encryptMetadata(metadata, docKey);

      setStep("uploading");

      // 5. Combine iv + ciphertext for upload
      const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(ciphertext), iv.byteLength);

      // 6. Upload encrypted blob to server
      const tempId = crypto.randomUUID();
      const formData = new FormData();
      formData.append("file", new Blob([combined]), `${tempId}.enc`);
      formData.append("documentId", tempId);

      const uploadRes = await fetch("/api/vault/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }

      const { storagePath } = await uploadRes.json();

      // 7. Create document record in DB
      await createDocument({
        documentType,
        label: label.trim(),
        fileName: file.name,
        storagePath,
        encryptedKeyBlob,
        metadataEncrypted,
        expiryDate: expiryDate || undefined,
        fileSizeBytes: file.size,
        mimeType: file.type,
      });

      setStep("done");
      setTimeout(() => router.push("/vault"), 1500);
    } catch (error: unknown) {
      console.error("[Upload] Error:", error);
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMsg(msg === "TIER_LIMIT_REACHED" ? t.tiers.limitReached : msg);
      setStep("error");
    }
  }

  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <CheckCircle className="mb-4 h-16 w-16 text-accent" />
        <h2 className="text-xl font-semibold text-white">{t.upload.success}</h2>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/vault" className="rounded-lg p-2 text-slate-400 hover:bg-background-card">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-white">{t.upload.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12 transition-colors hover:border-primary/40"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
          {file ? (
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">{t.upload.selectFile}</p>
              <p className="text-xs text-slate-600">{t.upload.dragDrop}</p>
              <p className="mt-1 text-[10px] text-slate-600">{t.upload.maxSize}</p>
            </>
          )}
        </div>

        {/* Document type */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">{t.upload.documentType}</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {DOC_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDocumentType(type)}
                className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                  documentType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background-surface text-slate-400 hover:border-primary/30"
                }`}
              >
                {(t.vault.documentTypes as Record<string, string>)[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">{t.upload.label}</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t.upload.labelPlaceholder}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
            required
          />
        </div>

        {/* Expiry date */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">{t.upload.expiryDate}</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || !label.trim() || step === "encrypting" || step === "uploading"}
          className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {step === "encrypting"
            ? t.upload.encrypting
            : step === "uploading"
              ? t.upload.uploading
              : t.vault.uploadDocument}
        </button>
      </form>
    </div>
  );
}

export default function UploadPage() {
  return (
    <VaultPassphraseGate>
      <UploadForm />
    </VaultPassphraseGate>
  );
}
