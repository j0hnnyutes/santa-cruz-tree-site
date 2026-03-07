import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE = "https://santacruztreepros.com";

const cities = [
  "santa-cruz",
  "watsonville",
  "capitola",
  "soquel",
  "aptos",
  "monterey",
  "scotts-valley",
  "live-oak",
  "felton",
  "boulder-creek",
  "ben-lomond",
];

const services = [
  "tree-removal",
  "tree-trimming",
  "stump-grinding-root-removal",
  "emergency-tree-service",
  "arborist-consulting",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/free-estimate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/service-areas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = cities.map((slug) => ({
    url: `${BASE}/service-areas/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogIndex: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/blog`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date).toISOString() : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages, ...cityPages, ...blogIndex, ...blogPosts];
}
