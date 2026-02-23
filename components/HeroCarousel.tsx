"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type HeroCarouselProps = {
  heightPx?: number; // default 420
  images?: string[]; // optional override
  intervalMs?: number; // default 5000
};

const DEFAULT_IMAGES = [
  "/images/hero/slide-1.jpg",
  "/images/hero/slide-2.jpg",
  "/images/hero/slide-3.jpg",
  "/images/hero/slide-4.jpg",
];

export default function HeroCarousel({
  heightPx = 420,
  images,
  intervalMs = 5000,
}: HeroCarouselProps) {
  const slides = useMemo(() => {
    const list = (images && images.length ? images : DEFAULT_IMAGES).filter(Boolean);
    return list.length ? list : DEFAULT_IMAGES;
  }, [images]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(t);
  }, [slides.length, intervalMs]);

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
      style={{ height: `${heightPx}px` }}
      aria-label="Hero carousel"
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={[
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              i === index ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden={i !== index}
          >
            <Image
  src={src}
  alt=""
  fill
  priority={i === 0}
  sizes="100vw"
  className="object-cover"
/>
          </div>
        ))}
      </div>

      {/* Dots overlay bottom-center */}
      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-0 z-10 w-full flex justify-center">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={[
                  "h-2 w-2 rounded-full border border-white/70 transition",
                  i === index ? "bg-white" : "bg-white/30 hover:bg-white/60",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}