import { NextRequest, NextResponse } from "next/server";
import { updateCampaignStatus } from "@/lib/db";
import type { CampaignStatus } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as { status?: CampaignStatus };
  if (!body.status) {
    return NextResponse.json({ error: "status saknas." }, { status: 400 });
  }

  const campaign = await updateCampaignStatus(id, body.status);
  if (!campaign) {
    return NextResponse.json({ error: "Kampanjen hittades inte." }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}
