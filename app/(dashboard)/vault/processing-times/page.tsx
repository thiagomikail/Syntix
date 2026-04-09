"use client";

import { useEffect, useState } from "react";
import { Clock, Search } from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";
import { getProcessingTimes } from "@/app/actions/vault/agent";

type ProcessingTime = {
  id: string;
  documentType: string;
  country: string;
  consulateCity: string | null;
  processingDays: number;
  source: string;
  reportedAt: Date;
};

export default function ProcessingTimesPage() {
  const { t } = useLanguage();
  const [times, setTimes] = useState<ProcessingTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getProcessingTimes()
      .then((data) => setTimes(data as ProcessingTime[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = times.filter(
    (pt) =>
      pt.country.toLowerCase().includes(search.toLowerCase()) ||
      (pt.consulateCity?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> {t.processing.title}
        </h1>
        <p className="text-sm text-slate-400">{t.processing.subtitle}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t.common.search}...`}
          className="w-full rounded-lg border border-border bg-background-surface py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Clock className="mb-3 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">{t.processing.noData}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-card text-left text-xs text-slate-500">
                <th className="px-4 py-3">{t.processing.documentType}</th>
                <th className="px-4 py-3">{t.processing.country}</th>
                <th className="px-4 py-3">{t.processing.city}</th>
                <th className="px-4 py-3 text-right">{t.processing.days}</th>
                <th className="px-4 py-3">{t.processing.source}</th>
                <th className="px-4 py-3">Reported</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pt) => (
                <tr key={pt.id} className="border-b border-border/50 hover:bg-background-card/50">
                  <td className="px-4 py-3 text-white">
                    {(t.vault.documentTypes as Record<string, string>)[pt.documentType] || pt.documentType}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{pt.country}</td>
                  <td className="px-4 py-3 text-slate-400">{pt.consulateCity || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-primary">
                    {pt.processingDays} {t.processing.days}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {(t.processing.sources as Record<string, string>)[pt.source] || pt.source}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(pt.reportedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
