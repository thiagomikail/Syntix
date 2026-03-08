import { prisma } from "@/lib/prisma";
import UserTableClient from "./UserTableClient";

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">User Management</h1>
                <p className="text-slate-400">Manage roles, set callsigns, and maintain platform access.</p>
            </div>
            <UserTableClient initialUsers={users} />
        </div>
    );
}
