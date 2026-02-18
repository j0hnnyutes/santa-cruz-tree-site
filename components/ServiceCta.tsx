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
  body = "Start with a quick on-site assessment. We'll review your goals, evaluate conditions, and provide clear recommendations with a straightforward scope of work.",
  primaryHref = "/contact",
  primaryLabel = "Request a Free Estimate",
  secondaryHref = "tel:+1XXXXXXXXXX",
  secondaryLabel = "Call Now",
}: ServiceCtaProps) {
  return (
    <section className="mt-12 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          {primaryLabel}
        </Link>

        <a
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          {secondaryLabel}
        </a>
      </div>

      <ul className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <li>• On-site evaluation</li>
        <li>• Clear recommendations</li>
        <li>• Transparent scope of work</li>
        <li>• Safety-first execution</li>
      </ul>
    </section>
  );
}