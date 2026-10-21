import { NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { isAdminSessionValid } from "@/lib/adminAuth";
import { getCompanyById } from "@/lib/db";

export async function GET() {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ company: null, impersonating: false });
  }
  // Admin har en helt egen session-cookie (se adminAuth.ts) – när den
  // finns KVAR samtidigt som en vanlig företagssession betyder det att
  // admin loggat in som företaget via "Logga in som företag" (se
  // /api/admin/companies/[id]/impersonate), snarare än att företaget
  // loggat in själva. Portalen visar då en banderoll om det, se
  // PortalShell.tsx.
  const [company, impersonating] = await Promise.all([
    getCompanyById(companyId),
    isAdminSessionValid(),
  ]);
  return NextResponse.json({ company, impersonating });
}
