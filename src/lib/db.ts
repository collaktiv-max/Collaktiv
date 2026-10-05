import "server-only";
import { neon } from "@neondatabase/serverless";
import type {
  CompanyProfile,
  Offer,
  Campaign,
  CampaignStatus,
  Payment,
  PaymentStatus,
  Category,
  PackageTier,
  ApplicationStatus,
  OfferStatus,
  DiscountType,
} from "./types";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL saknas i miljövariablerna (.env.local).");
}

export const sql = neon(databaseUrl);

// ---------- Rader från databasen (snake_case) ----------

interface CompanyRow {
  id: string;
  name: string;
  logo_data_url: string | null;
  website: string;
  description: string;
  category: Category;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  region: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  package_tier: PackageTier;
  application_status: ApplicationStatus;
  payment_confirmed: boolean;
  contest_host_interested: boolean;
  contest_prize_description: string | null;
  referred_by_company_id: string | null;
  bonus_access_until: string | null;
  approved_at: string | null;
  payment_confirmed_at: string | null;
  payment_reminder_sent_at: string | null;
  offer_reminder_sent_at: string | null;
  password_hash: string;
  onboarding_logo: boolean;
  onboarding_first_offer: boolean;
  onboarding_profile_complete: boolean;
  onboarding_first_publish: boolean;
  created_at: string;
}

interface OfferRow {
  id: string;
  company_id: string;
  title: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  discount_value_kr: number;
  points_cost: number;
  valid_to: string | null;
  terms: string | null;
  image_emoji: string;
  image_data_url: string | null;
  image_optimized: boolean;
  status: OfferStatus;
  views: number;
  redemptions: number;
  created_at: string;
}

interface CampaignRow {
  id: string;
  company_id: string;
  message: string | null;
  status: CampaignStatus;
  created_at: string;
}

function toCompany(row: CompanyRow): CompanyProfile & { passwordHash: string } {
  return {
    id: row.id,
    name: row.name,
    logoDataUrl: row.logo_data_url ?? undefined,
    website: row.website,
    description: row.description,
    category: row.category,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    region: row.region,
    address: row.address ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    packageTier: row.package_tier,
    applicationStatus: row.application_status,
    paymentConfirmed: row.payment_confirmed,
    contestHostInterested: row.contest_host_interested,
    contestPrizeDescription: row.contest_prize_description ?? undefined,
    referredByCompanyId: row.referred_by_company_id ?? undefined,
    bonusAccessUntil: row.bonus_access_until ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    paymentConfirmedAt: row.payment_confirmed_at ?? undefined,
    paymentReminderSentAt: row.payment_reminder_sent_at ?? undefined,
    offerReminderSentAt: row.offer_reminder_sent_at ?? undefined,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    onboardingChecklist: {
      logo: row.onboarding_logo,
      firstOffer: row.onboarding_first_offer,
      profileComplete: row.onboarding_profile_complete,
      firstPublish: row.onboarding_first_publish,
    },
  };
}

function stripPassword(company: CompanyProfile & { passwordHash: string }): CompanyProfile {
  const { passwordHash: _passwordHash, ...rest } = company;
  void _passwordHash;
  return rest;
}

function toOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    description: row.description,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    discountValueKr: row.discount_value_kr,
    pointsCost: row.points_cost,
    validTo: row.valid_to ?? undefined,
    terms: row.terms ?? undefined,
    imageEmoji: row.image_emoji,
    imageDataUrl: row.image_data_url ?? undefined,
    imageOptimized: row.image_optimized,
    status: row.status,
    createdAt: row.created_at,
    stats: { views: row.views, redemptions: row.redemptions },
  };
}

function toCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    companyId: row.company_id,
    message: row.message ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

// ---------- Företag ----------

export async function getCompanies(): Promise<CompanyProfile[]> {
  const rows = (await sql`select * from companies order by created_at desc`) as CompanyRow[];
  return rows.map((r) => stripPassword(toCompany(r)));
}

export async function getCompaniesCount(): Promise<number> {
  const rows = (await sql`select count(*)::int as count from companies`) as { count: number }[];
  return rows[0]?.count ?? 0;
}

export async function getCompanyById(id: string): Promise<CompanyProfile | null> {
  const rows = (await sql`select * from companies where id = ${id}`) as CompanyRow[];
  if (!rows[0]) return null;
  return stripPassword(toCompany(rows[0]));
}

/** Inkluderar password_hash – används bara internt av login(). */
export async function getCompanyByEmailWithPassword(email: string) {
  const rows = (await sql`
    select * from companies where lower(contact_email) = lower(${email})
  `) as CompanyRow[];
  return rows[0] ? toCompany(rows[0]) : null;
}

