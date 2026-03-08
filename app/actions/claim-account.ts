"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function claimGuestAccount(newCallsign: string) {
    if (!newCallsign || newCallsign.trim().length === 0) {
        return { error: "Callsign is required" };
    }

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return { error: "Not logged in" };
        }

        // Verify if it's actually a guest account
        if (!session.user.name?.startsWith("Guest-") && (session.user as any).role !== "GUEST") {
            // Maybe they just want to change their username? We can allow it.
        }

        const email = `${newCallsign.trim()}@syntix.local`;

        // Check if the target email/callsign already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser && existingUser.id !== session.user.id) {
            // If a real account already exists, we need to migrate the ideas to it!
            await prisma.idea.updateMany({
                where: { userId: session.user.id },
                data: { userId: existingUser.id }
            });

            // We can optionally delete the guest account, but returning a flag to force sign-out
            // so the user can sign in with their real account to see the migrated ideas.
            return { success: true, requiresRelogin: true, message: "Ideas migrated! Please sign in with your real account." };
        }

        // If target account doesn't exist, we just rename the current Guest account
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: newCallsign.trim(),
                email: email,
                role: "USER"
            }
        });

        return { success: true, requiresRelogin: true, message: "Account claimed! Please sign back in with your new callsign." };

    } catch (error: any) {
        console.error("Claim account error:", error);
        return { error: "Failed to claim account." };
    }
}
