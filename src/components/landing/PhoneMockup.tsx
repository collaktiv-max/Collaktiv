"use client";

import { Heart, Home, Ticket, Trophy, Tag, Star, MapPin } from "lucide-react";

export function PhoneMockup({
  companyName = "Ert företag",
  discountLabel = "20% rabatt på hela köpet",
  discountBadge = "-20%",
  points = 35,
  distance = "1,2 km bort",
  emoji = "🛍️",
  className = "",
}: {
  companyName?: string;
  discountLabel?: string;
  discountBadge?: string;
  points?: number;
  distance?: string;
  emoji?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-[240px] sm:w-[270px] rounded-[2.75rem] border-[10px] border-[#0f1f18] bg-[#0f1f18] shadow-2xl ${className}`}
    >
      <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#0f1f18]" />
      <div className="overflow-hidden rounded-[2.1rem] bg-white">
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-bold text-[var(--color-brand-ink)]">
          <span>9:41</span>
          <span>100%</span>
        </div>

        <div className="px-5 pb-5 pt-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-primary)]">
            Erbjudanden
          </p>
          <h3 className="mt-0.5 text-xl font-extrabold text-[var(--color-brand-ink)]">
            Veckans erbjudande
          </h3>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white shadow-sm">
            <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-[var(--color-brand-secondary)] to-[#e5f3ea] text-5xl">
              {emoji}
              <span className="absolute left-3 top-3 rounded-lg bg-[#e0432c] px-2 py-1 text-[11px] font-extrabold text-white">
                {discountBadge}
              </span>
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#e0432c]">
                <Heart className="h-4 w-4" fill="currentColor" />
              </span>
              <span className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-[var(--color-brand-primary)]">
                  {companyName.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-xs font-bold text-white drop-shadow">
                  {companyName}
                </span>
              </span>
            </div>
            <div className="p-4">
              <p className="text-[15px] font-extrabold leading-snug text-[var(--color-brand-ink)]">
                {discountLabel}
              </p>
              <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-[var(--color-brand-muted)]">
                Visa koden i kassan och få rabatt på ditt nästa besök hos oss.
              </p>
              <p className="mt-2 flex items-center gap-1 text-[11.5px] font-semibold text-[var(--color-brand-muted)]">
                <MapPin className="h-3.5 w-3.5" /> Gävle centrum · {distance}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[12.5px] font-extrabold text-[var(--color-brand-primary)]">
                  <Star className="h-3.5 w-3.5 fill-current" /> {points} resepoäng
                </span>
                <span className="rounded-full bg-[var(--color-brand-primary)] px-4 py-1.5 text-xs font-extrabold text-white">
                  Lös in
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--color-brand-border)] p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
              <Tag className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-bold text-[var(--color-brand-ink)]">
                Fika hos partner
              </p>
              <p className="text-[11.5px] font-medium text-[var(--color-brand-muted)]">
                25 resepoäng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-[var(--color-brand-border)] px-2 py-3">
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
