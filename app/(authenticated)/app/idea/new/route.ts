import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Prevent static caching of this route

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Check if user still exists in DB (fixes stale session issues)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            // User was deleted/DB reset, session is invalid
            return NextResponse.redirect(new URL("/api/auth/signout", req.url));
        }

        const idea = await prisma.idea.create({
            data: {
                userId: session.user.id,
                rawText: "",
                status: "ideation",
            }
        });

        const { searchParams } = new URL(req.url);
        const ideaText = searchParams.get("ideaText");

        const redirectUrl = new URL(`/app/idea/${idea.id}`, req.url);
        if (ideaText) {
            redirectUrl.searchParams.set("autoIgnite", ideaText);
        }

        return NextResponse.redirect(redirectUrl);
    } catch (error: any) {
        console.error("ROUTE HANDLER ERROR:", error);
        return new NextResponse(`
            <html><body>
                <h1 style="color:red;">Server Error 500</h1>
                <p>An error occurred in /app/idea/new/route.ts</p>
                <pre style="background: #111; color: #ff5555; padding: 10px; border-radius: 5px;">An internal server error occurred while creating your workspace.</pre>
                <hr />
                <pre style="background: #f4f4f4; padding: 10px; font-size: 12px;">Please try again later or contact support.</pre>
            </body></html>
        `, {
            status: 500,
            headers: { 'content-type': 'text/html' }
        });
    }
}
