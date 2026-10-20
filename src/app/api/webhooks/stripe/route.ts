import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createPayment, getCompanyById } from "@/lib/db";
import { completePayment, completePaidOffer } from "@/lib/payment-completion";
import { sendAdminInvoicePaidEmail } from "@/lib/email";
import { getPlan } from "@/lib/pricing";
import type { PackageTier } from "@/lib/types";

// Tar emot Stripe-webhooks. Behövs för fakturabetalningar (till
// skillnad från Checkout bekräftas de inte via en redirect tillbaka
// till sajten – kan ta dagar om företaget betalar via bank). Måste
// skapas i Stripe Dashboard → Developers → Webhooks, peka mot
// https://partner.collaktiv.se/api/webhooks/stripe, lyssna på
// invoice.paid, och "Signing secret" läggs in som STRIPE_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET saknas – kan inte verifiera webhooken.");
    return NextResponse.json({ error: "Webhook ej konfigurerad." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", secret);
  } catch (err) {
    console.error("Ogiltig Stripe-webhook-signatur:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Ogiltig signatur." }, { status: 400 });
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const { companyId, offerId, planId, period, termsVersion, termsAcceptedAt } =
      invoice.metadata ?? {};

    if (companyId && planId && period) {
      // Nyare Stripe-API:er kopplar en betalning till fakturan via ett
      // separat InvoicePayment-objekt istället för invoice.payment_intent
      // direkt – behövs här så admin kan återbetala via stripePaymentIntentId.
      const invoicePayments = await stripe.invoicePayments.list({
        invoice: invoice.id as string,
        limit: 1,
      });
      const paymentIntent = invoicePayments.data[0]?.payment.payment_intent;

      await createPayment({
        companyId,
        offerId,
        stripeSessionId: invoice.id as string,
        stripePaymentIntentId:
          typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id,
        amount: (invoice.amount_paid ?? 0) / 100,
        currency: invoice.currency ?? "sek",
        planId,
        period,
        status: "paid",
        termsVersion,
        // En admin-initierad faktura (se /api/admin/companies/[id]/invoice)
        // har inget termsAcceptedAt i metadata – företaget har aldrig
        // kryssat i en ruta, de godkänner genom att betala. Den här
        // betalningsbekräftelsen ÄR alltså godkännandet.
        termsAcceptedAt: termsAcceptedAt ?? new Date().toISOString(),
      });

      if (offerId) {
        await completePaidOffer({ companyId, offerId, planId: planId as PackageTier });
      } else {
        await completePayment({ companyId, planId: planId as PackageTier });
      }

      // Fakturabetalningar kan ta dagar (t.ex. banköverföring) och
      // syns annars bara om någon råkar kolla admin-panelen – mejla
      // oss så vi märker det direkt.
      const company = await getCompanyById(companyId);
      if (company) {
        await sendAdminInvoicePaidEmail({
          company,
          planName: getPlan(planId as PackageTier).name,
          amount: (invoice.amount_paid ?? 0) / 100,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
