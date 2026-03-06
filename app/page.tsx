// app/page.tsx
import Link from "next/link";
import ServiceAreaMapWrapper from "@/components/ServiceAreaMapWrapper";

export const metadata = {
  title: "Santa Cruz Tree Pros | Tree Removal, Trimming & Stump Grinding",
  description:
    "Premium tree services in Santa Cruz County — safe removals, expert pruning, and stump grinding with clean, professional job sites.",
  openGraph: {
    title: "Santa Cruz Tree Pros | Tree Removal, Trimming & Stump Grinding",
    description: "Premium tree services in Santa Cruz County — safe removals, expert pruning, and stump grinding with clean, professional job sites.",
    url: "https://santacruztreepros.com",
    type: "website",
    siteName: "Santa Cruz Tree Pros",
    images: [{ url: "https://santacruztreepros.com/assets/tree-removal-with-crane.webp", width: 1200, alt: "Professional tree removal services in Santa Cruz, CA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Santa Cruz Tree Pros | Tree Removal, Trimming & Stump Grinding",
    description: "Premium tree services in Santa Cruz County — safe removals, expert pruning, and stump grinding with clean, professional job sites.",
  },
};

// ── DATA ────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    title: "Tree Removal",
    desc: "Safe, efficient removal of hazardous, dead, or unwanted trees — including large crane removals and complete stump grinding.",
    href: "/services/tree-removal",
    img: "/assets/tree-removal-with-crane.webp",
    tag: "Most Popular",
    tagColor: "#1b5e35",
  },
  {
    title: "Tree Trimming & Pruning",
    desc: "Shape, thin, and elevate your canopy to promote healthy growth, improve clearance, and enhance your property's appearance.",
    href: "/services/tree-trimming",
    img: "/assets/tree-trimming.webp",
    tag: null,
    tagColor: null,
  },
  {
    title: "Emergency Tree Service",
    desc: "Storm damage? Fallen tree? We respond fast — 24 hours a day, 7 days a week — to protect your home and family.",
    href: "/services/emergency-tree-service",
    img: "/assets/emergency-tree-removal.webp",
    tag: "24/7 Emergency",
    tagColor: "#dc2626",
  },
  {
    title: "Stump Grinding & Removal",
    desc: "Eliminate unsightly stumps and surface roots quickly. We grind below grade and clean up all debris for a pristine finish.",
    href: "/services/stump-grinding-root-removal",
    img: "/assets/stump-removal.webp",
    tag: null,
    tagColor: null,
  },
  {
    title: "Arborist Consulting",
    desc: "Expert tree health assessments, risk evaluations, and written reports from our ISA Certified Arborists for any property need.",
    href: "/services/arborist-consulting",
    img: "/assets/tree-inspection.webp",
    tag: null,
    tagColor: null,
  },
  {
    title: "Mulching & Debris Removal",
    desc: "We chip and haul all debris, leaving your property clean. Mulch can be left on-site to nourish your soil — your choice.",
    href: "/services",
    img: "/assets/tree-mulching.webp",
    tag: null,
    tagColor: null,
  },
];

const CREDENTIALS = [
  { icon: "🛡️", title: "Licensed & Insured", sub: "CA Contractor Licensed · Full Liability Coverage" },
  { icon: "🌿", title: "ISA Certified Arborists", sub: "International Society of Arboriculture Certified" },
  { icon: "⚡", title: "24/7 Emergency Response", sub: "Storm damage & fallen trees — we're always available" },
  { icon: "🏡", title: "Family Owned & Local", sub: "Santa Cruz born, serving our community with pride" },
];

const WHY_ITEMS = [
  { icon: "🛡️", title: "Fully Licensed & Insured", desc: "CA Contractor Licensed and fully insured for your complete peace of mind on every job, large or small." },
  { icon: "🌿", title: "ISA Certified Arborists", desc: "Our team includes International Society of Arboriculture certified professionals who truly understand trees." },
  { icon: "⚡", title: "Fast Emergency Response", desc: "24/7 availability for storm damage and fallen trees. We arrive quickly when it matters most." },
  { icon: "🏡", title: "Locally Owned & Operated", desc: "Santa Cruz born and raised. We treat your property like our own and stand behind every job we do." },
];

