import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateIdeaThumbnail } from "@/app/actions/generate-image";

export async function GET(request: Request) {
    try {
        const ideas = await prisma.idea.findMany({
            where: {
                OR: [
                    { thumbnailUrl: null },
                    { thumbnailUrl: "" },
                    { thumbnailUrl: { not: { startsWith: "data:image/svg" } } } // Overwrite any older broken base64 images that didn't save properly
                ]
            }
        });

        console.log(`[Backfill] Found ${ideas.length} ideas needing thumbnails.`);

        for (const idea of ideas) {
            console.log(`[Backfill] Processing idea: ${idea.id} - ${idea.title}`);
            await generateIdeaThumbnail(idea.id, idea.title || idea.rawText?.substring(0, 50) || "Untitled Concept");
            console.log(`[Backfill] ✔ Generated for ${idea.id}`);
        }

        return NextResponse.json({ success: true, message: `Backfilled ${ideas.length} ideas` });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
