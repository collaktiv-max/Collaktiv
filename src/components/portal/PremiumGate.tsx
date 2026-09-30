"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PremiumGate({
  onUpgrade,
  title = "Premium-statistik",
  description = "Uppgradera för att se detaljerad statistik, som populäraste tider och per-erbjudande-data.",
  ctaLabel = "Uppgradera till Premium",
}: {
  onUpgrade: () => void;
  title?: string;
  description?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/30 p-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)]">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs font-medium text-[var(--color-brand-muted)]">
          {description}
        </p>
      </div>
      <Button size="sm" onClick={onUpgrade} icon={<Sparkles className="h-3.5 w-3.5" />}>
        {ctaLabel}
      </Button>
    </div>
  );
}
