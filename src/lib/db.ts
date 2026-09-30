import "server-only";
import { neon } from "@neondatabase/serverless";
import type {
  CompanyProfile,
  Offer,
  ReferralInvite,
  Campaign,
  CampaignStatus,
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

interface ReferralRow {
  id: string;
  email: string;
  status: "skickad" | "registrerad";
  sent_at: string;
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

function toReferral(row: ReferralRow): ReferralInvite {
  return { id: row.id, email: row.email, status: row.status, sentAt: row.sent_at };
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
  passwordHash: string;
}): Promise<CompanyProfile> {
  const rows = (await sql`
    insert into companies (
      name, logo_data_url, website, description, category,
      contact_name, contact_email, contact_phone, region, address,
      package_tier, application_status, password_hash,
      onboarding_logo
    ) values (
      ${input.name}, ${input.logoDataUrl ?? null}, ${input.website ?? ""}, ${input.description ?? ""},
      ${input.category ?? "ovrigt"}, ${input.contactName ?? ""}, ${input.contactEmail},
      ${input.contactPhone ?? ""}, ${input.region ?? "Gävleborg"}, ${input.address ?? ""},
      ${input.packageTier ?? "standard"}, ${input.applicationStatus ?? "inskickad"},
      ${input.passwordHash}, ${!!input.logoDataUrl}
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
      points_cost, valid_to, terms, image_emoji, image_data_url,
      image_optimized, status
    ) values (
      ${offer.companyId}, ${offer.title}, ${offer.description}, ${offer.discountType},
      ${offer.discountValue}, ${offer.pointsCost}, ${offer.validTo ?? null}, ${offer.terms ?? null},
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

export async function createReferral(email: string): Promise<ReferralInvite> {
  const rows = (await sql`
    insert into referrals (email) values (${email}) returning *
  `) as ReferralRow[];
  return toReferral(rows[0]);
}

export async function getReferrals(): Promise<ReferralInvite[]> {
  const rows = (await sql`select * from referrals order by sent_at desc`) as ReferralRow[];
  return rows.map(toReferral);
}

export async function getReferralsCount(): Promise<number> {
  const rows = (await sql`select count(*)::int as count from referrals`) as { count: number }[];
  return rows[0]?.count ?? 0;
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
  status: "paid" | "refunded";
  created_at: string;
}

export interface Payment {
  id: string;
  companyId: string;
  offerId: string | null;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string;
  planId: string;
  period: string;
  status: "paid" | "refunded";
  createdAt: string;
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
}): Promise<Payment> {
  const rows = (await sql`
    insert into payments (
      company_id, offer_id, stripe_session_id, stripe_payment_intent_id,
      amount, currency, plan_id, period
    ) values (
      ${input.companyId}, ${input.offerId ?? null}, ${input.stripeSessionId},
      ${input.stripePaymentIntentId ?? null}, ${input.amount}, ${input.currency ?? "sek"},
      ${input.planId}, ${input.period}
    )
    on conflict (stripe_session_id) do update set stripe_session_id = excluded.stripe_session_id
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
