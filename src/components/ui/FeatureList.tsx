"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Info } from "lucide-react";
import type { PlanFeature } from "@/lib/pricing";

export function FeatureList({
  features,
  checkClassName = "text-[var(--color-brand-muted)]",
  className = "",
}: {
  features: PlanFeature[];
  checkClassName?: string;
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <ul ref={listRef} className={`flex flex-col gap-2.5 ${className}`}>
      {features.map((feature, i) => {
        const open = openIndex === i;
        return (
          <li key={feature.label} className="relative">
            <div className="flex items-start justify-between gap-2.5">
              <span className="flex items-start gap-2.5 text-[13px] font-semibold text-[var(--color-brand-ink)]">
                <Check className={`mt-0.5 h-4 w-4 shrink-0 ${checkClassName}`} />
                {feature.label}
              </span>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-label={`Mer information om ${feature.label}`}
                aria-expanded={open}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                  open
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                    : "border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
                }`}
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            {open && (
              <div className="relative z-10 mt-2 rounded-xl border border-[var(--color-brand-border)] bg-white p-3 text-[12px] font-medium leading-relaxed text-[var(--color-brand-muted)] shadow-md">
                {feature.detail}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
