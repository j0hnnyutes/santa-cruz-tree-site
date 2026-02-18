import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

function buildRedirectUrl(req: NextRequest, rawNext: string | null): URL {
  const fallback = new URL("/admin?loggedOut=1", req.url);

  if (!rawNext) return fallback;

  try {
    // Allow relative paths ("/admin?x=1")
    if (rawNext.startsWith("/")) {
      return new URL(rawNext, req.url);
    }

    // If someone passes an absolute URL, only allow same-origin
    const u = new URL(rawNext);
    const origin = new URL(req.url).origin;
    if (u.origin !== origin) return fallback;
    return u;
  } catch {
    return fallback;
  }
}

export async function GET(req: NextRequest) {
  const nextParam = req.nextUrl.searchParams.get("next");
  const redirectTo = buildRedirectUrl(req, nextParam);

  const res = NextResponse.redirect(redirectTo, { status: 303 });

  // Clear cookie
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  return res;
}