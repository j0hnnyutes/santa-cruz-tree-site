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
  return <FreeEstimateClient />;
}
