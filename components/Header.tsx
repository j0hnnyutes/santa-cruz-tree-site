"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NavItem = { label: string; href: string };

const HEADER_H = 105;

export default function Header() {
  const nav: NavItem[] = useMemo(
    () => [
      { label: "Services", href: "/services" },
      { label: "Service Areas", href: "/service-areas" },
      { label: "Contact", href: "/contact" },
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
    <header className="sticky top-0 z-50">
      <div className="h-[5px] w-full bg-[var(--header-stripe)]" />

      <div className="bg-[var(--header-bg)] text-[var(--text)]">
        <div className="site-container">
          <div className="flex items-center justify-between" style={{ height: `${HEADER_H}px` }}>
            <Link href="/" className="flex items-center">
              <img
                src="/sctreepros-logo.svg"
                alt="Santa Cruz Tree Pros"
                style={{ height: `${HEADER_H}px` }}
                className="w-auto object-contain"
              />
            </Link>

            <nav className="hidden items-center md:flex">
              {nav.map((item, idx) => (
                <div key={item.href} className="flex items-center">
                  <Link
                    href={item.href}
                    className="font-semibold text-[var(--text)] hover:text-[var(--brand-green)] transition"
                  >
                    {item.label}
                  </Link>
                  {idx < nav.length - 1 && (
                    <span className="mx-4 select-none font-semibold text-[var(--brand-green)]">|</span>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/contact" className="btn-primary">
                Request an Estimate
              </Link>

              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] shadow-sm hover:bg-[var(--surface-hover)]"
                aria-label="Open menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            className={[
              "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
              open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="pb-5">
              <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]">
                <div className="flex flex-col p-3">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 font-semibold text-[var(--text)] hover:bg-[var(--surface-hover)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[5px] w-full bg-[var(--header-stripe)]" />
    </header>
  );
}