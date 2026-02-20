import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/free-estimate";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Free Tree Service Estimate | Santa Cruz Tree Pros",
  description:
    "Request a free tree service estimate in Santa Cruz County. Tell us what you need and we’ll recommend the safest, most practical plan for your property.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free Tree Service Estimate | Santa Cruz Tree Pros",
    description:
      "Request a free estimate for tree removal, trimming, stump grinding, emergency service, or arborist consulting in Santa Cruz County.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Tree Service Estimate | Santa Cruz Tree Pros",
    description:
      "Request a free estimate for tree services across Santa Cruz County.",
  },
  robots: { index: true, follow: true },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free Tree Service Estimate",
    url: pageUrl,
    description:
      "Request a free tree service estimate in Santa Cruz County from Santa Cruz Tree Pros.",
  };
}

export default function FreeEstimatePage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold">Request a Free Estimate</h1>
        <p className="text-[var(--muted)] leading-7">
          Tell us what you need and we’ll recommend the safest, most practical plan
          for your Santa Cruz County property. We can help with removals, pruning,
          storm damage, stump grinding, and arborist evaluations.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="tel:+1XXXXXXXXXX"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/40"
          >
            Call Now
          </a>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-green)] hover:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
          >
            Browse Services
          </Link>
        </div>
      </header>

      {/* Form placeholder — hooks into your existing lead capture later */}
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Quick Details</h2>
        <p className="text-sm text-[var(--muted)]">
          (We’ll wire this to your lead form / API. For now this is a clean on-page form scaffold.)
        </p>

        <form className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
              placeholder="Your name"
              name="name"
              autoComplete="name"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium">Phone</label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
              placeholder="(555) 555-5555"
              name="phone"
              autoComplete="tel"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
              placeholder="you@example.com"
              name="email"
              type="email"
              autoComplete="email"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium">City</label>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
              placeholder="Santa Cruz, Capitola, Aptos…"
              name="city"
              autoComplete="address-level2"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium">What do you need help with?</label>
            <textarea
              className="mt-1 min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
              placeholder="Tree removal, trimming, storm damage, stump grinding… Include any deadlines or concerns."
              name="message"
            />
            <p className="mt-2 text-xs text-[var(--muted)]">
              Tip: If it’s storm-related or a hazard, mention “Emergency” and any immediate risks.
            </p>
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              className="w-full rounded-xl bg-[var(--brand-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/40"
            >
              Submit Request
            </button>
            <p className="mt-2 text-xs text-[var(--muted)]">
              (Next step: we’ll connect this to your existing lead intake API.)
            </p>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">What happens next</h2>
        <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
          <li>• We review your request quickly</li>
          <li>• We may ask for a few photos</li>
          <li>• We provide a clear scope + estimate</li>
          <li>• We schedule a time that works for you</li>
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </main>
  );
}