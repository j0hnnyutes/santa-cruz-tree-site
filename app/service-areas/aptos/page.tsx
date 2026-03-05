import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/aptos";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Aptos, CA | Santa Cruz Tree Pros",
  description:
    "Professional tree removal, trimming, and emergency services in Aptos. Storm damage, hazard assessment, and coastal wind management for Aptos Village and Rio del Mar.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Aptos, CA | Santa Cruz Tree Pros",
    description:
      "Expert tree care for coastal Aptos, from storm cleanup to preventive trimming in salt-air conditions.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Why do Aptos coastal trees need different care than inland trees?",
    a: "Salt air, persistent coastal wind, and sandy soils stress trees differently. Monterey Pines and Coast Live Oaks in Aptos require structural pruning and hazard assessment more frequently than inland varieties. Storm events can rapidly develop dangerous lean and limb failure.",
  },
  {
    q: "What should I do after a storm like the 2023 atmospheric rivers?",
    a: "Call for a hazard assessment right away. We'll identify broken limbs, structural damage, and root plate failure before secondary damage worsens. Even trees that look okay may have internal root damage or hidden cracks that create safety risks.",
  },
  {
    q: "How do I know if my Monterey Pine is at risk?",
    a: "Watch for signs of decay, lean towards your home or roof, limbs already failed, or canopy dieback. Monterey Pines are prone to pitch canker and other diseases. If you see yellowing needles, gumming trunk, or sparse foliage, get an assessment.",
  },
  {
    q: "Can you work on hillside properties in Aptos?",
    a: "Yes. Many Aptos properties have significant slope. We bring specialized equipment and rigging for hillside work, though access limitations may affect timeline and approach. We'll assess feasibility and safety during the estimate.",
  },
  {
    q: "Should I remove a tree leaning toward the coast?",
    a: "Not necessarily—lean alone doesn't mean failure. But coastal wind loading is extreme in Aptos. If the lean is combined with decay, thin root plate, or age, we recommend removal or major structural work. Let us evaluate the specific tree.",
  },
  {
    q: "Do I need a permit to remove or trim trees in Aptos?",
    a: "Aptos follows Santa Cruz County guidelines. Many trees require permits; some heritage trees have additional protections. We'll flag permit needs during your estimate and guide you through the process.",
  },
] as const;

export default function AptosPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Aptos",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Aptos, CA" },
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
          Tree Service in Aptos, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Aptos sits in the heart of Santa Cruz County's coastal zone—where salt air, persistent
          wind, and winter storms challenge tree health and safety. From Aptos Village to Rio del Mar
          to the Seacliff State Beach area, we help property owners manage Monterey Pines, Coast Live Oaks,
          and canyon redwoods through hazard mitigation, storm cleanup, and preventive care.
        </p>
      </header>

      {/* Common Tree Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Aptos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Storm damage & coastal wind failure">
            Atmospheric river events in 2023 left many Aptos properties with broken limbs and uprooted trees.
            Coastal wind loads are extreme here. We assess damage quickly and recommend removal or structural
            repair based on safety and your goals.
          </InfoCard>
          <InfoCard title="Monterey Pine health">
            Pitch canker, insect stress, and age make older Monterey Pines frequent hazards. Canopy dieback
            and gumming trunk signal trouble. Early removal prevents sudden failure and cleanup costs.
          </InfoCard>
          <InfoCard title="Hillside erosion & slope failure">
            Aptos neighborhoods have steep terrain and erosion-prone soils. Tree roots provide slope stability;
            removal must account for erosion risk. We coordinate trimming and removal with slope protection.
          </InfoCard>
          <InfoCard title="Redwood and oak crowding in canyons">
            Aptos Creek canyon and similar areas have dense redwood and oak stands. Overcrowding increases disease
            spread, limb failure, and fire risk. Selective thinning opens canopy and improves health.
          </InfoCard>
        </div>
      </section>

      {/* Services Available */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available in Aptos</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/services/tree-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Safe removal of dead, diseased, storm-damaged, or hazardous trees—with full cleanup and debris haul.
            </p>
          </li>
          <li>
            <Link href="/services/tree-trimming" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Trimming & Pruning →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Structural pruning, crown reduction, and coastal wind management to reduce limb failure risk.
            </p>
          </li>
          <li>
            <Link href="/services/stump-grinding-root-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Stump Grinding & Root Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Grind stumps below grade to reclaim usable space and eliminate hazards and regrowth.
            </p>
          </li>
          <li>
            <Link href="/services/emergency-tree-service" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Emergency Tree Service →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Rapid response for storm damage, fallen trees, and urgent hazards threatening homes or utilities.
            </p>
          </li>
          <li>
            <Link href="/services/arborist-consulting" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Arborist Consulting →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Expert assessment of tree health, hazard, and mitigation strategies for slopes, coastal exposure, and storm risk.
            </p>
          </li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Aptos Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Request a Free Estimate in Aptos"
        body="Tell us about your trees, property, and concerns. We'll provide a clear assessment and transparent pricing."
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
    </main>
  );
}
