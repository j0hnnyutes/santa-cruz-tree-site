"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyEstimateButton from "@/components/StickyEstimateButton";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      <main id="main-content">{children}</main>

      <Footer />
      <StickyEstimateButton />
    </>
  );
}