import { NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { isAdminSessionValid } from "@/lib/adminAuth";
import { getCompanyById, getLinkedCompanies } from "@/lib/db";

export async function GET() {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ company: null, impersonating: false, linkedCompanies: [] });
  }
  // Admin har en helt egen session-cookie (se adminAuth.ts) – när den
  // finns KVAR samtidigt som en vanlig företagssession betyder det att
  // admin loggat in som företaget via "Logga in som företag" (se
  // /api/admin/companies/[id]/impersonate), snarare än att företaget
  // loggat in själva. Portalen visar då en banderoll om det, se
  // PortalShell.tsx.
  // linkedCompanies kommer från owner_group_id (satt av admin, se
  // linkCompanies i db.ts) och driver "Växla företag" i PortalShell.tsx.
  const [company, impersonating, linkedCompanies] = await Promise.all([
    getCompanyById(companyId),
    isAdminSessionValid(),
    getLinkedCompanies(companyId),
  ]);
  return NextResponse.json({ company, impersonating, linkedCompanies });
}
