// app/api/admin/leads/[leadId]/photos/[filename]/route.ts
import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { readFile } from "fs/promises";
import path from "path";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
  webp: "image/webp",
  tif: "image/tiff",
  tiff: "image/tiff",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string; filename: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId, filename } = await params;

  // Sanitize: only allow safe characters, prevent path traversal
  const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeLeadId = leadId.replace(/[^a-zA-Z0-9-]/g, "");

  if (!safeName || !safeLeadId) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "lead-uploads", safeLeadId, safeName);

  try {
    const buffer = await readFile(filePath);
    const ext = safeName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_MAP[ext] ?? "application/octet-stream";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }
}
