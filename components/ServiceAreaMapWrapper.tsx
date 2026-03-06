"use client";

import dynamic from "next/dynamic";

const ServiceAreaMap = dynamic(() => import("@/components/ServiceAreaMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%",
      background: "#e8f0e8",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#1b5e35", fontWeight: 600, fontSize: 15,
    }}>
      Loading map…
    </div>
  ),
});

export default function ServiceAreaMapWrapper() {
  return <ServiceAreaMap />;
}
