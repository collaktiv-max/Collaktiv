import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { createAndSendInvoice } from "@/lib/invoice";
import type { PlanId, BillingPeriod } from "@/lib/pricing";

interface InvoiceBody {
  offerId?: string;
  planId: PlanId;
  period: BillingPeriod;
  termsAccepted: boolean;
}

// Alternativ till /api/checkout för företag som vill betala mot faktura
// istället för kort, initierat av företaget självt (för en admin-
// initierad faktura, se /api/admin/companies/[id]/invoice). Den
// faktiska faktura-/Stripe-logiken ligger i src/lib/invoice.ts.
export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Partial<InvoiceBody>;
  const { offerId, planId, period, termsAccepted } = body;
  if (!planId || !period) {
    return NextResponse.json({ error: "Ofullständig förfrågan." }, { status: 400 });
  }
  if (!termsAccepted) {
    return NextResponse.json({ error: "Ni måste godkänna villkoren för att betala." }, { status: 400 });
  }
  const termsAcceptedAt = new Date().toISOString();

  try {
    const { invoiceUrl, dueInDays } = await createAndSendInvoice({
      companyId,
      offerId,
      planId,
      period,
      termsAcceptedAt,
    });
    return NextResponse.json({ sent: true, invoiceUrl, dueInDays });
  } catch (err) {
    console.error("[invoice] Kunde inte skapa/skicka fakturan:", err);
    const message = err instanceof Error ? err.message : "";
    const notFound = message.includes("hittades inte");
    return NextResponse.json(
      { error: notFound ? message : "Kunde inte skicka fakturan. Försök igen om en stund." },
      { status: notFound ? 404 : 500 }
    );
  }
}
