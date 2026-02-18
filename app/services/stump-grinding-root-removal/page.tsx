import type { Metadata } from "next";
import ServiceCta from "@/components/ServiceCta";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/stump-grinding-root-removal";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Stump Grinding in Santa Cruz, CA | Safe & Efficient Removal",
  description:
    "Remove unsightly stumps and restore usable yard space in Santa Cruz. Professional stump grinding and surface root reduction available.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Stump Grinding in Santa Cruz, CA | Safe & Efficient Removal",
    description:
      "Remove unsightly stumps and restore usable yard space in Santa Cruz. Professional stump grinding and surface root reduction available.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Stump Grinding in Santa Cruz, CA | Safe & Efficient Removal",
    description:
      "Remove unsightly stumps and restore usable yard space in Santa Cruz. Professional stump grinding and surface root reduction available.",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "How deep do you grind a stump?",
    a: "Typically several inches below grade. Depth can vary based on your landscaping plans (replanting, turf, hardscape, etc.).",
  },
  {
    q: "Will roots continue to grow after stump grinding?",
    a: "Most root systems naturally decay once the tree is removed. Some species may produce sprouts from remaining roots for a period of time.",
  },
  {
    q: "Can I plant a new tree where the stump was?",
    a: "It’s often better to plant slightly offset from the original root mass and refresh the soil for best results.",
  },
  {
    q: "What happens to the wood chips?",
    a: "Grindings can be left as backfill or hauled away upon request. Many homeowners reuse them as mulch in non-turf areas.",
  },
] as const;

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Stump Grinding & Root Removal",
        serviceType: "Stump grinding and surface root reduction",
        areaServed: {
          "@type": "City",
          name: "Santa Cruz",
          address: { "@type": "PostalAddress", addressRegion: "CA", addressCountry: "US" },
        },
        provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
        url: pageUrl,
        description:
          "Stump grinding and surface root reduction to restore usable yard space and reduce hazards, tailored for Santa Cruz soil and coastal moisture conditions.",
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

export default function StumpGrindingRootRemovalPage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Stump Grinding in Santa Cruz</h1>

      <p className="mt-4 text-base leading-7">
        After a tree is removed, stumps can limit landscaping options and create long-term maintenance headaches. In
        Santa Cruz, coastal moisture and seasonal rain can accelerate decay, which may attract pests and create soft,
        uneven areas over time. Grinding removes the visible stump below grade so your yard feels finished and usable.
      </p>
      <p className="mt-3 text-base leading-7">
        We account for site specifics like irrigation lines, slopes, and soil stability—so the surrounding area is left
        in a clean, workable condition for your next step.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">What’s Included</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Grinding below surface level</li>
          <li>Surface root reduction when necessary</li>
          <li>Debris containment and cleanup</li>
          <li>Optional removal of grindings</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">After Grinding</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Area can be leveled and topsoil added</li>
          <li>Seed, sod, or planting beds can be installed</li>
          <li>Remaining roots naturally decay underground</li>
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
        heading="Request a Free Stump Grinding Estimate"
        body="Tell us where the stump is located and your plans for the area. We’ll recommend the right grinding depth and cleanup option."
        secondaryHref="tel:+1XXXXXXXXXX"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </main>
  );
}