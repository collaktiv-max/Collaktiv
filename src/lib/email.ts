import "server-only";
import { Resend } from "resend";
import { REGION } from "./config";
import type { CompanyProfile } from "./types";

const FROM = "Collaktiv <partner@collaktiv.se>";
// Appen är deployad på partner.collaktiv.se, inte collaktiv.se (den
// redirectar till www.collaktiv.se, som är obokad/404) – se till att
// knapparna i mejlen alltid pekar på rätt ställe även utan
// NEXT_PUBLIC_SITE_URL satt i miljön.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://partner.collaktiv.se";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY saknas – mejl till ${to} ("${subject}") skickades inte.`
    );
    return { sent: false };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error(`[email] Kunde inte skicka till ${to}:`, err);
    return { sent: false };
  }
}

// Enkel, inline-stylad layout – e-postklienter stödjer inte extern CSS.
function layout(title: string, bodyHtml: string, ctaLabel: string, ctaHref: string) {
  return `
<div style="background:#f2faf7;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2ece7;">
    <div style="background:#0f1f18;padding:24px 32px;">
      <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">COLLAKTIV</span>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#0f2a1f;">${title}</h1>
      <div style="font-size:14px;line-height:1.65;color:#5b7168;font-weight:500;">
        ${bodyHtml}
      </div>
      <div style="margin-top:28px;">
        <a href="${ctaHref}" style="display:inline-block;background:#166849;color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;padding:13px 26px;border-radius:999px;">
          ${ctaLabel}
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #e2ece7;">
      <p style="margin:0;font-size:11.5px;color:#5b7168;font-weight:600;">
        Collaktiv &middot; Partnerportalen &middot; ${REGION}
      </p>
    </div>
  </div>
</div>`;
}

export async function sendApprovalEmail(company: CompanyProfile) {
  const html = layout(
    "Ert konto är godkänt! 🎉",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Vi har granskat och godkänt er ansökan till Collaktiv. Ni kan nu välja paket och publicera erbjudanden som syns för resenärer i ${REGION}.</p>`,
    "Gå till portalen",
    `${SITE_URL}/logga-in`
  );
  return sendEmail({
    to: company.contactEmail,
    subject: "Ert konto är godkänt – välkomna till Collaktiv!",
    html,
  });
}

export async function sendPaymentReminderEmail(company: CompanyProfile) {
  const html = layout(
    "Glöm inte välja paket",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Ert konto är godkänt, men ni har ännu inte valt ett paket. Så fort ni publicerar ett erbjudande börjar ni synas för resenärer i ${REGION} – det tar bara några minuter.</p>`,
    "Välj paket",
    `${SITE_URL}/portal/erbjudanden`
  );
  return sendEmail({
    to: company.contactEmail,
    subject: "Påminnelse: välj paket för att synas i Collaktiv",
    html,
  });
}

export async function sendOfferReminderEmail(company: CompanyProfile) {
  const html = layout(
    "Dags att skapa ert första erbjudande",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Ni har ett betalt paket, men inget erbjudande skapat ännu. Lägg upp ert första erbjudande så börjar ni synas för resenärer i ${REGION}.</p>`,
    "Skapa erbjudande",
    `${SITE_URL}/portal/erbjudanden/nytt`
  );
  return sendEmail({
    to: company.contactEmail,
    subject: "Påminnelse: skapa ert första erbjudande",
    html,
  });
}
