import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/landing/PublicHeader";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { PLANS, BILLING_LABELS, EARLY_BIRD_SLOTS, EARLY_BIRD_DISCOUNT } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Villkor – Collaktiv Företagsportalen",
  description: "Allmänna villkor och betalningsvillkor för partnerföretag i Collaktiv.",
};

const UPDATED = "5 oktober 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-extrabold text-[var(--color-brand-ink)]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm font-medium leading-relaxed text-[var(--color-brand-muted)]">
        {children}
      </div>
    </section>
  );
}

export default function VillkorPage() {
  return (
    <>
      <PublicHeader />
      <main className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <h1 className="text-2xl font-extrabold text-[var(--color-brand-ink)] sm:text-3xl">
            Allmänna villkor &amp; betalningsvillkor
          </h1>
          <p className="mt-2 text-sm font-semibold text-[var(--color-brand-muted)]">
            Senast uppdaterad {UPDATED}. Gäller för företag som registrerar sig som partner i
            Collaktiv Företagsportalen (&rdquo;portalen&rdquo;).
          </p>

          <div className="mt-6 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/30 p-4 text-xs font-bold text-[var(--color-brand-ink)]">
            Avtalspart: Collaktiv AB, org.nr 559603-5682, c/o Mossnelid,
            Vårbackavägen 9a, 805 95 Gävle.
          </div>

          <Section title="1. Tjänsten">
            <p>
              Collaktiv driver en reseapp där resenärer i Gävleborg kan ta del av erbjudanden
              från lokala företag mot poäng. Portalen är den kanal där partnerföretag
              (&rdquo;ni&rdquo;, &rdquo;företaget&rdquo;) skapar, publicerar och hanterar sina
              erbjudanden.
            </p>
            <p>
              Det är kostnadsfritt att registrera ert företag och spara erbjudanden som utkast.
              En betalning krävs först när ni väljer att publicera ett erbjudande i appen.
            </p>
          </Section>

          <Section title="2. Ansökan och granskning">
            <p>
              Både er ansökan som partner och varje enskilt erbjudande granskas manuellt av
              Collaktiv innan det går live i appen. Vi kan neka en ansökan eller ett erbjudande
              utan att behöva ange skäl, t.ex. om innehållet strider mot dessa villkor, är
              missvisande eller inte passar reseappens målgrupp.
            </p>
            <p>
              Om en ansökan eller ett redan betalt erbjudande nekas återbetalas betalningen
              automatiskt i sin helhet. Ni behöver inte kontakta oss för detta.
            </p>
          </Section>

          <Section title="3. Paket och priser">
            <p>
              Erbjudanden publiceras under något av två paket:{" "}
              {PLANS.map((p) => p.name).join(" och ")}. Aktuella priser och vad respektive
              paket innehåller visas alltid på{" "}
              <Link href="/#varfor" className="font-bold text-[var(--color-brand-primary)] underline">
                startsidan
              </Link>{" "}
              och vid publicering i portalen, och gäller före de villkor som anges här vid
              eventuell motstridighet i sakuppgifter om pris.
            </p>
            <p>
              Ett paket köps för en vald period – {BILLING_LABELS.sixMonths.toLowerCase()} eller{" "}
              {BILLING_LABELS.year.toLowerCase()}. De {EARLY_BIRD_SLOTS} första partnerföretagen
              får {Math.round(EARLY_BIRD_DISCOUNT * 100)}% rabatt på hela paketpriset.
            </p>
          </Section>

          <Section title="4. Betalning">
            <p>
              Alla priser som visas i portalen och i appen är i svenska kronor och inkluderar
              25% svensk moms. Betalning sker antingen med kort direkt vid publicering, eller
              mot faktura med 30 dagars betalningsvillkor – ni väljer själva vid
              publiceringstillfället.
            </p>
            <p>
              Betalningen är en engångsbetalning för den valda perioden – det är ingen
              prenumeration och ingen automatisk förnyelse. När perioden löper ut slutar
              erbjudandet synas i appen tills ni väljer att betala för en ny period.
            </p>
            <p>
              Om ni betalar mot faktura men inte betalar i tid skickar vi betalningspåminnelser.
              Erbjudandet publiceras inte, och ert konto räknas inte som betalt, förrän fakturan
              är betald.
            </p>
          </Section>

          <Section title="5. Ingen bindningstid, paus och uppsägning">
            <p>
              Det finns ingen bindningstid i bemärkelsen att ni binder er till återkommande
              betalningar – ni betalar en gång per period och kan när som helst, utan extra
              kostnad, pausa ett publicerat erbjudande från portalen. Ett pausat erbjudande tas
              bort från appen men ni behåller er redan betalda period och kan återuppta
              erbjudandet när ni vill, utan ny betalning.
            </p>
            <p>
              Paus, eller att ni väljer att inte använda hela den betalda perioden, ger ingen
              återbetalning. Betalningen avser rätten att publicera under den valda perioden,
              oavsett hur stor del av perioden erbjudandet faktiskt är synligt.
            </p>
            <p>
              Ni kan fritt redigera ett erbjudandes innehåll (text, rabatt, bild m.m.) under hela
              perioden utan ny betalning. Vill ni byta från Standard till Premium under en
              pågående period sker det genom en ny betalning enligt de villkor som visas vid
              köptillfället.
            </p>
          </Section>

          <Section title="6. Innehållsansvar">
            <p>
              Ni ansvarar för att uppgifterna i er ansökan och i era erbjudanden är korrekta,
              lagliga och inte vilseledande, samt att ni har rätt att leverera det som utlovas i
              erbjudandet. Collaktiv kan när som helst pausa eller ta bort ett erbjudande som
              bryter mot detta, utan att det ger rätt till återbetalning.
            </p>
          </Section>

          <Section title="7. Ansvarsbegränsning">
            <p>
              Collaktiv ansvarar inte för uteblivna besök, intäkter eller annan indirekt skada
              som uppstår till följd av hur ett erbjudande presterar i appen. Vårt ansvar är i
              alla delar begränsat till det belopp ni betalat för den aktuella perioden.
            </p>
          </Section>

          <Section title="8. Ändringar av villkoren">
            <p>
              Vi kan uppdatera dessa villkor löpande. Väsentliga ändringar som påverkar redan
              betalda, pågående perioder meddelas via e-post till den kontaktadress ni angett.
              Fortsatt användning av portalen efter en uppdatering innebär att ni accepterar de
              nya villkoren.
            </p>
          </Section>

          <Section title="9. Kontakt">
            <p>
              Frågor om dessa villkor eller en betalning? Mejla{" "}
              <a href="mailto:partner@collaktiv.se" className="font-bold text-[var(--color-brand-primary)] underline">
                partner@collaktiv.se
              </a>
              .
            </p>
            <p>
              Collaktiv AB, org.nr 559603-5682
              <br />
              c/o Mossnelid, Vårbackavägen 9a, 805 95 Gävle
            </p>
          </Section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
