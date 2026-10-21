import "server-only";
import type Stripe from "stripe";
import { getCompanyById, getOfferById, createPayment } from "./db";
import { stripe } from "./stripe";
import {
  getPlan,
  getDiscountedTotal,
  BILLING_LABELS,
  type BillingPeriod,
  type PlanId,
} from "./pricing";
import { TERMS_VERSION } from "./legal";
import { getSwedishMomsTaxRateId } from "./tax";

const DAYS_UNTIL_DUE = 30;

// Vissa stora företag vill inte ha fakturan till den vanliga
// kontaktadressen utan till en egen fakturaavdelning, med sin egna
// juridiska namn/adress/org.nr på fakturan – se "Annan
// faktureringsadress" i InvoiceModal (AdminSections.tsx). Allt är
// valfritt; det som inte anges faller tillbaka på företagets egna
// uppgifter.
export interface InvoiceBillingOverride {
  email?: string;
  name?: string;
  orgNumber?: string;
  addressLine1?: string;
  postalCode?: string;
  city?: string;
  /** Fri text – t.ex. butiksnummer eller en överenskommelse med en
   * kontaktperson – visas som ett eget fält på fakturan. */
  reference?: string;
}

// Samma SITE_URL-reservlösning som i email.ts – appen är deployad på
// partner.collaktiv.se, inte collaktiv.se.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://partner.collaktiv.se";

// Delad av både /api/invoice (företaget skickar fakturan till sig
// själv, efter att ha kryssat i villkorsrutan) och
// /api/admin/companies/[id]/invoice (admin skickar fakturan direkt
// till företagets mejl, utan att de behöver logga in). Stripe skickar
// själva fakturamejlet (med betalningslänk och PDF) direkt till
// kontaktmejlet – vi markerar bara betalningen som "pending" här. Den
// blir "paid" och ett ev. erbjudande skickas in för granskning i
// /api/webhooks/stripe när Stripe bekräftar att fakturan är betald.
export async function createAndSendInvoice(params: {
  companyId: string;
  offerId?: string;
  planId: PlanId;
  period: BillingPeriod;
  /** Sätts bara när företaget redan uttryckligen kryssat i
   * villkorsrutan själva (självbetjäningsflödet). En admin-initierad
   * faktura har ingen föregående bekräftelse – webhooken sätter då
   * godkännandet först när fakturan faktiskt betalas (betalning =
   * godkännande), se /api/webhooks/stripe. */
  termsAcceptedAt?: string;
  billingOverride?: InvoiceBillingOverride;
}): Promise<{
  invoiceUrl: string | null;
  invoicePdfUrl: string | null;
  dueInDays: number;
  amount: number;
  planName: string;
  recipientEmail: string;
  recipientName: string;
}> {
  const { companyId, offerId, planId, period, termsAcceptedAt, billingOverride } = params;

  const [company, offer] = await Promise.all([
    getCompanyById(companyId),
    offerId ? getOfferById(offerId) : Promise.resolve(null),
  ]);
  if (!company) {
    throw new Error("Företaget hittades inte.");
  }
  if (offerId && (!offer || offer.companyId !== companyId)) {
    throw new Error("Erbjudandet hittades inte.");
  }

  const plan = getPlan(planId);
  const amount = getDiscountedTotal(plan, period);

  // En "annan faktureringsadress" (se InvoiceBillingOverride) är en
  // egen mottagare, inte en uppdatering av företagets egen kontakt i
  // vårt system – kopplas bara till Stripe-kunden/fakturan.
  const recipientEmail = billingOverride?.email || company.contactEmail;
  const recipientName = billingOverride?.name || company.name;
  const address: Stripe.AddressParam | undefined =
    billingOverride?.addressLine1 || billingOverride?.postalCode || billingOverride?.city
      ? {
          line1: billingOverride?.addressLine1,
          postal_code: billingOverride?.postalCode,
          city: billingOverride?.city,
          country: "SE",
        }
      : undefined;

  const existingCustomers = await stripe.customers.list({
    email: recipientEmail,
    limit: 1,
  });
  const customer = existingCustomers.data[0]
    ? await stripe.customers.update(existingCustomers.data[0].id, { name: recipientName, address })
    : await stripe.customers.create({
        email: recipientEmail,
        name: recipientName,
        address,
        metadata: { companyId },
      });

  const customFields: Stripe.InvoiceCreateParams.CustomField[] = [];
  if (billingOverride?.orgNumber) {
    customFields.push({ name: "Org.nr", value: billingOverride.orgNumber });
  }
  if (billingOverride?.reference) {
    customFields.push({ name: "Referens", value: billingOverride.reference });
  }

  const momsTaxRateId = await getSwedishMomsTaxRateId();

  // Skapas i draft-läge FÖRST, och fakturaraden läggs sedan på med ett
  // uttryckligt invoice-id – att skapa fakturaraden innan fakturan och
  // lita på att Stripe plockar upp den automatiskt visade sig
  // opålitligt, se git-historiken för /api/invoice.
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: DAYS_UNTIL_DUE,
    // Visas längst ner på den hostade fakturasidan och i PDF:en – den
    // enda garanterade platsen att få med villkorsgodkännandet på en
    // admin-initierad faktura, där företaget aldrig sett en kryssruta.
    footer: `Genom att betala denna faktura godkänner ni Collaktivs villkor (${SITE_URL}/villkor), inklusive betalningsvillkoren.`,
    custom_fields: customFields.length ? customFields : undefined,
    metadata: {
      companyId,
      ...(offerId ? { offerId } : {}),
      planId,
      period,
      termsVersion: TERMS_VERSION,
      ...(termsAcceptedAt ? { termsAcceptedAt } : {}),
    },
  });

  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: amount * 100,
    currency: "sek",
    tax_rates: [momsTaxRateId],
    description: `Collaktiv ${plan.name} – ${BILLING_LABELS[period]} · ${company.name} · early bird-rabatt 20% inräknad, 25% moms inkluderad`,
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id as string);
  if (finalized.amount_due !== amount * 100) {
    // Säkerhetsspärr: om fakturaraden av någon anledning ändå inte
    // hamnade på fakturan ska vi hellre krascha synligt än skicka ut
    // en 0-kronorsfaktura som Stripe markerar betald utan att någon
    // betalat något.
    await stripe.invoices.voidInvoice(finalized.id as string);
    throw new Error(
      `Fakturabeloppet stämmer inte (förväntade ${amount * 100}, fick ${finalized.amount_due}) – fakturan makulerad.`
    );
  }
  // En faktura som redan är fullt betald vid finalisering (t.ex. via
  // ett tillgodohavande hos kunden) kan inte skickas – Stripe avvisar
  // det.
  if (finalized.status === "open") {
    await stripe.invoices.sendInvoice(finalized.id as string);
  }

  // Sparas ALLTID som "pending" här, oavsett vad det synkrona svaret
  // från Stripe säger – enda källan som får markera en faktura som
  // faktiskt betald är webhooken (invoice.paid).
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

  return {
    invoiceUrl: finalized.hosted_invoice_url ?? null,
    invoicePdfUrl: finalized.invoice_pdf ?? null,
    dueInDays: DAYS_UNTIL_DUE,
    amount,
    planName: plan.name,
    recipientEmail,
    recipientName,
  };
}
