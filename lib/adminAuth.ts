// lib/adminAuth.ts
import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE_SESSION = "admin_session";
const COOKIE_CSRF = "admin_csrf";

// 8 hours
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  iat: number; // issued at (sec)
  exp: number; // expires at (sec)
};

// base64url helpers
function b64urlEncode(buf: Buffer) {
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function b64urlDecodeToBuffer(s: string) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const base64 = s.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(base64, "base64");
}

function getSecret() {
  // MUST be set in .env.local
  return (process.env.ADMIN_SESSION_SECRET || "").trim();
}

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest(); // Buffer
}

function safeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createCsrfToken() {
  return randomBytes(32).toString("hex");
}

export function createSessionToken() {
  const secret = getSecret();
  if (!secret) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const payloadB64 = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = sign(payloadB64, secret);
  const sigB64 = b64urlEncode(sig);

  return `${payloadB64}.${sigB64}`;
}

export function isSessionValid(token: string | undefined | null) {
  const secret = getSecret();
  if (!secret) return false;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  let payloadBuf: Buffer;
  let sigBuf: Buffer;

  try {
    payloadBuf = b64urlDecodeToBuffer(payloadB64);
    sigBuf = b64urlDecodeToBuffer(sigB64);
  } catch {
    return false;
  }

  const expectedSig = sign(payloadB64, secret);
  if (!safeEqual(sigBuf, expectedSig)) return false;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(payloadBuf.toString("utf8")) as SessionPayload;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload?.exp || now > payload.exp) return false;

  return true;
}

/**
 * Server Component / RSC usage: checks cookie only.
 * (No CSRF on normal page loads.)
 */
export async function isAdminAuthenticated() {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSION)?.value;
  return isSessionValid(token);
}

/**
 * Route handler usage: optionally enforce CSRF for state-changing requests.
 * If enforceCsrf = true, requires header x-admin-csrf == admin_csrf cookie.
 */
export async function requireAdminAuth(options?: { enforceCsrf?: boolean }) {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSION)?.value;

  if (!isSessionValid(token)) return { ok: false as const, error: "Unauthorized" };

  if (options?.enforceCsrf) {
    const csrfCookie = jar.get(COOKIE_CSRF)?.value || "";
    const h = await headers();
    const csrfHeader = (h.get("x-admin-csrf") || "").trim();

    if (!csrfCookie || !csrfHeader) {
      return { ok: false as const, error: "Unauthorized" };
    }
    if (csrfCookie !== csrfHeader) {
      return { ok: false as const, error: "Unauthorized" };
    }
  }

  return { ok: true as const };
}

export const ADMIN_COOKIE_NAMES = {
  session: COOKIE_SESSION,
  csrf: COOKIE_CSRF,
};

export const ADMIN_SESSION_MAX_AGE = SESSION_TTL_SECONDS;