export async function createCompany(input: {
  name: string;
  logoDataUrl?: string;
  website?: string;
  description?: string;
  category?: Category;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  region?: string;
  address?: string;
  packageTier?: PackageTier;
  applicationStatus?: ApplicationStatus;
  referredByCompanyId?: string;
  passwordHash: string;
}): Promise<CompanyProfile> {
  const rows = (await sql`
    insert into companies (
      name, logo_data_url, website, description, category,
      contact_name, contact_email, contact_phone, region, address,
      package_tier, application_status, password_hash,
      onboarding_logo, referred_by_company_id
    ) values (
      ${input.name}, ${input.logoDataUrl ?? null}, ${input.website ?? ""}, ${input.description ?? ""},
      ${input.category ?? "ovrigt"}, ${input.contactName ?? ""}, ${input.contactEmail},
      ${input.contactPhone ?? ""}, ${input.region ?? "Gävleborg"}, ${input.address ?? ""},
      ${input.packageTier ?? "standard"}, ${input.applicationStatus ?? "inskickad"},
      ${input.passwordHash}, ${!!input.logoDataUrl}, ${input.referredByCompanyId ?? null}
    )
    returning *
  `) as CompanyRow[];
  return stripPassword(toCompany(rows[0]));
}

export async function updateCompany(
  id: string,
  partial: Partial<CompanyProfile>
): Promise<CompanyProfile | null> {
  const current = await getCompanyById(id);
  if (!current) return null;
  const next = { ...current, ...partial };
  const checklist = { ...current.onboardingChecklist, ...partial.onboardingChecklist };

  // Sätts automatiskt första gången, så vi vet när 2-/3-dagarsklockan
  // för påminnelsemejl (se src/lib/reminders.ts) ska börja räkna.
  const approvedAt =
    current.applicationStatus !== "godkand" && next.applicationStatus === "godkand"
      ? new Date().toISOString()
      : next.approvedAt;
  const paymentConfirmedAt =
    !current.paymentConfirmed && next.paymentConfirmed && !current.paymentConfirmedAt
      ? new Date().toISOString()
      : next.paymentConfirmedAt;

  const rows = (await sql`
    update companies set
      name = ${next.name},
      logo_data_url = ${next.logoDataUrl ?? null},
      website = ${next.website ?? ""},
      description = ${next.description ?? ""},
      category = ${next.category},
      contact_name = ${next.contactName},
      contact_email = ${next.contactEmail},
      contact_phone = ${next.contactPhone},
      region = ${next.region},
      address = ${next.address ?? ""},
      latitude = ${next.latitude ?? null},
      longitude = ${next.longitude ?? null},
      package_tier = ${next.packageTier},
      application_status = ${next.applicationStatus},
      payment_confirmed = ${next.paymentConfirmed},
      contest_host_interested = ${next.contestHostInterested},
      contest_prize_description = ${next.contestPrizeDescription ?? ""},
      bonus_access_until = ${next.bonusAccessUntil ?? null},
      approved_at = ${approvedAt ?? null},
      payment_confirmed_at = ${paymentConfirmedAt ?? null},
      payment_reminder_sent_at = ${next.paymentReminderSentAt ?? null},
      offer_reminder_sent_at = ${next.offerReminderSentAt ?? null},
      onboarding_logo = ${checklist.logo},
      onboarding_first_offer = ${checklist.firstOffer},
      onboarding_profile_complete = ${checklist.profileComplete},
      onboarding_first_publish = ${checklist.firstPublish}
    where id = ${id}
    returning *
  `) as CompanyRow[];
  return stripPassword(toCompany(rows[0]));
}

export async function updateCompanyPassword(id: string, passwordHash: string): Promise<void> {
  await sql`update companies set password_hash = ${passwordHash} where id = ${id}`;
}

// ---------- Påminnelser ----------
// Se src/lib/reminders.ts för hur de här används (daglig cron-körning).

// Godkända företag som inte valt/betalat för ett paket, minst 2 dagar
// efter godkännande, och inte redan påminda de senaste 5 dagarna.
export async function getCompaniesNeedingPaymentReminder(): Promise<CompanyProfile[]> {
  const rows = (await sql`
    select * from companies
    where application_status = 'godkand'
      and payment_confirmed = false
      and approved_at is not null
      and approved_at <= now() - interval '2 days'
      and (payment_reminder_sent_at is null or payment_reminder_sent_at <= now() - interval '5 days')
  `) as CompanyRow[];
  return rows.map((r) => stripPassword(toCompany(r)));
}

