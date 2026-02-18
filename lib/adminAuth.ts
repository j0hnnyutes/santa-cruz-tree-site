import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

// ---------- helpers ----------
function getCookieSecret(): string {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_COOKIE_SECRET in .env.local");
  }
  return secret;
}

function sign(payload: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

function timingSafeEq(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;

  const secret = getCookieSecret();
  const parts = token.split(".");
  if (parts.length < 3) return false;

  const sig = parts.pop();
  const payload = parts.join(".");
  if (!sig || !payload) return false;

  const expected = sign(payload, secret);
  return timingSafeEq(sig, expected);
}

function createSessionToken(): string {
  const secret = getCookieSecret();
  const payload = `${Date.now()}.${crypto.randomUUID()}`;
  const sig = sign(payload, secret);
  return `${payload}.${sig}`;
}

// ---------- RSC pages ----------
export async function isAdminAuthenticated(): Promise<boolean> {
  const c = await cookies();   // ✅ FIX: await
  const token = c.get(COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function setAdminSessionCookie(): Promise<void> {
  const c = await cookies();   // ✅ FIX: await
  const token = createSessionToken();

  c.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const c = await cookies();   // ✅ FIX: await

  c.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

// ---------- API route handlers ----------
export function isAdminAuthenticatedRequest(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}