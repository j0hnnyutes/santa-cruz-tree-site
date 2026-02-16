import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sc_tree_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
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
  return crypto.createHmac("sha256").update(payload).update(secret).digest();
}

type SessionPayload = {
  v: 1;
  exp: number; // unix seconds
  iat: number; // unix seconds
};

export function setAdminSessionCookie() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) throw new Error("Missing ADMIN_COOKIE_SECRET in .env.local");

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { v: 1, iat: now, exp: now + SESSION_TTL_SECONDS };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64url(payloadJson);

  const sig = hmac(payloadB64, secret);
  const sigB64 = base64url(sig);

  const value = `${payloadB64}.${sigB64}`;

  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function isAdminAuthenticated(): boolean {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) return false;

  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) return false;

  const [payloadB64, sigB64] = cookie.split(".");
  if (!payloadB64 || !sigB64) return false;

  let expectedSig: Buffer;
  try {
    expectedSig = hmac(payloadB64, secret);
  } catch {
    return false;
  }

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
