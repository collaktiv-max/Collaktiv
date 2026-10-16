import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { deleteLocation, getLocationById, updateLocation } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getLocationById(id);
  if (!existing || existing.companyId !== companyId) {
    return NextResponse.json({ error: "Butiken hittades inte." }, { status: 404 });
  }

  const body = (await req.json()) as { name?: string; address?: string };
  if (body.address !== undefined && !body.address.trim()) {
    return NextResponse.json({ error: "Adress krävs." }, { status: 400 });
  }

  // Bara skriva med nycklar som faktiskt skickades med – annars skulle
  // t.ex. en namnändring (utan address i body) nolla ut adressen, som
  // är NOT NULL i databasen.
  const partial: { name?: string; address?: string } = {};
  if (body.name !== undefined) partial.name = body.name;
  if (body.address !== undefined) partial.address = body.address.trim();

  const location = await updateLocation(id, partial);
  return NextResponse.json({ location });
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
  const existing = await getLocationById(id);
  if (!existing || existing.companyId !== companyId) {
    return NextResponse.json({ error: "Butiken hittades inte." }, { status: 404 });
  }

  await deleteLocation(id);
  return NextResponse.json({ ok: true });
}
