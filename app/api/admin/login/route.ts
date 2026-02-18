import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Missing ADMIN_PASSWORD in .env.local" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/admin/leads";

  const form = await req.formData();
  const password = String(form.get("password") ?? "");

  if (password !== adminPassword) {
    return NextResponse.redirect(new URL(`/admin?next=${encodeURIComponent(next)}&error=1`, url.origin), {
      status: 303,
    });
  }

  await setAdminSessionCookie();

  return NextResponse.redirect(new URL(next, url.origin), { status: 303 });
}