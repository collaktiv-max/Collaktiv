"use client";

import { useState } from "react";
import { Check, X, Calculator, Sparkles } from "lucide-react";
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
    ads: "5 000–10 000 kr för en tidningsannons eller osäkra klickavgifter.",
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

const AD_SPEND_PRESETS = [3000, 6000, 10000];

export function ComparisonSection() {
  const [activeRow, setActiveRow] = useState(1);
  const [adSpend, setAdSpend] = useState(AD_SPEND_PRESETS[1]);

  const standard = getPlan("standard");
  const collaktivMonthly = CHEAPEST_MONTHLY_PRICE;
  const monthlySavings = Math.max(0, adSpend - collaktivMonthly);
  const yearSavings = monthlySavings * 12;

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
            Klicka på en rad för att se skillnaden.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl items-start gap-6 lg:grid-cols-[3fr_2fr]">
          {/* Jämförelsetabell */}
          <div className="overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white shadow-sm">
            <div className="grid grid-cols-2 border-b border-[var(--color-brand-border)] bg-white text-[13px] font-extrabold">
              <div className="flex items-center gap-2 px-4 py-3.5 text-[var(--color-brand-muted)]">
                <X className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Traditionell annonsering</span>
                <span className="sm:hidden">Annonsering</span>
              </div>
              <div className="flex items-center gap-2 border-l border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)] px-4 py-3.5 text-[var(--color-brand-primary)]">
                <Check className="h-4 w-4" /> Collaktiv
              </div>
            </div>
            {rows.map((row, i) => {
              const active = activeRow === i;
              return (
                <button
                  key={row.label}
                  onClick={() => setActiveRow(active ? -1 : i)}
                  className={`grid w-full grid-cols-2 border-b border-[var(--color-brand-border)] text-left text-[12.5px] font-medium transition-colors last:border-b-0 ${
                    active ? "bg-[var(--color-brand-secondary)]/30" : "hover:bg-[var(--color-brand-secondary)]/15"
                  }`}
                >
                  <div className="px-4 py-3.5 text-[var(--color-brand-muted)]">
                    <p
                      className={`mb-1 text-[10.5px] font-extrabold uppercase tracking-wide transition-colors ${
                        active ? "text-[var(--color-brand-primary)]" : "text-[var(--color-brand-ink)]/50"
                      }`}
                    >
                      {row.label}
                    </p>
                    {row.ads}
                  </div>
                  <div className="border-l border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/40 px-4 py-3.5 text-[var(--color-brand-ink)]">
                    <span className="font-extrabold">{row.collaktivBold}</span>
                    {row.collaktivRest}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interaktiv besparingskalkylator */}
          <div className="flex h-full flex-col rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
                <Calculator className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                  Räkna ut er besparing
                </p>
                <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                  Vad lägger ni idag på annonsering per månad?
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {AD_SPEND_PRESETS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setAdSpend(amount)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition ${
                    adSpend === amount
                      ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                      : "border-[var(--color-brand-border)] text-[var(--color-brand-ink)] hover:border-[var(--color-brand-primary)]"
                  }`}
                >
                  {formatKr(amount)}/mån
                </button>
              ))}
            </div>

            <div className="mt-5 flex-1 rounded-xl bg-[#0f1f18] p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-white/60">
                Med Collaktiv ({standard.name} från {collaktivMonthly} kr/mån) sparar ni
              </p>
              <p className="mt-1 text-3xl font-extrabold leading-none text-[#e0432c]">
                {formatKr(monthlySavings)}
                <span className="text-sm font-bold text-white/60"> /mån</span>
              </p>
              <p className="mt-1 text-xs font-bold text-white/70">
                = {formatKr(yearSavings)} per år
              </p>

              <div className="mt-4 flex items-start gap-2 border-t border-white/15 pt-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-accent)]" />
                <p className="text-[12.5px] font-semibold leading-relaxed text-white">
                  Och ni får mer värde för pengarna: exakt statistik på vem som
                  faktiskt handlar, synlighet dygnet runt och inga tryck- eller
                  designkostnader – sånt en tidningsannons aldrig kan ge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
