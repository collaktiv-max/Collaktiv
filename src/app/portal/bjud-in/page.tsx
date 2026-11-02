"use client";

import { Gift, Rocket, Send } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { ReferralCard } from "@/components/portal/ReferralCard";
import { useAppState } from "@/lib/store";

const STEPS = [
  {
    icon: Send,
    title: "Dela er länk",
    text: "Kopiera länken eller skicka den direkt via mejl till ett företag ni tycker borde vara med.",
  },
  {
    icon: Rocket,
    title: "De registrerar sig",
    text: "Företaget registrerar sig gratis via er länk och kopplas automatiskt till er.",
  },
  {
    icon: Gift,
    title: "Ni får en bonusmånad",
    text: "Så fort de publicerar sitt första erbjudande får ni en gratis månad Premium.",
  },
];

export default function BjudInPage() {
  const { referralCount } = useAppState();

  return (
    <div>
      <PageHeader
        title="Bjud in företag"
        subtitle="Dela Collaktiv med andra lokala företag – fler partners gör satsningen starkare för alla."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReferralCard />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-brand-border)] bg-white p-6">
          <h3 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
            Så funkar det
          </h3>
          <div className="mt-1 flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
                  <step.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[var(--color-brand-ink)]">
                    {i + 1}. {step.title}
                  </p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {referralCount > 0 && (
            <p className="mt-2 rounded-xl bg-[var(--color-brand-secondary)]/60 px-3 py-2.5 text-xs font-bold text-[var(--color-brand-ink)]">
              {referralCount} företag har hittills registrerat sig via er länk – tack!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
