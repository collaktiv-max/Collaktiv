import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { createCampaign, getCampaignsByCompany } from "@/lib/db";

export async function GET() {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }
  const campaigns = await getCampaignsByCompany(companyId);
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as { message?: string };

  const campaign = await createCampaign({
    companyId,
    message: body.message,
  });
  return NextResponse.json({ campaign });
}
