import { NextRequest, NextResponse } from "next/server";
import { createCompany, getCompanyById } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { sendAdminNewCompanyEmail } from "@/lib/email";
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
  fullServiceRequested?: boolean;
  preferredContactTime?: string;
  brandUsageConsent?: boolean;
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
  // Krävs för att vi ska få nämna företagsnamn/logga i marknadsföring
  // och försäljning av tjänsten redan från registreringen – se
  // brandUsageConsentAt i types.ts. Kontrolleras även server-sidan,
  // inte bara via knappen i UI:t, som är lätt att kringgå.
  if (!body.brandUsageConsent) {
    return NextResponse.json(
      { error: "Ni måste godkänna att vi får nämna er som partner för att registrera er." },
      { status: 400 }
    );
  }
  // Annars vet vi inte när vi faktiskt ska höra av oss för att skapa
  // erbjudanden åt dem – kontrolleras även server-sidan, inte bara i UI:t.
  if (body.fullServiceRequested && !body.preferredContactTime?.trim()) {
    return NextResponse.json(
      { error: "Fyll i när vi bör höra av oss, eftersom ni vill ha hjälp med allt." },
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
      fullServiceRequested: body.fullServiceRequested,
      preferredContactTime: body.preferredContactTime,
      brandUsageConsent: body.brandUsageConsent,
      passwordHash,
    });
    await createSession(company.id);
    await sendAdminNewCompanyEmail(company);
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
