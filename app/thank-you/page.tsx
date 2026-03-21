import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for contacting Santa Cruz Tree Pros. We'll be in touch within 1–2 business days.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <main className="site-container py-16">
      <div className="mx-auto max-w-2xl text-center">

        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef7f2]">
          <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="var(--brand-green)" opacity="0.15" />
            <path
              d="M11 20.5l6.5 6.5 11.5-13"
              stroke="var(--brand-green)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Thank You for Reaching Out!
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
          We&apos;ve received your request and truly appreciate you choosing{" "}
          <span className="font-semibold text-[var(--brand-green)]">Santa Cruz Tree Pros</span>.
          Our team will carefully review the details you provided and get back to you with a
          tailored estimate as quickly as possible.
        </p>

        {/* What happens next card */}
        <div
          className="mt-10 rounded-xl bg-white p-7 text-left"
          style={{
            border: "1px solid var(--border)",
            borderTopWidth: "3px",
            borderTopColor: "var(--brand-green)",
            boxShadow: "0 4px 24px rgba(27,94,53,0.12)",
          }}
        >
          <h2 className="mb-4 text-xl font-bold text-[var(--text)]">What happens next</h2>
          <ul className="space-y-3">
            {[
              { icon: "📋", text: "We review your request and any photos you submitted to fully understand your needs." },
              { icon: "📞", text: "A member of our team will contact you within 1–2 business days to discuss your project and schedule a site visit if needed." },
              { icon: "📝", text: "We'll provide a clear, itemized estimate with no hidden fees — so you know exactly what to expect." },
              { icon: "✅", text: "Once you're ready, we'll schedule your service at a time that's convenient for you." },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-[var(--muted)]">
                <span className="mt-0.5 text-lg leading-none">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why SC Tree Pros */}
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-7 text-left shadow-[var(--shadow-soft)]">
          <h2 className="mb-4 text-xl font-bold text-[var(--text)]">Why Santa Cruz Tree Pros?</h2>
          <ul className="space-y-3">
            {[
              { icon: "🌲", text: "Locally owned and operated — we know Santa Cruz County's trees, terrain, and regulations." },
              { icon: "🛡️", text: "Fully licensed and insured for your complete peace of mind." },
              { icon: "⭐", text: "Trusted by hundreds of homeowners and property managers across the county." },
              { icon: "🌱", text: "We care about the health of your trees and the safety of your property — not just the job at hand." },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-[var(--muted)]">
                <span className="mt-0.5 text-lg leading-none">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Immediate assistance */}
        <p className="mt-8 text-[var(--muted)]">
          Need more immediate assistance? Email us directly at{" "}
          <a
            href="mailto:info@santacruztreepros.com"
            className="font-semibold text-[var(--brand-green)] underline underline-offset-2 hover:text-[var(--brand-green-dark)]"
          >
            info@santacruztreepros.com
          </a>{" "}
          and we&apos;ll do our best to respond as soon as possible.
        </p>

        {/* CTA */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-green)] px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-[var(--brand-green-dark)]"
          >
            ← Back to Homepage
          </Link>
        </div>

      </div>
    </main>
  );
}