const HOW_STEPS = [
  { num: "1", icon: "📞", title: "Contact Us", desc: "Call us or fill out our quick online form. We'll get back to you within a few hours to discuss your needs." },
  { num: "2", icon: "📋", title: "Free On-Site Estimate", desc: "We come to your property, assess the job in person, and provide a detailed written quote — no obligation." },
  { num: "3", icon: "📅", title: "Schedule Your Service", desc: "Pick a date that works for you. We handle all permits and logistics so you don't have to worry about a thing." },
  { num: "4", icon: "✅", title: "Sit Back & Relax", desc: "Our crew completes the job safely and efficiently, then leaves your property completely clean. Guaranteed." },
];

const CITIES = [
  "Santa Cruz", "Watsonville", "Capitola", "Soquel",
  "Aptos", "Monterey", "Scotts Valley", "Live Oak",
  "Felton", "Boulder Creek", "Ben Lomond",
];

const FAQS = [
  { q: "Do you provide free estimates?", a: "Yes. Tell us what you need and we'll follow up with next steps and scheduling. For complex jobs, we may recommend an on-site evaluation." },
  { q: "Are you licensed and insured?", a: "Yes — we're fully licensed as a CA contractor and carry full liability coverage to protect your property and our crew throughout every job." },
  { q: "Can you help with hazardous or storm-damaged trees?", a: "Yes. If there's a safety concern, contact us right away so we can discuss urgency and the safest approach. We're available 24/7 for emergencies." },
  { q: "Do you haul away debris and clean up?", a: "Yes. Cleanup and hauling is included. We can also leave chipped mulch on-site to nourish your soil — just let us know." },
  { q: "What areas do you serve?", a: "We serve Santa Cruz County including Santa Cruz, Scotts Valley, Capitola, Soquel, Aptos, Live Oak, Felton, Boulder Creek, Ben Lomond, Watsonville, and Monterey." },
  { q: "How soon can you schedule?", a: "Scheduling depends on season and job complexity. We'll confirm availability after you submit the request form — we typically respond within a few hours." },
];

// ── HELPERS ─────────────────────────────────────────────────────────────────

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block",
      background: "var(--brand-accent-light)",
      color: "var(--brand-green)",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "5px 12px",
      borderRadius: 99,
      marginBottom: 14,
    }}>
      {children}
    </span>
  );
}

