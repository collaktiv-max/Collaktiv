import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { createOffer, getCompanyById, getOffersByCompany, updateCompany } from "@/lib/db";
import type { Offer } from "@/lib/types";

export async function GET() {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }
  const offers = await getOffersByCompany(companyId);
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Omit<Offer, "id" | "companyId" | "createdAt" | "stats">;
  const offer = await createOffer({ ...body, companyId });

  const company = await getCompanyById(companyId);
  if (company) {
    await updateCompany(companyId, {
      onboardingChecklist: { ...company.onboardingChecklist, firstOffer: true },
    });
  }

  return NextResponse.json({ offer });
}
