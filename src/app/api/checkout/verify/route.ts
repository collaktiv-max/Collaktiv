import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { createPayment } from "@/lib/db";
import { completePaidOffer } from "@/lib/payment-completion";
import type { PackageTier } from "@/lib/types";
import type { BillingPeriod } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id saknas." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid" || session.metadata?.companyId !== companyId) {
    return NextResponse.json({ paid: false });
  }

  const offerId = session.metadata?.offerId;
  const planId = session.metadata?.planId as PackageTier | undefined;
  const period = session.metadata?.period as BillingPeriod | undefined;
  if (!offerId || !planId || !period) {
    return NextResponse.json({ paid: false });
  }

  // Sparas så admin kan hitta betalningen och en avvisning kan
  // återbetalas automatiskt – se /api/admin/companies/[id].
  await createPayment({
    companyId,
    offerId,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    amount: (session.amount_total ?? 0) / 100,
    currency: session.currency ?? "sek",
    planId,
    period,
  });

  const result = await completePaidOffer({ companyId, offerId, planId });
  if (!result) {
    return NextResponse.json({ paid: false });
  }

  return NextResponse.json({ paid: true, offer: result.offer, company: result.company });
}
