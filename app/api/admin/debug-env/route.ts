// app/api/admin/debug-env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const v = process.env.ADMIN_PASSWORD ?? "";
  return NextResponse.json({
    hasAdminPassword: !!v,
    length: v.length,
    preview: v ? `${v.slice(0, 2)}***${v.slice(-2)}` : null,
  });
}