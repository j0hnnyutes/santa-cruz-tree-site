"use client";

// components/BlogFilters.tsx
// Client-side search + category filter for the blog listing page.
// Mobile-first: search full-width, pills wrap with proper touch targets,
// pagination simplifies on narrow screens.

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { BlogPostMeta, formatDate, POSTS_PER_PAGE } from "@/lib/blog-shared";

/* ─── Category colour map ─────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, { bg: string; text: string; activeBg: string; activeText: string }> = {
  "Pricing & Planning": { bg: "#dcfce7", text: "#166534", activeBg: "#166534", activeText: "#fff" },
  "Tree Care":          { bg: "#dbeafe", text: "#1e40af", activeBg: "#1e40af", activeText: "#fff" },
  "Safety & Hazards":   { bg: "#fee2e2", text: "#991b1b", activeBg: "#991b1b", activeText: "#fff" },
  "Seasonal":           { bg: "#fef9c3", text: "#854d0e", activeBg: "#854d0e", activeText: "#fff" },
  "Services":           { bg: "#f3e8ff", text: "#6b21a8", activeBg: "#6b21a8", activeText: "#fff" },
  "Local Regulations":  { bg: "#e0f2fe", text: "#0c4a6e", activeBg: "#0c4a6e", activeText: "#fff" },
  "Service Areas":      { bg: "#f0fdf4", text: "#166534", activeBg: "#15803d", activeText: "#fff" },
  "Tree Removal":       { bg: "#fff7ed", text: "#9a3412", activeBg: "#c2410c", activeText: "#fff" },
  "Tree Law & Permits": { bg: "#f0f9ff", text: "#075985", activeBg: "#0369a1", activeText: "#fff" },
};

function cardCategoryStyle(cat: string) {
  const c = CATEGORY_COLORS[cat];
  return c ? { bg: c.bg, text: c.text } : { bg: "#f3f4f6", text: "#374151" };
}

interface Props {
  allPosts: BlogPostMeta[];
}

export default function BlogFilters({ allPosts }: Props) {
  const [query, setQuery]               = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage]                 = useState(1);

  /* scroll anchor */
  const gridTopRef   = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  /* category list derived from posts, preserving colour-map order */
  const categories = useMemo(() => {
    const order = Object.keys(CATEGORY_COLORS);
    const found: string[] = [];
    const extra = new Set<string>();
    for (const cat of order) {
      if (allPosts.some((p) => p.category === cat)) found.push(cat);
    }
    for (const post of allPosts) {
      if (!CATEGORY_COLORS[post.category] && !extra.has(post.category)) {
        extra.add(post.category);
        found.push(post.category);
      }
    }
    return found;
  }, [allPosts]);

  const trimmed    = query.trim().toLowerCase();
  const isFiltered = trimmed.length > 0 || activeCategory !== null;

  const filtered = useMemo(() => allPosts.filter((p) => {
    const matchesCat   = !activeCategory || p.category === activeCategory;
    const matchesQuery = !trimmed
      || p.title.toLowerCase().includes(trimmed)
      || p.description.toLowerCase().includes(trimmed)
      || p.category.toLowerCase().includes(trimmed);
    return matchesCat && matchesQuery;
  }), [allPosts, activeCategory, trimmed]);

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

  function getPageNumbers(): (number | "…")[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    const start = Math.max(2, page - 1);
    const end   = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  /* shared button style factories */
  const paginationBtn = (active = false, disabled = false) => ({
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minWidth: 44,
    height: 44,
    padding: "0 14px",
    borderRadius: 8,
    border: disabled ? "1px solid #e5e7eb" : "1px solid #d1d5db",
    background: active ? "var(--brand-green)" : disabled ? "#f9fafb" : "#fff",
    color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    cursor: disabled ? "default" as const : "pointer" as const,
  });

  return (
    <>
      {/* ── Scoped responsive styles ── */}
      <style>{`
        .bf-filterbar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }
        .bf-search-wrap {
          position: relative;
          width: 100%;
        }
        .bf-search-wrap svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }
        .bf-search-wrap input {
          width: 100%;
          padding: 11px 12px 11px 38px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          background: #fff;
          color: #111827;
          outline: none;
          box-sizing: border-box;
          -webkit-appearance: none;
        }
        .bf-search-wrap input:focus {
          border-color: var(--brand-green);
          box-shadow: 0 0 0 3px rgba(34,107,51,0.12);
        }
        .bf-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .bf-pill {
          padding: 8px 14px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
          line-height: 1;
          /* ensure 44px min touch target without visual bulk */
          min-height: 36px;
          display: inline-flex;
          align-items: center;
        }
        .bf-pill-clear {
          padding: 8px 14px;
          border-radius: 99px;
          border: 1px solid #d1d5db;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          background: #fff;
          color: #6b7280;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
        }
        .bf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .bf-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 48px;
        }
        /* On very small screens hide intermediate page numbers,
           keep only Prev / current / Next */
        @media (max-width: 400px) {
          .bf-page-num { display: none; }
          .bf-page-ellipsis { display: none; }
        }
        @media (min-width: 640px) {
          .bf-filterbar {
            flex-direction: row;
            align-items: flex-start;
          }
          .bf-search-wrap {
            flex: 0 0 260px;
            width: 260px;
          }
          .bf-pills {
            flex: 1 1 auto;
          }
          .bf-grid {
            gap: 28px;
          }
        }
      `}</style>

      <section style={{ background: "#f9fafb", padding: "40px 0 80px" }}>
        {/* Scroll anchor */}
        <div ref={gridTopRef} style={{ scrollMarginTop: 80 }} />
        <div className="site-container">

          {/* ── Search + Filter Bar ── */}
          <div className="bf-filterbar">

            {/* Search */}
            <div className="bf-search-wrap">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx={11} cy={11} r={8} />
                <line x1={21} y1={21} x2={16.65} y2={16.65} />
              </svg>
              <input
                type="search"
                placeholder="Search articles…"
                value={query}
                onChange={handleQueryChange}
                autoComplete="off"
              />
            </div>

            {/* Category pills */}
            <div className="bf-pills">
              {categories.map((cat) => {
                const colors = CATEGORY_COLORS[cat] ?? {
                  bg: "#f3f4f6", text: "#374151", activeBg: "#374151", activeText: "#fff",
                };
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    className="bf-pill"
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      background: isActive ? colors.activeBg : colors.bg,
                      color: isActive ? colors.activeText : colors.text,
                      boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
              {isFiltered && (
                <button
                  className="bf-pill-clear"
                  onClick={() => { setActiveCategory(null); setQuery(""); setPage(1); }}
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
            <div className="bf-grid">
              {displayedPosts.map((post) => {
                const { bg, text } = cardCategoryStyle(post.category);
                return (
                  <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                    <article className="blog-card" style={{ padding: post.image ? 0 : undefined }}>
                      {/* Card image */}
                      {post.image && (
                        <div style={{ position: "relative", height: 180, borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
                          <NextImage
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <div style={{ padding: post.image ? "18px 20px 20px" : undefined }}>
                      {/* Category + read time */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <span style={{
                          background: bg, color: text, fontSize: 11, fontWeight: 700,
                          letterSpacing: "0.05em", textTransform: "uppercase",
                          padding: "3px 10px", borderRadius: 99,
                        }}>
                          {post.category}
                        </span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{post.readTime}</span>
                      </div>

                      {/* Title */}
                      <h2 style={{
                        fontSize: 17, fontWeight: 700, color: "#111827",
                        lineHeight: 1.4, marginBottom: 10, flexGrow: 1,
                      }}>
                        {post.title}
                      </h2>

                      {/* Description */}
                      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 18 }}>
                        {post.description}
                      </p>

                      {/* Date + Read link */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderTop: "1px solid #f3f4f6", paddingTop: 14, marginTop: "auto",
                      }}>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(post.date)}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-green)" }}>
                          Read article →
                        </span>
                      </div>
                      </div>{/* end inner padding wrapper */}
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {/* ── Pagination ── */}
          {!isFiltered && totalPages > 1 && (
            <nav className="bf-pagination" aria-label="Blog pagination">

              {/* Prev */}
              {page > 1 ? (
                <button onClick={() => setPage((p) => p - 1)} style={paginationBtn()}>
                  ← Prev
                </button>
              ) : (
                <span style={paginationBtn(false, true)}>← Prev</span>
              )}

              {/* Page numbers (hidden on very narrow screens via CSS) */}
              {getPageNumbers().map((p, i) =>
                p === "…" ? (
                  <span key={`e-${i}`} className="bf-page-ellipsis"
                    style={{ padding: "0 4px", color: "#9ca3af", fontSize: 14, lineHeight: "44px" }}>
                    …
                  </span>
                ) : p === page ? (
                  <span key={p} className="bf-page-num" style={paginationBtn(true)} aria-current="page">
                    {p}
                  </span>
                ) : (
                  <button key={p} className="bf-page-num"
                    onClick={() => setPage(p as number)} style={paginationBtn()}>
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              {page < totalPages ? (
                <button onClick={() => setPage((p) => p + 1)} style={paginationBtn()}>
                  Next →
                </button>
              ) : (
                <span style={paginationBtn(false, true)}>Next →</span>
              )}
            </nav>
          )}

          {/* Page count */}
          {!isFiltered && totalPages > 1 && (
            <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#9ca3af" }}>
              Page {page} of {totalPages}
            </p>
          )}

        </div>
      </section>
    </>
  );
}
