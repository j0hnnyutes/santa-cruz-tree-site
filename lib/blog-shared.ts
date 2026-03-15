// lib/blog-shared.ts
// Types, constants, and pure utility functions shared between server code
// (lib/blog.ts) and client components (e.g. BlogFilters).
// Must NOT import 'fs', 'path', or any other Node-only module.

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;       // ISO date string e.g. "2025-03-01"
  description: string;
  category: string;
  readTime: string;
  image?: string;     // optional: path relative to /public e.g. "/images/blog/my-article.jpg"
}

export interface BlogPost extends BlogPostMeta {
  content: string;    // raw markdown body (after frontmatter)
}

export const POSTS_PER_PAGE = 12;

/** Format ISO date to readable string e.g. "March 1, 2025" */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
