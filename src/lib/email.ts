import "server-only";
import { Resend } from "resend";
import { REGION } from "./config";
import { CATEGORY_LABELS, type CompanyProfile, type Offer } from "./types";

const FROM = "Collaktiv <partner@collaktiv.se>";
// Dit admin-notiser (nya registreringar m.m.) skickas.
const ADMIN_EMAIL = "partner@collaktiv.se";
// Appen är deployad på partner.collaktiv.se, inte collaktiv.se (den
// redirectar till www.collaktiv.se, som är obokad/404) – se till att
// knapparna i mejlen alltid pekar på rätt ställe även utan
// NEXT_PUBLIC_SITE_URL satt i miljön.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://partner.collaktiv.se";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Fritext från företag (t.ex. hjälpförfrågningar) skrivs rätt in i
// HTML-mejlet – escapas så en gliring med "<" eller "&" inte stör
// layouten eller tolkas som markup.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  /** `path` låter Resend hämta filen från en URL själva – vi behöver
   * aldrig ladda ner t.ex. fakturans PDF här. */
  attachments?: { filename: string; path: string }[];
}) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY saknas – mejl till ${to} ("${subject}") skickades inte.`
    );
    return { sent: false };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html, attachments });
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

export async function sendRejectionEmail(company: CompanyProfile) {
  const html = layout(
    "Beslut om er ansökan",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Vi har granskat er ansökan till Collaktiv och kan tyvärr inte godkänna den den här gången. Om ni redan hunnit betala för ett paket återbetalas det beloppet enligt våra villkor.</p>
     <p style="margin-top:12px;">Har ni frågor om beslutet är ni välkomna att höra av er till oss på <a href="mailto:partner@collaktiv.se" style="color:#166849;font-weight:700;">partner@collaktiv.se</a>.</p>`,
    "Läs våra villkor",
    `${SITE_URL}/villkor`
  );
  return sendEmail({
    to: company.contactEmail,
    subject: "Beslut om er ansökan till Collaktiv",
    html,
  });
}

// Till oss själva (ADMIN_EMAIL) – så vi inte behöver sitta och
// uppdatera admin-panelen manuellt för att upptäcka nya registreringar.
export async function sendAdminNewCompanyEmail(company: CompanyProfile) {
  const html = layout(
    "Nytt företag har registrerat sig",
    `<p><strong>${company.name}</strong> har precis skapat ett konto i partnerportalen.</p>
     <ul style="margin:12px 0 0;padding-left:18px;">
       <li>Kategori: ${CATEGORY_LABELS[company.category]}</li>
       <li>Kontakt: ${company.contactName || "–"} · ${company.contactEmail}${company.contactPhone ? ` · ${company.contactPhone}` : ""}</li>
       <li>Region: ${company.region}</li>
     </ul>
     <p style="margin-top:12px;">Ansökan väntar på granskning i admin-panelen.</p>`,
    "Öppna admin-panelen",
    `${SITE_URL}/admin`
  );
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Nytt företag: ${company.name}`,
    html,
  });
}

// Skickas när ett företag klickar "Kontakta oss" på redigera-erbjudande-
// sidan – till oss själva (ADMIN_EMAIL), inte till företaget.
export async function sendHelpRequestEmail(params: {
  company: CompanyProfile;
  topics: string[];
  message: string;
}) {
  const { company, topics, message } = params;
  const topicsHtml = topics.length
    ? `<ul style="margin:12px 0 0;padding-left:18px;">${topics
        .map((t) => `<li>${escapeHtml(t)}</li>`)
        .join("")}</ul>`
    : "";
  const messageHtml = message.trim()
    ? `<p style="margin-top:12px;white-space:pre-wrap;">${escapeHtml(message.trim())}</p>`
    : "";
  const html = layout(
    "Hjälpförfrågan om erbjudande",
    `<p><strong>${company.name}</strong> (${company.contactEmail}${
      company.contactPhone ? ` · ${company.contactPhone}` : ""
    }) behöver hjälp med att skapa ett erbjudande.</p>
     ${topicsHtml}
     ${messageHtml}`,
    "Öppna admin-panelen",
    `${SITE_URL}/admin`
  );
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Hjälpförfrågan: ${company.name}`,
    html,
  });
}

