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

export default function Page() {
  return (
    <main className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Service Areas</h1>
        <p className="text-gray-600">
          We serve Santa Cruz County and nearby communities. Choose your city to learn more.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => (
          <li key={c.slug} className="border rounded-lg p-4">
            <Link className="font-medium underline" href={`/service-areas/${c.slug}`}>
              {c.name}, CA
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
