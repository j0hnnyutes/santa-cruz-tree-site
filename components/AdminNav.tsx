"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/errors", label: "Errors" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/settings", label: "⚙️ Settings" },
  ];

  return (
    <nav
      className="w-full flex items-center gap-1 px-4 py-3"
      style={{ backgroundColor: "#0f1f0f" }}
    >
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-full text-white font-medium text-sm transition-colors"
            style={{
              backgroundColor: isActive ? "var(--brand-green)" : "transparent",
              color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
