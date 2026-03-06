"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NavItem = { label: string; href: string };

export default function Header() {
  const nav: NavItem[] = useMemo(
    () => [
      { label: "Services", href: "/services" },
      { label: "Service Areas", href: "/service-areas" },
      { label: "Free Estimate", href: "/free-estimate" },
    ],
    []
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Thin green accent bar at top */}
      <div className="h-[3px] bg-[var(--brand-green)]" />

      <div className="site-container">
        <div className="flex items-center justify-between h-[109px] sm:h-[119px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/sctreepros-logo.svg"
              alt="Santa Cruz Tree Pros"
              className="h-[97px] sm:h-[109px] w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="max-md:hidden flex items-center gap-8">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ color: '#1a1a2e' }}
                className="text-lg font-medium hover:text-[var(--brand-green)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile menu button */}
          <div className="flex items-center gap-3">
            <Link
              href="/free-estimate"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[var(--brand-green)] px-4 py-2 text-lg font-semibold text-white hover:bg-[var(--brand-green-dark,#154d2b)] transition-colors"
            >
              Get Free Estimate
            </Link>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-[var(--muted)] hover:text-[var(--brand-green)] hover:bg-[#f3f4f6] transition"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d={open ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={[
            "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
            open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="pb-4">
            <div className="mobile-nav flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-[#1a1a2e] hover:bg-[#f3f4f6] hover:text-[var(--brand-green)] transition"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/free-estimate"
                onClick={() => setOpen(false)}
                className="mobile-cta-btn mt-2 rounded-lg bg-[var(--brand-green)] px-3 py-2.5 text-center text-base font-semibold text-white"
              >
                Get Free Estimate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
