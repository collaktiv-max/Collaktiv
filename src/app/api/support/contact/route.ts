import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { getCompanyById } from "@/lib/db";
import { sendHelpRequestEmail } from "@/lib/email";

interface ContactBody {
  topics: string[];
  message: string;
}

const MAX_TOPICS = 10;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Partial<ContactBody>;
  const topics = Array.isArray(body.topics)
    ? body.topics.filter((t): t is string => typeof t === "string").slice(0, MAX_TOPICS)
    : [];
  const message = typeof body.message === "string" ? body.message.slice(0, MAX_MESSAGE_LENGTH) : "";

  if (topics.length === 0 && !message.trim()) {
    return NextResponse.json(
      { error: "Välj minst en kategori eller skriv vad ni behöver hjälp med." },
      { status: 400 }
    );
  }

  const company = await getCompanyById(companyId);
  if (!company) {
    return NextResponse.json({ error: "Företaget hittades inte." }, { status: 404 });
  }

  await sendHelpRequestEmail({ company, topics, message });

  return NextResponse.json({ sent: true });
}
