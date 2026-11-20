import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createToken, verifyToken } from "./signedToken";

const COOKIE_NAME = "collaktiv_admin_session";
const SESSION_DAYS = 7;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET saknas i miljövariablerna (.env.local).");
  return value;
}

interface AdminSessionPayload {
  admin: true;
  exp: number;
}

export async function createAdminSession() {
  const token = createToken({ admin: true, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 }, secret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function isAdminSessionValid(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const payload = verifyToken<AdminSessionPayload>(token, secret());
  return payload?.admin === true;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// Anropas överst i varje admin-API-rutt (utom login/logout) – returnerar
// ett 401-svar att skicka tillbaka direkt om admin-sessionen saknas
// eller är ogiltig, annars null så anroparen bara fortsätter. Utan den
// här kontrollen litar rutterna blint på att bara admin-UI:t råkar
// anropa dem, vilket gör dem öppna för vem som helst som känner till
// URL-mönstret.
export async function requireAdminSession(): Promise<NextResponse | null> {
  if (await isAdminSessionValid()) return null;
  return NextResponse.json({ error: "Kräver admin-inloggning." }, { status: 401 });
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };
