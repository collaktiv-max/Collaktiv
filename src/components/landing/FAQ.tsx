"use client";

import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const faqs = [
  {
    q: "Vad kostar det att gå med?",
    a: "Det är gratis att registrera ert företag och skapa ett utkast till erbjudande. Ni betalar först när ni väljer att publicera erbjudandet i appen – och ser exakt hur många resenärer ni når innan ni betalar något.",
  },
  {
    q: "Är det någon bindningstid?",
    a: "Nej. Ni väljer själva hur länge ett erbjudande ska vara aktivt och kan pausa eller avsluta det när ni vill från portalen.",
  },
  {
    q: "Hur snabbt kommer vi igång?",
    a: "Registreringen tar under fem minuter. Efter det granskar vi ansökan manuellt, vilket normalt tar 1–2 dagar. Så fort ni är godkända är ni live direkt.",
  },
  {
    q: "Kan vi ändra eller pausa ett erbjudande efter att det publicerats?",
    a: "Ja, ni styr era erbjudanden helt själva i portalen – redigera, pausa eller skapa nya erbjudanden när det passar er verksamhet.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[var(--color-brand-secondary)]/50 py-16 sm:py-24">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="lg:w-[36%] lg:shrink-0">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)]">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
              Vanliga frågor
            </h2>
            <p className="mt-4 max-w-sm text-[15px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
              Hittar ni inte svaret ni letar efter? Hör av er så svarar vårt
              team inom en arbetsdag.
            </p>
            <Button
              href="mailto:info@collaktiv.se"
              variant="secondary"
              size="lg"
              className="mt-6"
              icon={<Mail className="h-4 w-4" />}
              iconPosition="left"
            >
              Kontakta oss
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {faqs.map((item, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white"
                >
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[var(--color-brand-primary)] transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="animate-slide-up px-5 pb-5 text-[14px] font-medium leading-relaxed text-[var(--color-brand-muted)] sm:px-6">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
