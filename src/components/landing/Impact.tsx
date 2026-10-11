import {
  Award,
  CalendarDays,
  MapPin,
  Medal,
  Star,
  Timer,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

// Siffrorna kommer från piloten i Gävle våren 2026. Byt eller lägg till
// nyckeltal här.
const stats = [
  { value: "18", unit: "företag", desc: "i Gävle har redan valt Collaktiv" },
  { value: "800", unit: "resenärer", desc: "Registrerade sig inom några veckor" },
  { value: "40+", unit: "inlösta erbjudanden", desc: "Hos lokala företag i Gävle" },
  {
    value: "200 000+",
    unit: "människor nådda",
    desc: "Via Gefle Dagblad, P4 Gävleborg och sociala medier",
  },
];

const facts: { icon: LucideIcon; text: string }[] = [
  { icon: CalendarDays, text: "Våren 2026" },
  { icon: Timer, text: "3 månader" },
  { icon: MapPin, text: "Gävle stad" },
];

const awards: { icon: LucideIcon; place: string; text: string }[] = [
  { icon: Trophy, place: "Vinnare", text: "Årets bästa UF-företag – Gävleborg & Gävle stad" },
  { icon: Medal, place: "Andraplats", text: "Bästa tjänst" },
  { icon: Award, place: "Tredjeplats", text: "Årets innovation" },
  { icon: Star, place: "Kvalificerad", text: "Kvalificering till SM för bästa företag" },
];

// Collaktiv UF och piloten i Gävle.
export function Impact() {
  return (
    <section id="collaktiv-uf" className="bg-[var(--color-brand-secondary)] py-16 sm:py-24">
      <Container>
        <div className="grid gap-7 md:gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-mint)] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--color-brand-primary-hover)]">
              Collaktiv UF · Piloten i Gävle
            </span>
            <h2 className="mt-3 text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-balance sm:text-[2.6rem]">
              Tillsammans gör vi{" "}
              <span className="text-[var(--color-brand-primary)]">skillnad!</span>
            </h2>
            <p className="mt-4 max-w-[52ch] text-base font-medium leading-relaxed text-[var(--color-brand-muted)] sm:text-[17px]">
              Våren 2026 lanserade Collaktiv UF en 3 månaders lång pilot av tjänsten i Gävle stad.
              Uppskattningen och feedbacken var enorm. Nu siktar vi större, fler användare, fler
              företag, i en regionalt satsad lansering av Collaktiv.
            </p>
            <ul className="mt-6 hidden flex-wrap gap-2 md:flex">
              {facts.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-[var(--color-brand-ink)] shadow-sm"
                >
                  <Icon className="h-4 w-4 text-[var(--color-brand-primary)]" />
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((s) => (
                <li
                  key={s.unit}
                  className="rounded-3xl border border-[var(--color-brand-border)] bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-[var(--color-brand-primary)]/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6"
                >
                  <p className="whitespace-nowrap text-[clamp(1.4rem,6.4vw,2.4rem)] font-extrabold leading-none tracking-tight text-[var(--color-brand-primary)] tabular-nums">
                    <CountUp value={s.value} />
                  </p>
                  <p className="mt-2.5 text-[14px] font-extrabold leading-tight sm:text-[17px]">
                    {s.unit}
                  </p>
                  <p className="mt-1 text-[12.5px] font-medium leading-snug text-[var(--color-brand-muted)] sm:text-[14.5px]">
                    {s.desc}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Utmärkelser – en rad med "medaljer" */}
        <Reveal className="mt-10 sm:mt-14">
          <div className="rounded-[2rem] bg-[var(--color-brand-ink)] p-6 text-white sm:p-8">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-brand-accent)]">
              Utmärkelser
            </h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {awards.map(({ icon: Icon, place, text }) => (
                <li
                  key={text}
                  className="group flex items-center gap-3.5 rounded-2xl bg-white/[0.05] p-4 transition-colors duration-200 hover:bg-white/10 lg:flex-col lg:items-start lg:p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-accent)] text-[var(--color-brand-ink)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-brand-accent)]">
                      {place}
                    </span>
                    <span className="mt-0.5 block text-[14.5px] font-bold leading-snug">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
