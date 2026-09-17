import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { REGION } from "@/lib/config";

export function CTABanner() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-brand-primary)] px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[var(--color-brand-accent)]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">
            Redo att nå {REGION}s hållbara resenärer?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15.5px] font-medium text-white/80">
            Registreringen tar under fem minuter, är gratis att komma igång
            med och helt utan bindningstid.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/registrera"
              size="lg"
              variant="white"
              icon={<ArrowRight className="h-4.5 w-4.5" />}
            >
              Registrera ert företag
            </Button>
            <Button href="/logga-in" size="lg" variant="ghost-white">
              Redan partner? Logga in
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
