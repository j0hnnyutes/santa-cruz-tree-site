import { NextResponse } from "next/server";
import { logError } from "@/lib/logError";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    // Light rate-limit so this can't be abused as a spam vector
    const rl = await rateLimit(request, { max: 60, windowMs: 60_000, keyPrefix: "log:404:" });
    if (!rl.ok) return NextResponse.json({ ok: true }, { status: 200 });

    let body: any = {};
    try { body = await request.json(); } catch {}

    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "unknown";
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;

    logError(request, {
      severity: "low",
      type: "not_found",
      message: `404 — page not found: ${path}`,
      path,
      metadata: { referrer: referrer || "none" },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
