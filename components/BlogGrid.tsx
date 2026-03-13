// components/BlogGrid.tsx
// Shared blog listing grid + pagination controls used by /blog and /blog/page/[n]

import Link from "next/link";
import { BlogPostMeta, formatDate } from "@/lib/blog-shared";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Pricing & Planning": { bg: "#dcfce7", text: "#166534" },
  "Tree Care":          { bg: "#dbeafe", text: "#1e40af" },
  "Safety & Hazards":   { bg: "#fee2e2", text: "#991b1b" },
  "Seasonal":           { bg: "#fef9c3", text: "#854d0e" },
  "Services":           { bg: "#f3e8ff", text: "#6b21a8" },
  "Local Regulations":  { bg: "#e0f2fe", text: "#0c4a6e" },
};

function categoryStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: "#f3f4f6", text: "#374151" };
}

interface Props {
  posts: BlogPostMeta[];
  currentPage: number;
  totalPages: number;
}

export default function BlogGrid({ posts, currentPage, totalPages }: Props) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  function pageHref(page: number) {
    return page === 1 ? "/blog" : `/blog/page/${page}`;
  }

  // Build array of page numbers to show (with ellipsis logic)
  function getPageNumbers(): (number | "…")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "…")[] = [1];
    if (currentPage > 3) pages.push("…");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <>
      {/* ── Post Grid ── */}
      <section style={{ background: "#f9fafb", padding: "64px 0 40px" }}>
        <div className="site-container">
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>
              No posts yet — check back soon.
            </p>
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
                  <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
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
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-green)" }}>
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <section style={{ background: "#f9fafb", padding: "0 0 80px" }}>
          <div className="site-container">
            <nav
              aria-label="Blog pagination"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {/* Prev */}
              {prevPage ? (
                <Link
                  href={pageHref(prevPage)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  ← Prev
                </Link>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    color: "#d1d5db",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "default",
                  }}
                >
                  ← Prev
                </span>
              )}

              {/* Page numbers */}
              {getPageNumbers().map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    style={{ padding: "8px 4px", color: "#9ca3af", fontSize: 14 }}
                  >
                    …
                  </span>
                ) : p === currentPage ? (
                  <span
                    key={p}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "var(--brand-green)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                    aria-current="page"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={pageHref(p as number)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      background: "#fff",
                      color: "#374151",
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    {p}
                  </Link>
                )
              )}

              {/* Next */}
              {nextPage ? (
                <Link
                  href={pageHref(nextPage)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Next →
                </Link>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    color: "#d1d5db",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "default",
                  }}
                >
                  Next →
                </span>
              )}
            </nav>

            {/* Page count summary */}
            <p
              style={{
                textAlign: "center",
                marginTop: 16,
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
