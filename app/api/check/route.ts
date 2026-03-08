import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const ideas = await prisma.idea.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, title: true, thumbnailUrl: true }
        });

        const noThumb = ideas.filter(i => !i.thumbnailUrl).length;

        return NextResponse.json({
            success: true,
            total: ideas.length,
            noThumb: noThumb,
            ideas: ideas.map(i => ({ id: i.id, title: i.title, hasThumb: !!i.thumbnailUrl }))
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
