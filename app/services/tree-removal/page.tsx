import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/tree-removal";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Tree Removal in Santa Cruz, CA | Santa Cruz Tree Pros",
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
  },
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

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5 shrink-0 text-[var(--muted)] transition-transform duration-200 group-open:rotate-180"
      aria-hidden="true"
    >
      <path
        d="M5.5 7.5l4.5 4.5 4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FaqBlock({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details
          key={f.q}
          className="group rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--text)]">
            <span>{f.q}</span>
            <ChevronDown />
          </summary>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function RelatedServicesBlock() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Related Services</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {relatedServices.map((s) => (
          <li
            key={s.href}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <Link
              href={s.href}
              className="font-semibold text-[var(--text)] hover:text-[var(--brand-accent)] transition"
            >
              {s.title} →
            </Link>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{s.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

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
    <main className="mx-auto w-full max-w-[1100px] py-10 space-y-12">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Tree Removal in Santa Cruz, CA
        </h1>
        <p className="text-[var(--muted)] leading-7">
          Coastal wind, winter storms, and hillside terrain can turn a weakened tree into a real hazard.
          We provide controlled tree removal planned around your home, landscaping, and access—then finish
          with thorough cleanup.
        </p>
      </header>

      {/* General info */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">What to Expect</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="font-semibold">Safety-first planning</div>
            <p className="mt-2 text-sm text-[var(--muted)] leading-6">
              We assess lean, decay, canopy load, and proximity to roofs and lines. For tight spaces,
              we use controlled rigging and sectional removal to reduce risk.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="font-semibold">Property protection</div>
            <p className="mt-2 text-sm text-[var(--muted)] leading-6">
              Expect clear drop zones, surface protection where needed, and a plan that accounts for Santa Cruz
              access challenges like slopes, narrow driveways, and landscaping constraints.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="font-semibold">Cleanup included</div>
            <p className="mt-2 text-sm text-[var(--muted)] leading-6">
              We haul branches and debris and leave the site tidy. If you want chips for mulch or rounds for firewood,
              we can typically leave them on-site by request.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="font-semibold">Pricing factors</div>
            <p className="mt-2 text-sm text-[var(--muted)] leading-6">
              Cost is driven by size, access, hazard level, rigging complexity, and whether you want stump grinding.
              We’ll provide a clear scope and total price during your estimate.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="font-semibold">Common reasons for removal</div>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
            <li>• Dead/dying trees or significant decay</li>
            <li>• Storm damage or repeated limb failure</li>
            <li>• Unsafe lean or compromised root plate</li>
            <li>• Conflicts with structures/utilities</li>
            <li>• Overcrowding or landscape redesign</li>
            <li>• High wind exposure near the coast</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tree Removal FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <RelatedServicesBlock />

      <ServiceCta
        heading="Request a Free Estimate"
        body="Tell us about the tree and your property. We’ll recommend the safest, most practical plan for Santa Cruz conditions."
        primaryHref="/contact"
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