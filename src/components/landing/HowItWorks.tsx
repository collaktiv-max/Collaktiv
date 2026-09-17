"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Store, Tags, ShieldCheck, Rocket } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    icon: Store,
    title: "Registrera ert företag",
    time: "~3 min",
    description:
      "Fyll i företagsinfo och kontaktperson. Tar under fem minuter – inget säljsamtal, ingen bindningstid.",
  },
  {
    icon: Tags,
    title: "Skapa ert erbjudande",
    time: "~2 min",
    description:
      "Beskriv rabatten, eller låt vår AI föreslå ett erbjudande utifrån er bransch. Ni ser hela tiden hur det ser ut i appen.",
  },
  {
    icon: ShieldCheck,
    title: "Vi granskar",
    time: "1–2 dagar",
    description:
      "Vi går igenom ansökan och erbjudandet manuellt för att hålla kvaliteten hög för både er och resenärerna.",
  },
  {
    icon: Rocket,
    title: "Ni är live!",
    time: "Direkt",
    description:
      "Så fort ni är godkända publiceras erbjudandet i appen och ni börjar synas för resenärer direkt.",
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  const Icon = step.icon;
  const isLast = active === steps.length - 1;

  return (
    <section id="sa-funkar-det" className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Så funkar det
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
            Från klick till kund i fyra steg
          </h2>
          <p className="mt-4 text-[16px] font-medium text-[var(--color-brand-muted)]">
            Klicka på ett steg för att se vad som händer.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="flex flex-col gap-3">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === active;
              return (
                <button
                  key={s.title}
                  onClick={() => setActive(i)}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
                    isActive
                      ? "border-[var(--color-brand-primary)]/30 bg-white shadow-md shadow-[var(--color-brand-primary)]/5"
                      : "border-transparent bg-[var(--color-brand-secondary)]/60 hover:bg-[var(--color-brand-secondary)]"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors ${
                        isActive
                          ? "bg-[var(--color-brand-primary)] text-white"
                          : "bg-white text-[var(--color-brand-muted)]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex items-center gap-2 text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                      <StepIcon className="hidden h-4 w-4 text-[var(--color-brand-primary)] sm:block" />
                      {s.title}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-muted)]">
                    {s.time}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0f1f18] p-8 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[var(--color-brand-accent)]">
                  <Icon className="h-7 w-7" />
                </span>
                <p className="mt-6 text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-accent)]">
                  Steg {active + 1} av {steps.length}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] font-medium leading-relaxed text-white/70">
                  {step.description}
                </p>

                {isLast ? (
                  <Button href="/registrera" className="mt-8" variant="primary">
                    Kom igång nu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActive((a) => Math.min(a + 1, steps.length - 1))}
                    className="mt-8"
                    variant="dark"
                  >
                    Nästa steg
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
