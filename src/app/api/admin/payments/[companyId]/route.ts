import { NextResponse } from "next/server";
import { getPaymentsByCompany } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const payments = await getPaymentsByCompany(companyId);
  return NextResponse.json({ payments });
}
