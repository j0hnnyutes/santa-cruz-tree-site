import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { newCsrfToken } from "@/lib/adminCsrf";
import { createSessionToken, ADMIN_SESSION_MAX_AGE, ADMIN_COOKIE_NAMES } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logError } from "@/lib/logError";

type AdminConfigRow = { key: string; value: string };

async function getAdminConfigValue(key: string): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<AdminConfigRow[]>(
      Prisma.sql`SELECT key, value FROM "AdminConfig" WHERE key = ${key} LIMIT 1`
    );
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

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

  // Check DB for password hash override first, then fall back to env var
  const dbHash = await getAdminConfigValue("password_hash");
  const hash = (dbHash || process.env.ADMIN_PASSWORD_HASH || "").trim();
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
      logError(req, {
        severity: "high",
        type: "auth",
        message: `Admin login locked out after ${MAX_ATTEMPTS} failed attempts`,
        path: "/api/admin/login",
        metadata: { ip, attempts: MAX_ATTEMPTS },
      });
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

    const attemptCount = attempts.get(ip)?.count ?? 1;
    logError(req, {
      severity: attemptCount >= 3 ? "medium" : "low",
      type: "auth",
      message: `Admin login failed (attempt ${attemptCount}/${MAX_ATTEMPTS})`,
      path: "/api/admin/login",
      metadata: { ip, attemptCount },
    });

    return NextResponse.json(
      { ok: false, error: "Invalid password." },
      { status: 401 }
    );
  }

  // Successful login resets attempts
  attempts.delete(ip);

  const sessionToken = createSessionToken();
  const csrfToken = newCsrfToken();

  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Admin not configured." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, next }, { status: 200 });

  res.cookies.set({
    name:     ADMIN_COOKIE_NAMES.session,
    value:    sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    path:     "/",
    maxAge:   ADMIN_SESSION_MAX_AGE,
  });

  res.cookies.set({
    name: ADMIN_COOKIE_NAMES.csrf,
    value: csrfToken,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}