import type { ComplimentaryDuration } from "./complimentary";

export type Category =
  | "mat-dryck"
  | "fika"
  | "mode"
  | "halsa-gym"
  | "kultur-noje"
  | "ovrigt";

export const CATEGORY_LABELS: Record<Category, string> = {
  "mat-dryck": "Mat & dryck",
  fika: "Fika & café",
  mode: "Mode & shopping",
  "halsa-gym": "Hälsa & gym",
  "kultur-noje": "Kultur & nöje",
  ovrigt: "Övrigt",
};

export type PackageTier = "standard" | "premium";

export type ApplicationStatus =
  | "utkast"
  | "inskickad"
  | "under_granskning"
  | "godkand"
  | "avvisad";

export interface CompanyProfile {
  id: string;
  name: string;
  logoDataUrl?: string;
  website?: string;
  description?: string;
  category: Category;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  /** Adress/plats – används för att visa företag närmast användaren i appen. */
  address?: string;
  /** Sätts av geokodning längre fram, inte av klienten. */
  latitude?: number;
  longitude?: number;
  packageTier: PackageTier;
  applicationStatus: ApplicationStatus;
  paymentConfirmed: boolean;
  /** Satt av admin via "Ge kostnadsfri åtkomst" – paymentConfirmed är
   * true men ingen riktig Stripe-betalning ligger bakom. Håller isär
   * betalande och gratis partners i statistik/fakturering. */
  complimentary: boolean;
  /** Räknas från lanseringen (APP_LAUNCH_DATE), inte från dagen den
   * beviljades – saknas både om "Tillsvidare" valdes OCH om
   * lanseringsdatumet ännu inte är känt (se complimentaryDuration då).
   * En daglig cron (src/lib/reminders.ts) återkallar automatiskt
   * åtkomsten när datumet passerat. */
  /** `| null` accepteras i en Partial-uppdatering för att uttryckligen
   * rensa fältet över ett API-anrop – ett JS-objekt med `undefined`
   * skickat via JSON.stringify tappar bort nyckeln helt (JSON saknar
   * undefined), så servern aldrig skulle få veta att fältet ska
   * nollställas. null serialiseras korrekt och hanteras identiskt med
   * undefined i updateCompany (se src/lib/db.ts). */
  complimentaryUntil?: string | null;
  /** Vald löptid, sparas även innan lanseringsdatumet är känt så
   * cron-sopningen vet vad den ska räkna ut complimentaryUntil till
   * den dagen (se src/lib/complimentary.ts). Se complimentaryUntil ovan
   * för varför `| null` behövs. */
  complimentaryDuration?: ComplimentaryDuration | null;
  /** Satt när en kostnadsfri partner godkänner villkoren – första
   * gången de publicerar ett erbjudande, se handlePublish i
   * /portal/erbjudanden/[id]/publicera. Betalande företags
   * godkännande loggas istället per betalning (se Payment). */
  termsVersion?: string;
  termsAcceptedAt?: string;
  /** Ikryssat vid registrering – ett eget, kort samtycke till att vi får
   * nämna företagsnamn och visa logga i marknadsföring/försäljning av
   * tjänsten redan från registreringen, innan de godkänner hela
   * villkoren (det sker först vid första publicering, se termsAcceptedAt).
   * Krävs för att slutföra registreringen, se /registrera. */
  brandUsageConsentAt?: string;
  contestHostInterested: boolean;
  contestPrizeDescription?: string;
  /** Ikryssat vid registrering – företaget vill inte använda portalen
   * själva utan vill att vi sköter paketval, erbjudande och
   * fakturering åt dem (se admins "Logga in som företag"). */
  fullServiceRequested: boolean;
  /** Vilket företag som bjöd in det här via sin delbara länk, om något. */
  referredByCompanyId?: string;
  /** Bonusåtkomst intjänad via inbjudningar – satt/förlängd 30 dagar
   * i taget när ett inbjudet företag betalar för sitt första paket. */
  bonusAccessUntil?: string;
  /** Sätts automatiskt när ansökan godkänns/första betalningen
   * bekräftas – grunden för när påminnelsemejl skickas. */
  approvedAt?: string;
  paymentConfirmedAt?: string;
  /** Senast ett påminnelsemejl av respektive typ skickades. */
  paymentReminderSentAt?: string;
  offerReminderSentAt?: string;
  /** Antal skickade påminnelser av respektive typ – vi slutar
   * automatiskt efter 4 (se src/lib/db.ts). */
  paymentReminderCount: number;
  offerReminderCount: number;
  createdAt: string;
  onboardingChecklist: {
    logo: boolean;
    firstOffer: boolean;
    profileComplete: boolean;
    firstPublish: boolean;
  };
}

