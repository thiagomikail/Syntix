"use client";

import { useState } from "react";
import { updateUserRole, updateUserCallsign, deleteUser } from "@/app/actions/admin-users";
import { ShieldCheck, ShieldAlert, KeyRound, Trash2, User, Search } from "lucide-react";

type UserData = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
};

export default function UserTableClient({ initialUsers }: { initialUsers: UserData[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const filteredUsers = initialUsers.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function handleRoleChange(userId: string, currentRole: string) {
        if (!confirm(`Are you sure you want to change this user's role to ${currentRole === "ADMIN" ? "USER" : "ADMIN"}?`)) return;
        setIsUpdating(userId);
        const res = await updateUserRole(userId, currentRole === "ADMIN" ? "USER" : "ADMIN");
        if (res.error) alert(res.error);
        setIsUpdating(null);
    }

    async function handleCallsignReset(userId: string, currentName: string | null) {
        const newCallsign = prompt(`Enter new callsign for ${currentName || "this user"}:`);
        if (!newCallsign) return;
        setIsUpdating(userId);
        const res = await updateUserCallsign(userId, newCallsign);
        if (res.error) alert(res.error);
        else alert("Callsign updated successfully, user instances logged out.");
        setIsUpdating(null);
    }

    async function handleDelete(userId: string, currentName: string | null) {
        if (!confirm(`Are you absolutely sure you want to delete ${currentName || "this user"}? This action cannot be undone and cascades to all their data.`)) return;
        setIsUpdating(userId);
        const res = await deleteUser(userId);
        if (res.error) alert(res.error);
        setIsUpdating(null);
    }

    return (
        <div className="bg-[#1A1A1A] border border-primary/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-primary/10 bg-black/40 flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111] border border-primary/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>
                <div className="text-sm text-slate-400 font-medium">
                    {filteredUsers.length} Users
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#111] text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-semibold">User</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Joined</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.name?.[0]?.toUpperCase() || <User className="size-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.name || "Anonymous Guest"}</p>
                                            <p className="text-xs text-slate-500">{user.email || "No Email"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'ADMIN' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                        {user.role === 'ADMIN' ? <ShieldCheck className="size-3.5" /> : <User className="size-3.5" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                        <button
                                            onClick={() => handleRoleChange(user.id, user.role)}
                                            disabled={isUpdating === user.id}
                                            className="p-2 bg-slate-800 hover:bg-fuchsia-500/20 text-slate-400 hover:text-fuchsia-400 rounded-lg transition-colors tooltip tooltip-top"
                                            data-tip="Toggle Role"
                                        >
                                            <ShieldAlert className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleCallsignReset(user.id, user.name)}
                                            disabled={isUpdating === user.id}
                                            className="p-2 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors tooltip tooltip-top"
                                            data-tip="Reset Callsign"
                                        >
                                            <KeyRound className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
                                            disabled={isUpdating === user.id}
                                            className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors tooltip tooltip-top"
                                            data-tip="Delete User"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
