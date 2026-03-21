import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/scotts-valley";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Scotts Valley, CA",
  description:
    "Professional tree removal, trimming, defensible space, and fire mitigation in Scotts Valley. Power line clearance and wildfire risk management for Highway 17 corridor.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Scotts Valley, CA | Santa Cruz Tree Pros",
    description:
      "Expert tree care for Scotts Valley's forested neighborhoods—wildfire defense, power line management, and hazard mitigation.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "What is defensible space and why does Scotts Valley need it?",
    a: "Defensible space is a cleared zone around your home (typically 30+ feet) that reduces wildfire risk. Scotts Valley is a high-risk wildland-urban interface area. Local fire safety ordinances often require defensible space. We remove dead/diseased trees, thin dense canopy, and clear branches over roofs.",
  },
  {
    q: "Do I need a permit for tree work in Scotts Valley?",
    a: "Yes. Scotts Valley requires permits for most tree removal and significant pruning. Some work qualifies for emergency exemptions if it's wildfire hazard mitigation. We'll flag permit needs and help navigate the process.",
  },
  {
    q: "Can you trim or remove trees near power lines in Scotts Valley?",
    a: "We handle power line clearance for most situations. For lines directly on your property, we work with the utility. For trees in conflict with lines, we recommend removal or major reduction. Call for an assessment.",
  },
  {
    q: "My property has redwoods and Douglas Firs—should I thin them for fire safety?",
    a: "Generally yes, especially in Scotts Valley's high-risk zone. Thinning reduces fuel load, improves individual tree health, and improves defensible space. We'll assess density, species mix, and risk during an estimate.",
  },
  {
    q: "How often should I have defensible space work done?",
    a: "Plan for major work every 3–5 years, with annual cleanup and monitoring. After removal or thinning, branches regrow. Regular maintenance keeps your property compliant and safe.",
  },
  {
    q: "What's the difference between trimming for health and trimming for fire safety?",
    a: "Health pruning improves structure and removes diseased limbs. Fire mitigation prioritizes clearing canopy over structures, removing ladder fuels (low branches), and thinning dense stands. We recommend both—a healthy tree is a safer tree.",
  },
] as const;

export default function ScottsValleyPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Scotts Valley",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Scotts Valley, CA" },
    serviceType: "Tree Removal, Trimming, Fire Mitigation, Defensible Space",
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
          Tree Service in Scotts Valley, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Scotts Valley's suburban neighborhoods are deeply embedded in forested hillsides—a transition zone
          between coastal redwood forest and oak woodland. Located along Highway 17, Scotts Valley faces significant
          wildfire risk and power line management challenges. We help residents and property managers implement
          defensible space, manage dense canopy, clear utility conflicts, and maintain healthy trees in a high-risk
          wildland-urban interface.
        </p>
      </header>

      {/* Common Tree Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Scotts Valley</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Wildfire risk & canopy density">
            Heavy tree canopy over homes creates ladder fuels and increases ember exposure. Scotts Valley's high-risk
            rating means defensible space is essential. We remove dead/dying trees, thin dense stands, and clear branches
            over structures to reduce fire spread risk.
          </InfoCard>
          <InfoCard title="Power line conflicts">
            Many Scotts Valley streets have power lines in or near tree canopy. Overhanging branches cause outages and fire
            risk. We trim for clearance or recommend removal. Coordination with utilities is part of the plan.
          </InfoCard>
          <InfoCard title="Redwood and Douglas Fir health in crowded stands">
            Overcrowded conifers compete for water and nutrients, leading to stress, pest vulnerability, and higher disease
            risk. Selective thinning opens canopy, improves air circulation, and strengthens remaining trees.
          </InfoCard>
          <InfoCard title="Permit requirements & fire ordinances">
            Scotts Valley's local codes require permits for most tree work and often mandate defensible space. We help navigate
            requirements and identify work that qualifies for wildfire mitigation exemptions.
          </InfoCard>
        </div>
      </section>

      {/* Services Available */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available in Scotts Valley</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/services/tree-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Safe removal of hazardous, dead, or fire-risk trees with full cleanup and debris haul.
            </p>
          </li>
          <li>
            <Link href="/services/tree-trimming" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Trimming & Pruning →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Crown reduction, defensible space clearance, and structural pruning for health and fire safety.
            </p>
          </li>
          <li>
            <Link href="/services/stump-grinding-root-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Stump Grinding & Root Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Remove stumps and regrowth below grade to reclaim space and eliminate fire hazards.
            </p>
          </li>
          <li>
            <Link href="/services/emergency-tree-service" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Emergency Tree Service →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Rapid response for storm damage, fallen trees, and urgent safety hazards.
            </p>
          </li>
          <li>
            <Link href="/services/arborist-consulting" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Arborist Consulting →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Expert assessment of tree health, wildfire risk, defensible space strategy, and utility conflicts.
            </p>
          </li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Scotts Valley Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Request a Free Estimate in Scotts Valley"
        body="Tell us about your trees, defensible space needs, and any utility conflicts. We'll assess risk and provide a clear plan."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Scotts Valley")) }}
      />
    </main>
  );
}
