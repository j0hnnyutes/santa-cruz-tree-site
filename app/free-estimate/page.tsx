// app/free-estimate/page.tsx
// Server component wrapper — exports metadata so Next.js can inject the
// correct <title> and <meta> tags.  The actual form is a client component
// rendered by FreeEstimateClient.

import type { Metadata } from "next";
import FreeEstimateClient from "./FreeEstimateClient";

const siteUrl = "https://santacruztreepros.com";
const pageUrl = `${siteUrl}/free-estimate`;

export const metadata: Metadata = {
  title: "Get a Free Estimate",
  description:
    "Request a free, no-obligation tree service estimate from Santa Cruz Tree Pros. Tree removal, trimming, stump grinding, and emergency service across Santa Cruz County.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Get a Free Estimate | Santa Cruz Tree Pros",
    description:
      "Request a free, no-obligation tree service estimate. Serving Santa Cruz, Capitola, Scotts Valley, Aptos, Watsonville, and surrounding areas.",
    url: pageUrl,
    type: "website",
    siteName: "Santa Cruz Tree Pros",
    images: [
      {
        url: `${siteUrl}/api/og?title=Get+a+Free+Estimate`,
        width: 1200,
        height: 630,
        alt: "Get a Free Estimate — Santa Cruz Tree Pros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get a Free Estimate | Santa Cruz Tree Pros",
    description:
      "Request a free, no-obligation tree service estimate from Santa Cruz's trusted tree care team.",
  },
  robots: { index: true, follow: true },
};

export default function FreeEstimatePage() {
  return (
    <>
      {/* ── SEO intro strip (Option B) ──────────────────────────────────────
          Server-rendered so Google sees the H1 immediately. Visible to users
          as a slim bar above the full-bleed layout. Tagline hidden on mobile
          to keep the strip to a single compact line. */}
      <div className="
        relative z-10
        bg-[rgba(5,20,8,0.96)]
        border-b border-white/[0.07]
        px-5 py-2.5
        flex flex-wrap items-baseline
        gap-x-2.5 gap-y-0.5
      ">
        <h1 className="text-[13px] font-bold text-white leading-none shrink-0 m-0">
          Get a Free Tree Service Estimate
        </h1>
        <p className="hidden sm:block text-[11px] text-white/40 leading-relaxed m-0">
          No obligation · Serving Santa Cruz County · Response usually within 1–2 business days
        </p>
      </div>

      <FreeEstimateClient />
    </>
  );
}
