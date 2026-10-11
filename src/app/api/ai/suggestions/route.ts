import { NextRequest, NextResponse } from "next/server";
import { getSessionCompanyId } from "@/lib/session";
import { generateOfferSuggestions } from "@/lib/offer-ai";
import { describeClaudeError } from "@/lib/claude";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

interface SuggestionsBody {
  category: Category;
  companyName: string;
  exclude?: string[];
}

export async function POST(req: NextRequest) {
  const companyId = await getSessionCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
  }

  const body = (await req.json()) as Partial<SuggestionsBody>;
  if (!body.category || !(body.category in CATEGORY_LABELS)) {
    return NextResponse.json({ error: "Ogiltig kategori." }, { status: 400 });
  }
  const exclude = Array.isArray(body.exclude)
    ? body.exclude.filter((t): t is string => typeof t === "string")
    : [];

  try {
    const suggestions = await generateOfferSuggestions({
      category: body.category,
      companyName: typeof body.companyName === "string" ? body.companyName : "",
      exclude,
    });
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[ai/suggestions]", describeClaudeError(err));
    return NextResponse.json(
      { error: "Kunde inte generera förslag just nu. Försök igen om en stund." },
      { status: 500 }
    );
  }
}
