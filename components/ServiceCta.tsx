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
    <section className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--cta-soft)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-accent)]"
        >
          {primaryLabel}
        </Link>

        <a
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-green)] hover:bg-[var(--bg-soft)]"
        >
          {secondaryLabel}
        </a>
      </div>
    </section>
  );
}