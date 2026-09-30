import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { updateCompanyPassword } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function PATCH(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as { newPassword?: string };
  const newPassword = body.newPassword ?? "";
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Lösenordet måste vara minst 6 tecken." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await updateCompanyPassword(companyId, passwordHash);
  return NextResponse.json({ ok: true });
}
