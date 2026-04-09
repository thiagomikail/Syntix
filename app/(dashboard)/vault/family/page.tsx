"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, FileText, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";
import { VaultPassphraseGate } from "@/components/vault/VaultPassphraseGate";
import { getFamilyOverview, addFamilyMember, removeFamilyMember } from "@/app/actions/vault/family";

const RELATIONSHIPS = ["SPOUSE", "CHILD", "PARENT", "SIBLING", "OTHER"] as const;

type FamilyData = Awaited<ReturnType<typeof getFamilyOverview>>;

function getExpiryStatus(date: Date | null) {
  if (!date) return "none";
  const days = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "expired";
  if (days < 30) return "danger";
  if (days < 90) return "warning";
  return "safe";
}

function FamilyContent() {
  const { t } = useLanguage();
  const [data, setData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState<string>("SPOUSE");
  const [error, setError] = useState("");

  async function load() {
    try {
      const d = await getFamilyOverview();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!newName.trim()) return;
    setError("");
    try {
      await addFamilyMember(newName, newRelation);
      setNewName("");
      setShowAdd(false);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "TIER_LIMIT_REACHED" ? t.tiers.limitReached : msg);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remove this family member?")) return;
    await removeFamilyMember(memberId);
    await load();
  }

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">{t.common.loading}</div>;

  const members = data?.group?.members || [];
  const ownDocs = data?.ownDocuments || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> {t.family.title}
        </h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> {t.family.addMember}
        </button>
      </div>

      {/* Add member form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border border-border bg-background-card p-4 space-y-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.family.memberName}
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r}
                onClick={() => setNewRelation(r)}
                className={`rounded-lg border px-3 py-1.5 text-xs ${
                  newRelation === r ? "border-primary bg-primary/10 text-primary" : "border-border text-slate-400"
                }`}
              >
                {(t.family.relationships as Record<string, string>)[r]}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark">
              {t.common.save}
            </button>
            <button onClick={() => setShowAdd(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-slate-400 hover:bg-background-surface">
              {t.common.cancel}
            </button>
          </div>
        </motion.div>
      )}

      {/* My own documents */}
      <div className="rounded-xl border border-border bg-background-card p-5">
        <h3 className="mb-3 text-sm font-medium text-white">Me ({ownDocs.length} {t.family.documentsCount})</h3>
        {ownDocs.length === 0 ? (
          <p className="text-sm text-slate-500">{t.vault.noDocuments}</p>
        ) : (
          <div className="space-y-2">
            {ownDocs.map((doc) => {
              const status = getExpiryStatus(doc.expiryDate);
              return (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
                  <span className="text-slate-300">{doc.label}</span>
                  {doc.expiryDate && (
                    <span className={`text-xs ${status === "safe" ? "text-accent" : status === "expired" ? "text-danger" : "text-warning"}`}>
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Family members */}
      {members.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Users className="mb-3 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">{t.family.noMembers}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {members.map((member) => {
            const nearestExpiry = member.documents.find((d) => d.expiryDate);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-background-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{member.name}</h3>
                    <p className="text-xs text-slate-500">{(t.family.relationships as Record<string, string>)[member.relationship]}</p>
                  </div>
                  <button onClick={() => handleRemove(member.id)} className="text-slate-600 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {member.documents.length} {t.family.documentsCount}
                  </span>
                  {nearestExpiry?.expiryDate && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {t.family.nextExpiry}: {new Date(nearestExpiry.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FamilyPage() {
  return (
    <VaultPassphraseGate>
      <FamilyContent />
    </VaultPassphraseGate>
  );
}
