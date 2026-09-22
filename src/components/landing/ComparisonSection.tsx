"use client";

import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Check, X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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

const cardVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

export function ComparisonSection() {
  const [adSpend, setAdSpend] = useState(6000);
  const [[cardIndex, direction], setCardState] = useState<[number, number]>([0, 0]);

  const standard = getPlan("standard");
  const collaktivMonthly = CHEAPEST_MONTHLY_PRICE;
  const monthlySavings = Math.max(0, adSpend - collaktivMonthly);
  const yearSavings = monthlySavings * 12;
  const collaktivBarPct = Math.max(3, (collaktivMonthly / MAX_SPEND) * 100);

  function paginate(dir: number) {
    setCardState(([current]) => [
      (current + dir + rows.length) % rows.length,
      dir,
    ]);
  }

  function goTo(i: number) {
    setCardState(([current]) => [i, i > current ? 1 : -1]);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) paginate(1);
    else if (info.offset.x > 60) paginate(-1);
  }

  const card = rows[cardIndex];

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

        <div className="mx-auto mt-10 grid max-w-5xl items-start gap-6 lg:grid-cols-2">
          {/* Interaktiv besparingskalkylator */}
          <div className="flex h-full flex-col rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-8">
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

            <div className="mt-4 flex flex-col gap-1.5">
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

            <div className="mt-5 rounded-xl bg-[var(--color-brand-mint)] p-5">
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

            <div className="mt-5 flex flex-1 items-start gap-2 border-t border-[var(--color-brand-border)] pt-5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
              <p className="text-[12.5px] font-semibold leading-relaxed text-[var(--color-brand-ink)]">
                Och ni får mer värde för pengarna: exakt statistik på vem som
                faktiskt handlar, synlighet dygnet runt och inga tryck- eller
                designkostnader – sånt traditionella annonser aldrig kan ge.
              </p>
            </div>
          </div>

          {/* Swipebara jämförelsekort */}
          <div className="flex h-full flex-col rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                Punkt {cardIndex + 1} av {rows.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => paginate(-1)}
                  aria-label="Föregående"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] transition-colors hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => paginate(1)}
                  aria-label="Nästa"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] transition-colors hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative mt-4 flex-1 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={cardIndex}
                  custom={direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab touch-pan-y active:cursor-grabbing"
                >
                  <h3 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                    {card.label}
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[var(--color-brand-secondary)]/60 p-3.5">
                      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                        <X className="h-3 w-3" /> Traditionellt
                      </p>
                      <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                        {card.ads}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--color-brand-mint)]/40 p-3.5">
                      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-brand-primary)]">
                        <Check className="h-3 w-3" /> Collaktiv
                      </p>
                      <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-ink)]">
                        <span className="font-extrabold">{card.collaktivBold}</span>
                        {card.collaktivRest}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              {rows.map((row, i) => (
                <button
                  key={row.label}
                  onClick={() => goTo(i)}
                  aria-label={`Visa ${row.label}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === cardIndex
                      ? "w-5 bg-[var(--color-brand-primary)]"
                      : "w-1.5 bg-[var(--color-brand-border)]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
