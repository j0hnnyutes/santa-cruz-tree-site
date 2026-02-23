import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";

export const metadata: Metadata = {
  title: "Tree Services in Santa Cruz, CA | Santa Cruz Tree Pros",
  description:
    "Professional tree removal, trimming, stump grinding, emergency service, and arborist consulting across Santa Cruz County.",
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
];

export default function ServicesPage() {
  return (
    <main className="site-container py-14 space-y-12">
      <header className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          Tree Services in Santa Cruz
        </h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          Santa Cruz properties face coastal winds, salt air exposure, winter storms, and slope-related risks.
          We provide professional tree services tailored to local conditions—focused on safety,
          long-term tree health, and protecting your home and landscape.
        </p>
      </header>

      <section>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {services.map((s) => (
            <li key={s.href} className="h-full">
              <Link href={s.href} className="surface-card block h-full p-6">
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">
                  {s.description}
                </p>
                <div className="mt-6 text-sm font-semibold text-[var(--brand-accent)]">
                  Learn more →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ServiceCta
        heading="Request a Free Estimate"
        body="Tell us what you need and we’ll recommend the safest, most practical plan for your property in Santa Cruz."
      />
    </main>
  );
}