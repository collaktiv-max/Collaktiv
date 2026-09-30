import { NextRequest, NextResponse } from "next/server";
import { getUnrefundedPaymentsByCompany, markPaymentRefunded, updateCompany } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type { CompanyProfile } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partial = (await req.json()) as Partial<CompanyProfile>;

  let refundedAmount = 0;
  const refundErrors: string[] = [];

  // En avvisad ansökan innebär att företaget inte får något för en
  // eventuell betalning – återbetala automatiskt via Stripe innan
  // avvisningen sparas, så företaget aldrig blir stående betalt utan
  // att ha blivit godkänt.
  if (partial.applicationStatus === "avvisad") {
    const payments = await getUnrefundedPaymentsByCompany(id);
    for (const payment of payments) {
      try {
        if (payment.stripePaymentIntentId) {
          await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
        }
        await markPaymentRefunded(payment.id);
        refundedAmount += payment.amount;
      } catch (err) {
        refundErrors.push(
          `Kunde inte återbetala ${payment.amount} kr (${payment.stripeSessionId}): ${
            err instanceof Error ? err.message : "okänt fel"
          }`
        );
      }
    }
    if (refundedAmount > 0) {
      partial.paymentConfirmed = false;
    }
  }

  const company = await updateCompany(id, partial);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }
  return NextResponse.json({ company, refundedAmount, refundErrors });
}
