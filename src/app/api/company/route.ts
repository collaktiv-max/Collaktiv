import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { updateCompany } from "@/lib/db";
import type { CompanyProfile } from "@/lib/types";

// Fält företaget själv får ändra. applicationStatus och paymentConfirmed
// styrs bara av admin (efter granskning) respektive av en verifierad
// Stripe-betalning – aldrig direkt av klienten.
const ALLOWED_FIELDS = [
  "name",
  "logoDataUrl",
  "website",
  "description",
  "category",
  "contactName",
  "contactEmail",
  "contactPhone",
  "region",
  "packageTier",
  "onboardingChecklist",
] as const satisfies readonly (keyof CompanyProfile)[];

export async function PATCH(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Partial<CompanyProfile>;
  const partial: Partial<CompanyProfile> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      // @ts-expect-error – vi kopierar bara tillåtna nycklar en och en
      partial[key] = body[key];
    }
  }

  const company = await updateCompany(companyId, partial);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }
  return NextResponse.json({ company });
}
