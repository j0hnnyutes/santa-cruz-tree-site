import type { Metadata } from "next";
import Image from "next/image";
import ServiceCta from "@/components/ServiceCta";
import { FaqBlock } from "@/components/ServicePageKit";
import { serviceBreadcrumb } from "@/lib/jsonld";

const siteUrl = "https://santacruztreepros.com";
const siteName = "Santa Cruz Tree Pros";
const pagePath = "/services/emergency-tree-service";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
  title: "Emergency Tree Service in Santa Cruz | 24/7 Storm Response",
  description:
    "Emergency tree service in Santa Cruz. Fallen trees, storm damage, and hazardous limbs handled safely and efficiently.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Emergency Tree Service in Santa Cruz | 24/7 Storm Response",
    description:
      "Emergency tree service in Santa Cruz. Fallen trees, storm damage, and hazardous limbs handled safely and efficiently.",
    url: pageUrl,
    type: "website",
    siteName,
    images: [
      {
        url: `https://santacruztreepros.com/api/og?title=Emergency+Tree+Service&photo=emergency-tree-removal-with-crane`,
        width: 1200,
        height: 630,
        alt: "Emergency Tree Service — Santa Cruz Tree Pros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emergency Tree Service in Santa Cruz | 24/7 Storm Response",
    description:
      "Emergency tree service in Santa Cruz. Fallen trees, storm damage, and hazardous limbs handled safely and efficiently.",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: "How quickly can you respond after a storm in Santa Cruz?",
    a: "Response time depends on conditions and demand, but immediate hazards are prioritized. Share photos and address details for faster triage.",
  },
  {
    q: "What should I do if a tree hits a power line?",
    a: "Keep a safe distance and contact your utility provider immediately. Do not approach or attempt to move debris near energized lines.",
  },
  {
    q: "Can you remove a fallen tree from a roof or driveway?",
    a: "Yes. We use controlled methods and rigging when needed to remove hazardous material while protecting the structure as much as possible.",
  },
  {
    q: "Will insurance cover emergency tree removal?",
    a: "Coverage depends on your policy and the situation. Documentation and photos can help support claims.",
  },
] as const;

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Emergency Tree Service",
        serviceType: "Emergency tree service",
        areaServed: {
          "@type": "City",
          name: "Santa Cruz",
          address: { "@type": "PostalAddress", addressRegion: "CA", addressCountry: "US" },
        },
        provider: { "@type": "LocalBusiness", name: siteName, url: siteUrl },
        url: pageUrl,
        description:
          "Emergency response for fallen trees, hazardous limbs, and storm damage in Santa Cruz, with safety-first stabilization and controlled removal.",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: pageUrl,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default function EmergencyTreeServicePage() {
  const ld = jsonLd();

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">Emergency Tree Service in Santa Cruz</h1>
        <p className="text-[var(--muted)] leading-7">
          Winter storms, coastal winds, and saturated soils can trigger sudden failures across Santa Cruz County—especially
          on slopes and in exposed coastal areas. Emergency tree service prioritizes rapid assessment, stabilization of
          hazards, and controlled removal to prevent further property damage.
        </p>
        <p className="text-[var(--muted)] leading-7">
          Safety comes first. We focus on managing immediate risk, protecting structures, and clearing critical access
          (driveways, walkways, and entry points) as efficiently as conditions allow.
        </p>
      </header>

      {/* Hero image */}
      <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/7]">
        <Image
          src="/assets/emergency-tree-removal.webp"
          alt="Emergency tree removal after storm damage in Santa Cruz"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1100px"
          priority
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoKAAoABUB8JQBOgBuVkl5gmgAA/jq4R0h/62S/2+Y+RGkad0TUDjfbPOyik+EF3k3WZLIAAAA="
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Emergency Situations</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Fallen trees on homes, garages, or fences</li>
          <li>Split or hanging limbs posing immediate risk</li>
          <li>Uprooted trees after storms</li>
          <li>Storm debris blocking driveways or access</li>
          <li>Immediate safety hazards around structures</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">FAQs</h2>
        <FaqBlock items={faqs} />
      </section>

      <p className="mt-8 leading-7">
        <strong>Safety note:</strong> If a tree is in contact with power lines, keep your distance and contact the
        utility provider.
      </p>

      <ServiceCta
        heading="Need Emergency Help?"
        body="If there’s an immediate hazard, submit photos and your address through the estimate form and we’ll prioritize your request."
        primaryLabel="Submit Emergency Request"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceBreadcrumb("Emergency Tree Service", "emergency-tree-service")) }}
      />
    </main>
  );
}