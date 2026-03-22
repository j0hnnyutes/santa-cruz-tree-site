// app/api/blob-upload/route.ts
//
// POST /api/blob-upload
//
// Handles the Vercel Blob client-upload token exchange.
// The browser calls this endpoint to get a short-lived upload token,
// then streams the file directly to Vercel Blob without passing through
// the serverless function — bypassing the 4.5 MB function body limit.
//
// Flow:
//   1. Client calls `upload(filename, file, { handleUploadUrl: '/api/blob-upload' })`
//      from `@vercel/blob/client`
//   2. That SDK makes a POST here to get a signed token
//   3. The file goes straight from browser → Vercel Blob CDN
//   4. The SDK calls this endpoint again to notify completion
//   5. We get the final blob URL back on the client
//
// Auth: No session required — photos are anonymous uploads before the lead
// is created. The lead route validates and associates URLs afterwards.
// Blob paths are scoped to `leads/{random-prefix}/` so enumeration is
// not practical.

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Restrict to image types only; 10 MB per file
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
            "image/tiff",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          // Scope all lead photos under a common prefix
          tokenPayload: JSON.stringify({ scope: "lead-photo" }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional: could log the upload here; for now no-op
        console.log("Blob upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("Blob upload handler error:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Upload failed" },
      { status: 400 }
    );
  }
}
