// app/blog/page.tsx
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata = {
  title: "Tree Care Blog | Santa Cruz Tree Pros",
  description:
    "Expert tree care advice, local guides, and seasonal tips for Santa Cruz County homeowners. Learn when to trim, when to remove, and how to protect your trees.",
  alternates: { canonical: "https://santacruztreepros.com/blog" },
  openGraph: {
    title: "Tree Care Blog | Santa Cruz Tree Pros",
    description:
      "Expert tree care advice, local guides, and seasonal tips for Santa Cruz County homeowners.",
    url: "https://santacruztreepros.com/blog",
    type: "website",
    siteName: "Santa Cruz Tree Pros",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tree Care Blog | Santa Cruz Tree Pros",
    description:
      "Expert tree care advice, local guides, and seasonal tips for Santa Cruz County homeowners.",
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Pricing & Planning":  { bg: "#dcfce7", text: "#166534" },
  "Tree Care":           { bg: "#dbeafe", text: "#1e40af" },
  "Safety & Hazards":    { bg: "#fee2e2", text: "#991b1b" },
  "Seasonal":            { bg: "#fef9c3", text: "#854d0e" },
  "Services":            { bg: "#f3e8ff", text: "#6b21a8" },
  "Local Regulations":   { bg: "#e0f2fe", text: "#0c4a6e" },
};

function categoryStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: "#f3f4f6", text: "#374151" };
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main>
      {/* ── Hero ── */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--brand-dark,#0a1e0f) 0%, #0f2d17 100%)",
          padding: "clamp(40px, 7vw, 72px) 0 clamp(36px, 6vw, 64px)",
        }}
      >
        <div className="site-container" style={{ textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(134,239,172,0.15)",
              color: "#86efad",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: 99,
              marginBottom: 18,
            }}
          >
            Tree Care Blog
          </span>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Expert Tree Care Advice
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 540,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Local guides, seasonal tips, and practical advice for Santa Cruz County homeowners.
          </p>
        </div>
      </section>

      {/* ── Post Grid ── */}
      <section style={{ background: "#f9fafb", padding: "64px 0 80px" }}>
        <div className="site-container">
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>No posts yet — check back soon.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 28,
              }}
            >
              {posts.map((post) => {
                const { bg, text } = categoryStyle(post.category);
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <article className="blog-card">
                      {/* Category + read time */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <span
                          style={{
                            background: bg,
                            color: text,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            padding: "3px 10px",
                            borderRadius: 99,
                          }}
                        >
                          {post.category}
                        </span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{post.readTime}</span>
                      </div>

                      {/* Title */}
                      <h2
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#111827",
                          lineHeight: 1.4,
                          marginBottom: 10,
                          flexGrow: 1,
                        }}
                      >
                        {post.title}
                      </h2>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          lineHeight: 1.6,
                          marginBottom: 18,
                        }}
                      >
                        {post.description}
                      </p>

                      {/* Date + Read link */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "1px solid #f3f4f6",
                          paddingTop: 14,
                          marginTop: "auto",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>
                          {formatDate(post.date)}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--brand-green)",
                          }}
                        >
                          Read article →
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        style={{
          background: "var(--brand-green)",
          padding: "56px 0",
          textAlign: "center",
        }}
      >
        <div className="site-container">
          <h2 style={{ fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            Ready for a Free Estimate?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 28 }}>
            Serving Santa Cruz County with licensed, insured tree care.
          </p>
          <Link
            href="/free-estimate"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "var(--brand-green)",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px 28px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Request a Free Estimate
          </Link>
        </div>
      </section>
    </main>
  );
}
