import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";
import { serviceAreaBreadcrumb } from "@/lib/jsonld";
import { FaqBlock, InfoCard } from "@/components/ServicePageKit";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/service-areas/live-oak";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Service in Live Oak, CA | Santa Cruz Tree Pros",
  description:
    "Professional tree removal, trimming, and care for Live Oak's dense residential neighborhoods and aging Monterey Pines. Coastal wind and salt exposure specialists.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Tree Service in Live Oak, CA | Santa Cruz Tree Pros",
    description:
      "Tree care for Live Oak neighborhoods—managing declining Monterey Pines, coastal wind exposure, and tight residential settings between Santa Cruz and Capitola.",
    url: pageUrl,
    type: "website",
    siteName,
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "Why are so many Monterey Pines in Live Oak declining or dying?",
    a: "Monterey Pine pitch canker is a fungal disease that has devastated this species across the region. Trees naturally stressed by coastal wind and salt exposure are especially vulnerable. If your tree shows branch cankers, reddish pitch tubes, or sudden branch dieback, we can assess whether removal or treatment is needed.",
  },
  {
    q: "How do I know if my tree is too close to my house or fence?",
    a: "During a free estimate, we evaluate proximity to structures, root plate position, lean, and canopy weight. Many Live Oak homes have mature trees on small lots—we'll be honest about whether it's safe to keep it trimmed or if removal makes sense for everyone's safety.",
  },
  {
    q: "Does salt spray from the coast damage trees in Live Oak?",
    a: "Yes. Salt and wind exposure weaken trees over time, making them more susceptible to disease, limb failure, and root stress. We recommend regular pruning to improve wind resistance and reduce canopy weight—especially for trees near structures or on slopes.",
  },
  {
    q: "What should I do if a tree is leaning after a storm?",
    a: "Call immediately. A new lean or bent trunk usually means root plate damage or root failure. We offer emergency response for storm-damaged trees and can assess whether it's salvageable with cabling or needs prompt removal before it falls.",
  },
  {
    q: "Are there restrictions on tree removal in Live Oak?",
    a: "Live Oak is an unincorporated area, so county rules apply—not city ordinances. Some heritage trees or protected species may need review, but there's generally more flexibility than in incorporated cities. We'll flag any concerns during your estimate.",
  },
  {
    q: "How often should I trim my trees in this coastal area?",
    a: "Trees exposed to coastal wind typically benefit from pruning every 2–3 years to maintain structure and reduce canopy load. We'll recommend a schedule based on species, size, and condition—aiming to improve safety without overdoing it.",
  },
] as const;

export default function LiveOakPage() {
  const ldService = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tree Service",
    provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
    areaServed: { "@type": "AdministrativeArea", name: "Live Oak, CA" },
    serviceType: "Tree Removal, Trimming, and Maintenance",
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
          Tree Service in Live Oak, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Live Oak's dense neighborhoods, salt-swept coastal exposure, and aging tree canopy present unique challenges.
          Many properties struggle with declining Monterey Pines, tight spaces between homes, and storm-weakened trees.
          We know the local conditions and provide practical solutions for property safety and mature tree care.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Common Tree Issues in Live Oak</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Monterey Pine Pitch Canker">
            This fungal disease has devastated Monterey Pines throughout the region. Trees show branch cankers, pitch
            tubes, and branch dieback. Many mature pines in Live Oak are either dying or dead. We assess each tree and
            recommend removal or proactive pruning where trees are still viable.
          </InfoCard>

          <InfoCard title="Coastal Wind & Salt Exposure">
            Salt spray and consistent ocean winds stress trees over time, weakening root plates and increasing limb
            failure risk. Trees near structures are especially concerning. Regular pruning reduces canopy load and
            improves wind resistance.
          </InfoCard>

          <InfoCard title="Small Lot Conflicts">
            Many Live Oak homes sit on modest lots where mature trees are too close to roofs, fences, utility lines,
            or neighbors' properties. Root plates can undermine foundations or crack driveways. We evaluate each
            situation and help you decide whether to keep, trim, or remove.
          </InfoCard>

          <InfoCard title="Storm Damage & Limb Failure">
            Winter storms and coastal wind bring down branches and sometimes whole trees. We respond quickly to hazards
            and assess whether a leaning or damaged tree is salvageable or needs removal before it falls.
          </InfoCard>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Services Available in Live Oak</h2>

        <div className="space-y-3">
          <p className="text-[var(--muted)] leading-7">
            We provide full-service tree care tailored to Live Oak conditions:
          </p>

          <ul className="space-y-2">
            <li>
              <Link
                href="/services/tree-removal"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Tree Removal
              </Link>
              — Safe removal of dead, dying, or hazardous trees with controlled rigging in tight spaces.
            </li>
            <li>
              <Link
                href="/services/tree-trimming"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Tree Trimming & Pruning
              </Link>
              — Structural pruning to improve wind resistance, reduce canopy load, and clear utility lines.
            </li>
            <li>
              <Link
                href="/services/stump-grinding-root-removal"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Stump Grinding & Root Removal
              </Link>
              — Remove stumps and problematic roots to reclaim space and prevent damage.
            </li>
            <li>
              <Link
                href="/services/emergency-tree-service"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Emergency Tree Service
              </Link>
              — Fast response for storm damage, fallen trees, and urgent hazards.
            </li>
            <li>
              <Link
                href="/services/arborist-consulting"
                className="text-xl font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
              >
                Arborist Consulting
              </Link>
              — Expert assessment of tree health, risk, and long-term management strategy.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Live Oak Tree Care FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <ServiceCta
        heading="Request a Free Tree Estimate in Live Oak"
        body="Tell us about your trees, property, and concerns. We'll assess the local conditions and recommend a practical plan for safety and long-term care."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaBreadcrumb("Tree Service in Live Oak")) }}
      />
    </main>
  );
}
