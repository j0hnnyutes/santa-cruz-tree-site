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
        "group block h-full rounded-xl border border-[var(--border)] bg-[var(--surface)]",
        "shadow-[var(--shadow-soft)] transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-[var(--shadow-hover)] hover:border-[var(--brand-accent)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]",
      ].join(" ")}
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full rounded-t-xl bg-[var(--card-bar)] transition-colors group-hover:bg-[var(--card-bar-hover)]" />

      <div className="flex h-full flex-col p-6">
        <div className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--brand-green)] transition-colors">
          {title}
        </div>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        ) : null}

        <div className="mt-auto" />
      </div>
    </Link>
  );
}
