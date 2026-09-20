import {
  Eye,
  Users,
  Smartphone,
  BarChart3,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { REGION } from "@/lib/config";

const cards = [
  {
    icon: Eye,
    title: "Exponering",
    text: `Synas för en engagerad lokal publik som redan är i rörelse i ${REGION}.`,
    iconBg: "bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]",
  },
  {
    icon: Users,
    title: "Ny kundgrupp",
    text: "Nå unga, hållbara resenärer som upptäcker nya favoritställen via appen.",
    iconBg: "bg-[#fce8da] text-[#c2703a]",
  },
  {
    icon: Smartphone,
    title: "Noll integration i kassan",
    text: "Inga nya system, dosor eller scanners. Kunden visar upp en rörlig 10-minuters nedräkning i sin mobil som personalen godkänner med ett ögonkast. Klart på 5 sekunder.",
    iconBg: "bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]",
  },
  {
    icon: BarChart3,
    title: "Statistik",
    text: "Statistik över visningar, inlösen och total exponering.",
    iconBg: "bg-[#0f1f18] text-[var(--color-brand-accent)]",
  },
];

const banner = [
  {
    icon: TrendingUp,
    title: "Betalande kunder",
    text: "Resenärer med poäng letar aktivt efter var de kan använda dem.",
  },
  {
    icon: Eye,
    title: "Ständig synlighet",
    text: "Ert erbjudande ligger kvar i appen – dygnet runt, utan nya annonser.",
  },
  {
    icon: CheckCircle2,
    title: "Ingen bindningstid",
    text: "Pausa eller ändra erbjudandet när ni vill i partnerportalen.",
  },
];

export function ValueGrid() {
  return (
    <section id="varfor" className="pt-10 pb-16 sm:pt-14 sm:pb-24">
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
            visningar ni inte vet effekten av - Med Collaktiv betalar ni för
            att synas med exakt statistik på vem som faktiskt kommer in genom
            dörren!
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, title, text, iconBg }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/5"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
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

        <div className="mt-6 grid gap-6 rounded-2xl bg-[var(--color-brand-secondary)]/60 p-6 sm:grid-cols-3 sm:p-8">
          {banner.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)] shadow-sm">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-[14px] font-extrabold text-[var(--color-brand-ink)]">
                  {title}
                </h4>
                <p className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
