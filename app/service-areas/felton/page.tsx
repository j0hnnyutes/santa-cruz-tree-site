import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/felton";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Felton, CA",
  description:
    "Professional tree service in Felton—removal, trimming, and emergency care in dense redwood forest. San Lorenzo Valley specialists with experience in tight access and flood-prone terrain.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Felton, CA | Santa Cruz Tree Pros",
    description:
      "Expert tree care in Felton's redwood forest—managing old-growth neighbors and mountain terrain challenges.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `${siteUrl}/api/og?title=Tree+Service+in+Felton%2C+CA&photo=tree-removal-with-crane`,
        width: 1200,
        height: 630,
        alt: "Tree Service in Felton, CA — Santa Cruz Tree Pros",
      },
    ],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Why is tree work in Felton different from other areas?",
    a: "Felton is densely forested—many homes sit among large old-growth redwoods and firs. Access is often tight (narrow driveways, steep slopes, limited turnaround). Equipment staging is challenging. We use smaller machinery and rigging for close-quarters work, and plan carefully around neighboring trees.",
  },
  {
    q: "Can you work on my property if I have limited road access?",
    a: "Yes, but it affects approach and timeline. We bring smaller equipment, hand-fall larger trees, and use rigging to lower sections safely in tight spaces. Some properties may require helicopter work for extremely limited access—we'll assess during an estimate.",
  },
  {
    q: "What about the San Lorenzo River flooding—how does that affect tree work?",
    a: "Heavy rain can trigger flooding in low-lying areas near the river. Trees that partially overhang the river or sit in flood zones may need removal or major pruning to reduce weight. We assess flood risk and recommend mitigation work.",
  },
  {
    q: "How do I manage trees around Henry Cowell Redwoods State Park?",
    a: "If your property adjoins the park, park regulations may apply. Some work may require coordination with state parks. We're familiar with those requirements and can guide you through the process.",
  },
  {
    q: "The redwoods next to my house are huge—should I be worried?",
    a: "Old-growth redwoods are generally healthy and stable, but size and proximity matter. We assess lean, root condition, decay, and risk to structures. Often the safest approach is strategic pruning to reduce wind load—not removal.",
  },
  {
    q: "My neighbors' trees are hanging over my property—what can I do?",
    a: "You can trim limbs that cross the property line at the line itself. For major conflicts, talk to neighbors first. If removal is needed, usually the tree owner is responsible. We can help with assessment and negotiation.",
  },
] as const;

export default function FeltonPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Felton",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Felton, CA" },
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
          Tree Service in Felton, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Felton is a small mountain town in the San Lorenzo Valley, nestled in dense old-growth redwood forest.
          Most homes are built among massive Coast Redwoods, Douglas Firs, and Tan Oaks—creating unique challenges
          for tree care, property access, and flood risk management. We specialize in close-quarters work, limited-access
          properties, and the particular needs of homes surrounded by forest giants near Henry Cowell Redwoods State Park.
        </p>
      </header>

      {/* Common Tree Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Felton</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Old-growth neighbors & tight access">
            Many Felton properties are built into dense redwood stands with minimal road access. Tree work requires careful
            rigging and small equipment. Removing or major pruning near old-growth trees demands precise planning to avoid
            damage to remaining canopy.
          </InfoCard>
          <InfoCard title="San Lorenzo River flood risk">
            Low-lying properties near the river face seasonal flooding. Trees overhanging the river or with heavy canopy in
            flood zones should be evaluated for removal or weight reduction. Flooding can destabilize roots and create hazards.
          </InfoCard>
          <InfoCard title="Dense canopy & disease spread">
            Crowded redwood and fir stands increase susceptibility to pathogens and pests. Dead trees go unnoticed in dense canopy.
            Selective thinning improves health and makes hazard identification easier. It also reduces wildland-urban interface
            fire risk.
          </InfoCard>
          <InfoCard title="Big Leaf Maple limbs and debris">
            Big Leaf Maples are common in Felton's understory. Large, heavy limbs fail regularly in wind and rain. Year-round cleanup
            and strategic pruning reduce risk to structures and utilities below. Fallen limbs are a consistent hazard.
          </InfoCard>
        </div>
      </section>

      {/* Services Available */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available in Felton</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/services/tree-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Specialized removal in tight spaces—hand-falling, rigging, and careful debris management for forest properties.
            </p>
          </li>
          <li>
            <Link href="/services/tree-trimming" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Trimming & Pruning →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Crown reduction for weight management, limb removal over structures, and health pruning in dense stands.
            </p>
          </li>
          <li>
            <Link href="/services/stump-grinding-root-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Stump Grinding & Root Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Grind stumps below grade in forest settings; handle root regrowth and root plate stabilization on slopes.
            </p>
          </li>
          <li>
            <Link href="/services/emergency-tree-service" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Emergency Tree Service →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Rapid response for fallen trees, storm damage, and urgent hazards in forested areas.
            </p>
          </li>
          <li>
            <Link href="/services/arborist-consulting" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Arborist Consulting →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Expert assessment of forest health, hazard identification, and long-term tree management strategy.
            </p>
          </li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Felton Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Request a Free Estimate in Felton"
        body="Tell us about your trees, property access, and any concerns. We'll assess feasibility and provide a clear plan for forest property work."
        primaryHref="/free-estimate"
        primaryLabel="Request an Estimate"
      />

      <Link className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition" href="/service-areas">
        ← Back to Service Areas
      </Link>

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Felton")) }}
      />
    </main>
  );
}
