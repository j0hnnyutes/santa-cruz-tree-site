// components/SiteKit.tsx
import Link from "next/link";
import React from "react";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="site-container py-10">{children}</main>;
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-[var(--muted)] sm:text-lg leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-3">{right}</div> : null}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="max-w-3xl">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-[var(--muted)] sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function TrustStrip({ items }: { items: string[] }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-xl bg-[var(--brand-accent-light)] border border-[var(--brand-accent)]/15 px-5 py-4">
      {items.map((t) => (
        <div key={t} className="flex items-center gap-2 text-sm text-[var(--brand-green)] font-medium">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

export function PrimaryButtonLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand-green)] px-5 text-sm font-semibold text-white",
        "hover:bg-[var(--brand-green-dark)] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function SecondaryButtonLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--text)]",
        "hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
