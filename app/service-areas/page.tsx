import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ServiceCta from "@/components/ServiceCta";
import ServiceAreaMapWrapper from "@/components/ServiceAreaMapWrapper";

export const metadata: Metadata = {
  title: "Tree Service Areas | Santa Cruz County",
  description: "Santa Cruz Tree Pros serves all of Santa Cruz County — from Santa Cruz and Capitola to Scotts Valley, Felton, and beyond. Free estimates throughout the region.",
  alternates: { canonical: "https://santacruztreepros.com/service-areas" },
  openGraph: {
    title: "Tree Service Areas | Santa Cruz County",
    description: "Santa Cruz Tree Pros serves all of Santa Cruz County — from Santa Cruz and Capitola to Scotts Valley, Felton, and beyond.",
    url: "https://santacruztreepros.com/service-areas",
    type: "website",
  },
};

const cities = [
  {
    name: "Santa Cruz",
    slug: "santa-cruz",
    blurb: "Salt air and coastal fog take a toll on urban trees. We handle trimming, removals, and storm cleanup across neighborhoods from the Westside to Twin Lakes.",
  },
  {
    name: "Watsonville",
    slug: "watsonville",
    blurb: "Agricultural land borders residential lots here, and overgrown boundary trees are a common issue. We serve both rural parcels and in-town properties throughout Watsonville.",
  },
  {
    name: "Capitola",
    slug: "capitola",
    blurb: "Coastal cypress and mature pines near the village need careful attention as they age. We work in tight beachside lots where access and property protection are top priorities.",
  },
  {
    name: "Soquel",
    slug: "soquel",
    blurb: "Wooded hillside lots and creek-adjacent properties make Soquel one of our busiest service areas. We handle large oak removals, root encroachment, and post-storm cleanup.",
  },
  {
    name: "Aptos",
    slug: "aptos",
    blurb: "Rio Del Mar and Seacliff areas saw significant storm damage in recent years. We specialize in wind-damaged tree removal, stump grinding, and preventive trimming for hillside homes.",
  },
  {
    name: "Monterey",
    slug: "monterey",
    blurb: "Monterey cypress and pine are iconic here — and demanding to maintain. We're experienced working near the bay, on bluff-top properties, and in established neighborhoods with mature canopy.",
  },
  {
    name: "Scotts Valley",
    slug: "scotts-valley",
    blurb: "Fast-growing residential neighborhoods sit amid dense redwood and oak forest. We help homeowners manage fire clearance, encroaching limbs, and trees stressed by summer drought.",
  },
  {
    name: "Live Oak",
    slug: "live-oak",
    blurb: "Densely populated and full of mature street trees, Live Oak sees frequent requests for limb clearance, root damage repair, and removals in close quarters with fences and structures.",
  },
  {
    name: "Felton",
    slug: "felton",
    blurb: "Old-growth redwood corridors and steep San Lorenzo Valley terrain make Felton tree work technically demanding. We bring the right rigging equipment for large redwoods on tight lots.",
  },
  {
    name: "Boulder Creek",
    slug: "boulder-creek",
    blurb: "Still recovering from the 2020 CZU Lightning Complex fire, Boulder Creek homeowners face dead standing trees, fire-damaged limbs, and debris on steep slopes. We know this terrain well.",
  },
  {
    name: "Ben Lomond",
    slug: "ben-lomond",
    blurb: "Nestled in the San Lorenzo Valley with redwood-shaded lots and winding roads, Ben Lomond properties often need careful sectional dismantling where heavy equipment can't reach.",
  },
];

export default function ServiceAreasPage() {
  return (
    <>
      {/* ── Hero banner ── */}
      <section style={{ position: "relative", height: 300, overflow: "hidden" }}>
        <img
          src="/assets/tree-mulching.webp"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(10,30,15,0.82) 0%, rgba(10,30,15,0.58) 100%)",
        }} />
        <div
          className="site-container"
          style={{
            position: "relative", zIndex: 2,
            height: "100%", display: "flex",
            flexDirection: "column", justifyContent: "center",
            padding: "40px 24px",
          }}
        >
          <p style={{
            color: "#86efad", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10,
          }}>
            Santa Cruz County
          </p>
          <h1 style={{
            fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900,
            color: "#fff", lineHeight: 1.1,
            letterSpacing: "-0.02em", maxWidth: 600, marginBottom: 12,
          }}>
            Service Areas
          </h1>
          <p style={{
            fontSize: 16, color: "rgba(255,255,255,0.82)",
            maxWidth: 520, lineHeight: 1.6,
          }}>
            We serve all of Santa Cruz County and nearby communities. Choose your
            city to see local service details and request an estimate.
          </p>
        </div>
      </section>

      <main className="site-container py-14 space-y-14">

        {/* ── Coverage map ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Coverage Map</h2>
          <p className="text-[var(--muted)] leading-relaxed">
            We cover the full county — from the coast to the mountains. Click any
            marker to jump to that city&apos;s service page.
          </p>
          <div
            className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm"
            style={{ height: 420 }}
          >
            <ServiceAreaMapWrapper />
          </div>
        </section>

        {/* ── City cards ── */}
        <section className="relative rounded-2xl overflow-hidden">
          {/* Background photo — darkened so it reads as texture, not distraction */}
          <div className="absolute inset-0">
            <Image
              src="/assets/tree-mulching.webp"
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: "center 40%" }}
              sizes="100vw"
              aria-hidden="true"
            />
            <div className="absolute inset-0" style={{ background: "rgba(10,30,15,0.55)" }} />
          </div>

          <div className="relative px-6 py-8 sm:px-8">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {cities.map((c) => (
                <li key={c.slug} className="h-full">
                  <Link
                    className="surface-card flex flex-col h-full p-6 transition-colors duration-200 hover:bg-[var(--brand-accent-light)] hover:border-[var(--brand-accent)]"
                    href={`/service-areas/${c.slug}`}
                  >
                    <h3 className="text-xl font-semibold">{c.name}, CA</h3>
                    <p className="mt-2 text-[var(--muted)] leading-relaxed flex-1">
                      {c.blurb}
                    </p>
                    <div className="mt-6 text-base font-semibold text-[var(--brand-accent)]">
                      View city page &rarr;
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ServiceCta
          heading="Need Tree Service?"
          body="Tell us your location and what you need. We serve all of Santa Cruz County."
        />
      </main>
    </>
  );
}
