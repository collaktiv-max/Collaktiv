import { ArrowRight, Bus, Users, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    num: 1,
    title: "Uppmuntra hållbara val",
    text: "Resenärer samlar poäng när deras kollektivtrafikresor verifieras i Collaktiv.",
  },
  {
    num: 2,
    title: "Belöna resandet",
    text: "Poängen löses in hos er och andra anslutna företag.",
  },
  {
    num: 3,
    title: "Ni blir en del av rörelsen",
    text: "Ni är med och formar en konkret, lokal satsning på hållbart resande i Gävleborg.",
    highlight: true,
  },
];

const bandItems = [
  {
    icon: Bus,
    title: "Fler alternativ till bilen",
    text: "Varje anslutet företag gör det lättare att välja kollektivtrafiken i vardagen.",
  },
  {
    icon: Users,
    title: "En gemensam satsning",
    text: "Lokala företag i hela regionen samlas kring samma ambition.",
  },
  {
    icon: MapPin,
    title: "Ett mer attraktivt Gävleborg",
    text: "Tillsammans bidrar vi till en region där hållbara val känns naturliga.",
  },
];

export function ComparisonSection() {
  return (
    <section className="bg-[var(--color-brand-secondary)]/50 py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
            Varför just Collaktiv?
          </h2>
          <p className="mt-3.5 text-[14.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
            Bli en del av Gävleborgs mest konkreta satsning på hållbart resande
            — och visa att ert företag står bakom en grönare vardag.
            Transporter formar både klimatet och våra städer, och er
            medverkan är en del av att göra kollektivtrafiken till det enkla
            valet.
          </p>
        </div>

        <div className="relative mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-7 sm:grid-cols-3">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-[23px] hidden h-px bg-[var(--color-brand-border)] sm:block" />
          {steps.map((s) => (
            <div
              key={s.title}
              className="relative flex flex-col items-center gap-2.5 text-center"
            >
              <span
                className={`relative z-10 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold ${
                  s.highlight
                    ? "bg-[var(--color-brand-accent)] text-[var(--color-brand-ink)] shadow-[0_0_0_6px_rgba(143,211,79,0.22)]"
                    : "bg-[var(--color-brand-primary)] text-white"
                }`}
              >
                {s.num}
              </span>
              <h3 className="text-[14px] font-extrabold text-[var(--color-brand-ink)]">
                {s.title}
              </h3>
              <p className="max-w-[220px] text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                {s.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[22px] bg-[#0f1f18] p-7 sm:p-8">
          <p className="text-center text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-brand-accent)]">
            En växande rörelse i Gävleborg
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {bandItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--color-brand-accent)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-[13px] font-extrabold text-white">
                    {title}
                  </h4>
                  <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-white/65">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-center text-[11.5px] font-semibold leading-relaxed text-white/70">
            Ju fler företag som är med, desto starkare blir den gemensamma
            satsningen – det är själva poängen med Collaktiv.
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs font-semibold leading-relaxed text-[var(--color-brand-muted)]">
          En resa i taget – tillsammans gör vi skillnad. Statistik om
          verifierade resor och engagemang visas här så snart den finns
          tillgänglig.
        </p>

        <div className="mt-6 flex flex-col items-center gap-2.5">
          <Button
            href="/registrera"
            size="lg"
            icon={<ArrowRight className="h-4.5 w-4.5" />}
          >
            Bli en del av Collaktiv
          </Button>
          <p className="text-[11.5px] font-semibold text-[var(--color-brand-muted)]">
            Gratis att komma igång – inget säljsamtal, ingen bindningstid.
          </p>
        </div>
      </Container>
    </section>
  );
}
