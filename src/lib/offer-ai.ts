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
- title: Kort, tydlig titel (max ca 40 tecken), t.ex. "20% rabatt på hela köpet".
- description: 1–2 meningar som förklarar vad erbjudandet innebär och hur man löser in det. Varm men konkret ton, ingen överdriven marknadsföringsjargong.
- discountType: "procent" (rabatt i procent), "belopp" (rabatt i kronor) eller "erbjudande" (fritt formulerat, t.ex. "2 för 1" eller "gratis dryck").
- discountValue: Kort visningstext som matchar discountType, t.ex. "20%", "50 kr" eller "1 gratis fika".
- discountValueKr: Ett ungefärligt kronovärde på vad rabatten faktiskt är värd för en typisk kund vid ett vanligt köp i den här branschen (ett heltal, rimligt för branschen – t.ex. en fika-rabatt kanske är värd 10–40 kr, ett klädköp 50–200 kr). Detta fält visas aldrig för resenären, det används bara internt.

Variera gärna mellan de olika discountType när du ger flera förslag.`,
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

- title: Kort och slagkraftig (max ca 40 tecken).
- description: 1–2 meningar, varm men konkret ton, gärna med en antydan om hur man löser in erbjudandet om det känns naturligt.`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Kunde inte tolka AI-svaret.");
  }
  return parsed;
}
