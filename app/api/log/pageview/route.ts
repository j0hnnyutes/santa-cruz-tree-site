import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Rate limit: 100 per minute
    const rl = await rateLimit(request, {
      max: 100,
      windowMs: 60_000,
      keyPrefix: "log:pageview:",
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

    const { path, referrer, sessionId, duration } = body;

    // Write to database (fire-and-forget)
    (prisma as any).pageView
      .create({
        data: {
          path: path || "/",
          referrer: referrer || null,
          sessionId: sessionId || "",
          duration: typeof duration === "number" ? duration : null,
          userAgent: request.headers.get("user-agent"),
        },
      })
      .catch((err: unknown) => console.error("Failed to log pageview:", err));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    // Never return 500 — catch all errors silently
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
