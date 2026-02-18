import type { Metadata } from "next";
import ServiceCta from "@/components/ServiceCta";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/tree-trimming";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Trimming & Pruning in Santa Cruz, CA | Improve Tree Health",
  description:
    "Professional tree trimming in Santa Cruz. Structural pruning, storm risk reduction, and canopy balancing for coastal conditions.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Trimming & Pruning in Santa Cruz, CA | Improve Tree Health",
    description:
      "Professional tree trimming in Santa Cruz. Structural pruning, storm risk reduction, and canopy balancing for coastal conditions.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tree Trimming & Pruning in Santa Cruz, CA | Improve Tree Health",
    description:
      "Professional tree trimming in Santa Cruz. Structural pruning, storm risk reduction, and canopy balancing for coastal conditions.",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "When is the best time to trim trees in Santa Cruz?",
    a: "Timing depends on species. Many trees are best pruned outside peak growth or during dormancy to reduce stress and improve healing.",
  },
  {
    q: "Does trimming help prevent storm damage?",
    a: "Yes. Removing weak, dead, or overextended limbs reduces the likelihood of breakage during coastal winds and winter storms.",
  },
  {
    q: "How often should trees be pruned?",
    a: "Most mature trees benefit from evaluation every 1–3 years. Younger trees may need more frequent structural pruning early on.",
  },
  {
    q: "Is tree topping recommended?",
    a: "Topping is generally avoided because it can weaken structure and increase long-term risk. Structural pruning is the preferred approach.",
  },
] as const;

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Tree Trimming & Pruning",
        serviceType: "Tree trimming and pruning",
        areaServed: {
          "@type": "City",
          name: "Santa Cruz",
          address: { "@type": "PostalAddress", addressRegion: "CA", addressCountry: "US" },
        },
        provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
        url: pageUrl,
        description:
          "Strategic pruning to improve structure, reduce storm risk, and support long-term tree health in Santa Cruz coastal conditions.",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: pageUrl,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default function TreeTrimmingPage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Tree Trimming in Santa Cruz</h1>

      <p className="mt-4 text-base leading-7">
        Santa Cruz trees face coastal winds, seasonal storms, and salt air exposure that can stress canopies and
        increase the chance of limb failure. Strategic trimming improves structural integrity, reduces risk over homes
        and walkways, and keeps growth balanced for long-term health.
      </p>
      <p className="mt-3 text-base leading-7">
        Professional pruning focuses on targeted cuts that support the tree’s natural form—prioritizing safety, storm
        resilience, and healthier growth patterns rather than cosmetic over-cutting.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Services May Include</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Deadwood removal</li>
          <li>Clearance pruning (rooflines, driveways, walkways)</li>
          <li>Structural pruning for young trees</li>
          <li>Canopy thinning where appropriate</li>
          <li>Risk-reduction trimming before storm season</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Benefits</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Improved safety around structures and high-traffic areas</li>
          <li>Better airflow and light penetration</li>
          <li>Stronger branch structure over time</li>
          <li>Reduced risk of storm-related breakage</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">FAQs</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm leading-6">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <ServiceCta
        heading="Request a Free Trimming Estimate"
        body="We’ll assess your trees and recommend pruning that improves safety, structure, and storm resilience—without over-cutting."
        secondaryHref="tel:+1XXXXXXXXXX"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </main>
  );
}