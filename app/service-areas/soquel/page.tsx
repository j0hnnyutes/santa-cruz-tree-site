import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";
import CityHero from "@/components/CityHero";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/soquel";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Soquel, CA",
  description:
    "Professional tree removal and emergency services in Soquel. Specialists in hillside properties, redwood groves, and wildfire risk mitigation.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Soquel, CA | Santa Cruz Tree Pros",
    description:
      "Expert tree care for Soquel’s hillside properties and redwood forests. Fire risk assessment, steep terrain work, and emergency response.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `${siteUrl}/api/og?title=Tree+Service+in+Soquel%2C+CA&photo=tree-removal-with-crane`,
        width: 1200,
        height: 630,
        alt: "Tree Service in Soquel, CA — Santa Cruz Tree Pros",
      },
    ],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "How do you work on steep Soquel hillsides?",
    a: "Soquel’s hillside properties have steep driveways and limited equipment access. We use rope systems, hand-carried equipment, and sectional removal to work safely on slopes. We also assess slope stability to prevent erosion and property loss during tree removal.",
  },
  {
    q: "What’s the fire risk in Soquel’s wildland-urban interface?",
    a: "Soquel sits in the wildland-urban interface with significant fire risk. Dead or weak trees near homes create ignition hazards. We assess fire risk, recommend limbing up lower branches, removing deadwood, and thinning crowded stands to reduce fuel load and defensible space.",
  },
  {
    q: "How should I manage large redwoods on my Soquel property?",
    a: "Historic Coast Redwoods are incredible assets but require careful management. We assess redwood health, recommend strategic pruning to reduce wind load and limb failure risk, and preserve trees when possible. If removal is necessary, we plan rigging carefully to minimize soil disturbance.",
  },
  {
    q: "Are there protected redwood groves in Soquel?",
    a: "Some redwood stands and heritage trees may have protections. We’ll identify protected trees during your site visit and advise on any permitting or preservation requirements before any work begins.",
  },
  {
    q: "What should I do about dead trees in a mixed forest stand?",
    a: "Dead trees (snags) create hazard but also provide wildlife habitat. We can selectively remove hazardous deadwood while preserving safe snags, or clear a stand based on your goals. We’ll discuss the pros and cons during your estimate.",
  },
  {
    q: "How do I prepare my Soquel property for fire season?",
    a: "Defensible space—clearing dead branches, removing small trees under larger ones, and thinning dense brush—reduces fire risk around homes. We can assess your property, create a mitigation plan, and execute the work. Contact your local fire department for guidelines.",
  },
] as const;

const localIssues = [
  {
    title: "Steep terrain and limited equipment access",
    children:
      "Soquel’s hillside properties have steep driveways and tight lot configurations. We use rope rigging and hand-carried equipment to work safely on slopes without heavy machinery. Proper technique prevents erosion and site damage.",
  },
  {
    title: "Fire risk and defensible space",
    children:
      "The wildland-urban interface creates significant fire hazard. Dead trees, low-hanging branches, and crowded stands increase risk. We recommend thinning, deadwood removal, and limbing-up to create defensible space and reduce fuel load around structures.",
  },
  {
    title: "Redwood health and hazard management",
    children:
      "Coast Redwoods are magnificent but require strategic management. We assess health, recommend wind-load reduction pruning, and remove hazardous limbs while preserving these valuable trees when possible. Removal planning accounts for their size and root systems.",
  },
  {
    title: "Storm damage on hillsides",
    children:
      "Winter storms weaken trees on exposed slopes. Saturated soil, high winds, and tree lean increase failure risk. We respond quickly to storm emergencies and assess slope stability to prevent hazard trees from threatening downslope properties.",
  },
];

export default function SoquelPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Soquel",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Soquel, CA",
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
        heading="Tree Service in Soquel, CA"
        subheading="Oak removal, creek-adjacent lots, and wooded hillside tree service"
        imgSrc="/assets/tree-removal-with-crane.webp"
      />
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 space-y-12">

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Soquel</h2>
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
              Expert removal on steep slopes with rope rigging, soil preservation, and careful planning around redwood stands.
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
              Fire-risk reduction, wind-load management, and health pruning for mixed forests and redwood preservation.
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
              Grind stumps with minimal soil disturbance on hillsides and restore ground for replanting or landscaping.
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
              Rapid response to storm damage, fallen trees, and hazard removal on steep slopes and in remote areas.
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
              Fire-risk assessment, defensible space planning, redwood health evaluation, and wildfire mitigation strategies.
            </p>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Soquel Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Schedule a Free Estimate in Soquel"
        body="Tell us about your hillside property, redwoods, or fire concerns. We’ll assess terrain, access challenges, and fire risk—then develop a clear plan."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Soquel")) }}
      />
    </main>
    </>
  );
}