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
  contestHostInterested: boolean;
  contestPrizeDescription?: string;
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
  | "arkiverad";

export type DiscountType = "procent" | "belopp" | "erbjudande";

export interface Offer {
  id: string;
  companyId: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  pointsCost: number;
  validTo?: string;
  terms?: string;
  imageEmoji: string;
  imageDataUrl?: string;
  imageOptimized?: boolean;
  status: OfferStatus;
  createdAt: string;
  stats: {
    views: number;
    redemptions: number;
  };
}

export interface ReferralInvite {
  id: string;
  email: string;
  sentAt: string;
  status: "skickad" | "registrerad";
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
