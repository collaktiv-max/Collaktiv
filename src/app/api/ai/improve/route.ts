import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { improveOfferCopy } from "@/lib/offer-ai";
import { describeClaudeError } from "@/lib/claude";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

interface ImproveBody {
  title: string;
  description: string;
  category: Category;
}

export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Partial<ImproveBody>;
  if (!body.category || !(body.category in CATEGORY_LABELS)) {
    return NextResponse.json({ error: "Ogiltig kategori." }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title : "";
  const description = typeof body.description === "string" ? body.description : "";
  if (!title.trim() && !description.trim()) {
    return NextResponse.json(
      { error: "Skriv något att förbättra först." },
      { status: 400 }
    );
  }

  try {
    const result = await improveOfferCopy({ title, description, category: body.category });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai/improve]", describeClaudeError(err));
    return NextResponse.json(
      { error: "Kunde inte förbättra texten just nu. Försök igen om en stund." },
      { status: 500 }
    );
  }
}
