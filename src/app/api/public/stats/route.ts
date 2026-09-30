import { NextResponse } from "next/server";
import { getCompaniesCount } from "@/lib/db";

// Offentligt, oautentiserat – returnerar bara ett antal, aldrig
// företagsdata, så den kan anropas fritt från landningssidan.
export async function GET() {
  const companyCount = await getCompaniesCount();
  return NextResponse.json({ companyCount });
}
