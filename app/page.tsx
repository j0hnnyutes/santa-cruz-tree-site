// app/page.tsx
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";

const services = [
  {
    title: "Tree Removal",
    href: "/services/tree-removal",
    description:
      "Controlled removal for hazardous, storm-damaged, dead, or unwanted trees—planned to protect structures and landscaping.",
  },
  {
    title: "Tree Trimming / Pruning",
    href: "/services/tree-trimming",
    description:
      "Structural pruning and canopy balancing to reduce limb failure risk and support long-term tree health in coastal winds.",
  },
  {
    title: "Stump Grinding / Removal",
    href: "/services/stump-grinding-root-removal",
    description:
      "Grind stumps below grade to reclaim usable space, reduce hazards, and prep for turf, planting, or hardscape.",
  },
  {
    title: "Emergency Tree Service",
    href: "/services/emergency-tree-service",
    description:
      "Rapid response for fallen trees and urgent hazards—stabilization, controlled removal, and cleanup.",
  },
  {
    title: "Arborist Consulting",
    href: "/services/arborist-consulting",
    description:
      "Professional evaluations for tree health and risk with clear recommendations for pruning, monitoring, or removal.",
  },
];

export default function HomePage() {
  return (
    <main className="site-container py-10 space-y-12">
      {/* Keep ONLY the card carousel */}
      <section className="space-y-5">
        <HeroCarousel heightPx={420} />

        {/* Buttons below carousel (centered) */}
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
  href="/contact"
  className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition"
  style={{
    backgroundColor: "var(--brand-green)",
    color: "#ffffff",
  }}
>
  Request an Estimate
</Link>
        </div>
      </section>

      {/* Overview */}
      <section className="surface-card p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Santa Cruz Tree Pros</h1>
        <p className="mt-3 text-[var(--muted)] leading-7">
          Santa Cruz properties face coastal winds, salt air exposure, winter storms, and hillside terrain.
          We provide safety-first tree services designed for local conditions—focused on protecting your home,
          improving tree health, and keeping your property looking great.
        </p>
      </section>

      {/* Services cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Services</h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {services.map((s) => (
            <li key={s.href} className="h-full">
              <Link href={s.href} className="surface-card block h-full p-6">
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">{s.description}</p>
                <div className="mt-6 text-sm font-semibold text-[var(--brand-accent)]">
                  Learn more →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}