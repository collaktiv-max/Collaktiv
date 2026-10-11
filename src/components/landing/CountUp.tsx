"use client";

import { useEffect, useRef, useState } from "react";

const format = (n: number) => n.toLocaleString("sv-SE");

// Räknar upp en siffra när den skrollas fram, t.ex. "200 000+". Det färdiga
// värdet renderas från början, så sökmotorer och skärmläsare ser rätt tal.
export function CountUp({ value }: { value: string }) {
  const match = value.replace(/\s/g, "").match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (target === null || !el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    let frame = 0;
    // Siffran nollställs först när den är utom synhåll, så ingen ser hoppet.
    setShown(format(0) + suffix);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(format(Math.round(target * eased)) + suffix);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, suffix]);

  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
