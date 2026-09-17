"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PhoneMockup } from "./PhoneMockup";
import { REGION, RESENARER_COUNT } from "@/lib/config";

const proofPoints = [
  "Nya kunder in i butiken",
  "Live inom 1–2 dagar",
  "Ni styr erbjudandena själva",
  "Månadsrapport på exponering",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-brand-secondary)] via-white to-white">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[var(--color-brand-accent)]/20 blur-3xl" />
      <Container className="relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="order-2 lg:order-1"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-accent)]/40 bg-[var(--color-brand-accent)]/10 px-4 py-2 text-xs font-extrabold text-[#3f7a1c]">
            <Sparkles className="h-3.5 w-3.5" />
            Nya kunder – utan annonsbudget
          </span>

          <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-[var(--color-brand-ink)] sm:text-5xl lg:text-[3.4rem]">
            Nå tusentals{" "}
            <span className="text-[var(--color-brand-primary)]">
              hållbara resenärer
            </span>{" "}
            i {REGION}
          </h1>

          <p className="mt-5 max-w-xl text-[17px] font-medium leading-relaxed text-[var(--color-brand-muted)] sm:text-lg">
            Collaktiv belönar kollektivtrafikresande med rabatter hos lokala
            företag. Lägg upp ett erbjudande – och låt resenärerna bli era
            nya stamkunder.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {proofPoints.map((point) => (
              <div key={point} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-[14.5px] font-bold text-[var(--color-brand-ink)]">
                  {point}
                </span>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              href="/registrera"
              size="lg"
              icon={<ArrowRight className="h-4.5 w-4.5" />}
            >
              Registrera ert företag
            </Button>
            <Button href="/logga-in" variant="secondary" size="lg">
              Redan partner? Logga in
            </Button>
          </div>

          <p className="mt-5 text-xs font-semibold text-[var(--color-brand-muted)]">
            Gratis att komma igång · Ingen bindningstid · {RESENARER_COUNT} resenärer i appen
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 lg:order-2"
        >
          <PhoneMockup />
        </motion.div>
      </Container>
    </section>
  );
}
