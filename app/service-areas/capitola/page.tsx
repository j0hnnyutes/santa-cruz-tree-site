import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/capitola";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Capitola, CA",
  description:
    "Professional tree removal and emergency services in Capitola village. Specialists in creek erosion, tight lot access, and heritage tree preservation.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Capitola, CA | Santa Cruz Tree Pros",
    description:
      "Expert tree care for Capitola’s dense neighborhoods and Soquel Creek area. Erosion mitigation, emergency response, and heritage tree assessment.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "How do you work in Capitola’s dense village neighborhoods?",
    a: "Capitola Village has tight residential lots with mature trees and limited equipment access. We use rope rigging, sectional removal, and hand-operated equipment to work safely in constrained spaces without damaging neighbor properties, fences, and landscaping.",
  },
  {
    q: "What’s the flooding risk near Soquel Creek, and how does it affect trees?",
    a: "Soquel Creek has a history of flooding in winter, especially during high water years. Trees near the creek bank experience erosion, root stress, and limb damage from water flow. We assess flood-vulnerable trees and recommend removal or erosion mitigation if needed.",
  },
  {
    q: "Are there protected or heritage trees in Capitola I should know about?",
    a: "Yes. Capitola has heritage tree designations and protected species lists. Some old Monterey Pines and Redwoods may be protected. We’ll identify protected trees during your estimate and advise on any permitting or preservation requirements.",
  },
  {
    q: "How do creek bank erosion and tree roots interact?",
    a: "Tree roots help stabilize banks, but severely undermined trees can fall into the creek during floods. Conversely, removing large trees without erosion control can accelerate bank loss. We assess slope stability and recommend solutions that balance tree preservation with safety.",
  },
  {
    q: "What should I do if a tree is leaning toward my neighbor’s house?",
    a: "Contact us for an assessment. If the tree is healthy but leaning, pruning and support may help. If decay or root failure is present, removal is often safer and more reliable than attempting to save it. We’ll advise on the best option and discuss it with you.",
  },
  {
    q: "Can you help with tree preservation in Capitola Village?",
    a: "Absolutely. If you have heritage or protected trees, we provide arborist assessment and can recommend preservation strategies—structural pruning, cabling, and management plans that keep valuable trees healthy and safe.",
  },
] as const;

const localIssues = [
  {
    title: "Soquel Creek erosion and bank stability",
    children:
      "Trees near creek banks face erosion from winter flooding and water scouring. We assess root exposure and bank stability, then recommend removal or erosion control measures to prevent sudden failure and property loss.",
  },
  {
    title: "Tight lot access and narrow driveways",
    children:
      "Capitola Village’s dense neighborhoods have small properties and limited equipment space. We use rope rigging and sectional removal techniques to safely work around homes, fences, and landscaping without damaging neighboring properties.",
  },
  {
    title: "Heritage tree preservation and ordinances",
    children:
      "Some old Monterey Pines, Redwoods, and landmark trees are protected. We assess heritage tree health, recommend preservation strategies, and coordinate with city requirements to keep valuable trees safe and compliant.",
  },
  {
    title: "Winter storm damage and fallen trees",
    children:
      "Wet winter soil, heavy rainfall, and high creek levels create hazard conditions. Storm-damaged trees can block access and threaten property. We respond quickly to emergencies and clear hazards safely.",
  },
];

export default function CapitolaPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service in Capitola",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Capitola, CA",
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
          Tree Service in Capitola, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Capitola’s charming village setting features dense residential neighborhoods, Soquel Creek erosion challenges, and
          heritage trees requiring specialized care. We provide expert tree removal, emergency response, and arborist consulting
          tailored to Capitola’s tight access, creek-side hazards, and protected tree requirements.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Capitola</h2>
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
              Controlled removal using rope rigging for tight spaces, erosion-prone areas, and heritage tree alternatives.
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
              Structural pruning and health improvement while preserving heritage trees and managing erosion risk.
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
              Grind stumps below grade while protecting neighboring properties and managing erosion concerns.
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
              Rapid response to storm damage, erosion emergencies, and fallen trees threatening Capitola properties.
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
              Expert assessment of heritage trees, creek-side hazards, erosion risk, and preservation strategies.
            </p>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Capitola Tree Service FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Schedule a Free Estimate in Capitola"
        body="Tell us about your trees, erosion concerns, or access challenges. We’ll assess safety, heritage considerations, and local requirements—then recommend the best solution."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Capitola")) }}
      />
    </main>
  );
}
