import { NextResponse } from "next/server";
import { getCampaigns } from "@/lib/db";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const campaigns = await getCampaigns();
  return NextResponse.json({ campaigns });
}
