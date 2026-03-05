"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type HeroCarouselProps = {
  heightPx?: number;
  images?: string[];
  intervalMs?: number;
};

const DEFAULT_IMAGES = [
  "/images/hero/slide-1.jpg",
  "/images/hero/slide-2.jpg",
  "/images/hero/slide-3.jpg",
  "/images/hero/slide-4.jpg",
];

const DEFAULT_ALTS = [
  "Professional tree removal service in Santa Cruz, CA",
  "Expert tree trimming and pruning in Santa Cruz County",
  "Emergency tree service and storm damage cleanup in Santa Cruz",
  "Stump grinding and tree care services in Santa Cruz, CA",
];

export default function HeroCarousel({
  heightPx = 480,
  images,
  intervalMs = 6000,
}: HeroCarouselProps) {
  const slides = useMemo(() => {
    const list = (images && images.length ? images : DEFAULT_IMAGES).filter(Boolean);
    return list.length ? list : DEFAULT_IMAGES;
  }, [images]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(t);
  }, [slides.length, intervalMs, paused]);

  return (
    <section
      className="relative w-full overflow-hidden rounded-xl"
      style={{ height: `${heightPx}px` }}
      aria-label="Hero carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={[
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              i === index ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden={i !== index}
          >
            <Image
              src={src}
              alt={DEFAULT_ALTS[i] ?? "Santa Cruz Tree Pros — professional tree services"}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      {slides.length > 1 ? (
        <div className="absolute bottom-3 right-6 z-10 flex items-center gap-2 sm:right-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                "h-2 w-2 rounded-full transition-all",
                i === index
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/70",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
