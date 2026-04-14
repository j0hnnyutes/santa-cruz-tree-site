interface CityHeroProps {
  heading: string;
  subheading: string;
  imgSrc?: string;
}

/**
 * Full-width hero banner used at the top of each city service-area page.
 * Sits outside the max-width site container so it bleeds edge-to-edge.
 */
export default function CityHero({
  heading,
  subheading,
  imgSrc = "/assets/tree-removal-with-crane.webp",
}: CityHeroProps) {
  return (
    <section style={{ position: "relative", height: 280, overflow: "hidden" }}>
      {/* Background photo */}
      <img
        src={imgSrc}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 55%",
        }}
      />
      {/* Gradient overlay — matches site-wide hero pattern */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, rgba(10,30,15,0.82) 0%, rgba(10,30,15,0.58) 100%)",
      }} />
      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        height: "100%",
        maxWidth: 1100, margin: "0 auto",
        padding: "0 24px",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <p style={{
          color: "#86efad", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10,
        }}>
          Santa Cruz Tree Pros
        </p>
        <h1 style={{
          fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 900,
          color: "#fff", lineHeight: 1.1,
          letterSpacing: "-0.02em", maxWidth: 620, marginBottom: 12,
        }}>
          {heading}
        </h1>
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.82)",
          maxWidth: 500, lineHeight: 1.65,
        }}>
          {subheading}
        </p>
      </div>
    </section>
  );
}
