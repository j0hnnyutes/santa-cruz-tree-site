// lib/blog.ts
// SERVER-ONLY — imports Node.js 'fs' and 'path'. Never import this from a
// "use client" component. Use lib/blog-shared.ts for shared types/utils.

import fs from "fs";
import path from "path";

// Re-export everything from the shared module so existing server imports
// (app/blog/page.tsx, app/blog/[slug]/page.tsx, etc.) keep working unchanged.
export type { BlogPostMeta, BlogPost } from "./blog-shared";
export { POSTS_PER_PAGE, formatDate } from "./blog-shared";

import type { BlogPostMeta, BlogPost } from "./blog-shared";
import { POSTS_PER_PAGE } from "./blog-shared";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

/** Parse simple YAML-style frontmatter between --- delimiters */
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, "");
    if (key) meta[key] = val;
  }

  return { meta, body: match[2] };
}

function metaFromFile(filename: string): BlogPostMeta {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { meta } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    description: meta.description ?? "",
    category: meta.category ?? "Tree Care",
    readTime: meta.readTime ?? "5 min read",
    ...(meta.image ? { image: meta.image } : {}),
  };
}

/** Returns all posts sorted newest → oldest */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(metaFromFile)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Returns a single post with body content, or null if not found */
export function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { meta, body } = parseFrontmatter(raw);

  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    description: meta.description ?? "",
    category: meta.category ?? "Tree Care",
    readTime: meta.readTime ?? "5 min read",
    content: body,
    ...(meta.image ? { image: meta.image } : {}),
  };
}

/** Returns a slice of posts for a given page (1-indexed) */
export function getPaginatedPosts(page: number, perPage = POSTS_PER_PAGE): BlogPostMeta[] {
  const all = getAllPosts();
  const start = (page - 1) * perPage;
  return all.slice(start, start + perPage);
}

/** Returns the total number of pages */
export function getTotalPages(perPage = POSTS_PER_PAGE): number {
  const all = getAllPosts();
  return Math.max(1, Math.ceil(all.length / perPage));
}
