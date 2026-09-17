import { Users, Megaphone, Repeat, LineChart } from "lucide-react";
import { Container } from "@/components/ui/Container";

const items = [
  {
    icon: Users,
    title: "Nya kunder, varje vecka",
    text: "Ert erbjudande visas för resenärer som redan är på väg in i stan – precis när de bestämmer var de ska handla, fika eller träna.",
  },
  {
    icon: Megaphone,
    title: "Synlighet utan annonsbudget",
    text: "Ingen kostnad per klick eller visning. Ni betalar för att vara med i appen – inte för varje resenär som ser erbjudandet.",
  },
  {
    icon: Repeat,
    title: "Stamkunder, inte engångsbesök",
    text: "Resenärer som samlar poäng återkommer. Ett bra erbjudande idag blir ofta ett nytt stamkundsförhållande imorgon.",
  },
  {
    icon: LineChart,
    title: "Svart på vitt vad det ger",
    text: "Månadsrapport med visningar, inlösningar och populäraste tider – ni ser exakt vad Collaktiv gör för er butik.",
  },
];

export function ValueGrid() {
  return (
    <section id="varfor" className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Varför Collaktiv
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
            Vad ni faktiskt får ut av att gå med
          </h2>
          <p className="mt-4 text-[16px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
            Till skillnad från vanlig annonsering betalar ni inte för
            visningar ni inte vet effekten av – ni betalar för att synas för
            en publik som redan reser hållbart och är redo att handla lokalt.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15.5px] font-extrabold text-[var(--color-brand-ink)]">
                {title}
              </h3>
              <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
