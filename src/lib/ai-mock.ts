import type { Category, DiscountType } from "./types";

// Simulerade AI-funktioner. I produktion ersätts dessa av riktiga anrop,
// men gränssnittet och flödet är byggt för att kopplas in rakt av.

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface OfferSuggestion {
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  /** Ungefärligt kronovärde på rabatten – grund för poängkostnaden. */
  discountValueKr: number;
}

// Varje kategori har en bredare pool realistiska förslag än vad som
// visas åt gången, så "Generera nya förslag" faktiskt ger nya resultat
// istället för att upprepa samma två varje gång.
const SUGGESTIONS_BY_CATEGORY: Record<Category, OfferSuggestion[]> = {
  "mat-dryck": [
    {
      title: "20% rabatt på hela notan",
      description: "Visa upp erbjudandet i kassan och få rabatt på hela ert besök, alla dagar i veckan.",
      discountType: "procent",
      discountValue: "20%",
      discountValueKr: 35,
    },
    {
      title: "Gratis dryck till lunchen",
      description: "En valfri dryck bjuder vi på till alla lunchgäster som reser kollektivt hit.",
      discountType: "erbjudande",
      discountValue: "1 gratis dryck",
      discountValueKr: 30,
    },
    {
      title: "15% rabatt vardagar 11–14",
      description: "Rabatt under lunchrusningen – ett enkelt sätt att fylla borden på en lugnare tid.",
      discountType: "procent",
      discountValue: "15%",
      discountValueKr: 25,
    },
    {
      title: "50 kr rabatt vid köp över 250 kr",
      description: "Passar bra för den som handlar middag eller fredagsmys på väg hem från jobbet.",
      discountType: "belopp",
      discountValue: "50 kr",
      discountValueKr: 50,
    },
    {
      title: "Gratis efterrätt till huvudrätt",
      description: "Ett litet extra som gör besöket minnesvärt, utan att tynga priset på huvudrätten.",
      discountType: "erbjudande",
      discountValue: "1 gratis efterrätt",
      discountValueKr: 45,
    },
    {
      title: "10% rabatt på hela notan, hela veckan",
      description: "Ett lågmält men generöst erbjudande som fungerar för alla gäster, alla dagar.",
      discountType: "procent",
      discountValue: "10%",
      discountValueKr: 25,
    },
  ],
  fika: [
    {
      title: "2 för 1 på fika",
      description: "Köp en fika, få en till på köpet. Gäller kaffe och bakverk i hela sortimentet.",
      discountType: "erbjudande",
      discountValue: "2 för 1",
      discountValueKr: 40,
    },
    {
      title: "15% på hela köpet",
      description: "Ett enkelt sätt att fira att resan hit gick hållbart – 15% rabatt på besöket.",
      discountType: "procent",
      discountValue: "15%",
      discountValueKr: 15,
    },
    {
      title: "Gratis påtår till kaffet",
      description: "En liten detalj som får gästen att stanna lite längre – och komma tillbaka.",
      discountType: "erbjudande",
      discountValue: "1 gratis påtår",
      discountValueKr: 10,
    },
    {
      title: "20 kr rabatt på valfri fikapaket",
      description: "Rabatt på kombinationen kaffe + bulle – det mest köpta på de flesta caféer.",
      discountType: "belopp",
      discountValue: "20 kr",
      discountValueKr: 20,
    },
    {
      title: "Gratis kanelbulle vid köp av kaffe",
      description: "Ett tydligt, lättförståeligt erbjudande som syns bra i appen.",
      discountType: "erbjudande",
      discountValue: "1 gratis kanelbulle",
      discountValueKr: 25,
    },
  ],
  mode: [
    {
      title: "10% på hela sortimentet",
      description: "Rabatten gäller på ordinarie pris, hela butiken, hela säsongen.",
      discountType: "procent",
      discountValue: "10%",
      discountValueKr: 60,
    },
    {
      title: "150 kr rabatt vid köp över 500 kr",
      description: "Perfekt för resenären som ändå är i stan och vill unna sig något nytt.",
      discountType: "belopp",
      discountValue: "150 kr",
      discountValueKr: 150,
    },
    {
      title: "20% på en vara i ordinarie pris",
      description: "Lagom avgränsat erbjudande som ändå känns som en riktig besparing.",
      discountType: "procent",
      discountValue: "20%",
      discountValueKr: 100,
    },
    {
      title: "Gratis presentinslagning",
      description: "Liten service som sänker tröskeln för den som handlar en present på väg hem.",
      discountType: "erbjudande",
      discountValue: "Gratis presentinslagning",
      discountValueKr: 20,
    },
    {
      title: "100 kr rabatt vid köp över 400 kr",
      description: "Ett rakt, lättbegripligt erbjudande som funkar bra för de flesta butiker.",
      discountType: "belopp",
      discountValue: "100 kr",
      discountValueKr: 100,
    },
  ],
  "halsa-gym": [
    {
      title: "Gratis dagpass",
      description: "Testa på ett fullt träningspass helt gratis – ingen bindningstid, inget krångel.",
      discountType: "erbjudande",
      discountValue: "1 gratis dagpass",
      discountValueKr: 150,
    },
    {
      title: "25% på första månaden",
      description: "Nya medlemmar som reser kollektivt hit får rabatt på sin första månad.",
      discountType: "procent",
      discountValue: "25%",
      discountValueKr: 125,
    },
    {
      title: "Ingen startavgift",
      description: "Ta bort den vanligaste anledningen till att nya medlemmar tvekar.",
      discountType: "belopp",
      discountValue: "500 kr",
      discountValueKr: 500,
    },
    {
      title: "Gratis pass hos valfri instruktör",
      description: "Ett sätt att visa upp gruppträningen för resenärer som ännu inte testat.",
      discountType: "erbjudande",
      discountValue: "1 gratis gruppass",
      discountValueKr: 180,
    },
    {
      title: "15% rabatt på 3-månaderskort",
      description: "Rabatt på ett lite längre åtagande, för den som vill komma igång på riktigt.",
      discountType: "procent",
      discountValue: "15%",
      discountValueKr: 200,
    },
  ],
  "kultur-noje": [
    {
      title: "20% på biljetten",
      description: "Visa upp erbjudandet i entrén och få rabatt på ordinarie biljettpris.",
      discountType: "procent",
      discountValue: "20%",
      discountValueKr: 40,
    },
    {
      title: "2-för-1 på valfri föreställning",
      description: "Ta med en vän – ni betalar för en biljett, båda får plats.",
      discountType: "erbjudande",
      discountValue: "2 för 1",
      discountValueKr: 140,
    },
    {
      title: "30 kr rabatt på entrén",
      description: "Ett litet, konkret avdrag som är enkelt att räkna på för gästen.",
      discountType: "belopp",
      discountValue: "30 kr",
      discountValueKr: 30,
    },
    {
      title: "Gratis garderob",
      description: "Liten men uppskattad detalj som gör besöket smidigare för gästen.",
      discountType: "erbjudande",
      discountValue: "Gratis garderob",
      discountValueKr: 20,
    },
    {
      title: "15% på nästa föreställning vid återbesök",
      description: "Belönar återkommande besökare och ger er en anledning till en ny inlösen.",
      discountType: "procent",
      discountValue: "15%",
      discountValueKr: 35,
    },
  ],
  ovrigt: [
    {
      title: "10% rabatt på hela köpet",
      description: "Ett enkelt, generöst erbjudande som passar de flesta besökare.",
      discountType: "procent",
      discountValue: "10%",
      discountValueKr: 40,
    },
    {
      title: "Fri frakt eller fri leverans",
      description: "Ta bort en tröskel för nya kunder som hittar er via Collaktiv.",
      discountType: "erbjudande",
      discountValue: "Fri frakt",
      discountValueKr: 49,
    },
    {
      title: "50 kr rabatt vid köp över 300 kr",
      description: "Rakt på sak – lätt för kunden att förstå och lätt för er att räkna på.",
      discountType: "belopp",
      discountValue: "50 kr",
      discountValueKr: 50,
    },
    {
      title: "15% rabatt för nya kunder",
      description: "Sänk tröskeln för resenärer som aldrig besökt er tidigare.",
      discountType: "procent",
      discountValue: "15%",
      discountValueKr: 45,
    },
  ],
};

