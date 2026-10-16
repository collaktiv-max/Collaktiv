import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { createLocation, getLocationsByCompany } from "@/lib/db";

export async function GET() {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }
  const locations = await getLocationsByCompany(companyId);
  return NextResponse.json({ locations });
}

export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as { name?: string; address?: string };
  if (!body.address?.trim()) {
    return NextResponse.json({ error: "Adress krävs." }, { status: 400 });
  }

  const location = await createLocation({
    companyId,
    name: body.name,
    address: body.address.trim(),
  });
  return NextResponse.json({ location });
}
