import { NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { getCompanyById } from "@/lib/db";

export async function GET() {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ company: null });
  }
  const company = await getCompanyById(companyId);
  return NextResponse.json({ company });
}