export async function generateOfferSuggestions(
  category: Category,
  exclude: string[] = [],
  count = 2
): Promise<OfferSuggestion[]> {
  await wait(900);
  const pool = SUGGESTIONS_BY_CATEGORY[category] ?? SUGGESTIONS_BY_CATEGORY.ovrigt;
  const fresh = pool.filter((s) => !exclude.includes(s.title));
  const source = fresh.length >= count ? fresh : pool;
  return shuffle(source).slice(0, count);
}

const IMPROVEMENT_CLOSERS = [
  "Visa upp erbjudandet i kassan – enkelt för både er och gästen.",
  "Gäller direkt i appen, utan krångel för er personal.",
  "Ett tydligt skäl för resenären att välja just er idag.",
  "Enkelt att känna igen för personalen, enkelt att lösa in för gästen.",
];

export async function improveOfferCopy(title: string, description: string) {
  await wait(1100);
  const cleanTitle = title.trim() || "Ert erbjudande";
  const punchyTitle =
    cleanTitle.length > 34 ? cleanTitle.slice(0, 34).trim() + "…" : cleanTitle;

  const cleanDescription = description.trim().replace(/\.+$/, "");
  const closer = IMPROVEMENT_CLOSERS[Math.floor(Math.random() * IMPROVEMENT_CLOSERS.length)];
  const improvedDescription = cleanDescription
    ? `${cleanDescription}. ${closer}`
    : "Ett tydligt, enkelt erbjudande som gör det lätt för nya gäster att välja er.";

  return {
    title: punchyTitle.replace(/^\w/, (c) => c.toUpperCase()),
    description: improvedDescription,
  };
}

export async function suggestPointsRange(discountValueKr: number) {
  await wait(500);
  // Grov tumregel: en poäng motsvarar ungefär 0,7 kr i rabattvärde,
  // med ett golv så att även små erbjudanden kostar något.
  const base = Math.max(10, Math.round(discountValueKr * 0.7));
  const min = Math.max(10, Math.round((base - base * 0.2) / 5) * 5);
  const max = Math.round((base + base * 0.2) / 5) * 5;
  const recommended = Math.round(base / 5) * 5;
  return { min, max, recommended };
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
