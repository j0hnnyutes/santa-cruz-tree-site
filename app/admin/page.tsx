export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams?.next || "/admin/leads";

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Enter your admin password to view leads.
      </p>

      <form
        className="mt-6 space-y-4"
        method="POST"
        action={`/api/admin/login?next=${encodeURIComponent(next)}`}
      >
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
