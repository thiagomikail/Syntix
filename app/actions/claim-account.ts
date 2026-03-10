"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function claimGuestAccount(newCallsign: string) {
    if (!newCallsign || newCallsign.trim().length === 0) {
        return { error: "Callsign is required" };
    }

    const RESERVED = ["admin", "root", "support", "syntix", "moderator", "staff"];
    const validCallsign = /^[a-zA-Z0-9_]{3,20}$/.test(newCallsign.trim());
    if (!validCallsign || RESERVED.includes(newCallsign.trim().toLowerCase())) {
        return { error: "Callsign must be 3–20 alphanumeric characters (letters, numbers, underscores)." };
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
            // Callsign already taken by a different account — reject to prevent idea injection.
            return { error: "This callsign is already taken. Please choose a different one." };
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
