import { NextRequest, NextResponse } from "next/server";
import { getCompanyById, getLinkedCompanies, linkCompanies, unlinkCompany } from "@/lib/db";
import { requireAdminSession } from "@/lib/adminAuth";

// Länkar/avlänkar två företag med samma ägare (se ownerGroupId i
// types.ts) - gör att de kan växla mellan varandra i portalen utan att
// dela lösenord eller mejl, se "Växla företag" i PortalShell.tsx.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = (await req.json()) as { targetCompanyId?: string };
  if (!body.targetCompanyId) {
    return NextResponse.json({ error: "targetCompanyId saknas." }, { status: 400 });
  }
  if (body.targetCompanyId === id) {
    return NextResponse.json({ error: "Kan inte länka ett företag till sig självt." }, { status: 400 });
  }

  const target = await getCompanyById(body.targetCompanyId);
  if (!target) {
    return NextResponse.json({ error: "Det andra företaget hittades inte." }, { status: 404 });
  }

  await linkCompanies(id, body.targetCompanyId);
  const linked = await getLinkedCompanies(id);
  return NextResponse.json({ linked });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await unlinkCompany(id);
  return NextResponse.json({ ok: true });
}
