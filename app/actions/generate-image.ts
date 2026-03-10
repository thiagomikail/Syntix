"use server";

import { prisma } from "@/lib/prisma";
import { requireOwnership } from "@/lib/auth-guards";

// Internal version — no ownership check. Used by server-side callers (ideation, backfill routes)
// that already have their own auth guards.
export async function generateIdeaThumbnailInternal(ideaId: string, prompt: string): Promise<string | null> {
    if (!prompt) return null;

    try {
        console.log(`[Image Gen] Generating with Pollinations for idea ${ideaId} with prompt: ${prompt.substring(0, 50)}...`);

        const cleanPrompt = prompt.replace(/[\r\n]+/g, ' ').replace(/"/g, '').substring(0, 180).trim();

        const seed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;

        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

        if (!response.ok) {
            throw new Error(`API Error ${response.status}: Failed to fetch image`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        await prisma.idea.update({
            where: { id: ideaId },
            data: { thumbnailUrl: dataUrl }
        });

        return dataUrl;
    } catch (error: any) {
        console.error("[Image Gen] Failed to generate thumbnail:", error.message);

        const safePrompt = encodeURIComponent(prompt.replace(/[<>&"']/g, ' ').substring(0, 60));
        const svg = `
<svg width="1024" height="576" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0A0A" />
      <stop offset="50%" stop-color="#141414" />
      <stop offset="100%" stop-color="#050505" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#A855F7" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <circle cx="50%" cy="50%" r="200" fill="url(#accent)" filter="url(#glow)" opacity="0.3" />
  <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="48" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">SYNTIX CONCEPT</text>
</svg>`.trim();
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

        try {
            await prisma.idea.update({
                where: { id: ideaId },
                data: { thumbnailUrl: dataUrl }
            });
        } catch (dbError) {
            console.error("Failed to save fallback thumbnail:", dbError);
        }

        return dataUrl;
    }
}

// Public-facing server action — requires the caller to own the idea.
export async function generateIdeaThumbnail(ideaId: string, prompt: string): Promise<string | null> {
    await requireOwnership(ideaId);
    return generateIdeaThumbnailInternal(ideaId, prompt);
}
