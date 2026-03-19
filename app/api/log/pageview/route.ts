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

    const { path, referrer, sessionId, duration, utmSource, utmMedium, utmCampaign } = body;

    // Geolocation from Vercel edge headers (available on all Vercel plans, null in local dev)
    const country = request.headers.get("x-vercel-ip-country") || null;
    const region  = request.headers.get("x-vercel-ip-country-region") || null;
    const rawCity = request.headers.get("x-vercel-ip-city") || null;
    // City header is URL-encoded (e.g. "San%20Jose")
    const city = rawCity ? decodeURIComponent(rawCity) : null;

    // Write to database (fire-and-forget)
    (prisma as any).pageView
      .create({
        data: {
          path: path || "/",
          referrer: referrer || null,
          sessionId: sessionId || "",
          duration: typeof duration === "number" ? duration : null,
          userAgent: request.headers.get("user-agent"),
          utmSource:   utmSource   || null,
          utmMedium:   utmMedium   || null,
          utmCampaign: utmCampaign || null,
          country,
          region,
          city,
        },
      })
      .catch((err: unknown) => console.error("Failed to log pageview:", err));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    // Never return 500 — catch all errors silently
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
