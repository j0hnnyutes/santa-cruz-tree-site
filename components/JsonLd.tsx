/**
 * Thin wrapper that renders any JSON-LD object as a <script> tag.
 * Works in both Server and Client components.
 *
 * Usage:
 *   import JsonLd from "@/components/JsonLd";
 *   import { serviceBreadcrumb } from "@/lib/jsonld";
 *   ...
 *   <JsonLd data={serviceBreadcrumb("Tree Removal", "tree-removal")} />
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