// Företag som betalat men inte skapat något erbjudande, minst 3 dagar
// efter betalningen, och inte redan påminda de senaste 5 dagarna.
export async function getCompaniesNeedingOfferReminder(): Promise<CompanyProfile[]> {
  const rows = (await sql`
    select c.* from companies c
    where c.payment_confirmed = true
      and c.payment_confirmed_at is not null
      and c.payment_confirmed_at <= now() - interval '3 days'
      and (c.offer_reminder_sent_at is null or c.offer_reminder_sent_at <= now() - interval '5 days')
      and not exists (select 1 from offers o where o.company_id = c.id)
  `) as CompanyRow[];
  return rows.map((r) => stripPassword(toCompany(r)));
}

export async function markPaymentReminderSent(id: string): Promise<void> {
  await sql`update companies set payment_reminder_sent_at = now() where id = ${id}`;
}

export async function markOfferReminderSent(id: string): Promise<void> {
  await sql`update companies set offer_reminder_sent_at = now() where id = ${id}`;
}

// ---------- Erbjudanden ----------

export async function getOffers(): Promise<Offer[]> {
  const rows = (await sql`select * from offers order by created_at desc`) as OfferRow[];
  return rows.map(toOffer);
}

export async function getOffersByCompany(companyId: string): Promise<Offer[]> {
  const rows = (await sql`
    select * from offers where company_id = ${companyId} order by created_at desc
  `) as OfferRow[];
  return rows.map(toOffer);
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const rows = (await sql`select * from offers where id = ${id}`) as OfferRow[];
  return rows[0] ? toOffer(rows[0]) : null;
}

export async function createOffer(
  offer: Omit<Offer, "id" | "createdAt" | "stats">
): Promise<Offer> {
  const rows = (await sql`
    insert into offers (
      company_id, title, description, discount_type, discount_value,
      discount_value_kr, points_cost, valid_to, terms, image_emoji, image_data_url,
      image_optimized, status
    ) values (
      ${offer.companyId}, ${offer.title}, ${offer.description}, ${offer.discountType},
      ${offer.discountValue}, ${offer.discountValueKr ?? 0}, ${offer.pointsCost}, ${offer.validTo ?? null}, ${offer.terms ?? null},
      ${offer.imageEmoji}, ${offer.imageDataUrl ?? null}, ${!!offer.imageOptimized}, ${offer.status}
    )
    returning *
  `) as OfferRow[];
  return toOffer(rows[0]);
}

export async function updateOffer(id: string, partial: Partial<Offer>): Promise<Offer | null> {
  const current = await getOfferById(id);
  if (!current) return null;
  const next = { ...current, ...partial };
  const stats = { ...current.stats, ...partial.stats };

  const rows = (await sql`
    update offers set
      title = ${next.title},
      description = ${next.description},
      discount_type = ${next.discountType},
      discount_value = ${next.discountValue},
      discount_value_kr = ${next.discountValueKr ?? 0},
      points_cost = ${next.pointsCost},
      valid_to = ${next.validTo ?? null},
      terms = ${next.terms ?? null},
      image_emoji = ${next.imageEmoji},
      image_data_url = ${next.imageDataUrl ?? null},
      image_optimized = ${!!next.imageOptimized},
      status = ${next.status},
      views = ${stats.views},
      redemptions = ${stats.redemptions}
    where id = ${id}
    returning *
  `) as OfferRow[];
  return toOffer(rows[0]);
}

export async function deleteOffer(id: string): Promise<void> {
  await sql`delete from offers where id = ${id}`;
}

// Företaget kan skapa och betala för ett erbjudande direkt, men det går
// live först när vi godkänt både kontot och erbjudandet – så det hamnar
// i granskning istället för att publiceras direkt.
export async function submitOfferForReview(
  offerId: string,
  companyId: string
): Promise<{ offer: Offer; company: CompanyProfile } | null> {
  const offer = await updateOffer(offerId, { status: "granskas" });
  if (!offer) return null;

  const current = await getCompanyById(companyId);
  if (!current) return null;

  const company = await updateCompany(companyId, {
    applicationStatus:
      current.applicationStatus === "inskickad" ? "under_granskning" : current.applicationStatus,
    onboardingChecklist: { ...current.onboardingChecklist, firstPublish: true },
  });

  return company ? { offer, company } : null;
}

// ---------- Referrals ----------
// Bjud in via en personlig länk (/registrera?ref=<company-id>) istället
// för att vi skickar mejl åt företaget. Räknas och belönas via
// referred_by_company_id på det nya företaget, se grantReferralBonus.

