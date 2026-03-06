import { isAdminAuthenticated } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminNav from "@/components/AdminNav";
import AdminErrorsClient from "@/components/AdminErrorsClient";

export const metadata = {
  title: "Errors",
  robots: { index: false, follow: false },
};

type ErrorLogRow = {
  id: number;
  createdAt: string;
  severity: string;
  type: string;
  message: string;
  stack: string | null;
  path: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: string | null;
};

interface ApiResponse {
  ok: boolean;
  errors?: ErrorLogRow[];
  total?: number;
  error?: string;
}

export default async function ErrorsPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) redirect("/admin?next=/admin/errors");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const base = process.env.SITE_URL || "http://localhost:3000";
  let errors: ErrorLogRow[] = [];
  let total = 0;

  try {
    const res = await fetch(`${base}/api/admin/errors?limit=100`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    const data: ApiResponse = await res.json();
    if (data.ok && data.errors) {
      errors = data.errors;
      total = data.total || 0;
    }
  } catch (err) {
    console.error("Failed to fetch errors:", err);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      <AdminNav />

      <main className="site-container py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Errors</h1>
          <p className="mt-1 text-sm text-gray-400">
            Monitor and debug system errors
          </p>
        </div>

        <AdminErrorsClient initialErrors={errors} initialTotal={total} />
      </main>
    </div>
  );
}
