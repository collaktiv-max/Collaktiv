import { Check, X } from "lucide-react";
import { Container } from "@/components/ui/Container";

const rows = [
  {
    label: "Betalningsmodell",
    ads: "Betala per klick/visning, oavsett resultat",
    collaktiv: "Fast, förutsägbar kostnad för synlighet",
  },
  {
    label: "Målgrupp",
    ads: "Bred, ofta okänd relevans",
    collaktiv: "Hållbarhetsmedvetna resenärer som redan är på väg ut",
  },
  {
    label: "Uppstart",
    ads: "Kampanjhantering, budgivning, optimering",
    collaktiv: "Skapa ett erbjudande – klart på minuter",
  },
  {
    label: "Effekt",
    ads: "Svårt att koppla till faktiska besök",
    collaktiv: "Inlösning sker i kassan – ni ser exakt vad som hänt",
  },
];

export function ComparisonSection() {
  return (
    <section className="bg-[var(--color-brand-secondary)]/50 py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Jämfört med vanlig annonsering
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-4xl">
            Varför just Collaktiv?
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white shadow-sm">
          <div className="grid grid-cols-2 border-b border-[var(--color-brand-border)] bg-white text-sm font-extrabold">
            <div className="flex items-center gap-2 px-5 py-4 text-[var(--color-brand-muted)]">
              <X className="h-4 w-4" /> Traditionell annonsering
            </div>
            <div className="flex items-center gap-2 border-l border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)] px-5 py-4 text-[var(--color-brand-primary)]">
              <Check className="h-4 w-4" /> Collaktiv
            </div>
          </div>
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-2 border-b border-[var(--color-brand-border)] text-[13px] font-medium last:border-b-0"
            >
              <div className="px-5 py-4 text-[var(--color-brand-muted)]">
                <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-ink)]/50">
                  {row.label}
                </p>
                {row.ads}
              </div>
              <div className="border-l border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/40 px-5 py-4 font-bold text-[var(--color-brand-ink)]">
                {row.collaktiv}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
