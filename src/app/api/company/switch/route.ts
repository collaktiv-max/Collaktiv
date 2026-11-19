import { NextRequest, NextResponse } from "next/server";
import { getCompanyById } from "@/lib/db";
import { createSession, getSessionCompanyId } from "@/lib/session";

// Växlar till ett annat av det inloggade företagets LÄNKADE konton (se
// ownerGroupId i types.ts, länkat av admin via linkCompanies i db.ts) -
// t.ex. en restaurangägare med flera olika ställen, se "Växla företag"
// i PortalShell.tsx. Kräver att båda företagen delar samma
// owner_group_id, annars skulle man kunna växla in sig på ett
// godtyckligt företag bara genom att känna till dess id.
export async function POST(req: NextRequest) {
  const currentId = await getSessionCompanyId();
  if (!currentId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as { targetCompanyId?: string };
  if (!body.targetCompanyId) {
    return NextResponse.json({ error: "targetCompanyId saknas." }, { status: 400 });
  }

  const [current, target] = await Promise.all([
    getCompanyById(currentId),
    getCompanyById(body.targetCompanyId),
  ]);
  if (!current || !target) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }
  if (!current.ownerGroupId || current.ownerGroupId !== target.ownerGroupId) {
    return NextResponse.json({ error: "Kontona är inte länkade." }, { status: 403 });
  }

  await createSession(target.id);
  return NextResponse.json({ company: target });
}
