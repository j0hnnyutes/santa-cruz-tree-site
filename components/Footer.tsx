import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-2">
          <div className="font-semibold">Santa Cruz Tree Service</div>
          <p className="text-sm text-gray-600">
            Tree removal, trimming, stump grinding & root removal, emergency service, and arborist consulting.
          </p>
        </div>

        <div className="space-y-2">
          <div className="font-semibold">Pages</div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><Link className="hover:underline" href="/services">Services</Link></li>
            <li><Link className="hover:underline" href="/service-areas">Service Areas</Link></li>
            <li><Link className="hover:underline" href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="font-semibold">Get a free estimate</div>
          <p className="text-sm text-gray-600">Tell us what you need and we’ll follow up.</p>
          <Link className="inline-block text-sm font-medium underline" href="/contact">
            Request an estimate →
          </Link>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Santa Cruz Tree Service. All rights reserved.
        </div>
      </div>
    </footer>
  );
}