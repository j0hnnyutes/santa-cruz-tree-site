// app/api/admin/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCsrf } from "@/lib/adminCsrf";

const SESSION_COOKIE = "admin_session";
const CSRF_COOKIE = "admin_csrf";

function toStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function buildRedirectUrl(req: NextRequest, rawNext: string | null): URL {
  const fallback = new URL("/admin?loggedOut=1", req.url);

  if (!rawNext) return fallback;

  try {
    // Allow relative paths ("/admin?x=1")
    if (rawNext.startsWith("/")) return new URL(rawNext, req.url);

    // If absolute URL, only allow same-origin
    const u = new URL(rawNext);
    const origin = new URL(req.url).origin;
    if (u.origin !== origin) return fallback;
    return u;
  } catch {
    return fallback;
  }
}

function clearAdminCookies(res: NextResponse) {
  const secure = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 0,
  });

  // admin_csrf is not httpOnly (so client JS can read it if needed), but we still clear it.
  res.cookies.set({
    name: CSRF_COOKIE,
    value: "",
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure,
    maxAge: 0,
  });
}

function hasHeaderCsrf(req: NextRequest) {
  const v = req.headers.get("x-admin-csrf");
  return !!(v && v.trim().length > 0);
}

function validateCsrfForGet(req: NextRequest) {
  // If header exists, enforce your standard verifier (session + csrf + header match)
  if (hasHeaderCsrf(req)) {
    return verifyAdminCsrf(req);
  }

  // Otherwise allow GET logout if `?csrf=` matches cookie.
  const csrfQuery = req.nextUrl.searchParams.get("csrf");
  const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value || "";

  if (csrfQuery && csrfCookie && csrfQuery === csrfCookie) {
    return { ok: true as const };
  }

  // In development, allow logout without CSRF so you can recover easily.
  if (process.env.NODE_ENV !== "production") {
    return { ok: true as const };
  }

  return { ok: false as const, status: 401, error: "Unauthorized" };
}

export async function GET(req: NextRequest) {
  const gate = validateCsrfForGet(req);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, error: gate.error },
      { status: gate.status }
    );
  }

  const nextParam = req.nextUrl.searchParams.get("next");
  const redirectTo = buildRedirectUrl(req, nextParam);

  const res = NextResponse.redirect(redirectTo, { status: 303 });
  clearAdminCookies(res);
  return res;
}

export async function POST(req: NextRequest) {
  const csrf = verifyAdminCsrf(req);
  if (!csrf.ok) {
    return NextResponse.json(
      { ok: false, error: csrf.error },
      { status: csrf.status }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const nextParam = toStr(body.next).trim() || "/admin?loggedOut=1";
  const redirectTo = buildRedirectUrl(req, nextParam);

  const res = NextResponse.json({ ok: true, next: redirectTo.pathname + redirectTo.search }, { status: 200 });
  clearAdminCookies(res);
  return res;
}