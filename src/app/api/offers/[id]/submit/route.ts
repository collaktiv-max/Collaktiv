import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { getCompanyById, getOfferById, submitOfferForReview } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOfferById(id);
  if (!existing || existing.companyId !== companyId) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { termsAccepted?: boolean };

  // Kostnadsfria partners godkänner villkoren här (se submitOfferForReview)
  // eftersom de aldrig ser betalflödets egen kryssruta – kontrolleras
  // även server-side så det inte går att kringgå den avstängda knappen
  // i klienten.
  const company = await getCompanyById(companyId);
  if (company?.complimentary && !company.termsAcceptedAt && !body.termsAccepted) {
    return NextResponse.json(
      { error: "Ni måste godkänna villkoren innan ni kan publicera." },
      { status: 400 }
    );
  }

  const result = await submitOfferForReview(id, companyId, body.termsAccepted);
  if (!result) {
    return NextResponse.json({ error: "Kunde inte skicka in erbjudandet." }, { status: 500 });
  }
  return NextResponse.json(result);
}