function SectionTagDark({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block",
      background: "rgba(134,239,172,0.15)",
      color: "#86efad",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "5px 12px",
      borderRadius: 99,
      marginBottom: 14,
    }}>
      {children}
    </span>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>

      {/* ── 1. HERO ── */}
      <section style={{ position: "relative", minHeight: "88vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Background image */}
        <img
          src="/assets/tree-removal-with-crane.webp"
          alt="Professional tree removal in Santa Cruz County"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(10,30,15,0.82) 0%, rgba(10,30,15,0.55) 60%, rgba(10,30,15,0.2) 100%)" }} />
        {/* Content */}
        <div className="site-container" style={{ position: "relative", zIndex: 2, padding: "80px 24px" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(6px)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "6px 14px", borderRadius: 99,
            marginBottom: 24,
          }}>
            🌲 <span style={{ color: "#86efad" }}>Santa Cruz County&apos;s Trusted Tree Service</span>
          </div>

          <h1 style={{
            fontSize: "clamp(38px, 5.5vw, 68px)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            marginBottom: 20,
            maxWidth: 720,
          }}>
            Expert Tree Care<br />
            You Can <span style={{ color: "#86efad" }}>Trust</span>
          </h1>

          <p style={{ fontSize: 19, color: "rgba(255,255,255,0.82)", maxWidth: 500, lineHeight: 1.6, marginBottom: 36 }}>
            Licensed, insured, and locally owned. From emergency removals to precision trimming — we protect your property and your trees.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/free-estimate"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "var(--brand-green)", color: "#fff",
                padding: "14px 32px", borderRadius: 8,
                fontSize: 18, fontWeight: 700, textDecoration: "none",
              }}
            >
              Get a Free Estimate
            </Link>
            <Link
              href="/services"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "transparent", color: "#fff",
                border: "2px solid rgba(255,255,255,0.65)",
                padding: "14px 32px", borderRadius: 8,
                fontSize: 18, fontWeight: 600, textDecoration: "none",
              }}
            >
              Our Services ↓
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. CREDENTIALS STRIP ── */}
      <div style={{ background: "var(--brand-green-dark)" }}>
        <div className="site-container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {CREDENTIALS.map((c, i) => (
              <div key={c.title} style={{
                padding: "24px 20px",
                display: "flex", alignItems: "center", gap: 14,
                borderRight: i < CREDENTIALS.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(134,239,172,0.12)",
                  border: "1px solid rgba(134,239,172,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. SERVICES ── */}
      <section style={{ background: "var(--bg-soft)", padding: "60px 0" }}>
        <div className="site-container">
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, gap: 24, flexWrap: "wrap" }}>
            <div>
              <SectionTag>What We Do</SectionTag>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 12 }}>
                Professional Tree Services<br />for Santa Cruz County
              </h2>
              <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 520, lineHeight: 1.6 }}>
                From routine trimming to complex removals — our certified arborists handle it all safely and efficiently.
              </p>
            </div>
            <Link href="/services" style={{
              display: "inline-flex", alignItems: "center",
              color: "var(--brand-green)", border: "2px solid var(--brand-green)",
              padding: "10px 22px", borderRadius: 8,
              fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              View All Services →
            </Link>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {SERVICES.map((s) => (
              <Link key={s.href + s.title} href={s.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                <div style={{
                  background: "#fff", borderRadius: 14, overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  display: "flex", flexDirection: "column", height: "100%",
                  transition: "transform .25s, box-shadow .25s",
                }}
                  className="service-photo-card"
                >
                  {/* Image */}
                  <div style={{ position: "relative", height: 210, overflow: "hidden", flexShrink: 0 }}>
                    <img
                      src={s.img}
                      alt={s.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s" }}
                      className="service-photo-card-img"
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,30,15,0.5) 0%, transparent 60%)" }} />
                    {s.tag && (
                      <span style={{
                        position: "absolute", top: 14, left: 14,
                        background: s.tagColor!, color: "#fff",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "4px 10px", borderRadius: 99,
                      }}>
                        {s.tag}
                      </span>
                    )}
                  </div>
                  {/* Body */}
                  <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{s.title}</h3>
                    <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.6, flex: 1, marginBottom: 20 }}>{s.desc}</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--brand-green)", fontSize: 15, fontWeight: 600 }}>
                      Learn more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. WHY CHOOSE US ── */}
      <section style={{ background: "#fff", padding: "60px 0" }}>
        <div className="site-container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionTag>Why Santa Cruz Tree Pros</SectionTag>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14 }}>
              The Right Team for the Job
            </h2>
            <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              We combine local expertise, certified skill, and old-fashioned reliability to deliver results that speak for themselves.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {WHY_ITEMS.map((w) => (
              <div key={w.title} className="why-card-hover" style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: 14, padding: "32px 24px",
                textAlign: "center",
                transition: "border-color .2s, box-shadow .2s",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "var(--brand-accent-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, margin: "0 auto 18px",
                }}>
                  {w.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{w.title}</h3>
                <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ── */}
      <section style={{ background: "var(--brand-green-dark)", padding: "60px 0" }}>
        <div className="site-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <SectionTagDark>Simple Process</SectionTagDark>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14, color: "#fff" }}>
              Getting Started is Easy
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              From your first call to a clean yard — here&apos;s exactly what to expect when you work with us.
            </p>
          </div>

          {/* Steps with connecting line */}
          <div style={{ position: "relative" }}>
            {/* Connecting line */}
            <div style={{
              position: "absolute", top: 60,
              left: "calc(12.5% + 12px)", right: "calc(12.5% + 12px)",
              height: 2, background: "rgba(134,239,172,0.25)",
              zIndex: 0,
            }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, position: "relative", zIndex: 1 }}>
              {HOW_STEPS.map((s) => (
                <div key={s.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 20px" }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: "50%",
                    background: "rgba(134,239,172,0.12)",
                    border: "2px solid rgba(134,239,172,0.35)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    marginBottom: 28, flexShrink: 0, gap: 4,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(134,239,172,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Step {s.num}</span>
                    <span style={{ fontSize: 40, lineHeight: 1 }}>{s.icon}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SERVICE AREA MAP ── */}
      <section style={{ background: "var(--bg-soft)", padding: "60px 0" }}>
        <div className="site-container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 56, alignItems: "center" }}>
            {/* Left: text + pills */}
            <div>
              <SectionTag>Where We Work</SectionTag>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14 }}>
                Proudly Serving<br />Santa Cruz County
              </h2>
              <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.6, marginBottom: 28 }}>
                From the coast to the mountains — if you&apos;re in Santa Cruz County, we&apos;ve got you covered.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {CITIES.map((city) => (
                  <Link key={city} href={`/service-areas/${city.toLowerCase().replace(/\s+/g, "-")}`} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#fff", border: "1px solid var(--border)",
                    borderRadius: 99, padding: "6px 16px",
                    fontSize: 14, fontWeight: 500, color: "var(--text)",
                    textDecoration: "none", transition: "border-color .2s, color .2s",
                  }}
                    className="city-pill-link"
                  >
                    📍 {city}
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <Link href="/service-areas" style={{
                  color: "var(--brand-green)", fontWeight: 600, fontSize: 15, textDecoration: "none",
                }}>
                  View all service areas →
                </Link>
              </div>
            </div>

            {/* Right: map */}
            <div style={{
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              height: 460,
            }}>
              <ServiceAreaMapWrapper />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FAQs ── */}
      <section style={{ background: "var(--bg-soft)", padding: "60px 0" }}>
        <div className="site-container">
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionTag>Common Questions</SectionTag>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              Everything you need to know before booking. Still have questions? We&apos;re happy to help.
            </p>
          </div>

          {/* FAQ grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {FAQS.map((f) => (
              <div key={f.q} style={{
                background: "#eef7f2",
                borderLeft: "5px solid var(--brand-green)",
                borderRadius: "0 14px 14px 0",
                padding: "0",
                boxShadow: "0 2px 12px rgba(27,94,53,0.08)",
                overflow: "hidden",
                transition: "box-shadow .2s, transform .2s",
              }}
                className="faq-card-hover"
              >
                {/* Card top accent bar */}
                <div style={{
                  height: 4,
                  background: "linear-gradient(90deg, var(--brand-green) 0%, var(--brand-accent) 100%)",
                  opacity: 0.45,
                }} />

                <div style={{ padding: "26px 28px 28px 32px" }}>
                  {/* Question row: icon + text */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                    {/* Green icon circle */}
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: "var(--brand-green)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2C5.8 2 4 3.6 4 5.6c0 1.4.8 2.6 2 3.2V10h4V8.8c1.2-.6 2-1.8 2-3.2C12 3.6 10.2 2 8 2zm0 8.5h-.5v1.5c0 .3.2.5.5.5s.5-.2.5-.5V10.5H8z" fill="white"/>
                        <circle cx="8" cy="13" r=".6" fill="white"/>
                      </svg>
                    </div>
                    <h3 style={{
                      fontSize: 19, fontWeight: 700, color: "var(--text)",
                      lineHeight: 1.35, margin: 0, paddingTop: 6,
                    }}>
                      {f.q}
                    </h3>
                  </div>

                  {/* Divider */}
                  <div style={{
                    height: 1,
                    background: "linear-gradient(90deg, rgba(27,94,53,0.25) 0%, transparent 100%)",
                    marginBottom: 14,
                    marginLeft: 52,
                  }} />

                  {/* Answer */}
                  <p style={{
                    fontSize: 16, color: "#3d4a3e", lineHeight: 1.75,
                    margin: "0 0 0 52px",
                  }}>
                    {f.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA nudge */}
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 16 }}>
              Don&apos;t see your question here?
            </p>
            <Link href="/free-estimate" style={{
              display: "inline-flex", alignItems: "center",
              background: "var(--brand-green)", color: "#fff",
              padding: "12px 28px", borderRadius: 8,
              fontSize: 16, fontWeight: 600, textDecoration: "none",
            }}>
              Ask Us Directly →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. CTA BAND ── */}
      <section style={{
        background: "linear-gradient(105deg, var(--brand-green-dark) 0%, var(--brand-green) 100%)",
        padding: "72px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-0.02em" }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.78)", marginBottom: 36, lineHeight: 1.6 }}>
            Get a free, no-obligation estimate from Santa Cruz&apos;s most trusted tree care team. We respond within 24 hours.
          </p>
          <Link
            href="/free-estimate"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "#fff", color: "var(--brand-green)",
              padding: "15px 36px", borderRadius: 8,
              fontSize: 18, fontWeight: 700, textDecoration: "none",
            }}
          >
            Get Your Free Estimate
          </Link>
        </div>
      </section>

    </main>
  );
}
