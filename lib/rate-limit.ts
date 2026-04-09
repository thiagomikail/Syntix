import { prisma } from "@/lib/prisma";

// In-memory fallback for demo stability (e.g. if DB table is missing)
const memoryCache = new Map<string, { count: number, resetAt: Date }>();

/**
 * Throws if the user has exceeded the rate limit for the given action.
 * @param userId  - The authenticated user's ID
 * @param action  - A label for the action being limited (e.g. "chat", "analyze")
 * @param limit   - Max requests allowed in the window (default: 10)
 * @param windowMs - Window size in milliseconds (default: 60s)
 */
export async function checkRateLimit(userId: string, action: string, limit = 10, windowMs = 60_000): Promise<void> {
    const key = `${userId}:${action}`;
    const now = new Date();
    
    try {
        const entry = await prisma.rateLimit.findUnique({ where: { key } });
        
        if (!entry || now > entry.resetAt) {
            await prisma.rateLimit.upsert({
                where: { key },
                update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
                create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
            });
            return;
        }
        
        if (entry.count >= limit) {
            throw new Error("Rate limit exceeded. Please wait before trying again.");
        }
        
        await prisma.rateLimit.update({
            where: { key },
            data: { count: { increment: 1 } },
        });
    } catch (error: unknown) {
        // Log the error but fallback to in-memory to prevent 500 crashes during demo
        console.warn("[RateLimit] Database error, falling back to memory:", error instanceof Error ? error.message : error);
        
        const memEntry = memoryCache.get(key);
        if (!memEntry || now > memEntry.resetAt) {
            memoryCache.set(key, { count: 1, resetAt: new Date(now.getTime() + windowMs) });
            return;
        }
        
        if (memEntry.count >= limit) {
            throw new Error("Rate limit exceeded (Memory). Please wait.");
        }
        
        memEntry.count += 1;
    }
}
