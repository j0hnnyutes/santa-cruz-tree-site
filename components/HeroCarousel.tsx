"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  src: string;
  alt: string;
};

export default function HeroCarousel() {
  const slides: Slide[] = useMemo(
    () => [
      { src: "/images/hero/slide-1.jpg", alt: "Tree service in Santa Cruz County" },
      { src: "/images/hero/slide-2.jpg", alt: "Tree trimming and pruning in coastal conditions" },
      { src: "/images/hero/slide-3.jpg", alt: "Emergency tree service and storm cleanup" },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef<number | null>(null);
  const lastXRef = useRef<number | null>(null);
  const dragDeltaRef = useRef<number>(0);

  const goTo = (i: number) =>
    setIndex(((i % slides.length) + slides.length) % slides.length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Auto-advance (pauses only while dragging)
  useEffect(() => {
    if (slides.length <= 1) return;
    if (isDragging) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(id);
  }, [slides.length, isDragging]);

  // Swipe / drag
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    dragDeltaRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current == null || lastXRef.current == null) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    dragDeltaRef.current += dx;
  };

  const onPointerUp = () => {
    const totalDx = dragDeltaRef.current;
    const threshold = 50;

    if (totalDx > threshold) prev();
    else if (totalDx < -threshold) next();

    startXRef.current = null;
    lastXRef.current = null;
    dragDeltaRef.current = 0;

    window.setTimeout(() => setIsDragging(false), 250);
  };

  return (
    <section className="w-full overflow-hidden">
      <div
        className="relative w-full select-none"
        style={{ height: "clamp(260px, 40vw, 420px)" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-label="Homepage image carousel"
      >
        {slides.map((slide, i) => {
          const isActive = i === index;

          return (
            <div
              key={slide.src}
              className={[
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                isActive ? "opacity-100" : "opacity-0",
              ].join(" ")}
              aria-hidden={!isActive}
            >
              <div
                className={[
                  "absolute inset-0 transition-transform duration-[6500ms] ease-out",
                  isActive ? "scale-[1.05]" : "scale-100",
                ].join(" ")}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </div>
          );
        })}

        {/* Dots */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={[
                  "h-2.5 w-2.5 rounded-full transition",
                  i === index ? "bg-white" : "bg-white/50 hover:bg-white/80",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}