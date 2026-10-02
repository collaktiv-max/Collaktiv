import { NextRequest, NextResponse } from "next/server";
import { createCompany, getCompanyById } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import type { Category } from "@/lib/types";

interface RegisterBody {
  name: string;
  logoDataUrl?: string;
  website?: string;
  description?: string;
  category?: Category;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  password: string;
  referredByCompanyId?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<RegisterBody>;
  const { name, contactEmail, password } = body;

  if (!name?.trim() || !contactEmail?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Fyll i företagsnamn, e-post och ett lösenord på minst 6 tecken." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  // Länken till /registrera?ref=<id> kan manipuleras fritt av vem som
  // helst, så vi kontrollerar att det faktiskt är ett riktigt företag
  // innan vi kopplar ihop dem – annars ignoreras den bara tyst.
  let referredByCompanyId: string | undefined;
  if (body.referredByCompanyId && UUID_RE.test(body.referredByCompanyId)) {
    const referrer = await getCompanyById(body.referredByCompanyId);
    if (referrer) referredByCompanyId = referrer.id;
  }

  try {
    const company = await createCompany({
      name: name.trim(),
      logoDataUrl: body.logoDataUrl,
      website: body.website,
      description: body.description,
      category: body.category,
      contactName: body.contactName,
      contactEmail: contactEmail.trim(),
      contactPhone: body.contactPhone,
      address: body.address,
      referredByCompanyId,
      passwordHash,
    });
    await createSession(company.id);
    return NextResponse.json({ company });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("duplicate key") || message.includes("companies_contact_email_key")) {
      return NextResponse.json(
        { error: "Det finns redan ett konto med den e-postadressen." },
        { status: 409 }
      );
    }
    throw err;
  }
}
