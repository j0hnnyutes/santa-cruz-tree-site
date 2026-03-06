"use client";

// Bounding box covers all 11 service cities across Santa Cruz County
// bbox = west, south, east, north  →  -122.35, 36.55, -121.55, 37.20
const OSM_URL =
  "https://www.openstreetmap.org/export/embed.html" +
  "?bbox=-122.35%2C36.55%2C-121.55%2C37.20" +
  "&layer=mapnik";

export default function ServiceAreaMap() {
  return (
    <iframe
      title="Santa Cruz Tree Pros Service Area"
      src={OSM_URL}
      width="100%"
      height="100%"
      style={{ border: 0, display: "block" }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
