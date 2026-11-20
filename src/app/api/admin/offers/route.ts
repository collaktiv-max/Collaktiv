import { NextResponse } from "next/server";
import { getOffers } from "@/lib/db";
import { requireAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const offers = await getOffers();
  return NextResponse.json({ offers });
}
