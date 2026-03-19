import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/adminAuth";
import { logError } from "@/lib/logError";
import { Prisma } from "@prisma/client";

const MIN_LENGTH = 10;

type AdminConfigRow = { key: string; value: string };

async function getAdminConfigValue(key: string): Promise<string | null> {
  const rows = await prisma.$queryRaw<AdminConfigRow[]>(
    Prisma.sql`SELECT key, value FROM "AdminConfig" WHERE key = ${key} LIMIT 1`
  );
  return rows[0]?.value ?? null;
}

async function upsertAdminConfig(key: string, value: string): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`INSERT INTO "AdminConfig" (key, value, "updatedAt")
               VALUES (${key}, ${value}, NOW())
               ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`
  );
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth({ enforceCsrf: true });
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const { currentPassword = "", newPassword = "", confirmPassword = "" } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ ok: false, error: "All fields are required." }, { status: 400 });
    }
    if (newPassword.length < MIN_LENGTH) {
      return NextResponse.json(
        { ok: false, error: `New password must be at least ${MIN_LENGTH} characters.` },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ ok: false, error: "New passwords do not match." }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { ok: false, error: "New password must be different from current password." },
        { status: 400 }
      );
    }

    // Get current hash — DB override first, then env var
    const dbHash = await getAdminConfigValue("password_hash");
    const currentHash = (dbHash || process.env.ADMIN_PASSWORD_HASH || "").trim();

    if (!currentHash) {
      return NextResponse.json({ ok: false, error: "Admin not configured." }, { status: 500 });
    }

    const isValid = await bcrypt.compare(currentPassword, currentHash);
    if (!isValid) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await upsertAdminConfig("password_hash", newHash);

    return NextResponse.json({ ok: true, message: "Password updated successfully." });
  } catch (err: any) {
    console.error("[change-password] Unexpected error:", err);
    logError(req, {
      severity: "high",
      type: "server_api",
      message: err instanceof Error ? err.message : "Unexpected error in change-password",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/admin/change-password",
    });
    return NextResponse.json(
      { ok: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
