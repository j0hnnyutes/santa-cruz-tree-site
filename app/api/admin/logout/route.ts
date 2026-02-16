import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/adminAuth";

export const runtime = "nodejs";

export function GET(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/admin", url), { status: 303 });
  res.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}