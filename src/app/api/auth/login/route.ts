import { NextRequest, NextResponse } from "next/server";
import { getCompanyByEmailWithPassword } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email) {
    return NextResponse.json({ error: "Ange en e-postadress." }, { status: 400 });
  }

  const company = await getCompanyByEmailWithPassword(email);
  if (!company) {
    return NextResponse.json(
      {
        error:
          "Vi hittar inget konto med den e-postadressen. Registrera ert företag för att komma igång.",
      },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, company.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Fel e-post eller lösenord." }, { status: 401 });
  }

  if (company.applicationStatus === "avvisad") {
    return NextResponse.json(
      { error: "Er ansökan har tyvärr avvisats. Kontakta support för mer info." },
      { status: 403 }
    );
  }

  await createSession(company.id);
  const { passwordHash: _passwordHash, ...safeCompany } = company;
  void _passwordHash;
  return NextResponse.json({ company: safeCompany });
}
