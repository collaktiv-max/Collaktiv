import { NextRequest, NextResponse } from "next/server";
import { updateCompany } from "@/lib/db";
import type { CompanyProfile } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partial = (await req.json()) as Partial<CompanyProfile>;

  const company = await updateCompany(id, partial);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }
  return NextResponse.json({ company });
}
