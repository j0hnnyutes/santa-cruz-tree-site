import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logError";

/**
 * Bot user-agent patterns to silently drop — never written to the DB.
 * Uses lowercase substring matching so a single entry covers many variants
 * (e.g. "googlebot" also catches "Googlebot/2.1", "APIs-Google", etc.).
 *
 * SEO crawlers (Googlebot, Bingbot, etc.) are deliberately included here
 * because they almost never execute JavaScript, so they can't reach this
 * endpoint in the first place. If they somehow do, we still don't want
 * them inflating session counts. Their ability to crawl the actual HTML
 * pages is completely unaffected.
 */
const BOT_UA_PATTERNS = [
  // Search engine crawlers
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "sogou", "exabot", "facebot", "ia_archiver",
  "semrushbot", "ahrefsbot", "mj12bot", "dotbot", "rogerbot",
  "screaming frog", "seokicks", "sistrix", "seobilitybot",
  // Generic bot / spider / crawler signals
  "bot", "crawl", "spider", "scrape", "slurp",
  // HTTP clients / automation tools
  "python-requests", "python-urllib", "go-http-client", "java/",
  "curl/", "wget/", "libwww", "lwp-", "okhttp", "axios/",
  "node-fetch", "got/", "undici", "httpclient", "apache-httpclient",
  // Monitoring / uptime tools
  "pingdom", "uptimerobot", "statuscake", "datadog", "newrelic",
  "site24x7", "freshping", "hetrixtools",
  // Headless / test browsers (non-user traffic)
  "headlesschrome", "phantomjs", "slimerjs",
];

function isBot(ua: string): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((p) => lower.includes(p));
}

export async function POST(request: Request) {
  try {
    // Drop known bots before anything else — no DB write, no rate-limit slot used
    const ua = request.headers.get("user-agent") ?? "";
    if (isBot(ua)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Rate limit: 100 per minute
    const rl = await rateLimit(request, {
      max: 100,
      windowMs: 60_000,
      keyPrefix: "log:pageview:",
    });

    if (!rl.ok) {
      logError(request, {
        severity: "low",
        type: "rate_limit",
        message: "Rate limit hit on /api/log/pageview",
        path: "/api/log/pageview",
      });
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

    // Write to database using raw SQL to avoid any Prisma client schema-sync issues.
    // prisma.$executeRaw sends parameterized SQL directly — bypasses ORM validation.
    const resolvedPath = path || "/";
    const resolvedReferrer = referrer || null;
    const resolvedSessionId = sessionId || "";
    const resolvedDuration = typeof duration === "number" ? duration : null;
    const resolvedUtmSource   = utmSource   || null;
    const resolvedUtmMedium   = utmMedium   || null;
    const resolvedUtmCampaign = utmCampaign || null;

    prisma.$executeRaw`
      INSERT INTO "PageView"
        ("path","referrer","sessionId","duration","userAgent",
         "utmSource","utmMedium","utmCampaign",
         "country","region","city","createdAt")
      VALUES
        (${resolvedPath}, ${resolvedReferrer}, ${resolvedSessionId},
         ${resolvedDuration}, ${ua},
         ${resolvedUtmSource}, ${resolvedUtmMedium}, ${resolvedUtmCampaign},
         ${country}, ${region}, ${city},
         NOW())
    `
      .catch((err: unknown) => {
        console.error("Failed to log pageview:", err);
        logError(null, {
          severity: "medium",
          type: "server_api",
          message: `Pageview DB write failed: ${err instanceof Error ? err.message : String(err)}`,
          path: "/api/log/pageview",
        });
      });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    // Never return 500 — catch all errors silently
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
