import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { getOfferById, submitOfferForReview } from "@/lib/db";

export async function POST(
  _req: NextRequest,
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

  const result = await submitOfferForReview(id, companyId);
  if (!result) {
    return NextResponse.json({ error: "Kunde inte skicka in erbjudandet." }, { status: 500 });
  }
  return NextResponse.json(result);
}
