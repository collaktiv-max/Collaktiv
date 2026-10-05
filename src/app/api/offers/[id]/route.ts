import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { deleteOffer, getOfferById, updateOffer } from "@/lib/db";
import type { Offer } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOfferById(id);
  if (!existing || existing.companyId !== companyId) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }

  const partial = (await req.json()) as Partial<Offer>;

  // Statusflödet (utkast → granskas → publicerad) styrs annars av
  // betalning/admin-godkännande – ett företag får bara själva växla
  // mellan publicerad och pausad, aldrig hoppa förbi betalning/granskning.
  if (partial.status !== undefined) {
    const allowedTransition =
      (existing.status === "publicerad" && partial.status === "pausad") ||
      (existing.status === "pausad" && partial.status === "publicerad");
    if (!allowedTransition) {
      return NextResponse.json(
        { error: "Den statusändringen kan inte göras härifrån." },
        { status: 400 }
      );
    }
  }

  const offer = await updateOffer(id, partial);
  return NextResponse.json({ offer });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOfferById(id);
  if (!existing || existing.companyId !== companyId) {
    return NextResponse.json({ error: "Erbjudandet hittades inte." }, { status: 404 });
  }

  await deleteOffer(id);
  return NextResponse.json({ ok: true });
}
