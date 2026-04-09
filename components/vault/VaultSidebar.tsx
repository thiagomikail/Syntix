"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import {
  Upload,
  Users,
  Share2,
  Clock,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/vault", icon: LayoutDashboard, labelKey: "vault" as const },
  { href: "/vault/upload", icon: Upload, labelKey: "upload" as const },
  { href: "/vault/family", icon: Users, labelKey: "family" as const },
  { href: "/vault/shared-with-me", icon: Share2, labelKey: "sharedWithMe" as const },
  { href: "/vault/processing-times", icon: Clock, labelKey: "processingTimes" as const },
  { href: "/vault/settings", icon: Settings, labelKey: "settings" as const },
];

export function VaultSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-background-dark lg:block">
      <div className="flex flex-col gap-1 p-3">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || (href !== "/vault" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-slate-400 hover:bg-background-card hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.nav[labelKey]}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
