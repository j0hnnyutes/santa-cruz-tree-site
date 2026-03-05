import Link from "next/link";
import Image from "next/image";
import ServiceCta from "@/components/ServiceCta";

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
    <main className="site-container py-14 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Service Areas</h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          We serve Santa Cruz County and nearby communities. Choose your city to
          view local service details, common tree issues for the area, and how to
          request an estimate.
        </p>
      </header>

      {/* Nature background behind cards */}
      <section className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/tree-mulching.webp"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-white/60" />
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
  );
}
