"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyEstimateButton from "@/components/StickyEstimateButton";
import HeroCarousel from "@/components/HeroCarousel";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <Header />

      {/* Full-width hero ONLY on homepage */}
      {isHome && <HeroCarousel />}

      {/* Constrained site content */}
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6">
        {children}
      </div>

      <Footer />
      <StickyEstimateButton />
    </>
  );
}