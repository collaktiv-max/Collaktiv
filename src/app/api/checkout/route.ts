import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlan, getDiscountedTotal, BILLING_LABELS, type BillingPeriod } from "@/lib/pricing";
import type { PlanId } from "@/lib/pricing";

interface CheckoutBody {
  companyId: string;
  offerId: string;
  planId: PlanId;
  period: BillingPeriod;
  companyName: string;
  companyEmail: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<CheckoutBody>;
  const { companyId, offerId, planId, period, companyName, companyEmail } = body;

  if (!companyId || !offerId || !planId || !period || !companyEmail) {
    return NextResponse.json({ error: "Ofullständig förfrågan." }, { status: 400 });
  }

  const plan = getPlan(planId);
  const amount = getDiscountedTotal(plan, period);
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: companyEmail,
    automatic_tax: { enabled: true },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "sek",
          unit_amount: amount * 100,
          product_data: {
            name: `Collaktiv ${plan.name} – ${BILLING_LABELS[period]}`,
            description: `${companyName} · early bird-rabatt 20% inräknad`,
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
