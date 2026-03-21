import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/ben-lomond";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Ben Lomond, CA",
  description:
    "Specialized tree care for Ben Lomond's redwood forests and mountain terrain. Expert rigging on slopes, storm recovery, and forest health consulting.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Ben Lomond, CA | Santa Cruz Tree Pros",
    description:
      "Forest and slope management for Ben Lomond—redwood removal, CZU fire recovery, limited access rigging, and San Lorenzo Valley expertise.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "How do you remove trees on steep slopes or with limited vehicle access?",
    a: "We use specialized rigging, rope systems, and sectional lowering to work safely on slopes where bucket trucks can't reach. We hand-fell where appropriate and pack gear in on foot. It's slower than flat-ground work, but we're equipped for Ben Lomond's terrain challenges.",
  },
  {
    q: "My property was affected by the CZU fire. What should I do about damaged or weakened trees?",
    a: "Fire-damaged trees can fail suddenly—especially in winter storms. We assess damage, identify hazards, and recommend removal or monitoring. Many Ben Lomond properties need post-fire cleanup and forest thinning to improve long-term health and wildfire resilience.",
  },
  {
    q: "Are redwoods protected or restricted in Ben Lomond?",
    a: "Coast Redwoods are generally not automatically protected, but Ben Lomond's forest character is important to the community. If a tree is hazardous or dead, removal is usually permitted, but we'll always flag heritage or scenic trees during your estimate.",
  },
  {
    q: "How do I reduce flood and erosion risk from trees on the San Lorenzo River slope?",
    a: "Trees on slopes above the river can increase erosion and create debris flow risk during heavy rain. We assess root stability, recommend strategic thinning to improve drainage, and suggest removal or cabling for trees that might fail. Professional assessment is worth the investment for steep properties.",
  },
  {
    q: "Can you help with forest thinning to reduce fire risk?",
    a: "Yes. We can thin dense forest, remove dead or diseased trees, prune lower branches, and clear debris to improve defensible space and forest health. This is especially valuable for Ben Lomond properties rebuilding after the CZU fire.",
  },
  {
    q: "What's the best way to access my property for tree work if the road is narrow or steep?",
    a: "We scout access beforehand and may use alternative methods—pack animals, foot traffic, or equipment carried in by hand. It takes more time and planning, but we know how to work in mountain conditions without damaging your property or our gear.",
  },
] as const;

export default function BenLomondPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Ben Lomond, CA" },
    serviceType: "Slope Tree Removal, Forest Management, and Rigging",
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
          Tree Service in Ben Lomond, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Ben Lomond's heavily forested slopes, San Lorenzo River proximity, and limited vehicle access require
          specialized tree care expertise. Between post-CZU fire recovery, erosion management, and the challenges of
          working in steep terrain, we provide solutions built for mountain conditions.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Ben Lomond</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="CZU Fire Recovery & Damage Assessment">
            Many Ben Lomond properties still have fire-damaged or stressed trees that pose hazards in winter storms.
            Burned redwoods and conifers can fail without warning. We assess damage, identify trees that need removal,
            and plan forest recovery that improves both safety and long-term resilience.
          </InfoCard>

          <InfoCard title="Steep Slope & Limited Access Challenges">
            Houses on slopes often have difficult driveway access and trees that bucket trucks can't reach. We use
            rope rigging, sectional removal, and specialized equipment to work safely in terrain where standard
            methods don't apply. It requires skill and planning, but we're built for it.
          </InfoCard>

          <InfoCard title="San Lorenzo River Erosion & Flooding">
            Trees on slopes above the river can increase erosion risk and contribute to debris flow during heavy rain.
            Strategic thinning improves drainage; removing dead or hazardous trees reduces the chance of blockages or
            damage below. We assess each property's specific risk.
          </InfoCard>

          <InfoCard title="Dense Forest & Wildfire Risk">
            Overstocked forest increases wildfire spread and beetle infestation. After CZU, many Ben Lomond residents
            are proactively thinning to reduce risk and improve forest health. We can design and execute forest
            thinning that creates defensible space without destroying the character of your property.
          </InfoCard>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available in Ben Lomond</h2>

        <div className="space-y-3">
          <p className="text-[var(--muted)] leading-7">
            Specialized tree care for Ben Lomond's unique conditions:
          </p>

          <ul className="space-y-2">
            <li>
              <Link
                href="/services/tree-removal"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Tree Removal
              </Link>
              — Slope rigging, sectional lowering, and specialized access techniques for terrain where standard
              equipment won't fit.
            </li>
            <li>
              <Link
                href="/services/tree-trimming"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Tree Trimming & Pruning
              </Link>
              — Forest thinning, lower-branch pruning for fire safety, and canopy work on steep ground.
            </li>
            <li>
              <Link
                href="/services/stump-grinding-root-removal"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Stump Grinding & Root Removal
              </Link>
              — Remove stumps and address erosion-prone root systems on slopes.
            </li>
            <li>
              <Link
                href="/services/emergency-tree-service"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Emergency Tree Service
              </Link>
              — Fast response for storm-felled trees, fallen limbs, and hazards that block access or threaten
              structures.
            </li>
            <li>
              <Link
                href="/services/arborist-consulting"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Arborist Consulting
              </Link>
              — Forest health assessment, post-fire recovery planning, and long-term management strategy.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ben Lomond Tree Care FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Request a Free Estimate in Ben Lomond"
        body="Tell us about your trees, property slope, access challenges, and any fire recovery concerns. We'll plan a site visit that fits mountain conditions and recommend solutions for your specific situation."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Ben Lomond")) }}
      />
    </main>
  );
}
