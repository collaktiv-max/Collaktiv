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
  package_tier      text not null default 'standard'
                      check (package_tier in ('standard','premium')),
  application_status text not null default 'inskickad'
                      check (application_status in ('utkast','inskickad','under_granskning','godkand','avvisad')),
  payment_confirmed boolean not null default false,
  contest_host_interested    boolean not null default false,
  contest_prize_description  text default '',
  password_hash     text not null,
  onboarding_logo             boolean not null default false,
  onboarding_first_offer      boolean not null default false,
  onboarding_profile_complete boolean not null default false,
  onboarding_first_publish    boolean not null default false,
  created_at        timestamptz not null default now()
);

create unique index if not exists companies_contact_email_key
  on companies (lower(contact_email));

create table if not exists offers (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references companies (id) on delete cascade,
  title            text not null,
  description      text not null default '',
  discount_type    text not null default 'procent'
                     check (discount_type in ('procent','belopp','erbjudande')),
  discount_value   text not null default '',
  points_cost      integer not null default 0,
  valid_to         timestamptz,
  terms            text,
  image_emoji      text not null default '🛍️',
  image_data_url   text,
  image_optimized  boolean not null default false,
  status           text not null default 'utkast'
                     check (status in ('utkast','granskas','publicerad','arkiverad')),
  views            integer not null default 0,
  redemptions      integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists offers_company_id_idx on offers (company_id);
create index if not exists offers_status_idx on offers (status);

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
                              check (status in ('paid','refunded')),
  created_at                timestamptz not null default now()
);

create index if not exists payments_company_id_idx on payments (company_id);
create unique index if not exists payments_stripe_session_id_key
  on payments (stripe_session_id);

-- Intresseanmälan om att synas extra i appen på riktade platser. Vad
-- som ingår (pris, längd, exakt vilka platser) bestäms senare – det
-- här är bara underlaget admin behöver för att följa upp.
create table if not exists campaigns (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references companies (id) on delete cascade,
  target_locations  text not null default '',
  message           text default '',
  status            text not null default 'intresseanmald'
                      check (status in ('intresseanmald','godkand','aktiv','avvisad')),
  created_at        timestamptz not null default now()
);

create index if not exists campaigns_company_id_idx on campaigns (company_id);
create index if not exists campaigns_status_idx on campaigns (status);
