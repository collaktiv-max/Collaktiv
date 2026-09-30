import { NextRequest, NextResponse } from "next/server";
import { updateOffer } from "@/lib/db";
import type { Offer } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partial = (await req.json()) as Partial<Offer>;

  const offer = await updateOffer(id, partial);
  if (!offer) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }
  return NextResponse.json({ offer });
}
