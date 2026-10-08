-- Collaktiv Företagsportalen — databasschema
-- Speglar src/lib/types.ts. Körs en gång mot Neon-databasen.

create extension if not exists "pgcrypto";

create table if not exists companies (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  logo_data_url     text,
  website           text default '',
  description       text default '',
  category          text not null default 'ovrigt'
                      check (category in ('mat-dryck','fika','mode','halsa-gym','kultur-noje','ovrigt')),
  contact_name      text not null default '',
  contact_email     text not null,
  contact_phone     text not null default '',
  region            text not null default 'Gävleborg',
  address           text default '',
  latitude          double precision,
  longitude         double precision,
  -- Vilket företag som bjöd in det här via sin delbara länk, om något.
  referred_by_company_id uuid references companies (id) on delete set null,
  -- Sätts/förlängs med 30 dagar när ett företag man bjudit in betalar
  -- för sitt första paket. Rent informativt kvitto i Profil – appen
  -- har i övrigt ingen utgångshantering av betalda paket.
  bonus_access_until timestamptz,
  package_tier      text not null default 'standard'
                      check (package_tier in ('standard','premium')),
  application_status text not null default 'inskickad'
                      check (application_status in ('utkast','inskickad','under_granskning','godkand','avvisad')),
  payment_confirmed boolean not null default false,
  contest_host_interested    boolean not null default false,
  contest_prize_description  text default '',
  -- Sätts automatiskt när ansökan godkänns/första betalningen
  -- bekräftas – används för att räkna ut när påminnelsemejl ska gå ut.
  approved_at                timestamptz,
  payment_confirmed_at       timestamptz,
  -- Senast ett påminnelsemejl av respektive typ skickades, så vi inte
  -- mejlar samma företag varje dag – se src/lib/reminders.ts.
  payment_reminder_sent_at   timestamptz,
  offer_reminder_sent_at     timestamptz,
  password_hash     text not null,
  onboarding_logo             boolean not null default false,
  onboarding_first_offer      boolean not null default false,
  onboarding_profile_complete boolean not null default false,
  onboarding_first_publish    boolean not null default false,
  created_at        timestamptz not null default now()
);

create unique index if not exists companies_contact_email_key
  on companies (lower(contact_email));

-- Fanns inte i ursprungsschemat – säkerställer att kolumnerna finns
-- även på databaser som skapades innan de lades till ovan.
alter table companies add column if not exists referred_by_company_id uuid references companies (id) on delete set null;
alter table companies add column if not exists bonus_access_until timestamptz;
create index if not exists companies_referred_by_idx on companies (referred_by_company_id);
alter table companies add column if not exists approved_at timestamptz;
alter table companies add column if not exists payment_confirmed_at timestamptz;
alter table companies add column if not exists payment_reminder_sent_at timestamptz;
alter table companies add column if not exists offer_reminder_sent_at timestamptz;

create table if not exists offers (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references companies (id) on delete cascade,
  title            text not null,
  description      text not null default '',
  discount_type    text not null default 'procent'
                     check (discount_type in ('procent','belopp','erbjudande')),
  discount_value   text not null default '',
  -- Rabattens värde i kronor, oavsett vad som visas i appen (procent,
  -- kronor eller fritt erbjudande). Används bara internt för att räkna
  -- ut ett rimligt poängkostnadsintervall.
  discount_value_kr integer not null default 0,
  points_cost      integer not null default 0,
  valid_to         timestamptz,
  terms            text,
  image_emoji      text not null default '🛍️',
  image_data_url   text,
  image_optimized  boolean not null default false,
  status           text not null default 'utkast'
                     check (status in ('utkast','granskas','publicerad','pausad','arkiverad')),
  views            integer not null default 0,
  redemptions      integer not null default 0,
  -- Sätts automatiskt första gången admin publicerar erbjudandet.
  -- Ändras inte av senare paus/återuppta – det är alltså en stabil
  -- "redo sen X"-tidsstämpel, inte en live-/synlighetsflagga. Tänkt
  -- som sorteringsnyckel för den framtida reseappen, se
  -- /api/public/offers.
  published_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists offers_company_id_idx on offers (company_id);
create index if not exists offers_status_idx on offers (status);
alter table offers add column if not exists published_at timestamptz;

-- Fanns inte i ursprungsschemat – säkerställer att kolumnen finns även
-- på databaser som skapades innan den lades till ovan.
alter table offers add column if not exists discount_value_kr integer not null default 0;

-- 'pausad' fanns inte i ursprungsschemat – ett publicerat erbjudande
-- kan pausas (döljs i appen) och återupptas av företaget själva, utan
-- ny betalning, se src/app/api/offers/[id].
alter table offers drop constraint if exists offers_status_check;
alter table offers add constraint offers_status_check
  check (status in ('utkast','granskas','publicerad','pausad','arkiverad'));

create table if not exists referrals (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  status     text not null default 'skickad'
               check (status in ('skickad','registrerad')),
  sent_at    timestamptz not null default now()
);

-- Ett register över varje lyckad Stripe-betalning, kopplat till
-- företaget (och erbjudandet, om det gällde en publicering). Behövs
-- för att admin ska kunna se/hitta betalningen, och för att en
-- automatisk Stripe-återbetalning ska kunna triggas om en betald
-- ansökan avvisas – se /api/admin/companies/[id].
create table if not exists payments (
  id                        uuid primary key default gen_random_uuid(),
  company_id                uuid not null references companies (id) on delete cascade,
  offer_id                  uuid references offers (id) on delete set null,
  stripe_session_id         text not null,
  stripe_payment_intent_id  text,
  amount                    integer not null,
  currency                  text not null default 'sek',
  plan_id                   text not null,
  period                    text not null,
  status                    text not null default 'paid'
                              check (status in ('paid','pending','refunded')),
  -- Vilken version av /villkor (se src/lib/legal.ts) företaget
  -- godkände, och exakt när – ifyllt av företaget själva via
  -- kryssrutan vid publicering, inte satt av oss i efterhand. Ger ett
  -- bevis per betalning om en tvist om villkoren skulle uppstå.
  terms_version             text,
  terms_accepted_at         timestamptz,
  created_at                timestamptz not null default now()
);

create index if not exists payments_company_id_idx on payments (company_id);
create unique index if not exists payments_stripe_session_id_key
  on payments (stripe_session_id);

alter table payments add column if not exists terms_version text;
alter table payments add column if not exists terms_accepted_at timestamptz;

-- 'pending' fanns inte i ursprungsschemat – används för en Stripe-
-- faktura som skickats men inte betalats än, se src/app/api/invoice.
alter table payments drop constraint if exists payments_status_check;
alter table payments add constraint payments_status_check
  check (status in ('paid','pending','refunded'));

-- Intresseanmälan om att köpa extra synlighet i appen under en
-- period, direkt i portalen. Vilket värde det ger företaget och vad
-- det ska kosta är inte bestämt än – det här är bara underlaget
-- admin behöver för att följa upp intresset.
create table if not exists campaigns (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references companies (id) on delete cascade,
  message           text default '',
  status            text not null default 'intresseanmald'
                      check (status in ('intresseanmald','godkand','aktiv','avvisad')),
  created_at        timestamptz not null default now()
);

create index if not exists campaigns_company_id_idx on campaigns (company_id);
create index if not exists campaigns_status_idx on campaigns (status);
