"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";
import type { CompanyProfile } from "@/lib/types";

export function OnboardingChecklist({
  company,
}: {
  company: CompanyProfile;
}) {
  const items = [
    {
      label: "Lägg till er logotyp",
      done: company.onboardingChecklist.logo,
      href: "/portal/profil",
    },
    {
      label: "Komplettera företagsprofilen",
      done: company.onboardingChecklist.profileComplete,
      href: "/portal/profil",
    },
    {
      label: "Skapa ert första erbjudande",
      done: company.onboardingChecklist.firstOffer,
      href: "/portal/erbjudanden/nytt",
    },
    {
      label: "Skicka in ett erbjudande för publicering",
      done: company.onboardingChecklist.firstPublish,
      href: "/portal/erbjudanden",
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  if (doneCount === items.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
          Kom igång med Collaktiv
        </h3>
        <span className="text-xs font-extrabold text-[var(--color-brand-primary)]">
          {doneCount}/{items.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-brand-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-brand-primary)] transition-all"
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>
      <ul className="mt-4 flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-bold transition hover:bg-[var(--color-brand-secondary)]"
            >
              {item.done ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-[var(--color-brand-border)]" />
              )}
              <span
                className={item.done ? "text-[var(--color-brand-muted)] line-through" : "text-[var(--color-brand-ink)]"}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
