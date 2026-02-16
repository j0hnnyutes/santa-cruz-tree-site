import Link from "next/link";

export default function Page() {
  const cityName = "boulder-creek"
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Tree Service in {cityName}, CA</h1>
      <p className="text-gray-600">
        This is a city-specific page. Next we’ll add unique content for {cityName}.
      </p>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Popular Services</h2>
        <ul className="list-disc pl-5">
          <li><Link className="underline" href="/services/tree-removal">Tree Removal</Link></li>
          <li><Link className="underline" href="/services/tree-trimming">Tree Trimming & Pruning</Link></li>
          <li><Link className="underline" href="/services/stump-grinding-root-removal">Stump Grinding & Root Removal</Link></li>
          <li><Link className="underline" href="/services/emergency-tree-service">Emergency Tree Service</Link></li>
          <li><Link className="underline" href="/services/arborist-consulting">Arborist Consulting</Link></li>
        </ul>
      </div>

      <Link className="underline" href="/service-areas">← Back to Service Areas</Link>
    </main>
  );
}
