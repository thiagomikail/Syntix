import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const doc = await prisma.vaultDocument.findUnique({
    where: { id },
    select: { ownerId: true, storagePath: true, fileName: true },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check ownership or active share
  if (doc.ownerId !== session.user.id) {
    const share = await prisma.vaultDocumentShare.findFirst({
      where: {
        documentId: id,
        sharedToUserId: session.user.id,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  // Download encrypted blob from Supabase
  const { data, error } = await getSupabaseAdmin().storage
    .from("vault-documents")
    .download(doc.storagePath);

  if (error || !data) {
    console.error("[Download] Supabase error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }

  // Log access
  await prisma.vaultAuditLog.create({
    data: {
      userId: session.user.id,
      action: "DOWNLOAD",
      resource: "document",
      resourceId: id,
    },
  });

  const arrayBuffer = await data.arrayBuffer();
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.fileName}.enc"`,
    },
  });
}
