// app/api/admin/refresh-session/route.ts
//
// POST /api/admin/refresh-session
//
// Called by AdminIdleTimer when the admin clicks "Stay logged in".
// Verifies the existing session is still valid, then issues a fresh session
// cookie with a new expiry window — effectively implementing a sliding-window
// inactivity timeout.

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { verifyAdminCsrf } from "@/lib/adminCsrf";
import { isSessionValid } from "@/lib/adminAuth";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS  = 8 * 60 * 60; // 8 hours absolute maximum

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signSession(secret: string, payload: object): string {
  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload)));
  const sig = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${payloadB64}.${sig}`;
}

export async function POST(req: NextRequest) {
  // 1. Verify the existing session cookie is still valid
  const jar   = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isSessionValid(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify CSRF (cookie value == x-admin-csrf header + same origin)
  const csrf = verifyAdminCsrf(req);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: csrf.status });
  }

  // 3. Issue a fresh session token
  const secret = (process.env.ADMIN_SESSION_SECRET || "").trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  const exp      = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const newToken = signSession(secret, { exp });

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({
    name:     ADMIN_SESSION_COOKIE,
    value:    newToken,
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    path:     "/",
    maxAge:   SESSION_TTL_SECONDS,
  });

  return res;
}
