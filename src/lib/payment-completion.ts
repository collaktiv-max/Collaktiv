import "server-only";
import { getCompanyById, grantReferralBonus, submitOfferForReview, updateCompany } from "./db";
import type { PackageTier } from "./types";

// Delas av /api/checkout/verify (kortbetalning) och /api/webhooks/stripe
// (fakturabetalning) – körs när en betalning är bekräftad, oavsett
// betalsätt. Ett företag kan numera betala för ett paket utan att redan
// ha ett erbjudande (se /portal/paket) – då finns inget offerId och
// bara företaget uppdateras.
export async function completePayment(params: { companyId: string; planId: PackageTier }) {
  const { companyId, planId } = params;

  const existingCompany = await getCompanyById(companyId);
  const isFirstPayment = !existingCompany?.paymentConfirmed;

  const company = await updateCompany(companyId, { packageTier: planId, paymentConfirmed: true });

  if (isFirstPayment && existingCompany?.referredByCompanyId) {
    await grantReferralBonus(existingCompany.referredByCompanyId);
  }

  return company;
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