// Skickas när admin publicerar ett inskickat erbjudande.
export async function sendOfferPublishedEmail(company: CompanyProfile, offer: Offer) {
  const html = layout(
    "Erbjudandet är publicerat! 🎉",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Vi har granskat och publicerat erbjudandet "<strong>${offer.title}</strong>". Det går live för resenärer i ${REGION} så fort appen lanseras.</p>`,
    "Gå till portalen",
    `${SITE_URL}/portal/erbjudanden`
  );
  return sendEmail({
    to: company.contactEmail,
    subject: `Erbjudandet "${offer.title}" är publicerat`,
    html,
  });
}

// Skickas när admin skickar tillbaka ett inskickat erbjudande för
// redigering istället för att publicera det.
export async function sendOfferReturnedEmail(company: CompanyProfile, offer: Offer) {
  const html = layout(
    "Erbjudandet skickades tillbaka",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Vi har granskat erbjudandet "<strong>${offer.title}</strong>" och skickat tillbaka det till er för justering innan det kan publiceras. Logga in, redigera det och skicka in igen.</p>`,
    "Redigera erbjudandet",
    `${SITE_URL}/portal/erbjudanden`
  );
  return sendEmail({
    to: company.contactEmail,
    subject: `Erbjudandet "${offer.title}" behöver justeras`,
    html,
  });
}

// Skickas till FÖRETAGET när admin skickar en faktura direkt till dem
// (se "Skicka faktura" i admin) – de behöver aldrig logga in i
// portalen för att betala, Stripes egen fakturasida har en
// betalningslänk. Komplement till Stripes eget fakturamejl, i
// Collaktivs egen ton/design, och med villkorsgodkännandet tydligt
// utskrivet – företaget har aldrig sett en kryssruta för det, de
// godkänner genom att betala.
export async function sendAdminInvoiceEmail(params: {
  company: CompanyProfile;
  planName: string;
  amount: number;
  invoiceUrl: string;
  invoicePdfUrl: string | null;
  dueInDays: number;
}) {
  const { company, planName, amount, invoiceUrl, invoicePdfUrl, dueInDays } = params;
  const html = layout(
    "Ni har blivit inbjudna som partner i Collaktiv",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Vi har skickat en faktura för ${planName}-paketet (${amount} kr) med ${dueInDays}
     dagars betalningsvillkor${invoicePdfUrl ? " – bifogad som PDF" : ""}. Betala enkelt via länken nedan – ni behöver inte logga in någonstans.</p>
     <p style="margin-top:12px;">Genom att betala fakturan godkänner ni Collaktivs
     <a href="${SITE_URL}/villkor" style="color:#166849;font-weight:700;">villkor</a>, inklusive betalningsvillkoren.</p>`,
    "Betala fakturan",
    invoiceUrl
  );
  return sendEmail({
    to: company.contactEmail,
    subject: `Faktura från Collaktiv – ${planName}-paketet`,
    html,
    attachments: invoicePdfUrl
      ? [{ filename: `Collaktiv-faktura-${planName}.pdf`, path: invoicePdfUrl }]
      : undefined,
  });
}

// Skickas till OSS SJÄLVA (ADMIN_EMAIL) när Stripe bekräftar att en
// faktura är betald – annars märks en fakturabetalning (som kan ta
// flera dagar, t.ex. via banköverföring) bara om någon råkar kolla
// admin-panelen.
export async function sendAdminInvoicePaidEmail(params: {
  company: CompanyProfile;
  planName: string;
  amount: number;
}) {
  const { company, planName, amount } = params;
  const html = layout(
    "En faktura har betalats! 🎉",
    `<p><strong>${company.name}</strong> har betalat sin faktura för ${planName}-paketet (${amount} kr).</p>
     <p style="margin-top:12px;">Kontot är redan markerat som betalt i admin-panelen – inget mer att göra
     här, om inte erbjudandet också väntar på granskning.</p>`,
    "Öppna admin-panelen",
    `${SITE_URL}/admin`
  );
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Betalning mottagen: ${company.name}`,
    html,
  });
}
