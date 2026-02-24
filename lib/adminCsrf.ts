// lib/adminCsrf.ts
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_CSRF_COOKIE = "admin_csrf";

export function newCsrfToken() {
  return randomBytes(32).toString("hex");
}

function safeEq(a: string, b: string) {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

function b64urlToBuffer(s: string) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(base64, "base64");
}

function b64urlToString(s: string) {
  return b64urlToBuffer(s).toString("utf8");
}

function hmacB64url(secret: string, data: string) {
  const digest = createHmac("sha256", secret).update(data).digest("base64");
  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function isValidAdminSession(req: NextRequest) {
  const v = req.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!v) return false;

  const secret = (process.env.ADMIN_SESSION_SECRET || "").trim();
  if (!secret) return false;

  const parts = v.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;

  const expectedSig = hmacB64url(secret, payloadB64);
  if (!safeEq(sigB64, expectedSig)) return false;

  try {
    const payloadJson = b64urlToString(payloadB64);
    const payload = JSON.parse(payloadJson) as any;

    if (!payload?.exp) return false;

    const exp = Number(payload.exp);
    if (!Number.isFinite(exp)) return false;

    const now = Math.floor(Date.now() / 1000);
    if (exp <= now) return false;

    return true;
  } catch {
    return false;
  }
}

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const host = req.headers.get("host");
  if (!host) return false;

  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");

  const expected = `${proto}://${host}`;
  return origin === expected;
}

function readCsrfHeader(req: NextRequest) {
  return (
    req.headers.get("x-admin-csrf") ||
    req.headers.get("x-admin-csrf-token") ||
    req.headers.get("x-csrf-token") ||
    ""
  );
}

export function verifyAdminCsrf(req: NextRequest) {
  if (!isValidAdminSession(req)) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  if (!isSameOrigin(req)) {
    return { ok: false as const, status: 403, error: "Bad origin" };
  }

  const cookieToken = req.cookies.get(ADMIN_CSRF_COOKIE)?.value || "";
  const headerToken = readCsrfHeader(req);

  if (!cookieToken || !headerToken || !safeEq(cookieToken, headerToken)) {
    return { ok: false as const, status: 403, error: "CSRF check failed" };
  }

  return { ok: true as const };
}