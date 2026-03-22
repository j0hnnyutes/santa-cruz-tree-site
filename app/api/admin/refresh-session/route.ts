// app/api/admin/refresh-session/route.ts
//
// POST /api/admin/refresh-session
//
// Called by AdminIdleTimer when the admin clicks "Stay logged in".
// Verifies the existing session is still valid, then issues a fresh session
// cookie with a new expiry window — effectively implementing a sliding-window
// inactivity timeout.

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCsrf } from "@/lib/adminCsrf";
import {
  isSessionValid,
  createSessionToken,
  ADMIN_COOKIE_NAMES,
  ADMIN_SESSION_MAX_AGE,
} from "@/lib/adminAuth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  // 1. Verify the existing session cookie is still valid
  const jar   = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAMES.session)?.value;
  if (!isSessionValid(token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify CSRF (cookie value == x-admin-csrf header + same origin)
  const csrf = verifyAdminCsrf(req);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: csrf.status });
  }

  // 3. Issue a fresh session token (single source of truth in lib/adminAuth.ts)
  const newToken = createSessionToken();
  if (!newToken) {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({
    name:     ADMIN_COOKIE_NAMES.session,
    value:    newToken,
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    path:     "/",
    maxAge:   ADMIN_SESSION_MAX_AGE,
  });

  return res;
}
