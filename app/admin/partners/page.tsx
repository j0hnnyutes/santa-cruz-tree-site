// app/admin/partners/page.tsx
// Server component — enforces admin auth, then renders the client UI.

import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import PartnersClient from "./PartnersClient";

export const metadata = {
  title: "Partners",
  robots: { index: false, follow: false },
};

export default async function PartnersPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin?next=/admin/partners");
  }
  return <PartnersClient />;
}
