// lib/blog.ts
// Reads .md files from content/blog/, parses frontmatter, returns post data.
// No external dependencies — pure Node.js fs + built-in string parsing.

import fs from "fs";
import path from "path";

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;       // ISO date string e.g. "2025-03-01"
  description: string;
  category: string;
  readTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;    // raw markdown body (after frontmatter)
}

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
  };
}

export const POSTS_PER_PAGE = 12;

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

/** Format ISO date to readable string e.g. "March 1, 2025" */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
