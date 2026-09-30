import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { submitOfferForReview, updateCompany } from "@/lib/db";
import type { PackageTier } from "@/lib/types";

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
  if (!offerId || !planId) {
    return NextResponse.json({ paid: false });
  }

  await updateCompany(companyId, { packageTier: planId, paymentConfirmed: true });
  const result = await submitOfferForReview(offerId, companyId);
  if (!result) {
    return NextResponse.json({ paid: false });
  }

  return NextResponse.json({ paid: true, offer: result.offer, company: result.company });
}
