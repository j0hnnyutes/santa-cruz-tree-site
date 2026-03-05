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
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] shadow-md">
      <div className="site-container">
        <div className="flex items-center justify-between h-[69px] sm:h-[77px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/sctreepros-logo.svg"
              alt="Santa Cruz Tree Pros"
              className="h-[58px] sm:h-[68px] w-auto object-contain brightness-0 invert"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-white/90 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile menu button */}
          <div className="flex items-center gap-3">
            <Link
              href="/free-estimate"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-lg font-semibold text-[var(--brand-green)] hover:bg-white/90 transition-colors"
            >
              Get Free Estimate
            </Link>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-white/90 hover:text-white hover:bg-white/10 transition"
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
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/free-estimate"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-white px-3 py-2.5 text-center text-base font-semibold text-[var(--brand-green)]"
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
