import type { Metadata } from "next";
import Link from "next/link";
import AccentCardLink from "@/components/AccentCardLink";
import ServiceCta from "@/components/ServiceCta";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pageUrl = siteUrl;

export const metadata: Metadata = {
  title: "Santa Cruz Tree Pros | Tree Service in Santa Cruz County, CA",
  description:
    "Tree removal, tree trimming, stump grinding, emergency tree service, and arborist consulting across Santa Cruz County. Request a free estimate.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Santa Cruz Tree Pros | Tree Service in Santa Cruz County, CA",
    description:
      "Tree removal, trimming, stump grinding, emergency service, and arborist consulting. Request a free estimate.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const services = [
  {
    title: "Tree Removal",
    href: "/services/tree-removal",
    description:
      "Controlled removals for hazardous, dead, or storm-damaged trees—planned to protect nearby structures and landscaping.",
  },
  {
    title: "Tree Trimming & Pruning",
    href: "/services/tree-trimming",
    description:
      "Structural pruning and canopy balancing to reduce limb failure and support long-term health in coastal wind conditions.",
  },
  {
    title: "Stump Grinding & Root Removal",
    href: "/services/stump-grinding-root-removal",
    description:
      "Remove stumps below grade to restore usable space and prepare for turf, planting, or hardscape.",
  },
  {
    title: "Emergency Tree Service",
    href: "/services/emergency-tree-service",
    description:
      "Rapid response for fallen trees and hazardous limbs—stabilization and controlled removal with safety-first priorities.",
  },
  {
    title: "Arborist Consulting",
    href: "/services/arborist-consulting",
    description:
      "Professional evaluations for health and risk—clear recommendations for pruning, monitoring, treatment, or removal.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="space-y-12 py-10">
      {/* Buttons directly under hero (hero is in SiteShell) */}
      <section>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/40 sm:w-auto"
          >
            Request an Estimate
          </Link>

          <a
            href="tel:+1XXXXXXXXXX"
            className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-green)] hover:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30 sm:w-auto"
          >
            Call Now
          </a>
        </div>
      </section>

      {/* Overview */}
      <section>
        <div className="grid gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7 space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Trusted Tree Service for Santa Cruz County
            </h1>
            <p className="text-[var(--muted)] leading-7">
              Santa Cruz properties face unique conditions—coastal wind, salt air exposure,
              winter storms, and in many areas, slope and erosion concerns. Santa Cruz Tree Pros
              helps homeowners and property managers choose the safest, most practical plan—
              from pruning for wind resistance to hazard mitigation and removals.
            </p>
            <p className="text-[var(--muted)] leading-7">
              We focus on clear communication, careful execution, and meticulous cleanup—so your
              property looks better than when we arrived.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-green)] hover:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
              >
                Browse Services
              </Link>
              <Link
                href="/service-areas"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-green)] hover:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/30"
              >
                View Service Areas
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">What you can expect</div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <li>• On-site evaluation and clear scope of work</li>
              <li>• Safety-first execution with property protection</li>
              <li>• Clean job sites and meticulous cleanup</li>
              <li>• Recommendations tailored to coastal conditions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Our Services</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choose a service to learn more, see FAQs, and request an estimate.
          </p>
        </div>

        <ul className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.href}>
              <AccentCardLink href={s.href} title={s.title} description={s.description} />
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="pb-6">
        <ServiceCta
          heading="Request a Free Estimate"
          body="Tell us what you need and we’ll recommend the safest, most practical plan for your property in Santa Cruz County."
          primaryHref="/contact"
          primaryLabel="Request an Estimate"
          secondaryHref="tel:+1XXXXXXXXXX"
          secondaryLabel="Call Now"
        />
      </section>
    </main>
  );
}