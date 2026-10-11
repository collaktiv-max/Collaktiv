import "server-only";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getClaudeClient } from "./claude";
import { CATEGORY_LABELS, type Category } from "./types";

const OfferSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  discountType: z.enum(["procent", "belopp", "erbjudande"]),
  discountValue: z.string(),
  // Ungefärligt kronovärde på rabatten – grund för poängkostnaden (se
  // src/lib/points.ts), visas aldrig för resenären.
  discountValueKr: z.number(),
});
export type OfferSuggestion = z.infer<typeof OfferSuggestionSchema>;

const SuggestionsResponseSchema = z.object({
  suggestions: z.array(OfferSuggestionSchema),
});

const ImproveResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// Riktiga erbjudanden från Collaktiv UF-året – bara som stilreferens
// för ton och struktur. Modellen ska INTE återanvända företagsnamn
// eller sakuppgifter härifrån, bara skriva i samma stil.
const STYLE_EXAMPLES = `- "Rabatt på skor" – "Är du på jakt efter nya skor? Då är detta helt perfekt! Få 10% rabatt på hela sortimentet hos Berglövs skor! Väl mellan olika modeller. Kom in och hitta din favorit!"
- "Kaka & kaffe" – "Nu kan du få City Caféets otroliga nougat och mandelkaka, plus en kopp kaffe för bara 72 kr. Ordinarie pris 82 kr. Kom in och fynda!"
- "Valfri dryck" – "Nu kan du få 2 valfria drycker till priset av en hos City Caféet i Gävle. Kom förbi och välj mellan olika favoriter!"
- "Dagens lunch" – "Få hela 15% rabatt på populära dagens lunch hos Epi. Ett perfekt lunchalternativ! Exklusivt hos Collaktiv. Kom och njut!"
- "Rabatt på Fazer" – "Rabatt på Fazer hos Escape Gaming. Få 2 för 15kr eller 2 för 26kr! Passa på! Gäller Fazer påse 80-90g."
- "Rabatt på ditt köp" – "Få 50kr rabatt vid köp över 500kr hos Ica Supermarket Strömsbro. Erbjudandet gäller vid ett köptillfälle och kan ej kombineras med andra rabatter. Gäller ej spel, lotter, tidningar, tobak och apoteksvaror."
- "Rabatt på måltid" – "Hungrig? Besök Le Báb och få 10% rabatt på mat och alkoholfri dryck. Kom in och välj fritt på deras otroliga meny. Detta erbjudande gäller en person och täcker inte hela notan. Rabatten gäller ej alkohol."
- "Gratis värdering" – "Funderar du på att sälja din bostad? Boka en kostnadsfri värdering hos Svensk Fastighetsförmedling Gävle – exklusivt via Collaktiv. En erfaren mäklare värderar din bostad helt gratis, utan några som helst krav på att gå vidare med en försäljning. Lös in erbjudandet och följ stegen för att gå vidare!"`;

const STYLE_GUIDE = `Skriv i exakt den här stilen (se exemplen nedan):
- Titel: kort och konkret, oftast "Rabatt på [vara/tjänst]" eller bara vad erbjudandet är (t.ex. "Kaka & kaffe", "Valfri dryck", "Gratis värdering") – inte en hel säljande mening.
- Beskrivning: börja gärna med en kort krok – en fråga ("Hungrig?", "Sugen på kaffe?", "Funderar du på...?") eller ett kort utrop. Säg sedan exakt vad erbjudandet är med konkreta siffror (procent, kronor, eller "X för Y"/"2 för 1"). Avsluta gärna med en kort uppmaning som "Passa på!", "Kom in och...", "Missa inte!". Nämn tydliga villkor eller undantag i ett eget kort stycke om det är naturligt (t.ex. "Gäller ej alkohol", "Gäller en person", "Kan ej kombineras med andra rabatter").
- Vardaglig, rak svenska – korta meningar, inga floskler eller överdriven marknadsföringsjargong.

Exempel på stilen (bara stilreferens – hitta inte på att det är samma företag eller kopiera texten rakt av):
${STYLE_EXAMPLES}`;

