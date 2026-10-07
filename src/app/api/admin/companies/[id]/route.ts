import { NextRequest, NextResponse } from "next/server";
import {
  getCompanyById,
  getPendingPaymentsByCompany,
  getUnrefundedPaymentsByCompany,
  markPaymentRefunded,
  updateCompany,
} from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendApprovalEmail } from "@/lib/email";
import type { CompanyProfile } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partial = (await req.json()) as Partial<CompanyProfile>;

  // Hämtas innan uppdateringen för att veta om det här faktiskt är en
  // ny godkännande-övergång – annars skulle varje efterföljande PATCH
  // (t.ex. byte av paket) trigga om godkännandemejlet.
  const existing = await getCompanyById(id);
  const isNewApproval =
    partial.applicationStatus === "godkand" && existing?.applicationStatus !== "godkand";

  let refundedAmount = 0;
  let manualRefundAmount = 0;
  const refundErrors: string[] = [];
  const manualRefundNotes: string[] = [];

  // En avvisad ansökan innebär att företaget inte får något för en
  // eventuell betalning – återbetala automatiskt via Stripe innan
  // avvisningen sparas, så företaget aldrig blir stående betalt utan
  // att ha blivit godkänt.
  if (partial.applicationStatus === "avvisad") {
    const payments = await getUnrefundedPaymentsByCompany(id);
    for (const payment of payments) {
      try {
        if (payment.stripePaymentIntentId) {
          // Betalat med kort, eller en faktura betald direkt hos
          // Stripe – ett riktigt kort-/betalningsobjekt finns att
          // återbetala via Stripe API.
          await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
          await markPaymentRefunded(payment.id);
          refundedAmount += payment.amount;
        } else {
          // Fakturan betalades "utanför Stripe" (t.ex. banköverföring
          // – det vanliga sättet att betala en skickad faktura i
          // Sverige). Stripe har då aldrig haft pengarna och kan inte
          // återbetala dem automatiskt – det måste göras manuellt.
          // Markeras INTE som "refunded" här för att inte ge sken av
          // att det redan är klart.
          manualRefundAmount += payment.amount;
          manualRefundNotes.push(
            `${payment.amount} kr (faktura ${payment.stripeSessionId}) betalades via banköverföring, inte kort – måste återbetalas manuellt, Stripe kan inte göra det automatiskt.`
          );
        }
      } catch (err) {
        refundErrors.push(
          `Kunde inte återbetala ${payment.amount} kr (${payment.stripeSessionId}): ${
            err instanceof Error ? err.message : "okänt fel"
          }`
        );
      }
    }
    if (refundedAmount > 0 || manualRefundAmount > 0) {
      partial.paymentConfirmed = false;
    }

    // Obetalda, skickade fakturor ska aldrig kunna betalas för en
    // nekad ansökan – makulera dem hos Stripe. Inga pengar har flutit
    // här, så det räknas inte som en återbetalning.
    const pendingInvoices = await getPendingPaymentsByCompany(id);
    for (const payment of pendingInvoices) {
      try {
        await stripe.invoices.voidInvoice(payment.stripeSessionId);
      } catch (err) {
        refundErrors.push(
          `Kunde inte makulera fakturan ${payment.stripeSessionId}: ${
            err instanceof Error ? err.message : "okänt fel"
          }`
        );
      }
    }
  }

  const company = await updateCompany(id, partial);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }

  if (isNewApproval) {
    await sendApprovalEmail(company);
  }

  return NextResponse.json({
    company,
    refundedAmount,
    refundErrors,
    manualRefundAmount,
    manualRefundNotes,
  });
}
