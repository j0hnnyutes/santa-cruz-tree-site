import type { Metadata } from "next";
import AccentCardLink from "@/components/AccentCardLink";
import ServiceCta from "@/components/ServiceCta";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service Areas in Santa Cruz County | Santa Cruz Tree Pros",
  description:
    "Santa Cruz Tree Pros serves Santa Cruz County and nearby communities. Select your city to see local tree service details, common issues, and what to expect.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service Areas in Santa Cruz County | Santa Cruz Tree Pros",
    description:
      "We serve Santa Cruz County and nearby communities with tree removal, trimming, stump grinding, emergency service, and arborist consulting.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tree Service Areas in Santa Cruz County | Santa Cruz Tree Pros",
    description:
      "Choose your city to learn about local tree services across Santa Cruz County and nearby communities.",
  },
  robots: { index: true, follow: true },
};

const cities = [
  { name: "Santa Cruz", slug: "santa-cruz" },
  { name: "Watsonville", slug: "watsonville" },
  { name: "Capitola", slug: "capitola" },
  { name: "Soquel", slug: "soquel" },
  { name: "Aptos", slug: "aptos" },
  { name: "Monterey", slug: "monterey" },
  { name: "Scotts Valley", slug: "scotts-valley" },
  { name: "Live Oak", slug: "live-oak" },
  { name: "Felton", slug: "felton" },
  { name: "Boulder Creek", slug: "boulder-creek" },
  { name: "Ben Lomond", slug: "ben-lomond" },
] as const;

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tree Service Areas",
    itemListElement: cities.map((c, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Tree Service in ${c.name}, CA`,
      url: `${siteUrl}/service-areas/${c.slug}`,
    })),
  };
}

export default function ServiceAreasPage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold">Service Areas</h1>

        <p className="text-[var(--muted)] leading-7">
          Santa Cruz County includes coastal neighborhoods exposed to wind and salt air,
          as well as mountain communities where slope, access, and storm runoff can affect
          tree safety. We tailor recommendations to local conditions—whether you need
          pruning for wind resistance, storm cleanup, or hazard mitigation near structures.
        </p>

        <p className="text-[var(--muted)] leading-7">
          Select your city below to learn more about common tree concerns in your area
          and what to expect when requesting an estimate.
        </p>
      </header>

      <section>
        <ul className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <li key={c.slug}>
              <AccentCardLink
                href={`/service-areas/${c.slug}`}
                title={`Tree Service in ${c.name}, CA`}
                description="Local service details, common tree issues, and what to expect."
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Services Available Across These Areas</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Most locations we serve can request any of the services below. If you have a time-sensitive issue,
          choose Emergency Tree Service for priority response.
        </p>

        <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
          <li>• Tree Removal</li>
          <li>• Tree Trimming & Pruning</li>
          <li>• Stump Grinding & Root Removal</li>
          <li>• Emergency Tree Service</li>
          <li>• Arborist Consulting</li>
        </ul>
      </section>

      <ServiceCta
        heading="Not sure which service you need?"
        body="Describe what’s going on and we’ll recommend the safest, most practical plan for your property—based on local conditions in your area."
        primaryHref="/contact"
        primaryLabel="Request a Free Estimate"
        secondaryHref="tel:+1XXXXXXXXXX"
        secondaryLabel="Call Now"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </main>
  );
}