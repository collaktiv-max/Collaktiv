import { Check, X } from "lucide-react";
import { Container } from "@/components/ui/Container";

const rows = [
  {
    label: "Kassahantering",
    ads: "Krångliga kuponger, streckkoder eller dyra kassaintegrationer.",
    collaktivBold: "Noll integration.",
    collaktivRest: " Dynamisk 10-minuters säkerhetsnedräkning på kundens skärm.",
  },
  {
    label: "Betalningsmodell",
    ads: "5 000–10 000 kr för en tidningsannons eller osäkra klickavgifter.",
    collaktivBold: "Fast, låg månadskostnad",
    collaktivRest: " (från 495 kr/mån för Founding Partners). Ingen bindningstid.",
  },
  {
    label: "Målgrupp & Tajming",
    ads: "Bred räckvidd till folk som ligger hemma i soffan.",
    collaktivBold: "Pendlare på språng",
    collaktivRest: " som precis samlat poäng och söker lokala erbjudanden.",
  },
  {
    label: "Fysiskt material",
    ads: "Ni måste designa, trycka och bekosta skyltar och dekaler själva.",
    collaktivBold: "Färdigt butikskit ingår",
    collaktivRest: " (professionella bordsryttare & fönsterdekaler med QR-kod).",
  },
  {
    label: "Mätbar effekt",
    ads: "Omöjligt att veta om annonsen gav en enda kund i kassan.",
    collaktivBold: "Exakt inlösenstatistik i realtid.",
    collaktivRest: " Ni ser varje genomfört köp i er portal.",
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
              <X className="h-4 w-4" /> Traditionell annonsering (Tidning / Sociala medier)
            </div>
            <div className="flex items-center gap-2 border-l border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)] px-5 py-4 text-[var(--color-brand-primary)]">
              <Check className="h-4 w-4" /> Collaktiv Företagsportal
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
              <div className="border-l border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/40 px-5 py-4 text-[var(--color-brand-ink)]">
                <span className="font-extrabold">{row.collaktivBold}</span>
                {row.collaktivRest}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
