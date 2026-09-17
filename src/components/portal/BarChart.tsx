"use client";

import { useState } from "react";

export function BarChart({
  data,
  unit = "",
}: {
  data: { label: string; value: number }[];
  unit?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-40 items-end gap-2.5 sm:gap-3">
      {data.map((d, i) => {
        const heightPct = Math.max(6, (d.value / max) * 100);
        const isHover = hover === i;
        return (
          <div
            key={d.label}
            className="relative flex flex-1 flex-col items-center gap-2"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {isHover && (
              <div className="absolute -top-8 z-10 whitespace-nowrap rounded-lg bg-[#0f1f18] px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg">
                {d.value}
                {unit}
              </div>
            )}
            <div className="flex h-32 w-full items-end rounded-md bg-[var(--color-brand-secondary)]">
              <div
                className="w-full rounded-md transition-all duration-300"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isHover
                    ? "var(--color-brand-primary-hover)"
                    : "var(--color-brand-primary)",
                }}
              />
            </div>
            <span className="text-[10.5px] font-bold text-[var(--color-brand-muted)]">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
