import type { Category, DiscountType } from "./types";

// Simulerade AI-funktioner. I produktion ersätts dessa av riktiga anrop,
// men gränssnittet och flödet är byggt för att kopplas in rakt av.

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SUGGESTIONS_BY_CATEGORY: Record<
  Category,
  { title: string; description: string; discountValue: string }[]
> = {
  "mat-dryck": [
    {
      title: "20% rabatt på hela notan",
      description:
        "Visa koden i kassan och få rabatt på hela ert besök, alla dagar i veckan.",
      discountValue: "20%",
    },
    {
      title: "Gratis dryck till lunchen",
      description: "En valfri dryck bjuder vi på till alla lunchgäster som reser kollektivt.",
      discountValue: "1 gratis dryck",
    },
  ],
  fika: [
    {
      title: "2 för 1 på fika",
      description: "Köp en fika, få en till på köpet. Gäller kaffe och bakverk i hela sortimentet.",
      discountValue: "2 för 1",
    },
    {
      title: "15% på hela köpet",
      description: "Ett enkelt sätt att fira att ni reste hållbart hit – 15% rabatt idag.",
      discountValue: "15%",
    },
  ],
  mode: [
    {
      title: "10% på hela sortimentet",
      description: "Rabatten gäller på ordinarie pris, hela butiken, hela säsongen.",
      discountValue: "10%",
    },
    {
      title: "150 kr rabatt vid köp över 500 kr",
      description: "Perfekt för resenären som ändå är i stan och vill unna sig något nytt.",
      discountValue: "150 kr",
    },
  ],
  "halsa-gym": [
    {
      title: "Gratis dagpass",
      description: "Testa på ett fullt träningspass helt gratis – ingen bindningstid.",
      discountValue: "1 gratis dagpass",
    },
    {
      title: "25% på första månaden",
      description: "Nya medlemmar som reser kollektivt får rabatt på sin första månad.",
      discountValue: "25%",
    },
  ],
  "kultur-noje": [
    {
      title: "20% på biljetten",
      description: "Visa upp erbjudandet i entrén och få rabatt på ordinarie biljettpris.",
      discountValue: "20%",
    },
    {
      title: "2-för-1 på valfri föreställning",
      description: "Ta med en vän – ni betalar för en biljett, båda får plats.",
      discountValue: "2 för 1",
    },
  ],
  ovrigt: [
    {
      title: "10% rabatt på hela köpet",
      description: "Ett enkelt, generöst erbjudande som passar de flesta besökare.",
      discountValue: "10%",
    },
    {
      title: "Fri frakt eller fri leverans",
      description: "Ta bort en tröskel för nya kunder som hittar er via Collaktiv.",
      discountValue: "Fri frakt",
    },
  ],
};

export async function generateOfferSuggestions(category: Category) {
  await wait(900);
  return SUGGESTIONS_BY_CATEGORY[category] ?? SUGGESTIONS_BY_CATEGORY.ovrigt;
}

export async function improveOfferCopy(title: string, description: string) {
  await wait(1100);
  const cleanTitle = title.trim() || "Ert erbjudande";
  const punchyTitle =
    cleanTitle.length > 34 ? cleanTitle.slice(0, 34).trim() + "…" : cleanTitle;
  const improvedDescription = description.trim()
    ? `${description.trim().replace(/\.$/, "")}. Visa upp erbjudandet i kassan – enkelt för både er och gästen.`
    : "Ett tydligt, enkelt erbjudande som gör det lätt för nya gäster att välja er.";
  return {
    title: punchyTitle.replace(/^\w/, (c) => c.toUpperCase()),
    description: improvedDescription,
  };
}

export async function suggestPointsRange(
  discountType: DiscountType,
  discountValue: string
) {
  await wait(500);
  const numeric = parseInt(discountValue.replace(/[^0-9]/g, ""), 10) || 10;
  let base = 20;
  if (discountType === "procent") {
    base = Math.round(numeric * 1.6);
  } else if (discountType === "belopp") {
    base = Math.round(numeric * 0.12);
  } else {
    base = 30;
  }
  const min = Math.max(10, Math.round((base - 8) / 5) * 5);
  const max = Math.round((base + 8) / 5) * 5;
  return { min, max, recommended: Math.round(base / 5) * 5 };
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
