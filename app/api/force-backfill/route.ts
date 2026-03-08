import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateIdeaThumbnail } from "@/app/actions/generate-image";

export async function GET(request: Request) {
    try {
        const ideas = await prisma.idea.findMany({ select: { id: true, title: true, rawText: true, thumbnailUrl: true } });
        console.log(`Regenerating ${ideas.length} thumbnails with real AI...`);
        let count = 0;

        for (const idea of ideas) {
            // Skip ideas that already successfully got a real image (not the SVG fallback)
            if (idea.thumbnailUrl && !idea.thumbnailUrl.includes('SYNTIX CONCEPT') && !idea.thumbnailUrl.includes('image/svg')) {
                continue;
            }

            // rawText often contains the full JSON with the imagePrompt hidden inside, but Pollinations works great with just a title and description.
            const prompt = idea.title || idea.rawText ? `${idea.title} - ${idea.rawText.substring(0, 150)}` : "A generic abstract tech background";
            try {
                await generateIdeaThumbnail(idea.id, prompt);
                console.log(`✅ Generated image for ${idea.id}`);
                count++;
                // Wait 2 seconds to avoid Pollinations 429 Too Many Requests IP ban
                await new Promise(r => setTimeout(r, 2000));
            } catch (e: any) {
                console.log(`❌ Failed for ${idea.id}:`, e.message);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        return NextResponse.json({ success: true, total: ideas.length, generated: count });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
