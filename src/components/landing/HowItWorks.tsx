"use client";

import { motion } from "framer-motion";
import { ArrowRight, Store, Tags, CreditCard, ShieldCheck, Rocket } from "lucide-react";
import { Container } from "@/components/ui/Container";

const steps = [
  {
    icon: Store,
    title: "Registrera ert företag",
    description: "Fem minuter, inget säljsamtal, ingen bindningstid.",
  },
  {
    icon: Tags,
    title: "Skapa erbjudande",
    description:
      "Helt gratis – beskriv rabatten eller låt vår AI föreslå ett förslag utifrån er bransch.",
  },
  {
    icon: CreditCard,
    title: "Välj paket & publicera",
    description:
      "Standard eller Premium – ni betalar först när ni skickar in erbjudandet för publicering.",
  },
  {
    icon: ShieldCheck,
    title: "Vi granskar",
    description:
      "Vi går igenom ansökan och erbjudandet manuellt för hög kvalitet. Besked inom 1–2 dagar.",
  },
  {
    icon: Rocket,
    title: "Ni är live!",
    description: "Erbjudandet publiceras och ni syns för tusentals resenärer direkt.",
    highlight: true,
  },
];

export function HowItWorks() {
  return (
    <section id="sa-funkar-det" className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Så funkar det
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
            Live i appen på några dagar
          </h2>
          <p className="mt-4 text-[16px] font-medium text-[var(--color-brand-muted)]">
            Från registrering till att ni syns för tusentals pendlare – utan krångel.
          </p>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-[23px] hidden h-px bg-[var(--color-brand-border)] lg:block" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`relative flex flex-col gap-3 ${
                  s.highlight ? "rounded-2xl bg-[var(--color-brand-mint)]/40 p-4" : ""
                }`}
              >
                {s.highlight ? (
                  <motion.span
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-accent)] text-[var(--color-brand-ink)] shadow-[0_0_0_6px_rgba(143,211,79,0.25)]"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <span className="relative z-10 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-[15px] font-extrabold text-white">
                    {i + 1}
                  </span>
                )}
                <h3
                  className={`text-[15.5px] font-extrabold ${
                    s.highlight
                      ? "text-[var(--color-brand-primary-hover)]"
                      : "text-[var(--color-brand-ink)]"
                  }`}
                >
                  {s.title}
                </h3>
                <p className="text-[13px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                  {s.description}
                </p>
                {s.highlight && (
                  <a
                    href="/registrera"
                    className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-extrabold text-[var(--color-brand-primary)] hover:underline"
                  >
                    Bli partner idag <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
