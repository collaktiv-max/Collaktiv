import { NextRequest, NextResponse } from "next/server";
import { getCompanyById } from "@/lib/db";
import { createSession } from "@/lib/session";

// Admin loggar in SOM företaget – sätter samma session-cookie som en
// vanlig företagsinloggning (se src/lib/session.ts), utan att röra
// admin-sessionen. Används för att skapa/publicera erbjudanden m.m. åt
// företag som inte vill/hinner använda portalen själva (se
// "Logga in som företag" i AdminSections.tsx). Portalen känner igen
// läget genom att BÅDA session-cookies finns samtidigt och visar en
// banderoll, se /api/auth/me och PortalShell.tsx.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }

  await createSession(id);
  return NextResponse.json({ ok: true });
}
