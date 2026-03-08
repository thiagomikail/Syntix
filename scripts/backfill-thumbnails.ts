import { PrismaClient } from "@prisma/client";
import { generateIdeaThumbnail } from "../app/actions/generate-image";

const prisma = new PrismaClient();

async function backfill() {
    const ideas = await prisma.idea.findMany({
        where: {
            OR: [
                { thumbnailUrl: null },
                { thumbnailUrl: "" },
            ]
        }
    });

    console.log(`Found ${ideas.length} ideas needing thumbnails.`);

    for (const idea of ideas) {
        console.log(`Processing idea: ${idea.id} - ${idea.title}`);
        await generateIdeaThumbnail(idea.id, idea.title || idea.rawText?.substring(0, 50) || "Untitled Concept");
        console.log(`✔ Generated for ${idea.id}`);
    }

    console.log("Done backfilling!");
}

backfill()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
