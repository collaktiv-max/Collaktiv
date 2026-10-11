"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FeatureList } from "@/components/ui/FeatureList";
import { Reveal } from "./Reveal";
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
  const [period, setPeriod] = useState<BillingPeriod>("year");

  return (
    <section className="bg-[var(--color-brand-secondary)]/40 py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
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
        </Reveal>

        {/* FOMO-banner */}
        <Reveal delay={100} className="mt-6 flex justify-center">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(224,67,44,0.28)",
                "0 0 0 9px rgba(224,67,44,0)",
                "0 0 0 0 rgba(224,67,44,0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#e0432c]/25 bg-gradient-to-r from-[#fff1ec] to-white px-5 py-2.5 shadow-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e0432c]/10 text-[#e0432c]"
            >
              <Flame className="h-3.5 w-3.5" />
            </motion.span>
            <p className="text-[13.5px] font-extrabold text-[var(--color-brand-ink)]">
              De {EARLY_BIRD_SLOTS} första företagen får{" "}
              <span className="text-[#e0432c]">20% rabatt</span> på hela paketet.
            </p>
          </motion.div>
        </Reveal>

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
        <Reveal delay={150} className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
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
                </p>
                {period === "year" && (
                  <p className="mt-0.5 text-xs font-semibold text-[var(--color-brand-muted)]">
                    Spara {formatKr(savings)} mot 6-månaderspriset
                  </p>
                )}

                <Button
                  href="/registrera"
                  size="lg"
                  variant={isPremium ? "primary" : "secondary"}
                  className="mt-6 w-full justify-center"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Välj {plan.name}
                </Button>

                <FeatureList
                  features={plan.features}
                  checkClassName={
                    isPremium ? "text-[var(--color-brand-primary)]" : "text-[var(--color-brand-muted)]"
                  }
                  className="mt-6 border-t border-[var(--color-brand-border)] pt-6"
                />
              </div>
            );
          })}
        </Reveal>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs font-semibold leading-relaxed text-[var(--color-brand-muted)]">
          Traditionella annonser kostar 5 000–10 000 kr för en enda publicering. Med Standard
          är ni synliga i appen dygnet runt i {BILLING_LABELS[period].toLowerCase()} – från{" "}
          {getDiscountedMonthly(PLANS[0], period)} kr/mån.
        </p>
      </Container>
    </section>
  );
}
