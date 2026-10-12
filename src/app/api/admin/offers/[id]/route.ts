import { NextRequest, NextResponse } from "next/server";
import { getCompanyById, getOfferById, updateOffer } from "@/lib/db";
import { sendOfferPublishedEmail, sendOfferReturnedEmail } from "@/lib/email";
import type { Offer } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partial = (await req.json()) as Partial<Offer>;

  // Hämtas innan uppdateringen för att veta om det här faktiskt är en
  // ny övergång – annars skulle en upprepad PATCH skicka om mejlet.
  const existing = await getOfferById(id);
  if (!existing) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }

  // Ett erbjudande ska aldrig kunna publiceras innan själva
  // företagsansökan är godkänd, även om erbjudandet redan är inskickat
  // för granskning (de två granskas separat).
  if (partial.status === "publicerad") {
    const owner = await getCompanyById(existing.companyId);
    if (!owner || owner.applicationStatus !== "godkand") {
      return NextResponse.json(
        { error: "Företagets ansökan måste godkännas innan erbjudandet kan publiceras." },
        { status: 400 }
      );
    }
  }

  const isNewPublish = existing.status !== "publicerad" && partial.status === "publicerad";
  const isNewReturn = existing.status === "granskas" && partial.status === "utkast";

  const offer = await updateOffer(id, partial);
  if (!offer) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }

  if (isNewPublish || isNewReturn) {
    const owner = await getCompanyById(offer.companyId);
    if (owner) {
      if (isNewPublish) await sendOfferPublishedEmail(owner, offer);
      if (isNewReturn) await sendOfferReturnedEmail(owner, offer);
    }
  }

  return NextResponse.json({ offer });
}
