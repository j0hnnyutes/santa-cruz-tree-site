import type { Metadata } from "next";
import Image from "next/image";
import ServiceCta from "@/components/ServiceCta";
import { serviceBreadcrumb } from "@/lib/jsonld";
import {
  ChevronDown,
  FaqBlock,
  RelatedServicesBlock,
  InfoCard,
  BulletListCard,
} from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/stump-grinding-root-removal";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Stump Grinding in Santa Cruz, CA",
  description:
    "Stump grinding to remove stumps below grade, reduce hazards, and prep for landscaping across Santa Cruz County. Optional chip haul-away.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Stump Grinding in Santa Cruz, CA | Santa Cruz Tree Pros",
    description:
      "Grind stumps below grade to reclaim space and prep for new landscaping across Santa Cruz County.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `https://santacruztreepros.com/api/og?title=Stump+Grinding+%26+Root+Removal&photo=stump-removal`,
        width: 1200,
        height: 630,
        alt: "Stump Grinding & Root Removal — Santa Cruz Tree Pros",
      },
    ],
  },
  twitter: { card: "summary_large_image", title: "Stump Grinding in Santa Cruz, CA | Santa Cruz Tree Pros", description: "Stump grinding to remove stumps below grade, reduce hazards, and prep for landscaping across Santa Cruz County. Optional chip haul-away." },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Can you grind stumps in rocky soil?",
    a: "Often yes. Rocky or compacted soil can affect speed and access, but stump grinding is commonly performed across a range of soil types. We’ll evaluate the site and confirm the best approach during your estimate.",
  },
  {
    q: "How deep do you grind a stump?",
    a: "Depth depends on your plans (turf vs. replanting vs. hardscape). A common approach is grinding below grade so the area can be backfilled and leveled; deeper grinding may be recommended for replanting in the same spot.",
  },
  {
    q: "Does stump grinding leave the area level?",
    a: "We grind the stump down and leave grindings (wood chips) that can be used as mulch or hauled away. With backfill/topsoil, the area can be restored to a clean, level finish.",
  },
  {
    q: "How long does stump grinding take?",
    a: "Many stumps can be completed quickly, but time varies based on stump size, root flare, soil conditions, and access. We’ll estimate duration when we see the site.",
  },
  {
    q: "Do you haul away the grindings (wood chips)?",
    a: "Yes—if you don’t want the chips for mulch, we can haul them away. Let us know your preference when scheduling.",
  },
  {
    q: "Can I replant a tree after stump grinding?",
    a: "Often yes. Replanting is easiest when grinding is done deeper and the area is amended with clean soil. We can recommend a practical depth based on what you want to plant and where.",
  },
  {
    q: "Stump grinding vs. full stump/root removal—what’s the difference?",
    a: "Grinding removes the visible stump below grade and allows roots to decay over time. Full removal involves excavation, which is more disruptive and may be preferred for certain construction or hardscape projects.",
  },
] as const;

const relatedServices = [
  {
    title: "Tree Removal",
    href: "/services/tree-removal",
    desc: "Remove the tree, then grind the stump for a clean finish and usable space.",
  },
  {
    title: "Tree Trimming & Pruning",
    href: "/services/tree-trimming",
    desc: "Maintain safer trees and reduce future removals with proactive pruning.",
  },
  {
    title: "Arborist Consulting",
    href: "/services/arborist-consulting",
    desc: "Get an expert opinion on tree health, risk, and the best plan forward.",
  },
] as const;


export default function StumpGrindingPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Stump Grinding",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Santa Cruz County, CA" },
    serviceType: "Stump Grinding",
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
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Stump Grinding in Santa Cruz, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Stumps can be an eyesore and a tripping hazard—especially in high-traffic yards and rental properties.
          Stump grinding removes the stump below grade so you can reclaim space and prep for turf, planting,
          or hardscape.
        </p>
      </header>

      {/* Hero image */}
      <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/7]">
        <Image
          src="/assets/stump-removal.webp"
          alt="Stump grinding and removal in Santa Cruz"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1100px"
          priority
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoKAAoABUB8JbACdAD57kC4CAAA/tHzdkCpQ9JYkR764cFDxy8K46sTaHy+GKrt/U86PvvDcxVmFhhco///9jC8AAA="
        />
      </div>

      {/* General info */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">What Stump Grinding Includes</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Site check & access">
            We confirm access width, slope, and obstacles (fences, gates, irrigation). Tight access is common in
            Santa Cruz neighborhoods, so planning avoids surprises.
          </InfoCard>
          <InfoCard title="Grinding below grade">
            We grind below the surface so the area can be backfilled and leveled. If you want to replant in the
            same spot, deeper grinding and soil amendment is often recommended.
          </InfoCard>
          <InfoCard title="Chips: keep or haul away">
            Grindings can be used as mulch, or we can haul them away if you prefer a cleaner finish for turf or
            hardscape prep.
          </InfoCard>
          <InfoCard title="Better use of the space">
            Reduce trip hazards, open up planting beds, and make mowing/maintenance easier—especially after
            removals.
          </InfoCard>
        </div>

        <BulletListCard
          title="Helpful prep before we arrive"
          items={[
            "Mark sprinklers/irrigation lines if known",
            "Clear rocks/decor around the stump",
            "Ensure gate access is unlocked",
            "Tell us your plan (turf, planting, hardscape)",
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Stump Grinding FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <RelatedServicesBlock services={relatedServices} />

      <ServiceCta
        heading="Request a Free Estimate"
        body="Tell us how many stumps you have and what you plan to do with the space. We’ll recommend the right depth and cleanup option."
        primaryHref="/free-estimate"
        primaryLabel="Request an Estimate"
        secondaryHref="tel:+1XXXXXXXXXX"
        secondaryLabel="Call Now"
      />

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceBreadcrumb("Stump Grinding & Root Removal", "stump-grinding-root-removal")) }}
      />
    </main>
  );
}