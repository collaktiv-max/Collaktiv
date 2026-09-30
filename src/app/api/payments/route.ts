import { NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { getPaymentsByCompany } from "@/lib/db";

export async function GET() {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }
  const payments = await getPaymentsByCompany(companyId);
  return NextResponse.json({ payments });
}
