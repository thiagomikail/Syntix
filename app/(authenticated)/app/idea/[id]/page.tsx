import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { WorkspaceClient } from "./WorkspaceClient";

export default async function IdeaWorkspacePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const autoIgnite = typeof resolvedSearchParams.autoIgnite === 'string' ? resolvedSearchParams.autoIgnite : undefined;

    if (!session?.user?.id) {
        redirect("/");
    }

    const idea = await prisma.idea.findUnique({
        where: { id: resolvedParams.id }
    });

    if (!idea) {
        redirect("/app");
    }

    if (idea.userId !== session.user.id) {
        redirect("/app");
    }

    return (
        <div className="h-full w-full">
            <WorkspaceClient idea={idea as any} user={session.user.name || "Builder"} autoIgnite={autoIgnite} />
        </div>
    );
}
