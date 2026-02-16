import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sc_tree_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function base64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64urlToBuffer(input: string) {
  const pad = 4 - (input.length % 4 || 4);
  const padded = input + "=".repeat(pad === 4 ? 0 : pad);
  const b64 = padded.replaceAll("-", "+").replaceAll("_", "/");
  return Buffer.from(b64, "base64");
}

function hmac(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest();
}

function getSecretOrThrow() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "Missing ADMIN_COOKIE_SECRET. Add it to .env/.env.local and restart the dev server."
    );
  }
  return secret;
}

type SessionPayload = { v: 1; iat: number; exp: number };

export function makeAdminCookieValue() {
  const secret = getSecretOrThrow();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { v: 1, iat: now, exp: now + SESSION_TTL_SECONDS };

  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload)));
  const sigB64 = base64url(hmac(payloadB64, secret));

  return `${payloadB64}.${sigB64}`;
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

// ✅ async in your Next version
export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) return false;

  const store = await cookies(); // <-- KEY FIX
  const cookie = store.get(COOKIE_NAME)?.value;
  if (!cookie) return false;

  const [payloadB64, sigB64] = cookie.split(".");
  if (!payloadB64 || !sigB64) return false;

  const expectedSig = hmac(payloadB64, secret);

  let gotSig: Buffer;
  try {
    gotSig = base64urlToBuffer(sigB64);
  } catch {
    return false;
  }

  if (gotSig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(gotSig, expectedSig)) return false;

  try {
    const payloadJson = base64urlToBuffer(payloadB64).toString("utf8");
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (payload?.v !== 1) return false;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || now >= payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}