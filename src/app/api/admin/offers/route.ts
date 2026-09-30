import { NextResponse } from "next/server";
import { getOffers } from "@/lib/db";

export async function GET() {
  const offers = await getOffers();
  return NextResponse.json({ offers });
}
