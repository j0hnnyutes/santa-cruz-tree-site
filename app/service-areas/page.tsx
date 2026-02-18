import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service Areas | Santa Cruz County Tree Experts",
  description:
    "Santa Cruz Tree Pros proudly serves Santa Cruz County and nearby communities including Capitola, Aptos, Watsonville, Scotts Valley, and more.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service Areas | Santa Cruz County Tree Experts",
    description:
      "Serving Santa Cruz County and surrounding communities with professional tree removal, trimming, stump grinding, and arborist consulting.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tree Service Areas | Santa Cruz County Tree Experts",
    description:
      "Professional tree services throughout Santa Cruz County including emergency response and arborist evaluations.",
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
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Service Areas",
    itemListElement: cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${city.name}, CA`,
      url: `${siteUrl}/service-areas/${city.slug}`,
    })),
  };
}

export default function ServiceAreasPage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">
          Tree Services Throughout Santa Cruz County
        </h1>

        <p className="text-gray-700 leading-7">
          Santa Cruz Tree Pros provides professional tree removal, tree trimming,
          stump grinding, emergency tree service, and arborist consulting
          throughout Santa Cruz County and nearby coastal and mountain communities.
        </p>

        <p className="text-gray-700 leading-7">
          From ocean-exposed properties dealing with salt air and wind stress
          to hillside neighborhoods with slope and erosion concerns, our services
          are tailored to the unique environmental conditions of each location.
          Select your city below to learn more about service availability.
        </p>
      </section>

      <section>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <li
              key={c.slug}
              className="rounded-xl border p-5 hover:shadow-sm transition"
            >
              <Link
                className="font-medium text-lg underline"
                href={`/service-areas/${c.slug}`}
              >
                Tree Service in {c.name}, CA
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-6 border-t">
        <h2 className="text-xl font-semibold mb-3">
          Services Available in Each Area
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm text-gray-700">
          <li>• Tree Removal</li>
          <li>• Tree Trimming & Pruning</li>
          <li>• Stump Grinding</li>
          <li>• Emergency Tree Service</li>
          <li>• Arborist Consulting & Risk Assessment</li>
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </main>
  );
}