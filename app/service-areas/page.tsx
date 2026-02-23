import Link from "next/link";

const cities = [
  { name: "Santa Cruz", slug: "santa-cruz" },
  { name: "Watsonville", slug: "watsonville" },
  { name: "Capitola", slug: "capitola" },
  { name: "Soquel", slug: "soquel" },
  { name: "Aptos", slug: "aptos" },
  { name: "Monterey", slug: "monterey" },
  { name: "Scotts Valley", slug: "scotts-valley" },
  { name: "Live Oak", slug: "live-oak" },
  { name: "Felton", slug: "felton" },
  { name: "Boulder Creek", slug: "boulder-creek" },
  { name: "Ben Lomond", slug: "ben-lomond" },
];

export default function ServiceAreasPage() {
  return (
    <main className="site-container py-14 space-y-12">
      <header className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Service Areas</h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          We serve Santa Cruz County and nearby communities. Choose your city to
          view local service details, common tree issues for the area, and how to
          request an estimate.
        </p>
      </header>

      <section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {cities.map((c) => (
            <li key={c.slug} className="h-full">
              <Link
                className="surface-card block h-full p-6"
                href={`/service-areas/${c.slug}`}
              >
                <div className="text-lg font-semibold">{c.name}, CA</div>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  Local tree care tailored to coastal weather, winter storms, and
                  hillside conditions.
                </p>
                <div className="mt-6 text-sm font-semibold text-[var(--brand-accent)]">
                  View city page →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}