import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  clearAdminSessionCookie();
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/admin", url), { status: 303 });
}
