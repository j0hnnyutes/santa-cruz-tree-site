// Shared components for service detail pages
import Link from "next/link";

/* ─── Chevron icon for FAQ accordions ─── */
export function ChevronDown() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5 shrink-0 text-[var(--muted)] transition-transform duration-200 group-open:rotate-180"
      aria-hidden="true"
    >
      <path
        d="M5.5 7.5l4.5 4.5 4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── FAQ accordion block ─── */
export function FaqBlock({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details
          key={f.q}
          className="group rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-semibold text-[var(--text)]">
            <span>{f.q}</span>
            <ChevronDown />
          </summary>
          <p className="mt-3 leading-7 text-[var(--muted)]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ─── Related services grid ─── */
export function RelatedServicesBlock({
  services,
}: {
  services: readonly { title: string; href: string; desc: string }[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Related Services</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {services.map((s) => (
          <li
            key={s.href}
            className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 transition-all duration-200"
          >
            <Link
              href={s.href}
              className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
            >
              {s.title} &rarr;
            </Link>
            <p className="mt-2 leading-6 text-[var(--muted)]">{s.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Info card (used in "What to Expect" grids) ─── */
export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="text-xl font-semibold text-[var(--text)]">{title}</div>
      <p className="mt-2 text-[var(--muted)] leading-6">{children}</p>
    </div>
  );
}

/* ─── Bullet list card ─── */
export function BulletListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="text-xl font-semibold text-[var(--text)]">{title}</div>
      <ul className="mt-3 grid gap-2 text-[var(--muted)] sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)] shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
