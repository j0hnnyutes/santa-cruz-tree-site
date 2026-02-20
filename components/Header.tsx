"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Contact", href: "/contact" },
] as const;

// EXACT from your SVG:
const HEADER_BG = "#F0E8D8";
const STRIPE = "#5a4a20";
const STRIPE_PX = 5;

// Header height matches logo height (adjust this number if you want slightly taller/shorter)
const LOGO_H = 96; // px
const HEADER_H = LOGO_H + STRIPE_PX * 2;

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Prevent body scroll when menu is open (mobile UX)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: HEADER_BG,
        borderTop: `${STRIPE_PX}px solid ${STRIPE}`,
        borderBottom: `${STRIPE_PX}px solid ${STRIPE}`,
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-3 sm:px-6"
        style={{ height: `${HEADER_H}px` }}
      >
        {/* Logo left */}
<Link
  href="/"
  aria-label="Go to Santa Cruz Tree Pros homepage"
  className="flex items-center"
>
  <Image
    src="/images/logo/sctreepros-logo.svg"
    alt="Santa Cruz Tree Pros"
    width={520}
    height={96}
    priority
    className="w-auto object-contain"
    style={{ height: "96px" }}
  />
</Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Desktop nav (bold + pipe separators) */}
          <nav className="hidden items-center md:flex" aria-label="Primary navigation">
            {navLinks.map((item, idx) => (
              <div key={item.href} className="flex items-center">
                <Link
                  href={item.href}
                  className="px-4 text-sm font-bold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
                >
                  {item.label}
                </Link>
                {idx < navLinks.length - 1 && (
                  <span className="font-bold select-none" style={{ color: STRIPE }}>
                    |
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* CTA always visible */}
          <Link
            href="/contact"
            onClick={close}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-accent)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
          >
            Request an Estimate
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--bg-soft)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={[
          "md:hidden overflow-hidden",
          "transition-[max-height,opacity] duration-300 ease-in-out",
          open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
        style={{ backgroundColor: HEADER_BG }}
      >
        <nav className="mx-auto px-3 sm:px-6 py-5" aria-label="Mobile navigation">
          <ul className="space-y-3">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block rounded-lg px-3 py-3 text-base font-bold text-[var(--text)] hover:bg-white/50 hover:text-[var(--brand-accent)] transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl border border-[var(--border)] bg-white/60 p-4">
            <p className="text-sm font-semibold text-[var(--text)]">Need help fast?</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Request an estimate or call now for time-sensitive issues.
            </p>
            <div className="mt-3 flex gap-3">
              <Link
                href="/contact"
                onClick={close}
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-[var(--brand-green)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-accent)] transition"
              >
                Request
              </Link>
              <a
                href="tel:+1XXXXXXXXXX"
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-green)] hover:bg-[var(--bg-soft)] transition"
              >
                Call Now
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Click-away overlay starts below header */}
      {open && (
        <button
          aria-label="Close menu overlay"
          className="md:hidden fixed inset-0 z-40 bg-black/10"
          style={{ top: `${HEADER_H}px` }}
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}