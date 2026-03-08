"use server";

import { prisma } from "@/lib/prisma";

export async function generateIdeaThumbnail(ideaId: string, prompt: string): Promise<string | null> {
    if (!prompt) return null;

    try {
        console.log(`[Image Gen] Generating with Pollinations for idea ${ideaId} with prompt: ${prompt.substring(0, 50)}...`);

        // Aggressively sanitize the prompt for URL safety and API limits
        const cleanPrompt = prompt.replace(/[\r\n]+/g, ' ').replace(/"/g, '').substring(0, 180).trim();

        // Use Pollinations for free, keyless image generation
        const seed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=800&height=500&nologo=true&seed=${seed}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error ${response.status}: Failed to fetch image`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        // Save to database
        await prisma.idea.update({
            where: { id: ideaId },
            data: { thumbnailUrl: dataUrl }
        });

        return dataUrl;
    } catch (error: any) {
        console.error("[Image Gen] Failed to generate thumbnail:", error.message);

        // Generate a beautiful fallback dynamic SVG
        const safePrompt = prompt.replace(/[<&>]/g, ' ').substring(0, 60);
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
  <text x="50%" y="45%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="48" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">SYNTIX CONCEPT</text>
  <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="20" fill="#94A3B8" text-anchor="middle" dominant-baseline="middle" opacity="0.8">${safePrompt}...</text>
</svg>`.trim();
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

        // Save fallback to database
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
