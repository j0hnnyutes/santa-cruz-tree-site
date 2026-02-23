import Link from "next/link";

type ServiceCtaProps = {
  heading?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function ServiceCta({
  heading = "Request an Estimate",
  body = "Start with a quick on-site assessment. We'll review your goals and provide clear recommendations.",
  primaryHref = "/contact",
  primaryLabel = "Request an Estimate",
  secondaryHref = "tel:+1XXXXXXXXXX",
  secondaryLabel = "Call Now",
}: ServiceCtaProps) {
  return (
    <section className="relative mt-12 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-7 shadow-[var(--shadow-soft)] sm:px-8 sm:py-8">
      {/* Top accent bar */}
      <div aria-hidden="true" className="absolute left-0 top-0 h-[6px] w-full bg-[var(--brand-green)] opacity-90" />

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{heading}</h2>
        <p className="text-sm leading-7 text-[var(--muted)]">{body}</p>
      </div>

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
        <Link href={primaryHref} className="btn-primary">
          {primaryLabel}
        </Link>

        <a href={secondaryHref} className="btn-secondary">
          {secondaryLabel}
        </a>
      </div>

      <ul className="mt-6 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-3">
        <li className="flex items-start gap-2">
          <span aria-hidden="true">•</span>
          <span>On-site evaluation</span>
        </li>
        <li className="flex items-start gap-2">
          <span aria-hidden="true">•</span>
          <span>Transparent scope of work</span>
        </li>
        <li className="flex items-start gap-2">
          <span aria-hidden="true">•</span>
          <span>Safety-first execution</span>
        </li>
      </ul>
    </section>
  );
}