export async function getReferralCountForCompany(companyId: string): Promise<number> {
  const rows = (await sql`
    select count(*)::int as count from companies where referred_by_company_id = ${companyId}
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

const REFERRAL_BONUS_DAYS = 30;

// Körs när ett inbjudet företag bekräftar sin FÖRSTA betalning (se
// /api/checkout/verify). Tre fall för den som bjöd in:
//   - Inget betalt paket sedan tidigare -> Standard låses upp gratis i
//     30 dagar.
//   - Betalar redan för Standard -> uppgraderas till Premium i 30
//     dagar (en uppgradering, inte en förlängning av Standard-tiden).
//   - Betalar redan för Premium -> får 30 extra dagar på det de redan
//     har kvar (förlängning).
// bonus_access_until är ett kvitto på bonusen – appen har i övrigt
// ingen utgångshantering av betalda paket.
export async function grantReferralBonus(companyId: string): Promise<CompanyProfile | null> {
  const company = await getCompanyById(companyId);
  if (!company) return null;

  const now = new Date();
  const freshBonusUntil = new Date(
    now.getTime() + REFERRAL_BONUS_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  if (!company.paymentConfirmed) {
    return updateCompany(companyId, {
      paymentConfirmed: true,
      packageTier: "standard",
      bonusAccessUntil: freshBonusUntil,
    });
  }

  if (company.packageTier === "standard") {
    return updateCompany(companyId, {
      packageTier: "premium",
      bonusAccessUntil: freshBonusUntil,
    });
  }

  const currentUntil = company.bonusAccessUntil ? new Date(company.bonusAccessUntil) : null;
  const base = currentUntil && currentUntil > now ? currentUntil : now;
  const extendedBonusUntil = new Date(
    base.getTime() + REFERRAL_BONUS_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  return updateCompany(companyId, { bonusAccessUntil: extendedBonusUntil });
}

// ---------- Betalningar ----------

interface PaymentRow {
  id: string;
  company_id: string;
  offer_id: string | null;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  plan_id: string;
  period: string;
  status: PaymentStatus;
  created_at: string;
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    companyId: row.company_id,
    offerId: row.offer_id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amount: row.amount,
    currency: row.currency,
    planId: row.plan_id,
    period: row.period,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createPayment(input: {
  companyId: string;
  offerId?: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency?: string;
  planId: string;
  period: string;
  status?: PaymentStatus;
}): Promise<Payment> {
  const rows = (await sql`
    insert into payments (
      company_id, offer_id, stripe_session_id, stripe_payment_intent_id,
      amount, currency, plan_id, period, status
    ) values (
      ${input.companyId}, ${input.offerId ?? null}, ${input.stripeSessionId},
      ${input.stripePaymentIntentId ?? null}, ${input.amount}, ${input.currency ?? "sek"},
      ${input.planId}, ${input.period}, ${input.status ?? "paid"}
    )
    -- En faktura skrivs in som 'pending' när den skickas och uppdateras
    -- till 'paid' av webhooken när Stripe bekräftar att den är betald.
    on conflict (stripe_session_id) do update set
      stripe_payment_intent_id = excluded.stripe_payment_intent_id,
      amount = excluded.amount,
      status = excluded.status
    returning *
  `) as PaymentRow[];
  return toPayment(rows[0]);
}

export async function getPaymentsByCompany(companyId: string): Promise<Payment[]> {
  const rows = (await sql`
    select * from payments where company_id = ${companyId} order by created_at desc
  `) as PaymentRow[];
  return rows.map(toPayment);
}

export async function getUnrefundedPaymentsByCompany(companyId: string): Promise<Payment[]> {
  const rows = (await sql`
    select * from payments where company_id = ${companyId} and status = 'paid' order by created_at desc
  `) as PaymentRow[];
  return rows.map(toPayment);
}

export async function markPaymentRefunded(id: string): Promise<void> {
  await sql`update payments set status = 'refunded' where id = ${id}`;
}

// ---------- Kampanjer ----------

export async function createCampaign(input: {
  companyId: string;
  message?: string;
}): Promise<Campaign> {
  const rows = (await sql`
    insert into campaigns (company_id, message)
    values (${input.companyId}, ${input.message ?? ""})
    returning *
  `) as CampaignRow[];
  return toCampaign(rows[0]);
}

export async function getCampaignsByCompany(companyId: string): Promise<Campaign[]> {
  const rows = (await sql`
    select * from campaigns where company_id = ${companyId} order by created_at desc
  `) as CampaignRow[];
  return rows.map(toCampaign);
}

export async function getCampaigns(): Promise<Campaign[]> {
  const rows = (await sql`select * from campaigns order by created_at desc`) as CampaignRow[];
  return rows.map(toCampaign);
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const rows = (await sql`select * from campaigns where id = ${id}`) as CampaignRow[];
  return rows[0] ? toCampaign(rows[0]) : null;
}

export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus
): Promise<Campaign | null> {
  const rows = (await sql`
    update campaigns set status = ${status} where id = ${id} returning *
  `) as CampaignRow[];
  return rows[0] ? toCampaign(rows[0]) : null;
}
