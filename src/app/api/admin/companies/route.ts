import { NextResponse } from "next/server";
import { getCompanies } from "@/lib/db";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const companies = await getCompanies();
  return NextResponse.json({ companies });
}
