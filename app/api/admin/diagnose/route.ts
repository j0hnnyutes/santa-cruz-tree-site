// app/api/admin/diagnose/route.ts
// TEMPORARY diagnostic endpoint — remove after login is fixed.
// Protected by a shared secret passed as ?key=<DIAGNOSE_SECRET>

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type AdminConfigRow = { key: string; value: string };

export async function GET(req: NextRequest) {
  // Guard: require ?key=<DIAGNOSE_SECRET> query param
  const key = req.nextUrl.searchParams.get("key") || "";
  const secret = (process.env.DIAGNOSE_SECRET || "").trim();

  if (!secret || key !== secret) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const results: Record<string, unknown> = {};

  // 1. Check env vars (never expose values, only metadata)
  const passwordHashEnv = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  const sessionSecretEnv = (process.env.ADMIN_SESSION_SECRET || "").trim();

  results.env = {
    ADMIN_PASSWORD_HASH_set: !!passwordHashEnv,
    ADMIN_PASSWORD_HASH_length: passwordHashEnv.length,
    ADMIN_PASSWORD_HASH_starts_with: passwordHashEnv.slice(0, 4),
    ADMIN_PASSWORD_HASH_looks_like_bcrypt:
      passwordHashEnv.startsWith("$2b$") || passwordHashEnv.startsWith("$2a$"),
    ADMIN_SESSION_SECRET_set: !!sessionSecretEnv,
    ADMIN_SESSION_SECRET_length: sessionSecretEnv.length,
    DATABASE_URL_set: !!process.env.DATABASE_URL,
    DATABASE_URL_starts_with: (process.env.DATABASE_URL || "").slice(0, 14),
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. Test DB connection — check if AdminConfig table exists and has rows
  let adminConfigRows: AdminConfigRow[] = [];
  try {
    adminConfigRows = await prisma.$queryRaw<AdminConfigRow[]>(
      Prisma.sql`SELECT key, value FROM "AdminConfig" LIMIT 5`
    );
    results.db = {
      ok: true,
      adminConfigRowCount: adminConfigRows.length,
      adminConfigKeys: adminConfigRows.map((r) => r.key),
      hasPasswordHash: adminConfigRows.some((r) => r.key === "password_hash"),
      passwordHashInDb_length:
        adminConfigRows.find((r) => r.key === "password_hash")?.value?.length ?? 0,
      passwordHashInDb_starts_with: (
        adminConfigRows.find((r) => r.key === "password_hash")?.value ?? ""
      ).slice(0, 4),
    };
  } catch (e: any) {
    results.db = { ok: false, error: e?.message || String(e) };
  }

  // 3. Test bcrypt — verify the env hash (if set) is syntactically valid
  if (passwordHashEnv) {
    try {
      const testResult = await bcrypt.compare("__diagnostic_test__", passwordHashEnv);
      results.bcrypt_env = {
        ok: true,
        hash_parseable: true,
        test_compare_result: testResult, // should always be false
      };
    } catch (e: any) {
      results.bcrypt_env = { ok: false, error: e?.message || String(e) };
    }
  } else {
    results.bcrypt_env = { ok: false, error: "ADMIN_PASSWORD_HASH not set" };
  }

  // 4. Test the DB hash if present
  const dbHashRow = adminConfigRows.find((r) => r.key === "password_hash");
  if (dbHashRow?.value) {
    try {
      const testResult = await bcrypt.compare("__diagnostic_test__", dbHashRow.value);
      results.bcrypt_db = {
        ok: true,
        hash_parseable: true,
        test_compare_result: testResult, // should always be false
      };
    } catch (e: any) {
      results.bcrypt_db = { ok: false, error: e?.message || String(e) };
    }
  } else {
    results.bcrypt_db = { ok: false, note: "No password_hash row in AdminConfig" };
  }

  // 5. Check Lead table (confirm Prisma ORM is fully working)
  try {
    const count = await prisma.lead.count();
    results.lead_count = Number(count);
  } catch (e: any) {
    results.lead_count_error = e?.message || String(e);
  }

  return NextResponse.json({ ok: true, ...results }, { status: 200 });
}
