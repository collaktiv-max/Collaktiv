import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { getCompanyById, getOfferById } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getPlan, getDiscountedTotal, BILLING_LABELS, type BillingPeriod } from "@/lib/pricing";
import type { PlanId } from "@/lib/pricing";

interface CheckoutBody {
  offerId: string;
  planId: PlanId;
  period: BillingPeriod;
}

export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Partial<CheckoutBody>;
  const { offerId, planId, period } = body;
  if (!offerId || !planId || !period) {
    return NextResponse.json({ error: "Ofullständig förfrågan." }, { status: 400 });
  }

  const [company, offer] = await Promise.all([getCompanyById(companyId), getOfferById(offerId)]);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }
  if (!offer || offer.companyId !== companyId) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }

  const plan = getPlan(planId);
  const amount = getDiscountedTotal(plan, period);
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: company.contactEmail,
    automatic_tax: { enabled: true },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "sek",
          unit_amount: amount * 100,
          product_data: {
            name: `Collaktiv ${plan.name} – ${BILLING_LABELS[period]}`,
            description: `${company.name} · early bird-rabatt 20% inräknad`,
          },
        },
      },
    ],
    metadata: { companyId, offerId, planId, period },
    success_url: `${origin}/portal/erbjudanden/${offerId}/publicera?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/portal/erbjudanden/${offerId}/publicera?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
