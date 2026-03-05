// app/page.tsx
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import {
  Card,
  PageShell,
  PrimaryButtonLink,
  Section,
  TrustStrip,
} from "@/components/SiteKit";

export const metadata = {
  title: "Santa Cruz Tree Pros | Tree Removal, Trimming & Stump Grinding",
  description:
    "Premium tree services in Santa Cruz County — safe removals, expert pruning, and stump grinding with clean, professional job sites.",
  openGraph: {
    title: "Santa Cruz Tree Pros | Tree Removal, Trimming & Stump Grinding",
    description: "Premium tree services in Santa Cruz County — safe removals, expert pruning, and stump grinding with clean, professional job sites.",
    url: "https://santacruztreepros.com",
    type: "website",
    siteName: "Santa Cruz Tree Pros",
    images: [{ url: "https://santacruztreepros.com/assets/tree-removal-with-crane.webp", width: 1200, alt: "Professional tree removal services in Santa Cruz, CA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Santa Cruz Tree Pros | Tree Removal, Trimming & Stump Grinding",
    description: "Premium tree services in Santa Cruz County — safe removals, expert pruning, and stump grinding with clean, professional job sites.",
  },
};

const TRUST_ITEMS = [
  "Licensed & insured",
  "Safety-first practices",
  "Clean, respectful jobsites",
  "Clear estimates & scheduling",
];

const SERVICES = [
  {
    title: "Tree Removal",
    desc: "Careful planning, controlled rigging, and a clean jobsite finish — for trees that must come down.",
    href: "/services/tree-removal",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  {
    title: "Tree Trimming & Pruning",
    desc: "Structural pruning, clearance trimming, and canopy shaping to protect tree health and property.",
    href: "/services/tree-trimming",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  {
    title: "Stump Grinding",
    desc: "Remove stumps and roots to reclaim space and reduce trip hazards, pests, and regrowth.",
    href: "/services/stump-grinding-root-removal",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Do you provide free estimates?",
    a: "Yes. Tell us what you need and we'll follow up with next steps and scheduling. For complex jobs, we may recommend an on-site evaluation.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Yes — we prioritize safety, professionalism, and protecting your property throughout the job.",
  },
  {
    q: "Can you help with hazardous or storm-damaged trees?",
    a: "Yes. If there's a safety concern, contact us right away so we can discuss urgency and the safest approach.",
  },
  {
    q: "Do you haul away debris and clean up?",
    a: "Yes. Cleanup and hauling can be included based on your request and the scope of work.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve Santa Cruz County, including Santa Cruz, Scotts Valley, Capitola, Soquel, Aptos, and nearby communities.",
  },
  {
    q: "How soon can you schedule?",
    a: "Scheduling depends on season and job complexity. We'll confirm availability after you submit the request form.",
  },
];

function ServiceCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="p-6 h-full transition-all duration-200 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 hover:border-[var(--brand-accent)]">
        <h3 className="text-xl font-semibold tracking-tight text-[var(--text)] group-hover:text-[var(--brand-green)] transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-[var(--muted)] leading-relaxed">{desc}</p>
        <div className="mt-4 text-sm font-semibold text-[var(--brand-accent)]">
          Learn more &rarr;
        </div>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  return (
    <PageShell>
      {/* Hero */}
      <HeroCarousel />

      <TrustStrip items={TRUST_ITEMS} />

      {/* Services */}
      <Section
        title="Our Services"
        subtitle="Focused, high-quality work with clear communication — from first contact through cleanup."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <ServiceCard key={s.href} title={s.title} desc={s.desc} href={s.href} />
          ))}
        </div>
        <div className="mt-5">
          <Link href="/services" className="text-sm font-semibold text-[var(--brand-accent)] hover:text-[var(--brand-green)] transition-colors">
            View all services &rarr;
          </Link>
        </div>
      </Section>

      {/* Why us */}
      <Section
        title="Why Santa Cruz Tree Pros"
        subtitle="Safety, professionalism, and respect for your property — that's the standard."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">Safety & Precision</h3>
            <ul className="grid gap-2.5 text-[var(--muted)]">
              {[
                "Safety-first approach and careful site setup",
                "Clear communication and straightforward scheduling",
                "Clean work areas and thorough debris handling",
                "Respectful crews and professional onsite behavior",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <svg className="h-4 w-4 mt-0.5 shrink-0 text-[var(--brand-accent)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-3">Local Expertise</h3>
            <ul className="grid gap-2.5 text-[var(--muted)]">
              {[
                "Work planned to protect nearby structures and landscaping",
                "Equipment and techniques selected for specific site constraints",
                "Recommendations based on your goals and risk factors",
                "Familiar with Santa Cruz County conditions and regulations",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <svg className="h-4 w-4 mt-0.5 shrink-0 text-[var(--brand-accent)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Process */}
      <Section title="How It Works" subtitle="Simple, predictable, and efficient.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "1", label: "Request", desc: "Send details and photos if available." },
            { step: "2", label: "Evaluate", desc: "We confirm scope, access, and safety needs." },
            { step: "3", label: "Schedule", desc: "We align timing and set clear expectations." },
            { step: "4", label: "Complete", desc: "Professional execution with cleanup." },
          ].map((s) => (
            <Card key={s.step} className="p-5">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-accent-light)] text-sm font-bold text-[var(--brand-green)]">
                {s.step}
              </div>
              <div className="mt-3 text-xl font-semibold text-[var(--text)]">{s.label}</div>
              <p className="mt-1.5 text-[var(--muted)]">{s.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Service areas */}
      <Section
        title="Service Areas"
        subtitle="Serving Santa Cruz County and surrounding communities."
      >
        <Card className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <ul className="grid gap-2 text-[var(--muted)]">
              {["Santa Cruz", "Capitola", "Soquel", "Aptos", "Scotts Valley", "Live Oak"].map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)]" />
                  {c}
                </li>
              ))}
            </ul>
            <ul className="grid gap-2 text-[var(--muted)]">
              {["Watsonville", "Rio Del Mar", "Seacliff", "Ben Lomond", "Felton", "And nearby areas"].map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)]" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <Link
              href="/service-areas"
              className="text-sm font-semibold text-[var(--brand-accent)] hover:text-[var(--brand-green)] transition-colors"
            >
              View all service areas &rarr;
            </Link>
          </div>
        </Card>
      </Section>

      {/* FAQs */}
      <Section title="FAQs" subtitle="Quick answers to common questions.">
        <div className="grid gap-3 sm:grid-cols-2">
          {FAQS.map((f) => (
            <Card key={f.q} className="p-6">
              <h3 className="text-xl font-semibold text-[var(--text)]">{f.q}</h3>
              <p className="mt-2 text-[var(--muted)] leading-relaxed">{f.a}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Bottom CTA */}
      <section className="mt-12 rounded-xl bg-[var(--brand-green)] px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Ready to request an estimate?
            </h2>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              Tell us the service you need and your location. We&apos;ll follow up with next steps.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/free-estimate"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-green)] hover:bg-white/90 transition shadow-sm"
            >
              Request an Estimate
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
