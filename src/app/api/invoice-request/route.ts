import { NextRequest, NextResponse } from "next/server";
import { verifyInvoiceRequestToken } from "@/lib/invoiceRequestToken";
import { getCompanyById } from "@/lib/db";
import { createAndSendInvoice, type InvoiceBillingOverride } from "@/lib/invoice";
import type { PlanId, BillingPeriod } from "@/lib/pricing";

// Stöd för /begar-faktura – ett företag kan begära en faktura via
// länken i påminnelsemejlet (sendPaymentReminderEmail) UTAN att logga
// in. Autentiseringen är tokenen själv (se invoiceRequestToken.ts),
// inte en session-cookie, så den här routen är medvetet oskyddad av
// proxy.ts.
export async function GET(req: NextRequest) {
  const companyId = verifyInvoiceRequestToken(req.nextUrl.searchParams.get("token"));
  if (!companyId) {
    return NextResponse.json({ error: "Länken är ogiltig eller har gått ut." }, { status: 401 });
  }
  const company = await getCompanyById(companyId);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }
  return NextResponse.json({
    company: { name: company.name, contactEmail: company.contactEmail },
  });
}

interface InvoiceRequestBody {
  token: string;
  planId: PlanId;
  period: BillingPeriod;
  termsAccepted: boolean;
  billingOverride?: InvoiceBillingOverride;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<InvoiceRequestBody>;
  const companyId = verifyInvoiceRequestToken(body.token);
  if (!companyId) {
    return NextResponse.json({ error: "Länken är ogiltig eller har gått ut." }, { status: 401 });
  }

  const { planId, period, termsAccepted, billingOverride } = body;
  if (!planId || !period) {
    return NextResponse.json({ error: "Ofullständig förfrågan." }, { status: 400 });
  }
  if (!termsAccepted) {
    return NextResponse.json({ error: "Ni måste godkänna villkoren för att betala." }, { status: 400 });
  }
  // Samma krav som /api/invoice – kontrolleras här också, inte bara i
  // formuläret, så ingen faktura går ut utan rätt mottagaruppgifter.
  if (
    !billingOverride?.name?.trim() ||
    !billingOverride?.orgNumber?.trim() ||
    !billingOverride?.addressLine1?.trim() ||
    !billingOverride?.postalCode?.trim() ||
    !billingOverride?.city?.trim()
  ) {
    return NextResponse.json(
      { error: "Fyll i företagsnamn, organisationsnummer och fakturaadress." },
      { status: 400 }
    );
  }
  const termsAcceptedAt = new Date().toISOString();

  try {
    const { invoiceUrl, dueInDays, recipientEmail } = await createAndSendInvoice({
      companyId,
      planId,
      period,
      termsAcceptedAt,
      billingOverride,
    });
    return NextResponse.json({ sent: true, invoiceUrl, dueInDays, recipientEmail });
  } catch (err) {
    console.error("[invoice-request] Kunde inte skapa/skicka fakturan:", err);
    const message = err instanceof Error ? err.message : "";
    const notFound = message.includes("hittades inte");
    return NextResponse.json(
      { error: notFound ? message : "Kunde inte skicka fakturan. Försök igen om en stund." },
      { status: notFound ? 404 : 500 }
    );
  }
}
