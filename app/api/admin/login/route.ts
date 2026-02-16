import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/admin/leads";

  const form = await req.formData();
  const password = String(form.get("password") ?? "");

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Missing ADMIN_PASSWORD in .env.local" },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.redirect(
      new URL(`/admin?next=${encodeURIComponent(next)}`, url),
      { status: 303 }
    );
  }

  setAdminSessionCookie();
  return NextResponse.redirect(new URL(next, url), { status: 303 });
}