// Genererar nya, varierade erbjudandeförslag åt ett företag utifrån
// deras bransch – används av "Låt AI föreslå ett erbjudande" i
// OfferForm. Kastar om ANTHROPIC_API_KEY saknas eller svaret inte går
// att tolka, anroparen (API-routen) fångar och svarar med fel.
export async function generateOfferSuggestions(params: {
  category: Category;
  companyName: string;
  exclude?: string[];
  count?: number;
}): Promise<OfferSuggestion[]> {
  const client = getClaudeClient();
  if (!client) {
    throw new Error("ANTHROPIC_API_KEY saknas i miljövariablerna.");
  }
  const { category, companyName, exclude = [], count = 2 } = params;

  const response = await client.messages.parse({
    model: "claude-haiku-5-5",
    max_tokens: 3000,
    output_config: { format: zodOutputFormat(SuggestionsResponseSchema) },
    messages: [
      {
        role: "user",
        content: `Du hjälper lokala företag i Sverige att skapa bra erbjudanden för Collaktiv – en app där resenärer som åker kollektivt samlar poäng och löser in dem mot rabatter hos lokala företag.

Företag: ${companyName || "(namn saknas)"}
Bransch: ${CATEGORY_LABELS[category]}
${exclude.length ? `Föreslå INTE någon av dessa redan visade titlar igen: ${exclude.join(", ")}` : ""}

Ge mig ${count} st olika, konkreta och realistiska erbjudandeförslag för just den här branschen. Varje förslag ska ha:
- title: Se stilguiden nedan.
- description: Se stilguiden nedan – 1–3 meningar eller korta stycken.
- discountType: "procent" (rabatt i procent), "belopp" (rabatt i kronor) eller "erbjudande" (fritt formulerat, t.ex. "2 för 1" eller "gratis dryck").
- discountValue: Kort visningstext som matchar discountType, t.ex. "20%", "50 kr" eller "1 gratis fika".
- discountValueKr: Ett ungefärligt kronovärde på vad rabatten faktiskt är värd för en typisk kund vid ett vanligt köp i den här branschen (ett heltal, rimligt för branschen – t.ex. en fika-rabatt kanske är värd 10–40 kr, ett klädköp 50–200 kr). Detta fält visas aldrig för resenären, det används bara internt.

Variera gärna mellan de olika discountType när du ger flera förslag.

${STYLE_GUIDE}`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Kunde inte tolka AI-svaret.");
  }
  return parsed.suggestions;
}

// Skriver om en titel/beskrivning så den blir tydligare och mer
// säljande, utan att ändra på vad erbjudandet faktiskt innebär.
export async function improveOfferCopy(params: {
  title: string;
  description: string;
  category: Category;
}): Promise<{ title: string; description: string }> {
  const client = getClaudeClient();
  if (!client) {
    throw new Error("ANTHROPIC_API_KEY saknas i miljövariablerna.");
  }
  const { title, description, category } = params;

  const response = await client.messages.parse({
    model: "claude-haiku-5-5",
    max_tokens: 1500,
    output_config: { format: zodOutputFormat(ImproveResponseSchema) },
    messages: [
      {
        role: "user",
        content: `Du hjälper ett lokalt företag (bransch: ${CATEGORY_LABELS[category]}) att skriva ett tydligare, mer säljande erbjudande för Collaktiv – en app där kollektivtrafikresenärer löser in poäng mot rabatter hos lokala företag.

Nuvarande titel: "${title || "(ingen titel ännu)"}"
Nuvarande beskrivning: "${description || "(ingen beskrivning ännu)"}"

Skriv om titeln och beskrivningen så de blir tydligare, mer lockande och går att förstå på en sekund. Behåll exakt samma rabatt/erbjudande som redan beskrivs – hitta inte på nya belopp, procentsatser eller villkor som inte redan finns med. Om nuvarande text är tom eller väldigt kort, gör ett rimligt antagande utifrån branschen men håll det generellt.

${STYLE_GUIDE}`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Kunde inte tolka AI-svaret.");
  }
  return parsed;
}
