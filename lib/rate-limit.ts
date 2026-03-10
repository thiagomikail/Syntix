// Simple in-memory rate limiter. Resets on server restart.
// For multi-instance production, replace with Redis-backed solution.

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Throws if the user has exceeded the rate limit for the given action.
 * @param userId  - The authenticated user's ID
 * @param action  - A label for the action being limited (e.g. "chat", "analyze")
 * @param limit   - Max requests allowed in the window (default: 10)
 * @param windowMs - Window size in milliseconds (default: 60s)
 */
export function checkRateLimit(userId: string, action: string, limit = 10, windowMs = 60_000): void {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return;
    }

    if (entry.count >= limit) {
        throw new Error("Rate limit exceeded. Please wait before trying again.");
    }

    entry.count++;
}
