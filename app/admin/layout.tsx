// app/admin/layout.tsx
//
// Shared layout for all /admin/* routes.
// Injects the AdminIdleTimer client component only when the admin is
// authenticated — so unauthenticated pages (login) never see it.

import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminIdleTimer from "@/components/AdminIdleTimer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthed = await isAdminAuthenticated();

  return (
    <>
      {isAuthed && <AdminIdleTimer />}
      {children}
    </>
  );
}
