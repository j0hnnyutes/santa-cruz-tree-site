import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";
import CityHero from "@/components/CityHero";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/watsonville";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Watsonville, CA",
  description:
    "Professional tree removal and pruning services in Watsonville. Specialists in agricultural windbreak management and Pajaro Valley flood-risk assessment.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Watsonville, CA | Santa Cruz Tree Pros",
    description:
      "Expert tree care for agricultural and residential properties in Watsonville’s Pajaro Valley. Windbreak maintenance, removal, and emergency response.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `${siteUrl}/api/og?title=Tree+Service+in+Watsonville%2C+CA&photo=tree-removal-with-crane`,
        width: 1200,
        height: 630,
        alt: "Tree Service in Watsonville, CA — Santa Cruz Tree Pros",
      },
    ],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Why is windbreak maintenance important for Watsonville farms?",
    a: "Eucalyptus and other windbreaks protect crops and buildings from valley winds. Regular pruning maintains their structure and effectiveness. We help farmers assess windbreak health and recommend removal or replanting when trees become hazardous or less effective.",
  },
  {
    q: "How do I know if my farm windbreak needs attention?",
    a: "Look for dead limbs, lean, large cavities, or uneven growth that reduces wind protection. Heavy limb loss after wind or storms is a sign of stress. We’ll evaluate your windbreak during a site visit and advise on pruning, removal, or replacement.",
  },
  {
    q: "What’s the Pajaro Valley flooding risk, and how does it affect trees?",
    a: "The Pajaro River and Pajaro Valley Slough create seasonal flooding risk, especially in winter. Trees in low-lying areas may experience root stress, erosion, or limb damage during high water. We help assess trees in flood-prone zones and recommend removal or mitigation if needed.",
  },
  {
    q: "Do you offer bilingual service for Spanish-speaking property owners?",
    a: "Yes, we can arrange bilingual consultation and communication for tree assessments and project planning. Please mention your language preference when you contact us to request an estimate.",
  },
  {
    q: "What’s typical for Valley Oak and Coast Live Oak care in Watsonville?",
    a: "Both are well-adapted to Pajaro Valley conditions but benefit from strategic pruning to reduce limb failure risk and improve structure. We avoid over-pruning and focus on health-driven cuts. If disease or significant decay is present, we’ll advise on removal or preservation strategies.",
  },
  {
    q: "How do you handle tree work on active agricultural land?",
    a: "We coordinate timing with your farming schedule, protect nearby crops and irrigation systems, and minimize soil disturbance. We can discuss access, timing, and site-specific requirements during your estimate.",
  },
] as const;

const localIssues = [
  {
    title: "Farm windbreak health and effectiveness",
    children:
      "Eucalyptus and other windbreaks lose structural integrity over time, reducing wind protection and increasing hazard risk. We assess canopy density, lean, and large limbs, then recommend targeted pruning or strategic removal and replanting.",
  },
  {
    title: "Pajaro Valley flood risk and root stress",
    children:
      "Seasonal flooding and high water tables stress trees in low-lying areas, promoting root rot and erosion. We identify flood-vulnerable trees and advise on removal or protection measures to prevent hazard during winter weather.",
  },
  {
    title: "Drought stress and Valley Oak decline",
    children:
      "Valley Oak and other native species experience stress during dry years. Proper pruning and removal of deadwood help preserve healthy trees. If significant decline occurs, removal may be necessary to prevent sudden failure.",
  },
  {
    title: "Limb failure in agricultural areas",
    children:
      "Heavy limb drop in windbreaks can damage farm equipment, buildings, and irrigation infrastructure. Regular assessment and pruning of weak branches reduces risk and maintains windbreak effectiveness throughout the growing season.",
  },
];

export default function WatsonvillePage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Watsonville",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Watsonville, CA",
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
    <>
      <CityHero
        heading="Tree Service in Watsonville, CA"
        subheading="Agricultural and residential tree care across the Pajaro Valley"
        imgSrc="/assets/tree-removal-with-crane.webp"
      />
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 space-y-12">

        <p className="text-[var(--muted)] leading-7">
          Watsonville’s agricultural heritage and Pajaro Valley location create unique tree management challenges—from farm windbreak effectiveness and seasonal flooding risk to native oak preservation. We provide specialized tree removal, pruning, and emergency response for both farm and residential properties in the Watsonville area.
        </p>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Watsonville</h2>
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
              Safe removal of hazardous, dead, or unwanted trees with minimal disruption to farms and residential areas.
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
              Windbreak maintenance, health pruning, and structural improvement for farm and residential trees.
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
              Grind stumps below grade for landscaping and prepare farmland for replanting or irrigation modifications.
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
              Rapid response to storm damage, fallen trees, and hazardous limbs threatening structures and farm operations.
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
              Professional assessment of windbreak health, native oak preservation, and flood-risk evaluation for Watsonville properties.
            </p>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Watsonville Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Schedule a Free Estimate in Watsonville"
        body="Tell us about your property, windbreaks, or trees. We’ll assess local conditions, flooding risk, and agricultural impacts—then provide a clear plan."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Watsonville")) }}
      />
    </main>
    </>
  );
}