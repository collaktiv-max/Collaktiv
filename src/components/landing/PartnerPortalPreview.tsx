"use client";

import { ChevronDown, Gift, Tag, BarChart3, Megaphone, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navItems } from "@/components/portal/nav-items";

const rows = [
  { icon: Tag, label: "Skapa och publicera erbjudanden" },
  { icon: BarChart3, label: "Se statistik och exponering" },
  { icon: Megaphone, label: "Ladda ner marknadsföringsmaterial" },
  { icon: UserRound, label: "Hantera er företagsprofil" },
];

export function PartnerPortalPreview({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-[260px] sm:w-[330px] lg:w-[400px] overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white shadow-2xl ${className}`}
    >
      <div className="flex">
        {/* Sidebar */}
        <div className="flex w-[92px] sm:w-[116px] shrink-0 flex-col gap-4 bg-[#0f1f18] px-2.5 py-4 sm:py-5">
          <Logo
            className="self-start pl-0.5"
            textClassName="text-[10px] text-white"
          />
          <nav className="flex flex-col gap-1">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const active = i === 1;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 ${
                    active ? "bg-white/10" : ""
                  }`}
                >
                  <Icon
                    className={`h-3 w-3 shrink-0 ${
                      active ? "text-[var(--color-brand-accent)]" : "text-white/50"
                    }`}
                  />
                  <span
                    className={`truncate text-[8px] sm:text-[9px] font-bold ${
                      active ? "text-white" : "text-white/40"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-3.5 sm:p-4">
          <p className="text-[10px] sm:text-[11px] font-medium text-[var(--color-brand-muted)]">
            Välkommen till
          </p>
          <p className="text-[13px] sm:text-[14.5px] font-extrabold text-[var(--color-brand-ink)]">
            Ert företag
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            {rows.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-brand-border)] px-2.5 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 text-[9.5px] sm:text-[10.5px] font-bold leading-tight text-[var(--color-brand-ink)]">
                  {label}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 text-[var(--color-brand-muted)]" />
              </div>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-2.5 rounded-lg bg-[var(--color-brand-mint)]/40 p-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)]">
              <Gift className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1">
              <p className="text-[9px] sm:text-[10px] font-bold leading-tight text-[var(--color-brand-ink)]">
                Bjud in ett företag, få en bonusmånad
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--color-brand-primary)] px-2.5 py-1 text-[8.5px] font-extrabold text-white">
              Läs mer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
