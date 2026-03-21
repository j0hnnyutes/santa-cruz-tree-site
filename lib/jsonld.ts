const SITE_URL = "https://santacruztreepros.com";

export interface BreadcrumbItem {
  name: string;
  item?: string; // URL — omit for the last (current) item per spec
}

/**
 * Build a BreadcrumbList JSON-LD object.
 * Home is always prepended automatically.
 *
 * @example
 * buildBreadcrumb([
 *   { name: "Services", item: "/services" },
 *   { name: "Tree Removal" },           // current page — no URL needed
 * ])
 */
export function buildBreadcrumb(crumbs: BreadcrumbItem[]) {
  const all = [{ name: "Home", item: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.name,
      ...(crumb.item
        ? { item: crumb.item.startsWith("http") ? crumb.item : `${SITE_URL}${crumb.item}` }
        : {}),
    })),
  };
}

/** Convenience: build breadcrumb for a single service page */
export function serviceBreadcrumb(name: string, slug: string) {
  return buildBreadcrumb([
    { name: "Services", item: "/services" },
    { name },
  ]);
}

/** Convenience: build breadcrumb for a service-area page */
export function serviceAreaBreadcrumb(name: string) {
  return buildBreadcrumb([
    { name: "Service Areas", item: "/service-areas" },
    { name },
  ]);
}

/** Convenience: build breadcrumb for a blog post */
export function blogBreadcrumb(title: string, slug: string) {
  return buildBreadcrumb([
    { name: "Blog", item: "/blog" },
    { name: title },
  ]);
}
