"use client";

export default function ServiceAreaMap() {
  return (
    <iframe
      title="Santa Cruz Tree Pros Service Area"
      src="https://maps.google.com/maps?q=Santa+Cruz+County,CA&t=m&z=10&ie=UTF8&iwloc=B&output=embed"
      width="100%"
      height="100%"
      style={{ border: 0, display: "block" }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
