import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/santa-cruz";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Santa Cruz, CA",
  description:
    "Professional tree removal, trimming, and emergency services in Santa Cruz. Expert coastal tree care for West Cliff, Downtown, Seabright, and Westside neighborhoods.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Santa Cruz, CA | Santa Cruz Tree Pros",
    description:
      "Certified arborists providing tree removal, trimming, and emergency response for Santa Cruz’s coastal and urban neighborhoods.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `${siteUrl}/api/og?title=Tree+Service+in+Santa+Cruz%2C+CA&photo=tree-removal-with-crane`,
        width: 1200,
        height: 630,
        alt: "Tree Service in Santa Cruz, CA — Santa Cruz Tree Pros",
      },
    ],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "How do you handle tree work in Santa Cruz’s tight neighborhoods?",
    a: "Many Santa Cruz properties—especially in West Cliff, Seabright, and near UCSC—have mature trees on small lots with limited driveway access. We use controlled rigging, sectional removal, and sometimes rope-and-harness techniques to work safely in constrained spaces without damaging adjacent properties or landscaping.",
  },
  {
    q: "Are there tree protection ordinances in Santa Cruz I should know about?",
    a: "Yes. Santa Cruz has Protected Tree lists and heritage tree designations. Monterey Cypress, Coast Live Oak, and certain redwoods may require permits before removal or significant work. We’ll assess your tree during the estimate and advise on any permitting requirements before work begins.",
  },
  {
    q: "How do coastal salt spray and wind affect trees in Santa Cruz?",
    a: "Salt spray and persistent coastal winds stress trees, especially on West Cliff and near the beach. We recommend regular pruning to reduce wind load and remove salt-damaged limbs. Monterey Cypress and Coast Live Oak are well-adapted, but constant pruning helps them stay healthy and reduces hazard risk.",
  },
  {
    q: "My tree gets a lot of fog drip and stays very wet. Is that a problem?",
    a: "Fog drip keeps Santa Cruz trees moist year-round, which reduces drought stress but can promote fungal issues and decay. Good air circulation pruning and removing dead wood helps prevent diseases. If decay is significant, removal may be the safest option.",
  },
  {
    q: "What tree services do you offer for UCSC campus and nearby properties?",
    a: "We handle tree work for residential properties near UCSC including removal, pruning, structural assessment, and emergency response. We’re familiar with the mixed redwood and oak groves typical of the campus area and surrounding hills.",
  },
  {
    q: "How quickly can you respond to storm damage and fallen trees?",
    a: "We offer emergency response for storm-damaged and fallen trees. Call us immediately after a storm—we prioritize hazard removal and property access. We work to clear urgent situations as soon as possible.",
  },
] as const;

const localIssues = [
  {
    title: "Coastal wind damage and lean",
    children:
      "Persistent westerly winds stress trees, especially on West Cliff and Seabright. We assess lean, canopy load, and limb failure risk, then prune or remove as needed to reduce wind exposure.",
  },
  {
    title: "Salt spray and foliage burn",
    children:
      "Salt spray damages foliage and twigs, particularly on exposed sites. Monterey Pine and non-native trees suffer most. We remove dead wood and recommend species-appropriate care to manage salt damage over time.",
  },
  {
    title: "Fog-drip and fungal issues",
    children:
      "Year-round fog moisture keeps soil and foliage wet, promoting fungi, cankers, and decay. Regular pruning improves air circulation. If decay is advanced, removal prevents future hazard and disease spread to neighboring trees.",
  },
  {
    title: "Dense neighborhoods and tight access",
    children:
      "Older Santa Cruz neighborhoods have mature trees on small lots with narrow driveways and limited equipment space. We use controlled rigging and rope techniques to safely work in constrained areas without damaging adjacent properties.",
  },
];

export default function SantaCruzPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Santa Cruz",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Santa Cruz, CA",
    },
    serviceType: "Tree Removal, Trimming, Emergency Service",
    url: pageUrl,
  };

  const ldFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Tree Service in Santa Cruz, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Santa Cruz’s coastal neighborhoods—from West Cliff to Seabright, and UCSC-adjacent areas—feature mature Monterey
          Cypress, Coast Live Oak, and Redwoods that face persistent wind, salt spray, and fog-drip stress. We provide expert
          tree removal, pruning, and emergency response tailored to Santa Cruz’s unique environmental and access challenges.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Santa Cruz</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {localIssues.map((issue) => (
            <InfoCard key={issue.title} title={issue.title}>
              {issue.children}
            </InfoCard>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <Link
              href="/services/tree-removal"
              className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
            >
              Tree Removal &rarr;
            </Link>
            <p className="mt-2 leading-6 text-[var(--muted)]">
              Safe removal of hazardous, dead, or unwanted trees with rigging for tight spaces and complete cleanup.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <Link
              href="/services/tree-trimming"
              className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
            >
              Tree Trimming & Pruning &rarr;
            </Link>
            <p className="mt-2 leading-6 text-[var(--muted)]">
              Structural and health pruning to reduce wind load, improve air circulation, and prevent limb failure.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <Link
              href="/services/stump-grinding-root-removal"
              className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
            >
              Stump Grinding & Root Removal &rarr;
            </Link>
            <p className="mt-2 leading-6 text-[var(--muted)]">
              Grind stumps below grade to reclaim space and prepare for landscaping or replanting.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <Link
              href="/services/emergency-tree-service"
              className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
            >
              Emergency Tree Service &rarr;
            </Link>
            <p className="mt-2 leading-6 text-[var(--muted)]">
              Rapid response to storm damage, fallen trees, and hazardous limbs threatening property and access.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm sm:col-span-2">
            <Link
              href="/services/arborist-consulting"
              className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
            >
              Arborist Consulting &rarr;
            </Link>
            <p className="mt-2 leading-6 text-[var(--muted)]">
              Professional assessment of tree health, structure, and risk, with recommendations for coastal and urban settings.
            </p>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Santa Cruz Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Schedule a Free Estimate in Santa Cruz"
        body="Tell us about your trees and property. We’ll assess coastal wind exposure, access constraints, and any city requirements—then provide a clear recommendation."
        primaryHref="/free-estimate"
        primaryLabel="Request an Estimate"
      />

      <div className="pt-4 border-t border-[var(--border)]">
        <Link
          href="/service-areas"
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition"
        >
          ← Back to Service Areas
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Santa Cruz")) }}
      />
    </main>
  );
}
