import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Services in Santa Cruz, CA | Santa Cruz Tree Pros",
  description:
    "Explore tree services in Santa Cruz, CA: tree removal, tree trimming, stump grinding, emergency tree service, and arborist consulting.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Services in Santa Cruz, CA | Santa Cruz Tree Pros",
    description:
      "Tree removal, trimming, stump grinding, emergency response, and arborist consulting across Santa Cruz County.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tree Services in Santa Cruz, CA | Santa Cruz Tree Pros",
    description:
      "Tree removal, trimming, stump grinding, emergency response, and arborist consulting across Santa Cruz County.",
  },
  robots: { index: true, follow: true },
};

const services = [
  {
    title: "Tree Removal",
    href: "/services/tree-removal",
    description:
      "Safe, controlled removal for hazardous, storm-damaged, dead, or unwanted trees—planned to protect nearby structures and landscaping.",
  },
  {
    title: "Tree Trimming & Pruning",
    href: "/services/tree-trimming",
    description:
      "Structural pruning and canopy balancing to reduce limb failure risk and support long-term tree health in coastal wind conditions.",
  },
  {
    title: "Stump Grinding & Root Removal",
    href: "/services/stump-grinding-root-removal",
    description:
      "Remove stumps below grade to restore usable space, reduce hazards, and prepare areas for turf, planting, or hardscape.",
  },
  {
    title: "Emergency Tree Service",
    href: "/services/emergency-tree-service",
    description:
      "Rapid response for fallen trees, hazardous limbs, and storm damage—stabilization and controlled removal with safety-first priorities.",
  },
  {
    title: "Arborist Consulting",
    href: "/services/arborist-consulting",
    description:
      "Professional evaluations for tree health and risk—clear recommendations for pruning, monitoring, treatment, or removal.",
  },
] as const;

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tree Services",
    itemListElement: services.map((s, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: s.title,
      url: `${siteUrl}${s.href}`,
    })),
  };
}

export default function ServicesIndexPage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold">Tree Services in Santa Cruz</h1>
        <p className="text-gray-700 leading-7">
          Santa Cruz properties face coastal winds, salt air exposure, winter storms, and in many areas, slope and
          erosion concerns. We provide professional tree services tailored to local conditions—focused on safety,
          long-term tree health, and protecting your home and landscape.
        </p>
        <p className="text-gray-700 leading-7">
          Choose a service below to learn more, see FAQs, and request an estimate.
        </p>
      </header>

      <section>
        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.href} className="rounded-2xl border p-6 hover:shadow-sm transition">
              <Link href={s.href} className="text-lg font-semibold underline">
                {s.title}
              </Link>
              <p className="mt-2 text-sm leading-6 text-gray-700">{s.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <ServiceCta
        heading="Request a Free Estimate"
        body="Tell us what you need and we’ll recommend the safest, most practical plan for your property in Santa Cruz."
        secondaryHref="tel:+1XXXXXXXXXX"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </main>
  );
}