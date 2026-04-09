import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseAdmin } from "@/lib/supabase";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const documentId = formData.get("documentId") as string;

    if (!file || !documentId) {
      return NextResponse.json({ error: "Missing file or documentId" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    // The file is already encrypted client-side — store the opaque blob
    const storagePath = `${session.user.id}/${documentId}/${crypto.randomUUID()}.enc`;
    const arrayBuffer = await file.arrayBuffer();

    const { error } = await getSupabaseAdmin().storage
      .from("vault-documents")
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("[Upload] Supabase error:", error);
      return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
    }

    return NextResponse.json({ storagePath, size: file.size });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
