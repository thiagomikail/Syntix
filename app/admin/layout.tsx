import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Users, Lightbulb, LayoutDashboard, ChevronLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background-dark flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-r border-primary/10 bg-[#111] flex flex-col p-4 gap-2 min-h-[auto] md:min-h-screen shrink-0 overflow-y-auto">
                <div className="mb-8 flex items-center justify-between mt-4">
                    <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-fuchsia-500">admin_panel_settings</span>
                        Admin
                    </h2>
                    <Link href="/app" className="text-slate-400 hover:text-primary transition-colors tooltip tooltip-bottom" data-tip="Back to App">
                        <ChevronLeft className="size-5" />
                    </Link>
                </div>

                <nav className="flex flex-col gap-1">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-primary/10 hover:text-primary transition-all">
                        <LayoutDashboard className="size-4" />
                        Overview
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-fuchsia-500/10 hover:text-fuchsia-500 transition-all">
                        <Users className="size-4" />
                        Users
                    </Link>
                    <Link href="/admin/ideas" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-amber-500/10 hover:text-amber-500 transition-all">
                        <Lightbulb className="size-4" />
                        Ideas
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-grid-white/[0.02]">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
