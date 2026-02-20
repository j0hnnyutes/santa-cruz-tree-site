import Link from "next/link";

type AccentCardLinkProps = {
  href: string;
  title: string;
  description?: string;
};

export default function AccentCardLink({
  href,
  title,
  description,
}: AccentCardLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "group block h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]",
        "shadow-md transition",
        "hover:-translate-y-1 hover:shadow-xl hover:border-[var(--brand-accent)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30",
      ].join(" ")}
    >
      {/* Thick top accent bar */}
      <div className="h-3 w-full rounded-t-2xl bg-[var(--card-bar)] transition-colors group-hover:bg-[var(--card-bar-hover)]" />

      <div className="flex h-full flex-col p-6">
        <div className="text-lg font-semibold text-[var(--text)] underline decoration-black/20 underline-offset-4 group-hover:decoration-[var(--brand-accent)]">
          {title}
        </div>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        ) : null}

        {/* Ensures equal-height cards */}
        <div className="mt-auto" />
      </div>
    </Link>
  );
}