import { NextRequest, NextResponse } from "next/server";
import { createAndSendInvoice, type InvoiceBillingOverride } from "@/lib/invoice";
import { sendAdminInvoiceEmail } from "@/lib/email";
import { getCompanyById } from "@/lib/db";
import type { PlanId, BillingPeriod } from "@/lib/pricing";

interface AdminInvoiceBody {
  planId: PlanId;
  period: BillingPeriod;
  billingOverride?: InvoiceBillingOverride;
}

// Admin skickar en faktura direkt till företagets kontaktmejl, utan
// att de behöver logga in i portalen – se "Skicka faktura" i
// Ansökningar/Alla företag. Till skillnad från /api/invoice (som
// företaget själva anropar efter att ha kryssat i villkoren) finns
// ingen föregående bekräftelse här; godkännandet sker istället genom
// att betala (se footer-texten i src/lib/invoice.ts och webhooken).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: companyId } = await params;
  const body = (await req.json()) as Partial<AdminInvoiceBody>;
  const { planId, period, billingOverride } = body;
  if (!planId || !period) {
    return NextResponse.json({ error: "Ofullständig förfrågan." }, { status: 400 });
  }

  const company = await getCompanyById(companyId);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }

  try {
    const {
      invoiceUrl,
      invoicePdfUrl,
      dueInDays,
      dueDate,
      amount,
      planName,
      recipientEmail,
      recipientName,
    } = await createAndSendInvoice({
      companyId,
      planId,
      period,
      billingOverride,
    });
    let pdfAttached = false;
    if (invoiceUrl) {
      const result = await sendAdminInvoiceEmail({
        recipientEmail,
        recipientName,
        planName,
        period,
        amount,
        invoiceUrl,
        invoicePdfUrl,
        dueDate,
      });
      pdfAttached = result.pdfAttached;
    }
    return NextResponse.json({ sent: true, invoiceUrl, dueInDays, pdfAttached });
  } catch (err) {
    console.error("[admin/invoice] Kunde inte skapa/skicka fakturan:", err);
    return NextResponse.json(
      { error: "Kunde inte skicka fakturan. Försök igen om en stund." },
      { status: 500 }
    );
  }
}
