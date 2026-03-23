import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/logError";

export async function POST(request: Request) {
  try {
    // Rate limit: 100 per minute per IP
    const rl = await rateLimit(request, {
      max: 100,
      windowMs: 60_000,
      keyPrefix: "log:error:",
    });
    if (!rl.ok) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { severity, type, message, stack, path, metadata } = body;

    // Validate severity to a known value; default client errors to "high" so
    // critical JS crashes (unhandled rejections, etc.) trigger alert emails.
    const safeSeverity = (["critical", "high", "medium", "low"] as const).includes(
      severity as "critical" | "high" | "medium" | "low",
    )
      ? (severity as "critical" | "high" | "medium" | "low")
      : "high";

    const safeMeta =
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : undefined;

    // Route through logError() so critical/high client errors trigger alert emails
    logError(request, {
      severity: safeSeverity,
      type:     typeof type    === "string" ? type    : "client_error",
      message:  typeof message === "string" ? message : "Unknown client error",
      stack:    typeof stack   === "string" ? stack   : undefined,
      path:     typeof path    === "string" ? path    : undefined,
      metadata: safeMeta,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    // Never return 500 — client error logging must not break the page
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
