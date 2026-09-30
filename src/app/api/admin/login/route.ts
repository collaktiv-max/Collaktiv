import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminSession } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { password?: string };
  const password = body.password ?? "";
  const expected = process.env.ADMIN_PASSWORD ?? "";

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const valid = expected.length > 0 && a.length === b.length && timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.json({ error: "Fel lösenord." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
