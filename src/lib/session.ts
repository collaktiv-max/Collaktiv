import "server-only";
import { cookies } from "next/headers";
import { createToken, verifyToken } from "./signedToken";

const COOKIE_NAME = "collaktiv_session";
const SESSION_DAYS = 30;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET saknas i miljövariablerna (.env.local).");
  return value;
}

interface SessionPayload {
  companyId: string;
  exp: number;
}

export async function createSession(companyId: string) {
  const token = createToken(
    { companyId, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 },
    secret()
  );
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSessionCompanyId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const payload = verifyToken<SessionPayload>(token, secret());
  return payload?.companyId ?? null;
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
