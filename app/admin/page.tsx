// app/admin/page.tsx

import AdminLoginClient from "./AdminLoginClient";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const next =
    typeof sp.next === "string" && sp.next.startsWith("/")
      ? sp.next
      : "/admin/leads";

  const loggedOut =
    typeof sp.loggedOut === "string" &&
    (sp.loggedOut === "1" || sp.loggedOut === "true");

  return <AdminLoginClient next={next} loggedOut={loggedOut} />;
}
