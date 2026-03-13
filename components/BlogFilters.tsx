"use client";

// components/BlogFilters.tsx
// Client-side search + category filter for the blog listing page.
// When a filter is active → shows ALL matching posts (no pagination).
// When no filter → shows paginated grid (12/page) via inline pagination.

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { BlogPostMeta, formatDate, POSTS_PER_PAGE } from "@/lib/blog-shared";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; activeBg: string; activeText: string }> = {
  "Pricing & Planning": { bg: "#dcfce7", text: "#166534", activeBg: "#166534", activeText: "#fff" },
  "Tree Care":          { bg: "#dbeafe", text: "#1e40af", activeBg: "#1e40af", activeText: "#fff" },
  "Safety & Hazards":   { bg: "#fee2e2", text: "#991b1b", activeBg: "#991b1b", activeText: "#fff" },
  "Seasonal":           { bg: "#fef9c3", text: "#854d0e", activeBg: "#854d0e", activeText: "#fff" },
  "Services":           { bg: "#f3e8ff", text: "#6b21a8", activeBg: "#6b21a8", activeText: "#fff" },
  "Local Regulations":  { bg: "#e0f2fe", text: "#0c4a6e", activeBg: "#0c4a6e", activeText: "#fff" },
};

function cardCategoryStyle(cat: string) {
  const c = CATEGORY_COLORS[cat];
  return c ? { bg: c.bg, text: c.text } : { bg: "#f3f4f6", text: "#374151" };
}

interface Props {
  allPosts: BlogPostMeta[];
}

export default function BlogFilters({ allPosts }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Ref to the top of the grid — scroll here whenever the page changes
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Scroll to grid top on every page change (skip the very first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  // Derive category list from posts (preserving declaration order above)
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const order = Object.keys(CATEGORY_COLORS);
    const found: string[] = [];
    for (const cat of order) {
      if (allPosts.some((p) => p.category === cat)) found.push(cat);
    }
    // Any category not in our color map
    for (const post of allPosts) {
      if (!seen.has(post.category) && !CATEGORY_COLORS[post.category]) {
        seen.add(post.category);
        found.push(post.category);
      }
    }
    return found;
  }, [allPosts]);

  const trimmed = query.trim().toLowerCase();
  const isFiltered = trimmed.length > 0 || activeCategory !== null;

  // Filter posts
  const filtered = useMemo(() => {
    return allPosts.filter((p) => {
      const matchesCat = !activeCategory || p.category === activeCategory;
      const matchesQuery =
        !trimmed ||
        p.title.toLowerCase().includes(trimmed) ||
        p.description.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed);
      return matchesCat && matchesQuery;
    });
  }, [allPosts, activeCategory, trimmed]);

  // When filter changes, reset to page 1
  const displayedPosts = isFiltered
    ? filtered
    : filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const totalPages = isFiltered ? 1 : Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));

  function handleCategoryClick(cat: string) {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setPage(1);
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPage(1);
  }

  function pageHref(p: number) {
    return p === 1 ? "/blog" : `/blog/page/${p}`;
  }

  function getPageNumbers(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <section style={{ background: "#f9fafb", padding: "40px 0 80px" }}>
      {/* Scroll target — sits just above the filter bar */}
      <div ref={gridTopRef} style={{ scrollMarginTop: 80 }} />
      <div className="site-container">

        {/* ── Search + Filter Bar ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {/* Search input */}
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 220, maxWidth: 340 }}>
            <svg
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
              }}
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx={11} cy={11} r={8} />
              <line x1={21} y1={21} x2={16.65} y2={16.65} />
            </svg>
            <input
              type="search"
              placeholder="Search articles…"
              value={query}
              onChange={handleQueryChange}
              style={{
                width: "100%",
                paddingLeft: 36,
                paddingRight: 12,
                paddingTop: 9,
                paddingBottom: 9,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                background: "#fff",
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: "1 1 auto" }}>
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat] ?? {
                bg: "#f3f4f6",
                text: "#374151",
                activeBg: "#374151",
                activeText: "#fff",
              };
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 99,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                    background: isActive ? colors.activeBg : colors.bg,
                    color: isActive ? colors.activeText : colors.text,
                    transition: "background 0.15s, color 0.15s",
                    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
                  }}
                >
                  {cat}
                </button>
              );
            })}
            {isFiltered && (
              <button
                onClick={() => { setActiveCategory(null); setQuery(""); setPage(1); }}
                style={{
                  padding: "5px 14px",
                  borderRadius: 99,
                  border: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#fff",
                  color: "#6b7280",
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Results count (when filtering) ── */}
        {isFiltered && (
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
            {filtered.length === 0
              ? "No articles match your search."
              : `${filtered.length} article${filtered.length === 1 ? "" : "s"} found`}
          </p>
        )}

        {/* ── Post Grid ── */}
        {displayedPosts.length === 0 && !isFiltered ? (
          <p style={{ textAlign: "center", color: "#9ca3af" }}>No posts yet — check back soon.</p>
        ) : displayedPosts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 28,
            }}
          >
            {displayedPosts.map((post) => {
              const { bg, text } = cardCategoryStyle(post.category);
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
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(post.date)}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-green)" }}>
                        Read article →
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : null}

        {/* ── Pagination (only when not filtering) ── */}
        {!isFiltered && totalPages > 1 && (
          <nav
            aria-label="Blog pagination"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 48,
            }}
          >
            {/* Prev */}
            {page > 1 ? (
              <button
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                ← Prev
              </button>
            ) : (
              <span
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#d1d5db",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                ← Prev
              </span>
            )}

            {/* Page numbers */}
            {getPageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} style={{ padding: "8px 4px", color: "#9ca3af", fontSize: 14 }}>…</span>
              ) : p === page ? (
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
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
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
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            {page < totalPages ? (
              <button
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            ) : (
              <span
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#d1d5db",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Next →
              </span>
            )}
          </nav>
        )}

        {/* Page count summary */}
        {!isFiltered && totalPages > 1 && (
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#9ca3af" }}>
            Page {page} of {totalPages}
          </p>
        )}
      </div>
    </section>
  );
}
