import { NextResponse } from "next/server";
import {
  makeAdminCookieValue,
  getAdminCookieName,
  getAdminCookieOptions,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

function sanitizeNext(nextRaw: string | null) {
  const fallback = "/admin/leads";
  if (!nextRaw) return fallback;
  if (nextRaw.includes("://")) return fallback;
  if (!nextRaw.startsWith("/")) return fallback;
  if (nextRaw.startsWith("/api")) return fallback;
  if (!nextRaw.startsWith("/admin")) return fallback;
  return nextRaw;
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const next = sanitizeNext(url.searchParams.get("next"));
  return NextResponse.redirect(
    new URL(`/admin?next=${encodeURIComponent(next)}`, url),
    { status: 303 }
  );
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const next = sanitizeNext(url.searchParams.get("next"));

  const form = await req.formData();
  const password = String(form.get("password") ?? "");

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Missing ADMIN_PASSWORD in .env/.env.local" },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.redirect(
      new URL(`/admin?next=${encodeURIComponent(next)}&error=1`, url),
      { status: 303 }
    );
  }

  // ✅ Set cookie on the redirect response (reliable)
  const res = NextResponse.redirect(new URL(next, url), { status: 303 });
  res.cookies.set(getAdminCookieName(), makeAdminCookieValue(), getAdminCookieOptions());
  return res;
}