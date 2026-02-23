// app/api/admin/login/route.ts
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

function toStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function safeNext(v: unknown) {
  const s = toStr(v);
  return s.startsWith("/") ? s : "/admin/leads";
}

function preview(s: string) {
  const t = s ?? "";
  if (!t) return null;
  const start = t.slice(0, 2);
  const end = t.slice(-2);
  return `${start}***${end}`;
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const password = toStr(body.password).trim();
  const next = safeNext(body.next);

  // ✅ Trim env too
  const expected = (process.env.ADMIN_PASSWORD || "").trim();

  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin password is not configured. Set ADMIN_PASSWORD in your .env.local and restart npm run dev.",
      },
      { status: 500 }
    );
  }

  if (!password || password !== expected) {
    // ✅ Dev-only diagnostics (won't reveal the full password)
    const devDebug =
      process.env.NODE_ENV !== "production"
        ? {
            expectedLen: expected.length,
            expectedPreview: preview(expected),
            providedLen: password.length,
            providedPreview: preview(password),
          }
        : undefined;

    return NextResponse.json(
      { ok: false, error: "Invalid password.", debug: devDebug },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, next }, { status: 200 });

  res.cookies.set({
    name: COOKIE_NAME,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });

  return res;
}