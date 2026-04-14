import type { Metadata } from "next";
import Link from "next/link";
import ServiceCta from "@/components/ServiceCta";

export const metadata: Metadata = {
  title: "Tree Services in Santa Cruz, CA | Santa Cruz Tree Pros",
  description:
    "Professional tree removal, trimming, stump grinding, emergency service, and arborist consulting across Santa Cruz County.",
  alternates: { canonical: "https://santacruztreepros.com/services" },
};

const services = [
  {
    title: "Tree Removal",
    href: "/services/tree-removal",
    img: "/assets/tree-removal-with-crane.webp",
    tag: "Most Popular",
    tagColor: "#1b5e35",
    description:
      "Safe, controlled removal for hazardous, storm-damaged, dead, or unwanted trees—planned to protect nearby structures and landscaping.",
  },
  {
    title: "Tree Trimming & Pruning",
    href: "/services/tree-trimming",
    img: "/assets/tree-trimming.webp",
    tag: null,
    tagColor: null,
    description:
      "Structural pruning and canopy balancing to reduce limb failure risk and support long-term tree health in coastal wind conditions.",
  },
  {
    title: "Stump Grinding & Root Removal",
    href: "/services/stump-grinding-root-removal",
    img: "/assets/stump-removal.webp",
    tag: null,
    tagColor: null,
    description:
      "Remove stumps below grade to restore usable space, reduce hazards, and prepare areas for turf, planting, or hardscape.",
  },
  {
    title: "Emergency Tree Service",
    href: "/services/emergency-tree-service",
    img: "/assets/emergency-tree-removal.webp",
    tag: "24/7 Emergency",
    tagColor: "#dc2626",
    description:
      "Rapid response for fallen trees, hazardous limbs, and storm damage—stabilization and controlled removal with safety-first priorities.",
  },
  {
    title: "Arborist Consulting",
    href: "/services/arborist-consulting",
    img: "/assets/tree-inspection.webp",
    tag: null,
    tagColor: null,
    description:
      "Professional evaluations for tree health and risk—clear recommendations for pruning, monitoring, treatment, or removal.",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero banner ── */}
      <section style={{ position: "relative", height: 300, overflow: "hidden" }}>
        {/* Background photo */}
        <img
          src="/assets/tree-removal-with-crane.webp"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 55%",
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(10,30,15,0.82) 0%, rgba(10,30,15,0.58) 100%)",
        }} />
        {/* Content */}
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
            Professional Tree Services
          </h1>
          <p style={{
            fontSize: 16, color: "rgba(255,255,255,0.82)",
            maxWidth: 520, lineHeight: 1.6,
          }}>
            Removal, trimming, stump grinding, emergency response, and arborist consulting—
            tailored to coastal Santa Cruz conditions.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="site-container py-14 space-y-12">
        {/* ── Service cards with photos ── */}
        <section>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {services.map((s) => (
              <li key={s.href} className="h-full">
                <Link
                  href={s.href}
                  className="surface-card block h-full overflow-hidden transition-shadow duration-200 hover:shadow-md"
                  style={{ padding: 0 }}
                >
                  {/* Photo */}
                  <div style={{ position: "relative", paddingBottom: "52%", overflow: "hidden" }}>
                    <img
                      src={s.img}
                      alt={s.title}
                      style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                    />
                    {/* Badge */}
                    {s.tag && (
                      <span style={{
                        position: "absolute", top: 12, left: 12,
                        background: s.tagColor ?? "#1b5e35",
                        color: "#fff", fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "4px 10px", borderRadius: 99,
                      }}>
                        {s.tag}
                      </span>
                    )}
                  </div>
                  {/* Text */}
                  <div style={{ padding: "20px 24px 24px" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                      {s.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>
                      {s.description}
                    </p>
                    <div style={{
                      marginTop: 16, fontSize: 14, fontWeight: 700,
                      color: "var(--brand-accent)",
                    }}>
                      Learn more &rarr;
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <ServiceCta
          heading="Request a Free Estimate"
          body="Tell us what you need and we'll recommend the safest, most practical plan for your property in Santa Cruz."
        />
      </main>
    </>
  );
}
