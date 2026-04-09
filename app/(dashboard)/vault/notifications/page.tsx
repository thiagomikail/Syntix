"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useLanguage } from "@/components/vault/LanguageContext";
import { getNotifications, markAsRead, markAllRead } from "@/app/actions/vault/notifications";
import Link from "next/link";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getNotifications(50);
    setNotifications(data);
    setLoading(false);
  }

  useEffect(() => {
    getNotifications(50).then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  async function handleMarkAllRead() {
    await markAllRead();
    await load();
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    await load();
  }

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">{t.common.loading}</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> {t.nav.notifications}
        </h1>
        {notifications.some((n) => !n.readAt) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-background-card"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Bell className="mb-3 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors ${
                n.readAt
                  ? "border-border/50 bg-background-card/50"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">{n.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{n.body}</p>
                  <p className="mt-2 text-[10px] text-slate-600">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {n.refId && n.refType === "document" && (
                    <Link
                      href={`/vault/document/${n.refId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </Link>
                  )}
                  {!n.readAt && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-slate-500 hover:text-accent"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
