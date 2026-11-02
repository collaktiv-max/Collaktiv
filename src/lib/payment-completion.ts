import "server-only";
import { submitOfferForReview, updateCompany } from "./db";
import type { PackageTier } from "./types";

// Delas av /api/checkout/verify (kortbetalning) och /api/webhooks/stripe
// (fakturabetalning) – körs när en betalning är bekräftad, oavsett
// betalsätt. Gäller numera bara uppgradering till Premium (Standard är
// gratis och kräver aldrig betalning, se createCompany i db.ts). Ett
// företag kan betala för Premium utan att redan ha ett erbjudande (se
// /portal/paket) – då finns inget offerId och bara företaget uppdateras.
//
// Referral-bonusen ("gratis månad Premium") ges INTE här – den ges bara
// när det inbjudna företaget faktiskt publicerar sitt första erbjudande,
// se becomingFirstPublish i updateOffer (db.ts).
export async function completePayment(params: { companyId: string; planId: PackageTier }) {
  const { companyId, planId } = params;

  // En riktig betalning gör företaget till en genuin betalande kund –
  // nollställ en eventuell kostnadsfri åtkomst (annars skulle badgen
  // fortsätta visa "Kostnadsfritt" trots en skarp betalning).
  return updateCompany(companyId, {
    packageTier: planId,
    paymentConfirmed: true,
    complimentary: false,
    complimentaryUntil: undefined,
    complimentaryDuration: undefined,
  });
}

export async function completePaidOffer(params: {
  companyId: string;
  offerId: string;
  planId: PackageTier;
}) {
  const { companyId, offerId, planId } = params;
  const company = await completePayment({ companyId, planId });
  if (!company) return null;
  return submitOfferForReview(offerId, companyId);
}
