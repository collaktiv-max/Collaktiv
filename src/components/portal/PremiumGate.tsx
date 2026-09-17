"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { type ReactNode } from "react";

export function PremiumGate({
  children,
  onUpgrade,
  title = "Premium-statistik",
  description = "Uppgradera för att se detaljerad statistik, som populäraste tider och per-erbjudande-data.",
}: {
  children: ReactNode;
  onUpgrade: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white">
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 p-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">{title}</p>
          <p className="mx-auto mt-1 max-w-xs text-xs font-medium text-[var(--color-brand-muted)]">
            {description}
          </p>
        </div>
        <Button size="sm" onClick={onUpgrade} icon={<Sparkles className="h-3.5 w-3.5" />}>
          Uppgradera till Premium
        </Button>
      </div>
    </div>
  );
}
