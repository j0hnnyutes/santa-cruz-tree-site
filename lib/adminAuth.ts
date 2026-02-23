// lib/adminAuth.ts
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

/**
 * Server-side admin auth check.
 * Works in App Router Server Components and Route Handlers.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    // In newer Next versions, cookies() may be async.
    const store = await cookies();
    const v = store.get(COOKIE_NAME)?.value;
    return v === "1";
  } catch {
    return false;
  }
}

/**
 * Optional helper if you want to throw/redirect from server components.
 */
export async function requireAdmin(): Promise<void> {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    // Importing redirect here would create a circular dependency risk sometimes,
    // so we keep this helper minimal. Prefer redirect in pages directly.
    throw new Error("ADMIN_NOT_AUTHENTICATED");
  }
}