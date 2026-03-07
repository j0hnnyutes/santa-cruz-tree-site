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
  primaryHref = "/free-estimate",
  primaryLabel = "Request an Estimate",
  secondaryHref = "tel:+1XXXXXXXXXX",
  secondaryLabel = "Call Now",
}: ServiceCtaProps) {
  return (
    <section className="mt-12 rounded-xl bg-[var(--brand-green)] px-6 py-8 sm:px-8 sm:py-10">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white">{heading}</h2>
        <p className="leading-7 text-white/80">{body}</p>
      </div>

      <div className="mt-6">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-green)] hover:bg-white/90 transition shadow-sm"
        >
          {primaryLabel}
        </Link>
      </div>

      <ul className="mt-6 grid gap-2 text-white/70 sm:grid-cols-3">
        <li className="flex items-start gap-2">
          <svg className="h-4 w-4 mt-0.5 shrink-0 text-white/60" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>On-site evaluation</span>
        </li>
        <li className="flex items-start gap-2">
          <svg className="h-4 w-4 mt-0.5 shrink-0 text-white/60" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Transparent scope of work</span>
        </li>
        <li className="flex items-start gap-2">
          <svg className="h-4 w-4 mt-0.5 shrink-0 text-white/60" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Safety-first execution</span>
        </li>
      </ul>
    </section>
  );
}
