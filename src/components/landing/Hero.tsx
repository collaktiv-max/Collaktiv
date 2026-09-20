"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PhoneMockup } from "./PhoneMockup";
import { OfferPhoto } from "./OfferPhoto";
import { PartnerPortalPreview } from "./PartnerPortalPreview";
import { REGION } from "@/lib/config";

const proofPoints = [
  "Nya kunder in i butiken",
  "Live inom 1–2 dagar",
  "Ni styr erbjudandena själva",
  "Tydlig statistik",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-brand-secondary)] via-white to-white">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[var(--color-brand-accent)]/20 blur-3xl" />
      <Container className="relative grid items-center gap-8 pt-8 pb-8 sm:pt-10 sm:pb-10 lg:grid-cols-2 lg:gap-8 lg:pt-10 lg:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="order-2 lg:order-1"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-accent)]/40 bg-[var(--color-brand-accent)]/10 px-4 py-1.5 text-xs font-extrabold text-[#3f7a1c]">
            <Sparkles className="h-3.5 w-3.5" />
            Nya kunder – utan annonsbudget
          </span>

          <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-[var(--color-brand-ink)] sm:text-4xl lg:text-[2.75rem]">
            Nå tusentals{" "}
            <span className="text-[var(--color-brand-primary)]">
              hållbara resenärer
            </span>{" "}
            i {REGION}
          </h1>

          <p className="mt-3.5 max-w-xl text-[15.5px] font-medium leading-relaxed text-[var(--color-brand-muted)] sm:text-base">
            Collaktiv belönar kollektivtrafikresande med rabatter hos lokala
            företag. Lägg upp ett erbjudande – och låt resenärerna bli era
            nya stamkunder.
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {proofPoints.map((point) => (
              <div key={point} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-[14px] font-bold text-[var(--color-brand-ink)]">
                  {point}
                </span>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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

          <p className="mt-4 text-center text-xs font-semibold text-[var(--color-brand-muted)]">
            Gratis att komma igång · Ingen bindningstid
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative order-1 mx-auto h-[300px] w-full max-w-[320px] sm:h-[340px] sm:max-w-[380px] lg:order-2 lg:h-[360px] lg:max-w-[440px]"
        >
          <div className="absolute right-0 top-0 origin-top-right scale-[0.78]">
            <PartnerPortalPreview />
          </div>
          <div className="absolute bottom-0 left-0 z-10 origin-bottom-left scale-[0.68]">
            <PhoneMockup image={<OfferPhoto className="absolute inset-0 h-full w-full" />} />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
