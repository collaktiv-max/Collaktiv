import "server-only";
import { getCompanyById, grantReferralBonus, submitOfferForReview, updateCompany } from "./db";
import type { PackageTier } from "./types";

// Delas av /api/checkout/verify (kortbetalning) och /api/webhooks/stripe
// (fakturabetalning) – körs när en betalning för en publicering är
// bekräftad, oavsett betalsätt.
export async function completePaidOffer(params: {
  companyId: string;
  offerId: string;
  planId: PackageTier;
}) {
  const { companyId, offerId, planId } = params;

  const existingCompany = await getCompanyById(companyId);
  const isFirstPayment = !existingCompany?.paymentConfirmed;

  await updateCompany(companyId, { packageTier: planId, paymentConfirmed: true });

  if (isFirstPayment && existingCompany?.referredByCompanyId) {
    await grantReferralBonus(existingCompany.referredByCompanyId);
  }

  return submitOfferForReview(offerId, companyId);
}
