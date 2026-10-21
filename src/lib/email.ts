import "server-only";
import { Resend } from "resend";
import { REGION } from "./config";
import { BILLING_LABELS, type BillingPeriod } from "./pricing";
import { createInvoiceRequestToken } from "./invoiceRequestToken";
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
  /** Skickas alltid som `content` (en Buffer vi redan hämtat och
   * verifierat själva) – INTE Resends egen `path`-hämtning, vars
   * felhantering vid en trasig/långsam fjärr-URL är odokumenterad och
   * kan missa bilagan helt utan att sendet misslyckas synligt. Se
   * fetchPdfBuffer nedan. */
  attachments?: { filename: string; content: Buffer }[];
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
// ctaLabel/ctaHref är valfria – utelämnas för mejl som medvetet inte
// ska ha en klickbar åtgärdslänk (t.ex. admins fakturamejl, se
// sendAdminInvoiceEmail).
function layout(title: string, bodyHtml: string, ctaLabel?: string, ctaHref?: string) {
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
      ${
        ctaLabel && ctaHref
          ? `<div style="margin-top:28px;">
        <a href="${ctaHref}" style="display:inline-block;background:#166849;color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;padding:13px 26px;border-radius:999px;">
          ${ctaLabel}
        </a>
      </div>`
          : ""
      }
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
     <p style="margin-top:12px;">Vi har granskat och godkänt er ansökan till Collaktiv. Ni kan nu välja paket och publicera erbjudanden – de går live för resenärer i ${REGION} så fort appen lanseras.</p>`,
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
  // Alternativ till att logga in och välja paket i portalen – en egen,
  // tidsbegränsad länk (se invoiceRequestToken.ts) till /begar-faktura
  // där företaget kan skicka in sina fakturauppgifter direkt, utan
  // inloggning, och få fakturan som PDF på mejlen.
  const invoiceRequestUrl = `${SITE_URL}/begar-faktura?token=${createInvoiceRequestToken(company.id)}`;
  const html = layout(
    "Glöm inte välja paket",
    `<p>Hej ${company.name}!</p>
     <p style="margin-top:12px;">Ert konto är godkänt, men ni har ännu inte valt ett paket. Så fort ni publicerar ett erbjudande är ni redo att synas för resenärer i ${REGION} när appen lanseras – det tar bara några minuter.</p>
     <p style="margin-top:12px;">Vill ni hellre betala mot faktura utan att logga in? <a href="${invoiceRequestUrl}" style="color:#166849;font-weight:700;">Begär en faktura här</a> – fyll i era uppgifter så skickar vi den som PDF direkt.</p>`,
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
     <p style="margin-top:12px;">Ni har ett betalt paket, men inget erbjudande skapat ännu. Lägg upp ert första erbjudande så är ni redo att synas för resenärer i ${REGION} så fort appen lanseras.</p>`,
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
  // Ikryssat av företaget vid registrering – de vill inte använda
  // portalen själva utan vill att vi sköter allt åt dem (paket,
  // erbjudande, fakturering), se full_service_requested. Lyft fram det
  // tydligt så det inte drunknar bland vanliga nyregistreringar.
  const fullServiceCallout = company.fullServiceRequested
    ? `<p style="margin-top:12px;background:#fdf3e0;border-radius:10px;padding:12px 14px;font-weight:700;">
         ⭐ Vill ha hjälp med allt – de vill inte logga in själva. Hör av er direkt istället för
         att vänta på att de loggar in, och använd "Logga in som företag" i admin för att skapa
         erbjudandet och skicka fakturan åt dem.
       </p>`
    : "";
  const html = layout(
    "Nytt företag har registrerat sig",
    `<p><strong>${company.name}</strong> har precis skapat ett konto i partnerportalen.</p>
     <ul style="margin:12px 0 0;padding-left:18px;">
       <li>Kategori: ${CATEGORY_LABELS[company.category]}</li>
       <li>Kontakt: ${company.contactName || "–"} · ${company.contactEmail}${company.contactPhone ? ` · ${company.contactPhone}` : ""}</li>
       <li>Region: ${company.region}</li>
     </ul>
     ${fullServiceCallout}
     <p style="margin-top:12px;">Ansökan väntar på granskning i admin-panelen.</p>`,
    "Öppna admin-panelen",
    `${SITE_URL}/admin`
  );
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: company.fullServiceRequested
      ? `⭐ Vill ha hjälp med allt: ${company.name}`
      : `Nytt företag: ${company.name}`,
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
// Stripe hinner inte alltid rendera PDF:en förrän en liten stund efter
// att fakturan finaliseras – en hämtning direkt efter kan träffa en
// 404 eller en ofullständig fil. Hämtar själva (istället för att ge
// Resend en `path`-URL, vars felhantering vid en trasig/långsam
// fjärr-hämtning inte är dokumenterad och kan missa bilagan helt utan
// att mejlutskicket märks av det) så vi kan verifiera svaret och
// försöka om. Kastar om alla försök misslyckas – anroparen avgör om
// mejlet ändå ska skickas utan bilaga.
async function fetchPdfBuffer(url: string): Promise<Buffer> {
  const retryDelaysMs = [0, 1500, 3000];
  let lastError: unknown;
  for (const delay of retryDelaysMs) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const res = await fetch(url);
      const contentType = res.headers.get("content-type") ?? "";
      if (res.ok && contentType.includes("pdf")) {
        return Buffer.from(await res.arrayBuffer());
      }
      lastError = new Error(`Oväntat svar (${res.status}, ${contentType || "okänd typ"})`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

// Skickas till FÖRETAGET när admin skickar en faktura direkt till dem
// (se "Skicka faktura" i admin) – de behöver aldrig logga in i
// portalen för att betala. Medvetet UTAN klickbar betalningslänk/CTA
// (se layout() ovan) – fakturan ska gå att betala direkt från den
// bifogade PDF:en, med alla uppgifter (belopp, period, förfallodatum)
// utskrivna i klartext i mejlet, inte gömda bakom en länk. Komplement
// till Stripes eget fakturamejl, i Collaktivs egen ton/design, och med
// villkorsgodkännandet tydligt utskrivet – företaget har aldrig sett
// en kryssruta för det, de godkänner genom att betala.
export async function sendAdminInvoiceEmail(params: {
  /** Mottagarens mejl/namn – kan vara en egen fakturaadress istället
   * för företagets vanliga kontaktuppgifter, se InvoiceBillingOverride
   * i src/lib/invoice.ts. */
  recipientEmail: string;
  recipientName: string;
  planName: string;
  period: BillingPeriod;
  amount: number;
  invoiceUrl: string;
  invoicePdfUrl: string | null;
  dueDate: string | null;
}): Promise<{ sent: boolean; pdfAttached: boolean }> {
  const { recipientEmail, recipientName, planName, period, amount, invoiceUrl, invoicePdfUrl, dueDate } =
    params;

  let pdfAttachment: { filename: string; content: Buffer } | undefined;
  if (invoicePdfUrl) {
    try {
      const content = await fetchPdfBuffer(invoicePdfUrl);
      pdfAttachment = { filename: `Collaktiv-faktura-${planName}.pdf`, content };
    } catch (err) {
      // Fakturan är redan skapad och skickad hos Stripe oavsett – det
      // vore fel att misslyckas hela anropet för att bara bilagan i
      // VÅRT eget mejl inte gick att hämta. Skickas utan bilaga, och
      // anroparen (admin-UI:t) får veta det via pdfAttached: false så
      // ingen tror att en PDF kom fram som faktiskt inte gjorde det.
      console.error(`[email] Kunde inte hämta fakturans PDF (${invoicePdfUrl}):`, err);
    }
  }

  const dueDateLabel = dueDate
    ? new Date(dueDate).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })
    : null;

  // Om PDF:en ändå inte gick att bifoga (pdfAttachment saknas) har
  // mottagaren annars ingen väg till betalning alls härifrån – då får
  // de i alla fall en vanlig textlänk som reservlösning, istället för
  // den klickbara CTA-knappen vi annars medvetet utelämnar.
  const fallbackLinkHtml = !pdfAttachment
    ? `<p style="margin-top:12px;">Vi lyckades tyvärr inte bifoga fakturan som PDF i det här mejlet – öppna den istället via
       <a href="${invoiceUrl}" style="color:#166849;font-weight:700;">den här länken</a>.</p>`
    : "";

  const html = layout(
    "Ni har blivit inbjudna som partner i Collaktiv",
    `<p>Hej ${recipientName}!</p>
     <p style="margin-top:12px;">Vi har skickat en faktura${pdfAttachment ? ", bifogad som PDF" : ""} med följande uppgifter:</p>
     <ul style="margin:12px 0 0;padding-left:18px;">
       <li>Paket: ${planName} – ${BILLING_LABELS[period]}</li>
       <li>Belopp: ${amount} kr (inkl. 25% moms)</li>
       ${dueDateLabel ? `<li>Förfallodatum: ${dueDateLabel}</li>` : ""}
     </ul>
     <p style="margin-top:12px;">Betala enkelt direkt från den bifogade fakturan – ni behöver inte logga in någonstans.</p>
     ${fallbackLinkHtml}
     <p style="margin-top:12px;">Genom att betala fakturan godkänner ni Collaktivs
     <a href="${SITE_URL}/villkor" style="color:#166849;font-weight:700;">villkor</a>, inklusive betalningsvillkoren.</p>`
  );
  const { sent } = await sendEmail({
    to: recipientEmail,
    subject: `Faktura från Collaktiv – ${planName}-paketet`,
    html,
    attachments: pdfAttachment ? [pdfAttachment] : undefined,
  });
  return { sent, pdfAttached: !!pdfAttachment };
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
