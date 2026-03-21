import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/monterey";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Monterey, CA",
  description:
    "Specialized tree care for Monterey's native Cypress and Pine, heritage tree management, and coastal urban forest preservation.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Monterey, CA | Santa Cruz Tree Pros",
    description:
      "Tree care and preservation in Monterey—native species expertise, protected tree management, coastal wind resilience, and heritage tree consulting.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Are Monterey Cypress and Monterey Pine protected on the Monterey Peninsula?",
    a: "Both are native to a narrow range near Monterey, and some are protected by local ordinance or Del Monte Forest conservation guidelines. We're familiar with Monterey's heritage tree designations and permit requirements. During your estimate, we'll confirm whether your tree has restrictions before any work.",
  },
  {
    q: "Why is my Monterey Cypress twisted, leaning, or showing stress?",
    a: "Monterey Cypress naturally grows with irregular form as a response to constant coastal wind. However, repeated gales can cause lean, branch breakage, or root stress. We assess structural integrity and recommend whether the tree needs bracing, pruning for wind reduction, or removal if safety is compromised.",
  },
  {
    q: "What's the best way to care for my heritage or significant trees?",
    a: "Heritage trees deserve specialized attention. We use arboricultural best practices—structural pruning without topping, proper cabling and bracing, soil aeration, and careful assessment of hazards. We can work with you and any preservation guidelines to keep these trees healthy for decades.",
  },
  {
    q: "How do salt spray and coastal fog affect tree health in Monterey?",
    a: "Salt spray stresses foliage and slows growth; fog keeps humidity high but can encourage fungal issues. Together, they make trees less vigorous than inland species. Regular pruning reduces canopy stress, and wise species selection for replacements can help. We recommend checking trees after heavy storms or salt events.",
  },
  {
    q: "Can you remove trees while preserving the forest character of my property?",
    a: "Yes. We can selectively remove dead, diseased, or hazardous trees while maintaining sight lines, privacy screens, and the feel of the forest. Strategic removal and light pruning often improve both safety and aesthetics without clear-cutting or drastically changing the landscape.",
  },
  {
    q: "What should I do about Eucalyptus trees in Monterey?",
    a: "Eucalyptus are common but invasive. They shed bark, drop large branches in wind, and are fire-prone. If you have one that's hazardous or conflicts with your plans, removal is straightforward. If you want to keep it, regular pruning reduces failure risk, but we're honest about their limitations in coastal wind.",
  },
] as const;

export default function MontereyPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Monterey, CA" },
    serviceType: "Heritage Tree Care, Native Species Management, and Urban Forestry",
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
          Tree Service in Monterey, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Monterey's coastal location, native Cypress and Pine heritage, and protected urban forest require expertise in
          heritage tree preservation, coastal species management, and sensitive removal planning. We respect both the
          natural character and practical safety needs of Monterey properties.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Monterey</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Monterey Cypress & Pine Health & Stress">
            These native species grow in Monterey's unique coastal conditions but are stressed by salt spray, constant
            wind, and fog. Cypress especially develops an irregular form but can also lean or show branch failure in
            extreme weather. We assess structure and recommend pruning, cabling, or removal as needed.
          </InfoCard>

          <InfoCard title="Heritage Tree Protection & Restrictions">
            Many Monterey trees are designated as heritage or protected by local ordinance. We're familiar with these
            restrictions and can guide you through permitting and best practices for care. Removing or severely damaging
            a protected tree can result in fines, so proper assessment is important.
          </InfoCard>

          <InfoCard title="Salt Spray & Coastal Fog Effects">
            Salt kills foliage, slows growth, and makes trees more vulnerable to disease and insects. Constant fog
            creates moist conditions that promote fungal problems. Together, these stressors mean trees need regular
            assessment and careful pruning to stay healthy.
          </InfoCard>

          <InfoCard title="Wind-Induced Damage & Irregular Form">
            Monterey's strong, constant winds shape trees naturally, but repeated gales cause real damage—twisted stems,
            branch breakage, and root plate stress. Strategic pruning reduces wind-loading; for severely compromised
            trees, removal may be the safest option.
          </InfoCard>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available in Monterey</h2>

        <div className="space-y-3">
          <p className="text-[var(--muted)] leading-7">
            Specialized tree care for Monterey's heritage forest and coastal environment:
          </p>

          <ul className="space-y-2">
            <li>
              <Link
                href="/services/tree-removal"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Tree Removal
              </Link>
              — Careful removal of hazardous or dead trees while respecting heritage designations and neighborhood
              character.
            </li>
            <li>
              <Link
                href="/services/tree-trimming"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Tree Trimming & Pruning
              </Link>
              — Structural pruning for wind resilience, heritage tree care, and selective removal to maintain forest
              aesthetics.
            </li>
            <li>
              <Link
                href="/services/stump-grinding-root-removal"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Stump Grinding & Root Removal
              </Link>
              — Remove stumps and address root systems on properties with multiple trees or heritage restoration.
            </li>
            <li>
              <Link
                href="/services/emergency-tree-service"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Emergency Tree Service
              </Link>
              — Fast response for storm-damaged trees, fallen limbs, and coastal wind damage.
            </li>
            <li>
              <Link
                href="/services/arborist-consulting"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Arborist Consulting
              </Link>
              — Heritage tree assessment, long-term management planning, and species selection for coastal resilience.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Monterey Tree Care FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Request a Free Estimate in Monterey"
        body="Tell us about your trees, any heritage designations, concerns about wind or coastal stress, and your goals for your property. We'll assess the local conditions and recommend a plan that respects both safety and preservation."
        primaryHref="/free-estimate"
        primaryLabel="Request an Estimate"
      />

      <div className="pt-4 border-t border-[var(--border)]">
        <Link
          href="/service-areas"
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition"
        >
          ← Back to Service Areas
        </Link>
      </div>

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Monterey")) }}
      />
    </main>
  );
}
