// app/blog/page/[page]/page.tsx  — Blog listing pages 2, 3, 4, ...
// /blog/page/1 redirects to /blog for canonical cleanliness
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import BlogGrid from "@/components/BlogGrid";
import { getPaginatedPosts, getTotalPages } from "@/lib/blog";

interface Props {
  params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
  const total = getTotalPages();
  // Generate params for pages 2..N  (page 1 is handled by /blog)
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
  const totalPages = getTotalPages();

  if (isNaN(page) || page < 2 || page > totalPages) {
    return { title: "Not Found" };
  }

  const pageTitle = `Tree Care Blog — Page ${page} | Santa Cruz Tree Pros`;
  const canonical = `https://santacruztreepros.com/blog/page/${page}`;

  return {
    title: pageTitle,
    description: `Tree care articles, local guides, and seasonal tips for Santa Cruz County homeowners. Page ${page} of ${totalPages}.`,
    alternates: {
      canonical,
      ...(page > 2 ? { prev: page === 2 ? "https://santacruztreepros.com/blog" : `https://santacruztreepros.com/blog/page/${page - 1}` } : {}),
      ...(page < totalPages ? { next: `https://santacruztreepros.com/blog/page/${page + 1}` } : {}),
    },
    openGraph: {
      title: pageTitle,
      url: canonical,
      type: "website",
      siteName: "Santa Cruz Tree Pros",
    },
    // Paginated pages shouldn't be indexed independently (the content appears on canonical /blog page 1)
    robots: { index: false, follow: true },
  };
}

export default async function BlogPageN({ params }: Props) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
  const totalPages = getTotalPages();

  // Redirect /blog/page/1 → /blog
  if (page === 1) redirect("/blog");

  // 404 for invalid pages
  if (isNaN(page) || page < 1 || page > totalPages) notFound();

  const posts = getPaginatedPosts(page);

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
            {" "}
            <Link
              href="/blog"
              style={{ color: "#86efad", textDecoration: "underline" }}
            >
              Back to page 1
            </Link>
          </p>
        </div>
      </section>

      {/* ── Post Grid + Pagination ── */}
      <BlogGrid posts={posts} currentPage={page} totalPages={totalPages} />

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
