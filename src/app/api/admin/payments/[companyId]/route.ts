import { NextResponse } from "next/server";
import { getPaymentsByCompany } from "@/lib/db";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { companyId } = await params;
  const payments = await getPaymentsByCompany(companyId);
  return NextResponse.json({ payments });
}
