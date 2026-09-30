import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createToken(data: Record<string, unknown>, secret: string): string {
  const payload = base64url(JSON.stringify(data));
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export function verifyToken<T>(token: string | undefined, secret: string): T | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T & {
      exp?: number;
    };
    if (typeof data.exp === "number" && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
