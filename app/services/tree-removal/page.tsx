import type { Metadata } from "next";
import ServiceCta from "@/components/ServiceCta";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/tree-removal";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Removal in Santa Cruz, CA | Safe & Professional Tree Service",
  description:
    "Professional tree removal in Santa Cruz, CA. Safe dismantling, storm-damaged tree removal, and property protection. Request a free on-site estimate.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Removal in Santa Cruz, CA | Safe & Professional Tree Service",
    description:
      "Professional tree removal in Santa Cruz, CA. Safe dismantling, storm-damaged tree removal, and property protection. Request a free on-site estimate.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tree Removal in Santa Cruz, CA | Safe & Professional Tree Service",
    description:
      "Professional tree removal in Santa Cruz, CA. Safe dismantling, storm-damaged tree removal, and property protection. Request a free on-site estimate.",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "How much does tree removal cost in Santa Cruz?",
    a: "Cost depends on tree size, species, access, slope, and proximity to structures. Coastal wind exposure and hillside terrain can increase complexity.",
  },
  {
    q: "Do I need a permit to remove a tree in Santa Cruz?",
    a: "Some trees and sizes may require permits depending on local rules. It’s best to verify requirements before scheduling removal.",
  },
  {
    q: "Can you remove a tree near my home safely?",
    a: "Yes. Sectional removal and controlled rigging allow trees to be dismantled safely in tight or sensitive areas.",
  },
  {
    q: "What happens to the wood after removal?",
    a: "Wood can be hauled away, chipped on-site, or left on-site upon request where appropriate.",
  },
] as const;

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Tree Removal",
        serviceType: "Tree removal",
        areaServed: {
          "@type": "City",
          name: "Santa Cruz",
          address: { "@type": "PostalAddress", addressRegion: "CA", addressCountry: "US" },
        },
        provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
        url: pageUrl,
        description:
          "Safe removal of hazardous, dead, declining, or storm-damaged trees with controlled dismantling and property protection for Santa Cruz coastal conditions.",
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

export default function TreeRemovalPage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Tree Removal in Santa Cruz</h1>

      <p className="mt-4 text-base leading-7">
        Coastal winds, winter storms, salt air exposure, and hillside terrain in Santa Cruz can accelerate tree decline
        and increase the risk of limb or whole-tree failure. When a tree becomes hazardous, severely damaged, or no
        longer fits your property’s long-term plans, professional removal helps protect structures, driveways, and
        surrounding landscaping.
      </p>
      <p className="mt-3 text-base leading-7">
        Safe tree removal requires controlled dismantling, careful rigging, and a plan tailored to the site—especially
        in tight residential neighborhoods and coastal properties where access and wind conditions matter.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">When Removal Is Needed</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Storm-damaged or wind-compromised trees</li>
          <li>Leaning trees on slopes or erosion-prone areas</li>
          <li>Root damage affecting foundations or hardscape</li>
          <li>Dead or declining trees</li>
          <li>Site prep for construction or landscape redesign</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">What’s Included</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>On-site safety and structural assessment</li>
          <li>Sectional removal for confined spaces</li>
          <li>Professional rigging to protect structures</li>
          <li>Haul-away or chipping options</li>
          <li>Optional stump grinding</li>
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
        heading="Request a Free Tree Removal Estimate"
        body="Share a few details (and photos if you have them). We’ll recommend a safe removal plan that protects your home, access points, and surrounding landscaping."
        secondaryHref="tel:+1XXXXXXXXXX"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </main>
  );
}