import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Rate limit: 100 per minute
    const rl = await rateLimit(request, {
      max: 100,
      windowMs: 60_000,
      keyPrefix: "log:error:",
    });

    if (!rl.ok) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { severity, type, message, stack, path, metadata } = body;

    // Safely serialise any client-supplied metadata
    let metadataStr: string | null = null;
    if (metadata !== undefined && metadata !== null) {
      try {
        metadataStr = JSON.stringify(metadata);
      } catch {
        metadataStr = null;
      }
    }

    // Write to database (fire-and-forget)
    (prisma as any).errorLog
      .create({
        data: {
          severity: severity || "error",
          type: type || "client_error",
          message: message || "Unknown error",
          stack: stack || null,
          path: path || null,
          ip: getClientIp(request),
          userAgent: request.headers.get("user-agent"),
          metadata: metadataStr,
        },
      })
      .catch((err: unknown) => console.error("Failed to log error:", err));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    // Never return 500 — catch all errors silently
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

function getClientIp(req: Request): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();

  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();

  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  return "unknown";
}
