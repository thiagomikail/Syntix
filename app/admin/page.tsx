import { prisma } from "@/lib/prisma";
import { Users, Lightbulb, TrendingUp, Activity } from "lucide-react";

export default async function AdminDashboardOverview() {
    // Fetch metrics
    const totalUsers = await prisma.user.count();
    const totalIdeas = await prisma.idea.count();

    const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true }
    });

    const recentIdeas = await prisma.idea.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, createdAt: true, user: { select: { name: true } } }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Admin Overview</h1>
                <p className="text-slate-400">Platform metrics and recent activity.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1A1A1A] border border-primary/10 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="size-16 text-fuchsia-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-fuchsia-500/10 rounded-lg text-fuchsia-500"><Users className="size-5" /></div>
                        <h3 className="font-bold text-slate-300">Total Users</h3>
                    </div>
                    <p className="text-4xl font-black text-white">{totalUsers}</p>
                </div>

                <div className="bg-[#1A1A1A] border border-primary/10 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Lightbulb className="size-16 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Lightbulb className="size-5" /></div>
                        <h3 className="font-bold text-slate-300">Total Ideas</h3>
                    </div>
                    <p className="text-4xl font-black text-white">{totalIdeas}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-[#1A1A1A] border border-primary/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="size-5 text-fuchsia-500" />
                        Recent Registrations
                    </h3>
                    <div className="space-y-4">
                        {recentUsers.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
                                <div>
                                    <p className="font-medium text-slate-200">{user.name || "Anonymous"}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                                <span className="text-xs text-slate-400">{user.createdAt.toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Ideas */}
                <div className="bg-[#1A1A1A] border border-primary/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="size-5 text-amber-500" />
                        Recent Ideas
                    </h3>
                    <div className="space-y-4">
                        {recentIdeas.map(idea => (
                            <div key={idea.id} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
                                <div>
                                    <p className="font-medium text-slate-200">{idea.title || "Untitled"}</p>
                                    <p className="text-xs text-slate-500">by {idea.user.name || "Unknown"}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 capitalize">
                                        {idea.status}
                                    </span>
                                    <span className="text-xs text-slate-400">{idea.createdAt.toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