export type OfferStatus =
  | "utkast"
  | "granskas"
  | "publicerad"
  | "pausad"
  | "arkiverad";

export type DiscountType = "procent" | "belopp" | "erbjudande";

// Hur resenären löser in erbjudandet i kassan:
//   app        – dagens swish-liknande sida som personalen bekräftar
//                manuellt i kassan (standard, inget extra att ange).
//   streckkod  – en streckkodsbild företaget laddar upp, skannas i
//                kassasystemet.
//   rabattkod  – en kod som visas för resenären efter köp, som löses
//                in på en webbplats företaget anger.
export type RedemptionMethod = "app" | "streckkod" | "rabattkod";

export interface Offer {
  id: string;
  companyId: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  /** Rabattens värde i kronor – anges alltid, oavsett vilken typ som
   * visas i appen, så poängkostnaden kan räknas ut korrekt. */
  discountValueKr: number;
  pointsCost: number;
  validTo?: string;
  terms?: string;
  imageEmoji: string;
  imageDataUrl?: string;
  imageOptimized?: boolean;
  redemptionMethod: RedemptionMethod;
  /** Uppladdad streckkodsbild – bara satt när redemptionMethod är "streckkod". */
  barcodeDataUrl?: string;
  /** Angiven av företaget eller genererad av oss – bara satt när
   * redemptionMethod är "rabattkod". */
  discountCode?: string;
  /** Webbplatsen resenären skickas till för att lösa in rabattkoden –
   * bara satt när redemptionMethod är "rabattkod". */
  redirectUrl?: string;
  /** Satt av företaget vid skapande – en resenär får bara lösa in
   * erbjudandet en gång, oavsett hur ofta det visas. Själva spärren
   * kan inte hållas förrän den framtida reseappen har resenärskonton
   * (se getPublishedOffersForApp i db.ts) – det här fältet exponeras
   * via /api/public/offers så appen vet att den behöver hålla koll. */
  limitedToOnePerUser: boolean;
  status: OfferStatus;
  /** Sätts automatiskt första gången admin publicerar erbjudandet –
   * ändras inte av senare paus/återuppta. Används som sorteringsnyckel
   * av /api/public/offers, den framtida reseappens datakälla. */
  publishedAt?: string;
  createdAt: string;
  stats: {
    views: number;
    redemptions: number;
  };
}

// En kampanj = extra synlighet i appen under en period, köpt direkt
// i portalen. Vilket värde det ger företaget och vad det ska kosta
// är inte bestämt än – det här fångar bara intresseanmälan så admin
// kan följa upp.
export type CampaignStatus = "intresseanmald" | "godkand" | "aktiv" | "avvisad";

export interface Campaign {
  id: string;
  companyId: string;
  message?: string;
  status: CampaignStatus;
  createdAt: string;
}

// Extra butiker utöver företagets huvudadress (CompanyProfile.address).
// De flesta företag har noll rader här – bara kedjor med flera
// fysiska platser lägger till egna.
export interface CompanyLocation {
  id: string;
  companyId: string;
  name?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export type PaymentStatus = "paid" | "pending" | "refunded";

export interface Payment {
  id: string;
  companyId: string;
  offerId: string | null;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string;
  planId: string;
  period: string;
  status: PaymentStatus;
  termsVersion: string | null;
  termsAcceptedAt: string | null;
  createdAt: string;
}
