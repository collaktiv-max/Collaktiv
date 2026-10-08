import { NextResponse } from "next/server";
import { getPublishedOffersForApp } from "@/lib/db";

// Offentlig, oautentiserad datakälla för den framtida reseappen – den
// enda plats den ska behöva fråga för att visa erbjudanden. Returnerar
// bara publicerade (inte pausade/arkiverade/under granskning)
// erbjudanden, och bara de fält en resenär ska se.
//
// OBS: tjänsten/appen är inte lanserad ännu (se APP_LAUNCHED i
// src/lib/config.ts). Erbjudanden samlas här i god tid innan dess,
// precis som avsett – det är själva poängen med den här endpointen.
export async function GET() {
  const offers = await getPublishedOffersForApp();
  return NextResponse.json({ offers });
}
