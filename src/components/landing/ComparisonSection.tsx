"use client";

import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getPlan, CHEAPEST_MONTHLY_PRICE, formatKr } from "@/lib/pricing";

const rows = [
  {
    label: "Kassahantering",
    ads: "Krångliga kuponger, streckkoder eller dyra kassaintegrationer.",
    collaktivBold: "Noll integration.",
    collaktivRest: " Dynamisk 10-minuters säkerhetsnedräkning på kundens skärm.",
  },
  {
    label: "Betalningsmodell",
    ads: "5 000–10 000 kr för traditionella annonser eller osäkra klickavgifter.",
    collaktivBold: "Fast, låg månadskostnad",
    collaktivRest: ` (från ${CHEAPEST_MONTHLY_PRICE} kr/mån för de 50 första företagen). Ingen bindningstid.`,
  },
  {
    label: "Målgrupp & Tajming",
    ads: "Bred räckvidd till folk som ligger hemma i soffan.",
    collaktivBold: "Pendlare på språng",
    collaktivRest: " som precis samlat poäng och söker lokala erbjudanden.",
  },
  {
    label: "Fysiskt material",
    ads: "Ni måste designa, trycka och bekosta skyltar och dekaler själva.",
    collaktivBold: "Färdigt butikskit ingår",
    collaktivRest: " (professionella bordsryttare & fönsterdekaler med QR-kod).",
  },
  {
    label: "Mätbar effekt",
    ads: "Omöjligt att veta om annonsen gav en enda kund i kassan.",
    collaktivBold: "Exakt inlösenstatistik i realtid.",
    collaktivRest: " Ni ser varje genomfört köp i er portal.",
  },
];

const MIN_SPEND = 1500;
const MAX_SPEND = 15000;

export function ComparisonSection() {
  const [adSpend, setAdSpend] = useState(6000);

  const standard = getPlan("standard");
  const collaktivMonthly = CHEAPEST_MONTHLY_PRICE;
  const monthlySavings = Math.max(0, adSpend - collaktivMonthly);
  const yearSavings = monthlySavings * 12;
  const tradBarPct = Math.min(100, (adSpend / MAX_SPEND) * 100);
  const collaktivBarPct = Math.max(3, (collaktivMonthly / MAX_SPEND) * 100);

  return (
    <section className="bg-[var(--color-brand-secondary)]/50 py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Jämfört med vanlig annonsering
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
            Varför just Collaktiv?
          </h2>
          <p className="mt-3 text-sm font-medium text-[var(--color-brand-muted)]">
            Dra i reglaget och se vad ni sparar.
          </p>
        </div>

        {/* Interaktiv besparingskalkylator */}
        <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand-muted)]">
                  Annonsbudget / mån
                </span>
                <span className="text-lg font-extrabold text-[var(--color-brand-ink)]">
                  {formatKr(adSpend)}
                </span>
              </div>
              <input
                type="range"
                min={MIN_SPEND}
                max={MAX_SPEND}
                step={250}
                value={adSpend}
                onChange={(e) => setAdSpend(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--color-brand-primary)]"
              />

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-[var(--color-brand-muted)]">
                    <span>Traditionell annonsering</span>
                    <span>{formatKr(adSpend)}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-brand-secondary)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-brand-muted)] transition-all duration-300"
                      style={{ width: `${tradBarPct}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-[var(--color-brand-primary)]">
                    <span>Collaktiv {standard.name} (-20%, de 50 första)</span>
                    <span>{formatKr(collaktivMonthly)}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-brand-secondary)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-brand-primary)] transition-all duration-300"
                      style={{ width: `${collaktivBarPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-[var(--color-brand-mint)] p-5 sm:w-[230px]">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-primary)]/70">
                Ni sparar
              </p>
              <p className="mt-1 text-3xl font-extrabold leading-none text-[var(--color-brand-primary)]">
                {formatKr(monthlySavings)}
                <span className="text-sm font-bold text-[var(--color-brand-ink)]/60"> /mån</span>
              </p>
              <p className="mt-1 text-xs font-bold text-[var(--color-brand-ink)]/70">
                = {formatKr(yearSavings)} per år
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 border-t border-[var(--color-brand-border)] pt-5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
            <p className="text-[12.5px] font-semibold leading-relaxed text-[var(--color-brand-ink)]">
              Och ni får mer värde för pengarna: exakt statistik på vem som
              faktiskt handlar, synlighet dygnet runt och inga tryck- eller
              designkostnader – sånt traditionella annonser aldrig kan ge.
            </p>
          </div>
        </div>

        {/* Jämförelsekort */}
        <div className="mx-auto mt-6 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white shadow-sm"
            >
              <p className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/60 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-primary)]">
                {row.label}
              </p>
              <div className="flex flex-col divide-y divide-[var(--color-brand-border)]">
                <div className="flex items-start gap-2 px-4 py-3">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand-muted)]" />
                  <p className="text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                    {row.ads}
                  </p>
                </div>
                <div className="flex items-start gap-2 bg-[var(--color-brand-secondary)]/40 px-4 py-3">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand-primary)]" />
                  <p className="text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-ink)]">
                    <span className="font-extrabold">{row.collaktivBold}</span>
                    {row.collaktivRest}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
