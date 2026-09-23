import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ImageCarousel } from "./ImageCarousel";

const stats = [
  { value: "18", unit: "företag", desc: "i Gävle har redan valt Collaktiv" },
  { value: "800", unit: "resenärer", desc: "Registrerade sig inom några veckor" },
  { value: "40+", unit: "inlösta erbjudanden", desc: "Hos lokala företag i Gävle" },
  { value: "9 av 10", unit: "partners", desc: "Valde det största paketet" },
  {
    value: "200 000+",
    unit: "människor nådda",
    desc: "Via Gefle Dagblad, P4 Gävleborg och sociala medier",
  },
];

const awards = [
  { icon: Trophy, text: "Årets bästa UF-företag – Gävleborg & Gävle stad" },
  { icon: Medal, text: "Andraplats – Bästa tjänst" },
  { icon: Award, text: "Tredjeplats – Årets innovation" },
  { icon: Sparkles, text: "+ ytterligare andra utmärkelser" },
];

export function PilotResults() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-mint)] px-4 py-1.5 text-xs font-extrabold text-[var(--color-brand-primary-hover)]">
          COLLAKTIV UF &middot; PILOTEN I GÄVLE
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
          Collaktiv: En redan bevisad plattform.
        </h2>
        <p className="mt-2 max-w-2xl text-[15.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
          Under våren 2026 lanserade Collaktiv UF en 3 månaders lång pilot av
          tjänsten i Gävle stad. Uppskattningen och feedbacken var enorm. Nu
          siktar vi större, fler användare, fler företag, i en regionalt
          satsad lansering av Collaktiv.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <div
                  key={s.unit}
                  className={`rounded-2xl border border-[var(--color-brand-border)] bg-white p-5 ${
                    i === stats.length - 1 ? "col-span-2" : ""
                  }`}
                >
                  <p className="text-[28px] font-extrabold leading-none text-[var(--color-brand-primary)]">
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-[13px] font-extrabold text-[var(--color-brand-ink)]">
                    {s.unit}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-[var(--color-brand-muted)]">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#0f1f18] p-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-accent)]">
                Utmärkelser
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {awards.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--color-brand-accent)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[13.5px] font-bold text-white">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ImageCarousel />
        </div>
      </Container>
    </section>
  );
}
