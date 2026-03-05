import type { Metadata } from "next";
import ServiceCta from "@/components/ServiceCta";
import {
  ChevronDown,
  FaqBlock,
  RelatedServicesBlock,
  InfoCard,
  BulletListCard,
} from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/tree-trimming";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Trimming & Pruning in Santa Cruz, CA | Santa Cruz Tree Pros",
  description:
    "Tree trimming and pruning to improve safety, structure, clearance, and tree health in Santa Cruz County—ideal for coastal winds and winter storms.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Trimming & Pruning in Santa Cruz, CA | Santa Cruz Tree Pros",
    description:
      "Structural pruning and canopy balancing for healthier, safer trees in coastal conditions across Santa Cruz County.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Why is tree trimming or pruning important?",
    a: "Proper pruning reduces deadwood, improves structure, and can lower the chance of limb failure—especially helpful in Santa Cruz coastal winds and winter storms. It also supports long-term tree health and appearance.",
  },
  {
    q: "What’s the difference between trimming and pruning?",
    a: "People use the terms interchangeably, but in practice: trimming often focuses on shaping and managing growth, while pruning is more targeted—removing specific branches for structure, clearance, or risk reduction.",
  },
  {
    q: "How often should trees be trimmed or pruned?",
    a: "A common cadence is every few years, but ideal timing depends on species, age, prior pruning history, and exposure (wind/salt). During the estimate we’ll recommend a practical interval for your trees and goals.",
  },
  {
    q: "When should a tree be removed instead of trimmed?",
    a: "Removal may be the better choice if the tree is dead/dying, structurally compromised, repeatedly failing, or creating a high-risk situation that pruning can’t reasonably mitigate.",
  },
  {
    q: "Can I trim a tree myself?",
    a: "Small, low branches can be DIY, but pruning larger limbs can be dangerous and easy to do incorrectly. Professional pruning helps avoid improper cuts, over-thinning, and safety hazards—especially near roofs and power lines.",
  },
  {
    q: "Will pruning help reduce storm damage?",
    a: "Often yes. Selective deadwood removal, canopy balancing, and clearance pruning can reduce sail effect and remove weak attachments—helpful for coastal wind events.",
  },
] as const;

const relatedServices = [
  {
    title: "Tree Removal",
    href: "/services/tree-removal",
    desc: "When trimming isn’t enough—controlled removals for high-risk or compromised trees.",
  },
  {
    title: "Emergency Tree Service",
    href: "/services/emergency-tree-service",
    desc: "Storm response for downed limbs and urgent hazards—stabilization and cleanup.",
  },
  {
    title: "Arborist Consulting",
    href: "/services/arborist-consulting",
    desc: "Professional evaluations and recommendations for tree health and risk.",
  },
] as const;


export default function TreeTrimmingPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Trimming & Pruning",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Santa Cruz County, CA" },
    serviceType: "Tree Trimming & Pruning",
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
          Tree Trimming &amp; Pruning in Santa Cruz, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Trimming and pruning in Santa Cruz isn’t just about appearance—coastal wind exposure, salt air,
          and winter storms make structure and thoughtful canopy management especially important. We tailor
          pruning to your tree species, location, and goals.
        </p>
      </header>

      {/* General info */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">How Pruning Helps</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Safety & risk reduction">
            Removing deadwood and addressing weak attachments can lower the chance of failures—especially
            in windy coastal corridors and during winter storms.
          </InfoCard>
          <InfoCard title="Clearance & access">
            Improve clearance over roofs, driveways, walkways, and views while keeping the tree’s natural
            shape and long-term structure in mind.
          </InfoCard>
          <InfoCard title="Health & longevity">
            Targeted cuts can reduce stress and support healthier growth without over-thinning.
          </InfoCard>
          <InfoCard title="A practical plan">
            We recommend a pruning approach and cadence based on species, age, and exposure—so you avoid
            unnecessary work while staying ahead of hazards.
          </InfoCard>
        </div>

        <BulletListCard
          title="Common trimming goals"
          items={[
            "Deadwood and hazard reduction",
            "Canopy balancing for wind exposure",
            "Roof and utility clearance",
            "Structure for young trees",
            "Better views and sunlight management",
            "A cleaner, well-kept look",
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Tree Trimming FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <RelatedServicesBlock services={relatedServices} />

      <ServiceCta
        heading="Request a Free Estimate"
        body="We’ll evaluate your trees and recommend the right pruning approach for safety, structure, and coastal conditions."
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
    </main>
  );
}