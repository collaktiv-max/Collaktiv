// Simulerade AI-funktioner för delar som ännu inte är kopplade till en
// riktig modell. Erbjudandeförslag och textförbättring går numera via
// riktiga Claude-anrop, se src/lib/offer-ai.ts.

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MarketingVariant {
  id: string;
  headline: string;
  subline: string;
  emoji: string;
}

const MARKETING_HEADLINES = [
  "Res hållbart. Få mer.",
  "Er belöning väntar här.",
  "Hoppa på, spara pengar.",
  "Kollektivt resande lönar sig.",
  "Nya stamkunder tack vare bussen.",
];

export async function generateMarketingVariants(
  companyName: string,
  offerTitle: string,
  count = 3
): Promise<MarketingVariant[]> {
  await wait(1200);
  return Array.from({ length: count }).map((_, i) => ({
    id: `${Date.now()}-${i}`,
    headline: MARKETING_HEADLINES[(i + offerTitle.length) % MARKETING_HEADLINES.length],
    subline: `${companyName} · ${offerTitle}`,
    emoji: ["🌿", "🚌", "✨", "🎉", "☕"][(i + companyName.length) % 5],
  }));
}
