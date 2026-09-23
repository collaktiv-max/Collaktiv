"use client";

import { useState } from "react";
import { Check, Flame, Sparkles, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/store";
import {
  PLANS,
  BILLING_LABELS,
  EARLY_BIRD_SLOTS,
  getMonthly,
  getDiscountedMonthly,
  getTotal,
  getDiscountedTotal,
  getYearlySavings,
  formatKr,
  type BillingPeriod,
} from "@/lib/pricing";

export function PricingSection() {
  const { state } = useAppState();
  const [period, setPeriod] = useState<BillingPeriod>("year");

  const spotsUsedPct = Math.min(100, (state.companies.length / EARLY_BIRD_SLOTS) * 100);

  return (
    <section className="bg-[var(--color-brand-secondary)]/40 py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Priser
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
            Välj ert paket
          </h2>
          <p className="mt-4 text-[16px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
            Gratis att skapa erbjudanden och se hur det ser ut i appen.
            Ni betalar först när ni väljer att publicera.
          </p>
        </div>

        {/* FOMO-banner */}
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#e0432c]/25 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0432c]/10 text-[#e0432c]">
              <Flame className="h-4 w-4" />
            </span>
            <p className="text-[13.5px] font-extrabold text-[var(--color-brand-ink)]">
              De 50 första företagen får 20% rabatt på hela paketet.
            </p>
          </div>
          <div className="mt-3">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-brand-secondary)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#e0432c] to-[#f2894f] transition-all duration-500"
                style={{ width: `${spotsUsedPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-[#e0432c]">Några platser kvar</p>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-[var(--color-brand-border)] bg-white p-1 shadow-sm">
            {(["sixMonths", "year"] as BillingPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`relative flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-extrabold transition-colors ${
                  period === p
                    ? "bg-[var(--color-brand-primary)] text-white"
                    : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-ink)]"
                }`}
              >
                {BILLING_LABELS[p]}
                {p === "year" && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      period === p
                        ? "bg-white/20 text-white"
                        : "bg-[var(--color-brand-accent)]/20 text-[#3f7a1c]"
                    }`}
                  >
                    Spara ~10%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const isPremium = plan.id === "premium";
            const regularMonthly = getMonthly(plan, period);
            const discountedMonthly = getDiscountedMonthly(plan, period);
            const regularTotal = getTotal(plan, period);
            const discountedTotal = getDiscountedTotal(plan, period);
            const savings = getYearlySavings(plan);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-[1.75rem] border-2 bg-white p-6 sm:p-7 ${
                  isPremium
                    ? "border-[var(--color-brand-primary)] shadow-xl shadow-[var(--color-brand-primary)]/10 sm:-translate-y-2"
                    : "border-[var(--color-brand-border)]"
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[var(--color-brand-primary)] px-3.5 py-1.5 text-[11px] font-extrabold text-white shadow-md">
                    <Sparkles className="h-3 w-3" /> Mest populär
                  </span>
                )}

                <h3 className="text-lg font-extrabold text-[var(--color-brand-ink)]">
                  {plan.name}
                </h3>
                <p className="mt-0.5 text-[12.5px] font-semibold text-[var(--color-brand-muted)]">
                  {plan.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-base font-bold text-[var(--color-brand-muted)] line-through">
                    {regularMonthly} kr
                  </span>
                  <span className="text-[2.5rem] font-extrabold leading-none text-[#e0432c]">
                    {discountedMonthly}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-brand-muted)]">
                    kr/mån
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-[var(--color-brand-muted)]">
                  {formatKr(discountedTotal)}{" "}
                  <span className="line-through">{formatKr(regularTotal)}</span> för{" "}
                  {BILLING_LABELS[period]}
                  {period === "year" && (
                    <> · spara {formatKr(savings)} mot 6-månaderspriset</>
                  )}
                </p>

                <Button
                  href="/registrera"
                  size="lg"
                  variant={isPremium ? "primary" : "secondary"}
                  className="mt-6 w-full justify-center"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Kom igång med {plan.name}
                </Button>

                <ul className="mt-6 flex flex-col gap-2.5 border-t border-[var(--color-brand-border)] pt-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[13.5px] font-semibold text-[var(--color-brand-ink)]"
                    >
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isPremium ? "text-[var(--color-brand-primary)]" : "text-[var(--color-brand-muted)]"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs font-semibold leading-relaxed text-[var(--color-brand-muted)]">
          Traditionella annonser kostar 5 000–10 000 kr för en enda publicering. Med Standard
          är ni synliga i appen dygnet runt i {BILLING_LABELS[period].toLowerCase()} – från{" "}
          {getDiscountedMonthly(PLANS[0], period)} kr/mån.
        </p>
      </Container>
    </section>
  );
}
