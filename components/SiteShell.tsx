"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyEstimateButton from "@/components/StickyEstimateButton";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />

      {/* Constrained site content */}
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6">
        {children}
      </div>

      <Footer />
      <StickyEstimateButton />
    </>
  );
}