import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { newCsrfToken } from "@/lib/adminCsrf";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_CSRF_COOKIE = "admin_csrf";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory attempt tracker
const attempts = new Map<string, { count: number; firstAttempt: number }>();

function getIp(req: NextRequest) {
  // Works behind proxies + localhost
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // fallback
  return "unknown";
}

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signSession(secret: string, payload: object) {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64url(Buffer.from(payloadStr));

  const sig = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${payloadB64}.${sig}`;
}

function getAttemptState(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry) return { locked: false, entry: null };

  if (now - entry.firstAttempt > WINDOW_MS) {
    attempts.delete(ip);
    return { locked: false, entry: null };
  }

  return { locked: entry.count >= MAX_ATTEMPTS, entry };
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const password = String(body.password || "");
  const next =
    typeof body.next === "string" && body.next.startsWith("/")
      ? body.next
      : "/admin/leads";

  const hash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  const secret = (process.env.ADMIN_SESSION_SECRET || "").trim();

  if (!hash || !secret) {
    return NextResponse.json(
      { ok: false, error: "Admin not configured." },
      { status: 500 }
    );
  }

  const { locked } = getAttemptState(ip);

  const isValid = await bcrypt.compare(password, hash);

  if (!isValid) {
    if (locked) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const now = Date.now();
    const entry = attempts.get(ip);
    if (!entry) {
      attempts.set(ip, { count: 1, firstAttempt: now });
    } else {
      entry.count += 1;
    }

    return NextResponse.json(
      { ok: false, error: "Invalid password." },
      { status: 401 }
    );
  }

  // Successful login resets attempts
  attempts.delete(ip);

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h
  const sessionToken = signSession(secret, { exp });
  const csrfToken = newCsrfToken();

  const res = NextResponse.json({ ok: true, next }, { status: 200 });

  res.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.cookies.set({
    name: ADMIN_CSRF_COOKIE,
    value: csrfToken,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}