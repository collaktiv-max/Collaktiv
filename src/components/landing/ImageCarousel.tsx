"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera } from "lucide-react";

export interface CarouselSlide {
  src?: string;
  alt: string;
}

const placeholderSlides: CarouselSlide[] = [
  { alt: "Bild från UF-året" },
  { alt: "Bild från UF-året" },
  { alt: "Bild från UF-året" },
  { alt: "Bild från UF-året" },
];

export function ImageCarousel({
  slides = placeholderSlides,
  intervalMs = 4000,
  className = "",
}: {
  slides?: CarouselSlide[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  const slide = slides[Math.min(index, slides.length - 1)];

  return (
    <div
      className={`relative h-full min-h-[320px] overflow-hidden rounded-[1.75rem] border border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)] ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {slide.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--color-brand-secondary)] to-[var(--color-brand-mint)]/50 text-[var(--color-brand-primary)]">
              <Camera className="h-8 w-8 opacity-50" />
              <span className="text-xs font-bold opacity-60">{slide.alt}</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Visa bild ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
