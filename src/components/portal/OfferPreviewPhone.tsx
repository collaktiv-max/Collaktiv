"use client";

import { Crown, Heart, MapPin, Sparkles, Star } from "lucide-react";
import { CATEGORY_LABELS, type Category, type PackageTier } from "@/lib/types";

export function OfferPreviewPhone({
  companyName,
  category,
  title,
  description,
  discountType,
  discountValue,
  pointsCost,
  emoji,
  imageDataUrl,
  tier = "standard",
}: {
  companyName: string;
  category: Category;
  title: string;
  description: string;
  discountType: "procent" | "belopp" | "erbjudande";
  discountValue: string;
  pointsCost: number;
  emoji: string;
  imageDataUrl?: string;
  tier?: PackageTier;
}) {
  const isPremium = tier === "premium";
  const badge =
    discountType === "procent"
      ? `-${discountValue.replace(/[^0-9]/g, "")}%`
      : discountType === "belopp"
      ? `-${discountValue}`
      : "ERBJ.";

  return (
    <div className="sticky top-6 mx-auto w-[260px]">
      <div
        className={`rounded-[2.5rem] border-[9px] bg-[#0f1f18] shadow-xl transition-colors ${
          isPremium
            ? "border-[var(--color-brand-primary)] shadow-[0_0_0_5px_rgba(22,104,73,0.16)]"
            : "border-[#0f1f18]"
        }`}
      >
        <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[#0f1f18]" />
        <div className="overflow-hidden rounded-[1.9rem] bg-white">
          <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[10px] font-bold text-[var(--color-brand-ink)]">
            <span>9:41</span>
            <span>100%</span>
          </div>
          <div className="px-4 pb-5 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-brand-primary)]">
                {CATEGORY_LABELS[category]}
              </p>
              {isPremium && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-mint)] px-2 py-0.5 text-[8.5px] font-extrabold text-[var(--color-brand-primary-hover)]">
                  <Crown className="h-2.5 w-2.5" /> Prioriterad
                </span>
              )}
            </div>
            <div
              className={`mt-2.5 overflow-hidden rounded-xl border bg-white shadow-sm transition-colors ${
                isPremium
                  ? "border-[var(--color-brand-primary)]/50 shadow-[0_0_16px_-6px_rgba(22,104,73,0.5)]"
                  : "border-[var(--color-brand-border)]"
              }`}
            >
              <div className="relative flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-secondary)] to-[#e5f3ea] text-4xl">
                {imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageDataUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  emoji || "🏷️"
                )}
                <span className="absolute left-2 top-2 rounded-md bg-[#e0432c] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                  {badge}
                </span>
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#e0432c]">
                  <Heart className="h-3 w-3" fill="currentColor" />
                </span>
                <span className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[8px] font-extrabold text-[var(--color-brand-primary)]">
                    {companyName.slice(0, 2).toUpperCase() || "ER"}
                  </span>
                  <span className="text-[10px] font-bold text-white drop-shadow">
                    {companyName || "Ert företag"}
                  </span>
                </span>
              </div>
              <div className="p-3">
                <p className="text-[12.5px] font-extrabold leading-snug text-[var(--color-brand-ink)]">
                  {title || "Titel på erbjudandet"}
                </p>
                <p className="mt-1 text-[10.5px] font-medium leading-snug text-[var(--color-brand-muted)] line-clamp-2">
                  {description || "Beskrivning av erbjudandet visas här."}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-[9.5px] font-semibold text-[var(--color-brand-muted)]">
                  <MapPin className="h-3 w-3" /> Gävle centrum · 1,2 km bort
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10.5px] font-extrabold text-[var(--color-brand-primary)]">
                    <Star className="h-3 w-3 fill-current" /> {pointsCost || 0} p
                  </span>
                  <span className="rounded-full bg-[var(--color-brand-primary)] px-3 py-1 text-[10px] font-extrabold text-white">
                    Lös in
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[10.5px] font-bold text-[var(--color-brand-muted)]">
        Så här ser erbjudandet ut i appen{isPremium ? " – med Premium" : ""}
      </p>

      {isPremium && (
        <div className="mx-auto mt-4 w-[260px] rounded-2xl border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-mint)]/30 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="text-[11.5px] font-extrabold text-[var(--color-brand-ink)]">
              Chans att synas som Veckans erbjudande
            </p>
          </div>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
            Med Premium kan erbjudandet lyftas fram överst i appen som
            Veckans erbjudande – extra synlighet precis när resenärerna
            öppnar den.
          </p>
        </div>
      )}
    </div>
  );
}
