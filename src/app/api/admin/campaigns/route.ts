import { NextResponse } from "next/server";
import { getCampaigns } from "@/lib/db";

export async function GET() {
  const campaigns = await getCampaigns();
  return NextResponse.json({ campaigns });
}
