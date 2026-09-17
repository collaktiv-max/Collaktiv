import { Clock, TrendingUp, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PhoneMockup } from "./PhoneMockup";

export function DealExample() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-12 rounded-[2rem] bg-[#0f1f18] px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-2">
          <div>
            <Badge variant="translucent">
              <Zap className="h-3.5 w-3.5 text-[var(--color-brand-accent)]" />
              Exempel: tidsbegränsad kampanj
            </Badge>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Så kan en kampanj se ut – och så snabbt kan den vara live
            </h2>
            <p className="mt-4 text-[15.5px] font-medium leading-relaxed text-white/70">
              Ett lokalt gym testade en helgkampanj: gratis dagpass för alla
              som reste kollektivt fredag–söndag. Erbjudandet skapades på
              under tre minuter i portalen och var live samma vecka.
            </p>

            <div className="mt-7 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-extrabold text-white">312</p>
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-white/50">
                  Visningar / dag
                </p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">58</p>
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-white/50">
                  Inlösta dagpass
                </p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[var(--color-brand-accent)]">
                  19%
                </p>
                <p className="text-[11.5px] font-bold uppercase tracking-wide text-white/50">
                  Blev medlemmar
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/registrera" size="lg">
                Skapa er egen kampanj
              </Button>
              <span className="flex items-center gap-2 text-xs font-bold text-white/60">
                <Clock className="h-4 w-4" />
                Live inom 1–2 dagar efter godkännande
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <PhoneMockup
              companyName="Pulsgymmet"
              discountLabel="Gratis dagpass hela helgen"
              discountBadge="GRATIS"
              points={40}
              distance="0,8 km bort"
              emoji="💪"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-semibold text-[var(--color-brand-muted)]">
          <TrendingUp className="h-3.5 w-3.5" />
          Kampanjer med tydlig deadline får i snitt fler inlösningar än
          löpande erbjudanden – testa gärna en tidsbegränsad kampanj själva.
        </div>
      </Container>
    </section>
  );
}
