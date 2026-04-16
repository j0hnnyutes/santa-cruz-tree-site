import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";
import CityHero from "@/components/CityHero";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/boulder-creek";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Boulder Creek, CA",
  description:
    "Professional tree removal and fire mitigation in Boulder Creek—post-CZU fire recovery, defensible space, and mountain terrain specialists.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Boulder Creek, CA | Santa Cruz Tree Pros",
    description:
      "Expert tree care and fire recovery in Boulder Creek—managing wildfire damage and defensible space in remote mountain terrain.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `${siteUrl}/api/og?title=Tree+Service+in+Boulder+Creek%2C+CA&photo=tree-removal-with-crane`,
        width: 1200,
        height: 630,
        alt: "Tree Service in Boulder Creek, CA — Santa Cruz Tree Pros",
      },
    ],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Are there still fire-damaged trees from the CZU Complex fire that need removal?",
    a: "Yes. Many properties still have scorched, compromised trees that pose hazards as they continue to weaken and fail. Removal is often the safest option, though some trees recover depending on burn severity. We assess damage and recommend removal or monitoring based on structural risk.",
  },
  {
    q: "How do I rebuild defensible space after the CZU fire?",
    a: "Start by removing dead/dying trees from the removal itself, then thin remaining canopy to reduce density, clear ladder fuels (low branches), and maintain spacing between tree crowns. This typically requires 30+ feet of cleared space around structures. We work with fire agencies and create phased plans.",
  },
  {
    q: "Can you remove trees on steep terrain with limited road access?",
    a: "Yes—that's a specialty. We hand-fall trees, use rigging, and bring smaller equipment or even generator-powered tools where conventional machinery can't reach. Very steep/remote properties may require multiple trips or specialized techniques.",
  },
  {
    q: "My property is off-grid/generator-powered—can you still work there?",
    a: "Absolutely. Many Boulder Creek properties are generator-dependent. We bring equipment suited for remote settings, schedule accordingly, and coordinate around your power availability. Communication and planning are key.",
  },
  {
    q: "Are Knobcone Pines and Douglas Firs safe to keep, or should I remove them?",
    a: "Both can be healthy and valuable. Knobcone Pines are fire-adapted. Assessment depends on tree health, proximity to structures, canopy density, and your defensible space goals. Often thinning and pruning preserve them while improving safety.",
  },
  {
    q: "What's the timeline for post-fire tree removal work?",
    a: "That depends on property access, tree size, slope, and current permit queues. Boulder Creek work often takes longer than flatter areas due to terrain. We'll give realistic timelines during your estimate and explain any bottlenecks.",
  },
] as const;

export default function BoulderCreekPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Boulder Creek",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Boulder Creek, CA" },
    serviceType: "Tree Removal, Fire Mitigation, Defensible Space",
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
        heading="Tree Service in Boulder Creek, CA"
        subheading="Hazard removal, fire-damaged trees, and steep terrain specialists"
        imgSrc="/assets/chainsaw.webp"
      />
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 space-y-12">

        <p className="text-[var(--muted)] leading-7">
          Boulder Creek is the most remote of our service areas—a mountain community in the upper San Lorenzo Valley surrounded by dense forest and steep terrain. Many properties were directly affected by the 2020 CZU Lightning Complex fire and continue to deal with fire-damaged trees, post-fire recovery, and defensible space requirements. We specialize in challenging access, remote properties, fire mitigation, and working safely on slopes where conventional equipment simply cannot go.
        </p>

      {/* Common Tree Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Boulder Creek</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="CZU fire damage & dead/dying trees">
            The 2020 fire left thousands of acres scarred. Many properties have scorched, weakened trees that now pose hazards
            as they continue to fail. We systematically identify and remove dangerous fire-damaged timber while preserving trees
            with recovery potential.
          </InfoCard>
          <InfoCard title="Defensible space & fuel reduction">
            Post-fire code requirements and safety demand 30+ feet of cleared space around structures. We remove ladder fuels,
            thin dense canopy, and create spacing between crowns. This is ongoing work—defensible space needs renewal every 3–5 years.
          </InfoCard>
          <InfoCard title="Steep terrain & limited road access">
            Boulder Creek's mountainous terrain limits equipment access. Many properties require hand-falling, rigging, smaller machinery,
            or even helicopter work. Slope instability requires careful planning to avoid erosion and secondary hazards.
          </InfoCard>
          <InfoCard title="Off-grid power & remote property logistics">
            Many Boulder Creek homes are generator-dependent or completely off-grid. We coordinate around power availability and
            access constraints. Communication and flexible scheduling are essential for successful remote work.
          </InfoCard>
        </div>
      </section>

      {/* Services Available */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available in Boulder Creek</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/services/tree-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Specialized removal of fire-damaged, hazardous, or overcrowded trees using hand-falling, rigging, and mountain-terrain techniques.
            </p>
          </li>
          <li>
            <Link href="/services/tree-trimming" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Tree Trimming & Pruning →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Crown thinning, defensible space clearance, ladder fuel removal, and weight reduction on steep slopes.
            </p>
          </li>
          <li>
            <Link href="/services/stump-grinding-root-removal" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Stump Grinding & Root Removal →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Grind stumps below grade and manage root regrowth on mountainous terrain; stabilize slopes after removal.
            </p>
          </li>
          <li>
            <Link href="/services/emergency-tree-service" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Emergency Tree Service →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Rapid response for fallen trees, storm damage, and urgent safety hazards in remote areas.
            </p>
          </li>
          <li>
            <Link href="/services/arborist-consulting" className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition">
              Arborist Consulting →
            </Link>
            <p className="text-[var(--muted)] mt-1">
              Post-fire recovery planning, defensible space strategy, fire-adapted species assessment, and long-term mountain property management.
            </p>
          </li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Boulder Creek Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Request a Free Estimate in Boulder Creek"
        body="Tell us about your property, access challenges, and any fire damage or defensible space concerns. We'll assess feasibility and create a realistic plan."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Boulder Creek")) }}
      />
    </main>
    </>
  );
}