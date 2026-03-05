import type { Metadata } from "next";
import Image from "next/image";
import ServiceCta from "@/components/ServiceCta";
import { FaqBlock } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/arborist-consulting";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Arborist Consulting in Santa Cruz, CA | Tree Risk Assessment",
  description:
    "Professional tree evaluations in Santa Cruz. Health assessments, risk evaluations, and guidance for permits or construction projects.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Arborist Consulting in Santa Cruz, CA | Tree Risk Assessment",
    description:
      "Professional tree evaluations in Santa Cruz. Health assessments, risk evaluations, and guidance for permits or construction projects.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [{ url: `${siteUrl}/assets/tree-moving.webp`, width: 1200, alt: "Arborist consulting and tree evaluation in Santa Cruz" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arborist Consulting in Santa Cruz, CA | Tree Risk Assessment",
    description:
      "Professional tree evaluations in Santa Cruz. Health assessments, risk evaluations, and guidance for permits or construction projects.",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "What is a tree risk assessment?",
    a: "A structured evaluation of tree health, structural integrity, and site conditions to estimate the likelihood of failure and recommend next steps.",
  },
  {
    q: "Can an arborist help with city permits in Santa Cruz?",
    a: "Yes. Written recommendations and documentation can support permit applications or required reporting depending on local requirements.",
  },
  {
    q: "Is removal always necessary if a tree is leaning?",
    a: "Not always. The cause of the lean, soil conditions, root stability, and exposure to wind all affect whether pruning, monitoring, or removal is appropriate.",
  },
  {
    q: "When should I schedule an evaluation?",
    a: "If you notice decline, cracks, significant lean changes, storm damage, or if construction is planned near the root zone.",
  },
] as const;

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Arborist Consulting & Tree Risk Assessment",
        serviceType: "Arborist consulting",
        areaServed: {
          "@type": "City",
          name: "Santa Cruz",
          address: { "@type": "PostalAddress", addressRegion: "CA", addressCountry: "US" },
        },
        provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
        url: pageUrl,
        description:
          "Arborist evaluations for tree health, structural risk, and planning guidance in Santa Cruz coastal and hillside conditions.",
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

export default function ArboristConsultingPage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">Arborist Consulting in Santa Cruz</h1>
        <p className="text-[var(--muted)] leading-7">
          Santa Cruz trees often deal with coastal winds, salt air exposure, slope-related soil movement, and seasonal
          storm cycles that can affect stability over time. Arborist consulting helps you make informed decisions when
          you’re unsure whether pruning, monitoring, treatment, or removal is the best next step.
        </p>
        <p className="text-[var(--muted)] leading-7">
          A professional evaluation can reduce long-term risk, protect valuable landscape assets, and support planning
          for permits or construction near root zones—without defaulting to removal.
        </p>
      </header>

      {/* Hero image */}
      <div className="-mt-8 relative w-full overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/7]">
        <Image
          src="/assets/tree-moving.webp"
          alt="Arborist evaluating a tree in Santa Cruz"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1100px"
          priority
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAgCdASoKAAoABUB8JagCdADcWtpWP+AAAPwbVOnpkPA72X9JplALA3J4FRdIXEroiCERT92nktCt1UdNJMwKsAA="
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">When to Schedule an Evaluation</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Visible decline (thinning canopy, dieback, unusual leaf drop)</li>
          <li>Structural cracks, splits, or weak unions</li>
          <li>Leaning concerns—especially on slopes or after storms</li>
          <li>Construction planned near root zones</li>
          <li>Permit or insurance documentation needed</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Consulting May Include</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Health assessment</li>
          <li>Structural risk evaluation</li>
          <li>Written recommendations</li>
          <li>Preservation guidance</li>
          <li>Long-term maintenance planning</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Schedule an Arborist Evaluation"
        body="If you’re unsure whether a tree needs pruning, monitoring, or removal, start with a professional assessment and clear recommendations."
        secondaryHref="tel:+1XXXXXXXXXX"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </main>
  );
}