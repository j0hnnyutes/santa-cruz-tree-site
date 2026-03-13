// app/blog/page.tsx  — Blog listing with search + category filtering
import Link from "next/link";
import BlogFilters from "@/components/BlogFilters";
import { getAllPosts } from "@/lib/blog";

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

export default function BlogPage() {
  // All posts passed to the client component for filtering + client-side pagination
  const allPosts = getAllPosts();

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

      {/* ── Search + Filter + Grid + Pagination (client component) ── */}
      <BlogFilters allPosts={allPosts} />

      {/* ── Bottom CTA ── */}
      <section
        style={{
          background: "var(--brand-green)",
          padding: "56px 0",
          textAlign: "center",
        }}
      >
        <div className="site-container">
          <h2
            style={{
              fontSize: "clamp(20px, 2.5vw, 30px)",
              fontWeight: 800,
              color: "#fff",
              marginBottom: 12,
            }}
          >
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
