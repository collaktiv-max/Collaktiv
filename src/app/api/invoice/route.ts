import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { getCompanyById, getOfferById, createPayment } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getPlan, getDiscountedTotal, BILLING_LABELS, type BillingPeriod } from "@/lib/pricing";
import type { PlanId } from "@/lib/pricing";
import { TERMS_VERSION } from "@/lib/legal";

interface InvoiceBody {
  offerId: string;
  planId: PlanId;
  period: BillingPeriod;
  termsAccepted: boolean;
}

const DAYS_UNTIL_DUE = 30;

// Till skillnad från Checkout (där Stripe Tax kan räkna ut momsen live
// utifrån adressen kunden fyller i under betalningen) kräver en
// skickad faktura momsen förinställd, eftersom vi inte har företagets
// fullständiga adress sparad. Återanvänder en svensk 25%-momssats om
// en redan finns i Stripe-kontot, annars skapas den första gången.
async function getSwedishMomsTaxRateId(): Promise<string> {
  const existing = await stripe.taxRates.list({ active: true, limit: 100 });
  const found = existing.data.find(
    (r) => r.country === "SE" && r.percentage === 25 && r.inclusive
  );
  if (found) return found.id;

  const created = await stripe.taxRates.create({
    display_name: "Moms",
    percentage: 25,
    inclusive: true,
    country: "SE",
    description: "Svensk moms 25%",
  });
  return created.id;
}

// Alternativ till /api/checkout för företag som vill betala mot faktura
// istället för kort. Stripe skickar fakturan (med betalningslänk och
// PDF) direkt till kontaktmejlet – vi markerar bara betalningen som
// "pending" här. Den blir "paid" och erbjudandet skickas in för
// granskning i /api/webhooks/stripe när Stripe bekräftar att fakturan
// är betald (kan ta dagar om företaget betalar via bank).
export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Partial<InvoiceBody>;
  const { offerId, planId, period, termsAccepted } = body;
  if (!offerId || !planId || !period) {
    return NextResponse.json({ error: "Ofullständig förfrågan." }, { status: 400 });
  }
  if (!termsAccepted) {
    return NextResponse.json({ error: "Ni måste godkänna villkoren för att publicera." }, { status: 400 });
  }
  const termsAcceptedAt = new Date().toISOString();

  const [company, offer] = await Promise.all([getCompanyById(companyId), getOfferById(offerId)]);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }
  if (!offer || offer.companyId !== companyId) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }

  const plan = getPlan(planId);
  const amount = getDiscountedTotal(plan, period);

  const existingCustomers = await stripe.customers.list({
    email: company.contactEmail,
    limit: 1,
  });
  const customer =
    existingCustomers.data[0] ??
    (await stripe.customers.create({
      email: company.contactEmail,
      name: company.name,
      metadata: { companyId },
    }));

  const momsTaxRateId = await getSwedishMomsTaxRateId();

  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: amount * 100,
    currency: "sek",
    tax_rates: [momsTaxRateId],
    description: `Collaktiv ${plan.name} – ${BILLING_LABELS[period]} · ${company.name} · early bird-rabatt 20% inräknad, 25% moms inkluderad`,
  });

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: DAYS_UNTIL_DUE,
    metadata: { companyId, offerId, planId, period, termsVersion: TERMS_VERSION, termsAcceptedAt },
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id as string);
  // En faktura som redan är fullt betald vid finalisering (t.ex. via
  // ett tillgodohavande hos kunden) kan inte skickas – Stripe avvisar
  // det.
  if (finalized.status === "open") {
    await stripe.invoices.sendInvoice(finalized.id as string);
  }

  // Sparas ALLTID som "pending" här, oavsett vad det synkrona svaret
  // från Stripe säger – det visade sig opålitligt (en nyskapad faktura
  // kunde komma tillbaka som "paid" direkt, utan att företaget gjort
  // något). Enda källan som får markera en faktura som faktiskt betald
  // är webhooken (invoice.paid), som bara triggas av en riktig
  // betalningshändelse hos Stripe. Annars riskerar vi att visa en
  // obetald faktura som "betald och återbetalad" om ansökan nekas.
  await createPayment({
    companyId,
    offerId,
    stripeSessionId: finalized.id as string,
    amount,
    currency: "sek",
    planId,
    period,
    status: "pending",
    termsVersion: TERMS_VERSION,
    termsAcceptedAt,
  });

  return NextResponse.json({
    sent: true,
    invoiceUrl: finalized.hosted_invoice_url,
    dueInDays: DAYS_UNTIL_DUE,
  });
}
