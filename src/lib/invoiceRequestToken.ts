import "server-only";
import { createToken, verifyToken } from "./signedToken";

const TOKEN_DAYS = 30;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET saknas i miljövariablerna (.env.local).");
  return value;
}

interface InvoiceRequestPayload {
  companyId: string;
  purpose: "invoice-request";
  exp: number;
}

// Låter ett företag begära en faktura via länken i påminnelsemejlet
// (se sendPaymentReminderEmail och /begar-faktura) UTAN att logga in –
// 30 dagars giltighet räcker för hela påminnelsecykeln (4 påminnelser
// var 5:e dag, se reminders.ts), och varje nytt mejl bär en färsk
// token ändå. Återanvänder SESSION_SECRET istället för en egen hemlighet
// (en mindre miljövariabel att hålla reda på), men "purpose"-fältet gör
// att en vanlig inloggningssession eller den här tokenen aldrig kan
// förväxlas eller återanvändas som den andra.
export function createInvoiceRequestToken(companyId: string): string {
  return createToken(
    { companyId, purpose: "invoice-request", exp: Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000 },
    secret()
  );
}

export function verifyInvoiceRequestToken(token: string | null | undefined): string | null {
  const payload = verifyToken<InvoiceRequestPayload>(token ?? undefined, secret());
  if (!payload || payload.purpose !== "invoice-request") return null;
  return payload.companyId;
}
