"use client";

import { type ReactNode } from "react";
import { Heart, Home, Ticket, Trophy, Tag, Star, MapPin } from "lucide-react";

const sizeClasses = {
  md: "w-[240px] sm:w-[270px]",
  sm: "w-[168px] sm:w-[190px]",
};

export function PhoneMockup({
  companyName = "Ert företag",
  discountLabel = "20% rabatt på hela köpet",
  discountBadge = "-20%",
  points = 35,
  distance = "1,2 km bort",
  emoji = "🛍️",
  image,
  size = "md",
  className = "",
}: {
  companyName?: string;
  discountLabel?: string;
  discountBadge?: string;
  points?: number;
  distance?: string;
  emoji?: string;
  image?: ReactNode;
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto ${sizeClasses[size]} rounded-[2.75rem] border-[10px] border-[#0f1f18] bg-[#0f1f18] shadow-2xl ${className}`}
    >
      <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#0f1f18]" />
      <div className="overflow-hidden rounded-[2.1rem] bg-white">
        <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[10.5px] font-bold text-[var(--color-brand-ink)]">
          <span>9:41</span>
          <span>100%</span>
        </div>

        <div className="px-4 pb-4 pt-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-brand-primary)]">
            Erbjudanden
          </p>
          <h3 className="text-[17px] font-extrabold leading-tight text-[var(--color-brand-ink)]">
            Veckans erbjudande
          </h3>

          <div className="mt-2.5 overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white shadow-sm">
            <div className="relative flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-secondary)] to-[#e5f3ea] text-4xl">
              {image ?? emoji}
              <span className="absolute left-2.5 top-2.5 rounded-lg bg-[#e0432c] px-2 py-1 text-[10px] font-extrabold text-white">
                {discountBadge}
              </span>
              <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#e0432c]">
                <Heart className="h-3.5 w-3.5" fill="currentColor" />
              </span>
              <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-extrabold text-[var(--color-brand-primary)]">
                  {companyName.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {companyName}
                </span>
              </span>
            </div>
            <div className="p-3">
              <p className="text-[13.5px] font-extrabold leading-snug text-[var(--color-brand-ink)]">
                {discountLabel}
              </p>
              <p className="mt-1 text-[11px] font-medium leading-snug text-[var(--color-brand-muted)]">
                Visa koden i kassan och få rabatt.
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold text-[var(--color-brand-muted)]">
                <MapPin className="h-3 w-3" /> Gävle centrum · {distance}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11.5px] font-extrabold text-[var(--color-brand-primary)]">
                  <Star className="h-3 w-3 fill-current" /> {points} resepoäng
                </span>
                <span className="rounded-full bg-[var(--color-brand-primary)] px-3.5 py-1.5 text-[11px] font-extrabold text-white">
                  Lös in
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2.5 rounded-2xl border border-[var(--color-brand-border)] p-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
              <Tag className="h-3.5 w-3.5" />
            </span>
            <div className="leading-tight">
              <p className="text-[11.5px] font-bold text-[var(--color-brand-ink)]">
                Fika hos partner
              </p>
              <p className="text-[10px] font-medium text-[var(--color-brand-muted)]">
                25 resepoäng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-[var(--color-brand-border)] px-2 py-2">
          {[
            { icon: Home, label: "Hem", active: false },
            { icon: Ticket, label: "Biljetter", active: false },
            { icon: Tag, label: "Erbjudanden", active: true },
            { icon: Trophy, label: "Tävla", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                active ? "text-[var(--color-brand-primary)]" : "text-[var(--color-brand-muted)]/60"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
