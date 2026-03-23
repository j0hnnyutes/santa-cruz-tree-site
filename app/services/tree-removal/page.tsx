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
const pagePath = "/services/tree-removal";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Removal in Santa Cruz, CA",
  description:
    "Safe, controlled tree removal for hazardous, dead, storm-damaged, or unwanted trees in Santa Cruz County. Free estimates and thorough cleanup.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Removal in Santa Cruz, CA | Santa Cruz Tree Pros",
    description:
      "Controlled removals planned around safety, property protection, and cleanup across Santa Cruz County.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `https://santacruztreepros.com/api/og?title=Tree+Removal+Services&photo=tree-removal-with-crane`,
        width: 1200,
        height: 630,
        alt: "Tree Removal Services — Santa Cruz Tree Pros",
      },
    ],
  },
  twitter: { card: "summary_large_image", title: "Tree Removal in Santa Cruz, CA | Santa Cruz Tree Pros", description: "Safe, controlled tree removal for hazardous, dead, storm-damaged, or unwanted trees in Santa Cruz County. Free estimates and thorough cleanup." },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Do I need a permit to remove a tree in Santa Cruz County?",
    a: "Sometimes. Requirements can vary by city, neighborhood rules, and tree type (for example, protected trees or trees in certain zones). During your estimate, we’ll flag potential permit considerations and help you understand the next steps before work begins.",
  },
  {
    q: "How much does tree removal cost?",
    a: "Pricing depends on tree size, access (tight yards or slopes), risk level (near homes/lines), and the complexity of rigging and cleanup. We provide a clear, no-pressure estimate so you know the total cost up front.",
  },
  {
    q: "Can you remove the stump too?",
    a: "Yes—stump grinding is a common add-on after removal. We can grind below grade so you can reclaim usable space and prep for new landscaping.",
  },
  {
    q: "Is it safe to remove a large tree without damaging my property?",
    a: "Yes—when the job is planned and executed with controlled rigging and property protection. We prioritize safety, set drop zones, and use controlled lowering techniques to reduce risk around structures and landscaping.",
  },
  {
    q: "Why remove a tree instead of trimming it?",
    a: "Removal may be the best option when a tree is dead, structurally compromised, severely leaning, repeatedly failing in coastal winds, or causing unavoidable conflicts with structures and utilities.",
  },
  {
    q: "What happens to the wood and debris after removal?",
    a: "We cut, haul, and clean up. If you’d like to keep rounds/wood chips for firewood or mulch, we can usually accommodate—just let us know during the estimate.",
  },
] as const;

const relatedServices = [
  {
    title: "Emergency Tree Service",
    href: "/services/emergency-tree-service",
    desc: "Rapid response for storm damage, fallen trees, and urgent hazards.",
  },
  {
    title: "Tree Trimming & Pruning",
    href: "/services/tree-trimming",
    desc: "Reduce limb failure risk and improve structure in coastal wind exposure.",
  },
  {
    title: "Stump Grinding & Root Removal",
    href: "/services/stump-grinding-root-removal",
    desc: "Remove stumps below grade to reclaim space and prep for landscaping.",
  },
] as const;


export default function TreeRemovalPage() {
  // IMPORTANT: output JSON-LD as separate scripts (not an array) to avoid your runtime error
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Removal",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Santa Cruz County, CA" },
    serviceType: "Tree Removal",
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
          Tree Removal in Santa Cruz, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Coastal wind, winter storms, and hillside terrain can turn a weakened tree into a real hazard.
          We provide controlled tree removal planned around your home, landscaping, and access—then finish
          with thorough cleanup.
        </p>
      </header>

      {/* Hero image */}
      <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/7]">
        <Image
          src="/assets/tree-removal-with-crane.webp"
          alt="Professional tree removal crew using a crane in Santa Cruz"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1100px"
          priority
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAwAgCdASoKAAoABUB8JZACdAEDpK18IexYAAD5b5he4FUUjH/S4QacHmliy1XIr+JA/lTWt+YR/t3gN9AAAA=="
        />
      </div>

      {/* General info */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">What to Expect</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Safety-first planning">
            We assess lean, decay, canopy load, and proximity to roofs and lines. For tight spaces,
            we use controlled rigging and sectional removal to reduce risk.
          </InfoCard>
          <InfoCard title="Property protection">
            Expect clear drop zones, surface protection where needed, and a plan that accounts for Santa Cruz
            access challenges like slopes, narrow driveways, and landscaping constraints.
          </InfoCard>
          <InfoCard title="Cleanup included">
            We haul branches and debris and leave the site tidy. If you want chips for mulch or rounds for firewood,
            we can typically leave them on-site by request.
          </InfoCard>
          <InfoCard title="Pricing factors">
            Cost is driven by size, access, hazard level, rigging complexity, and whether you want stump grinding.
            We’ll provide a clear scope and total price during your estimate.
          </InfoCard>
        </div>

        <BulletListCard
          title="Common reasons for removal"
          items={[
            "Dead/dying trees or significant decay",
            "Storm damage or repeated limb failure",
            "Unsafe lean or compromised root plate",
            "Conflicts with structures/utilities",
            "Overcrowding or landscape redesign",
            "High wind exposure near the coast",
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Tree Removal FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <RelatedServicesBlock services={relatedServices} />

      <ServiceCta
        heading="Request a Free Estimate"
        body="Tell us about the tree and your property. We’ll recommend the safest, most practical plan for Santa Cruz conditions."
        primaryHref="/free-estimate"
        primaryLabel="Request an Estimate"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceBreadcrumb("Tree Removal", "tree-removal")) }}
      />
    </main>
  );
}