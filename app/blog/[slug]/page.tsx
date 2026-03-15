// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPost, formatDate } from "@/lib/blog";
import { markdownToHtml } from "@/lib/markdown";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `https://santacruztreepros.com/blog/${slug}`;
  return {
    title: `${post.title} | Santa Cruz Tree Pros`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      siteName: "Santa Cruz Tree Pros",
      publishedTime: post.date,
      ...(post.image ? { images: [`https://santacruztreepros.com${post.image}`] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.image ? { images: [`https://santacruztreepros.com${post.image}`] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const bodyHtml = markdownToHtml(post.content);
  const url = `https://santacruztreepros.com/blog/${slug}`;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Organization",
      name: "Santa Cruz Tree Pros",
      url: "https://santacruztreepros.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Santa Cruz Tree Pros",
      url: "https://santacruztreepros.com",
      logo: {
        "@type": "ImageObject",
        url: "https://santacruztreepros.com/sctreepros-logo.svg",
      },
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />

      {/* ── Article Hero ── */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--brand-dark,#0a1e0f) 0%, #0f2d17 100%)",
          padding: "clamp(36px, 6vw, 64px) 0 clamp(32px, 5vw, 56px)",
        }}
      >
        <div className="site-container" style={{ maxWidth: 780 }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
            <Link href="/blog" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
              Blog
            </Link>
            {" / "}
            <span style={{ color: "rgba(255,255,255,0.65)" }}>{post.category}</span>
          </div>

          {/* Category tag */}
          <span
            style={{
              display: "inline-block",
              background: "rgba(134,239,172,0.15)",
              color: "#86efad",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: 99,
              marginBottom: 18,
            }}
          >
            {post.category}
          </span>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(24px, 3.5vw, 42px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            {post.title}
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {formatDate(post.date)}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{post.readTime}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Santa Cruz Tree Pros</span>
          </div>
        </div>
      </section>

      {/* ── Article Hero Image (if provided) ── */}
      {post.image && (
        <section style={{ background: "#fff", paddingTop: 40, paddingBottom: 0 }}>
          <div className="site-container" style={{ maxWidth: 780 }}>
            <img
              src={post.image}
              alt={post.title}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: 440,
                objectFit: "cover",
                borderRadius: 12,
                display: "block",
              }}
            />
          </div>
        </section>
      )}

      {/* ── Article Body ── */}
      <section style={{ background: "#fff", padding: "56px 0 72px" }}>
        <div className="site-container" style={{ maxWidth: 780 }}>
          <div
            className="blog-body"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {/* ── In-article CTA ── */}
          <div
            style={{
              marginTop: 48,
              background: "var(--brand-accent-light,#dcfce7)",
              borderLeft: "4px solid var(--brand-green)",
              borderRadius: "0 10px 10px 0",
              padding: "24px 28px",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, color: "#14532d", marginBottom: 6 }}>
              Need a professional tree evaluation?
            </p>
            <p style={{ fontSize: 14, color: "#166534", marginBottom: 16, lineHeight: 1.6 }}>
              Santa Cruz Tree Pros serves all of Santa Cruz County with licensed, insured tree care. Get a free estimate today.
            </p>
            <Link
              href="/free-estimate"
              style={{
                display: "inline-block",
                background: "var(--brand-green)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                padding: "10px 22px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Request a Free Estimate
            </Link>
          </div>
        </div>
      </section>

      {/* ── Back to Blog ── */}
      <section style={{ background: "#f9fafb", padding: "36px 0 48px" }}>
        <div className="site-container" style={{ maxWidth: 780 }}>
          <Link
            href="/blog"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--brand-green)",
              textDecoration: "none",
            }}
          >
            ← Back to all articles
          </Link>
        </div>
      </section>
    </main>
  );
}
