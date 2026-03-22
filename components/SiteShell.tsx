"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyEstimateButton from "@/components/StickyEstimateButton";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      <div id="main-content">{children}</div>

      <Footer />
      <StickyEstimateButton />
    </>
  );
}