"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CircleDollarSign,
  Clock,
  Gift,
  Mail,
  Phone,
  Rocket,
  ShieldCheck,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  CATEGORY_LABELS,
  type ApplicationStatus,
  type Campaign,
  type CampaignStatus,
  type CompanyProfile,
  type Offer,
  type PackageTier,
} from "@/lib/types";
import type { AdminTab } from "./AdminTabs";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  utkast: "Utkast",
  inskickad: "Inskickad",
  under_granskning: "Under granskning",
  godkand: "Godkänd",
  avvisad: "Avvisad",
};

const APPLICATION_STATUS_VARIANT: Record<ApplicationStatus, "light" | "accent" | "dark" | "outline"> = {
  utkast: "outline",
  inskickad: "light",
  under_granskning: "light",
  godkand: "accent",
  avvisad: "outline",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  intresseanmald: "Intresseanmäld",
  godkand: "Godkänd",
  aktiv: "Aktiv",
  avvisad: "Avvisad",
};

const CAMPAIGN_STATUS_VARIANT: Record<CampaignStatus, "light" | "accent" | "dark" | "outline"> = {
  intresseanmald: "light",
  godkand: "accent",
  aktiv: "dark",
  avvisad: "outline",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-[var(--color-brand-ink)]">{title}</h1>
      <p className="mt-1.5 text-sm font-medium text-[var(--color-brand-muted)]">{description}</p>
    </div>
  );
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  iconBg,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-extrabold text-[var(--color-brand-ink)]">{value}</p>
      <p className="text-[12.5px] font-bold text-[var(--color-brand-muted)]">{label}</p>
    </div>
  );
}

export function ContactCell({ name, email, phone }: { name: string; email: string; phone: string }) {
  return (
    <div>
      <p className="font-bold text-[var(--color-brand-ink)]">{name || "–"}</p>
      <div className="mt-0.5 flex flex-col gap-0.5 text-xs font-medium text-[var(--color-brand-muted)]">
        <span className="flex items-center gap-1.5">
          <Mail className="h-3 w-3" /> {email}
        </span>
        {phone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" /> {phone}
          </span>
        )}
      </div>
    </div>
  );
}

export function PaymentToggle({ confirmed, onToggle }: { confirmed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
        confirmed
          ? "bg-[var(--color-brand-accent)]/15 text-[#3f7a1c]"
          : "bg-[#fdecea] text-[#c0392b]"
      }`}
    >
      {confirmed ? <ShieldCheck className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {confirmed ? "Betald" : "Obetald"}
    </button>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-white p-6 text-center text-sm font-medium text-[var(--color-brand-muted)]">
      {text}
    </div>
  );
}

function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-brand-border)] bg-white">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

function Th({ children, align }: { children: ReactNode; align?: "right" }) {
  return (
    <th className={`px-5 py-3 ${align === "right" ? "text-right" : ""}`}>{children}</th>
  );
}

function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--color-brand-border)] text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
        {children}
      </tr>
    </thead>
  );
}

// ---------- Översikt ----------

export function OversiktSection({
  companies,
  offers,
  campaigns,
  onNavigate,
}: {
  companies: CompanyProfile[];
  offers: Offer[];
  campaigns: Campaign[];
  onNavigate: (tab: AdminTab) => void;
}) {
  const pendingCompanies = companies.filter(
    (c) => c.applicationStatus === "inskickad" || c.applicationStatus === "under_granskning"
  );
  const pendingOffers = offers.filter((o) => o.status === "granskas");
  const payingCompanies = companies.filter((c) => c.paymentConfirmed);
  const pendingCampaigns = campaigns.filter((c) => c.status === "intresseanmald");
  const contestHosts = companies.filter((c) => c.contestHostInterested);

  const actionItems = [
    {
      tab: "ansokningar" as AdminTab,
      label: "Ansökningar att granska",
      count: pendingCompanies.length,
    },
    {
      tab: "erbjudanden" as AdminTab,
      label: "Erbjudanden att granska",
      count: pendingOffers.length,
    },
    {
      tab: "kampanjer" as AdminTab,
      label: "Kampanjer – intresseanmälningar",
      count: pendingCampaigns.length,
    },
  ].filter((item) => item.count > 0);

  return (
    <div>
      <SectionHeader
        title="Översikt"
        description="Läget just nu – hoppa vidare till en kö för att hantera den."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={Building2}
          label="Företag totalt"
          value={companies.length}
          iconBg="bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
        />
        <KpiCard
          icon={Clock}
          label="Väntar på granskning"
          value={pendingCompanies.length}
          iconBg="bg-[#fce8da] text-[#c2703a]"
        />
        <KpiCard
          icon={Ticket}
          label="Erbjudanden att granska"
          value={pendingOffers.length}
          iconBg="bg-[#fdecea] text-[#c0392b]"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Betalande företag"
          value={payingCompanies.length}
          iconBg="bg-[#0f1f18] text-[var(--color-brand-accent)]"
        />
        <KpiCard
          icon={Rocket}
          label="Kampanjintresse"
          value={pendingCampaigns.length}
          iconBg="bg-[var(--color-brand-mint)] text-[var(--color-brand-primary-hover)]"
        />
        <KpiCard
          icon={Gift}
          label="Tävlingsvärdar"
          value={contestHosts.length}
          iconBg="bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
          Kräver åtgärd
        </h2>
        {actionItems.length === 0 ? (
          <div className="mt-3">
            <EmptyRow text="Inget väntar på er just nu – allt är avklarat." />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5">
            {actionItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => onNavigate(item.tab)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-brand-border)] bg-white px-5 py-4 text-left transition hover:border-[var(--color-brand-primary)]/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#e0432c] px-1.5 text-[11px] font-extrabold text-white">
                    {item.count}
                  </span>
                  <span className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--color-brand-muted)]" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Ansökningar ----------

export function ApplicationsSection({
  companies,
  onUpdate,
  onReject,
}: {
  companies: CompanyProfile[];
  onUpdate: (id: string, partial: Partial<CompanyProfile>) => void;
  onReject: (company: CompanyProfile) => void;
}) {
  const pending = companies.filter(
    (c) => c.applicationStatus === "inskickad" || c.applicationStatus === "under_granskning"
  );

  return (
    <div>
      <SectionHeader
        title="Ansökningar att granska"
        description="Godkänn eller avvisa nya företag som skickat in en ansökan."
      />
      {pending.length === 0 ? (
        <EmptyRow text="Inga ansökningar väntar just nu." />
      ) : (
        <TableCard>
          <THead>
            <Th>Företag</Th>
            <Th>Kontakt</Th>
            <Th>Kategori</Th>
            <Th>Paket</Th>
            <Th>Betalning</Th>
            <Th>Inskickad</Th>
            <Th align="right">Åtgärd</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {pending.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">{c.name}</td>
                <td className="px-5 py-3.5">
                  <ContactCell name={c.contactName} email={c.contactEmail} phone={c.contactPhone} />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {CATEGORY_LABELS[c.category]}
                </td>
                <td className="px-5 py-3.5 font-medium capitalize text-[var(--color-brand-muted)]">
                  {c.packageTier}
                </td>
                <td className="px-5 py-3.5">
                  <PaymentToggle
                    confirmed={c.paymentConfirmed}
                    onToggle={() => onUpdate(c.id, { paymentConfirmed: !c.paymentConfirmed })}
                  />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onUpdate(c.id, { applicationStatus: "godkand" })}
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)]"
                    >
                      <Check className="h-3.5 w-3.5" /> Godkänn
                    </button>
                    <button
                      onClick={() => onReject(c)}
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-muted)] hover:border-[#c0392b] hover:text-[#c0392b]"
                    >
                      <X className="h-3.5 w-3.5" /> Avvisa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Erbjudanden ----------

export function OffersSection({
  offers,
  companies,
  onUpdate,
}: {
  offers: Offer[];
  companies: CompanyProfile[];
  onUpdate: (id: string, partial: Partial<Offer>) => void;
}) {
  const pending = offers.filter((o) => o.status === "granskas");

  return (
    <div>
      <SectionHeader
        title="Erbjudanden att granska"
        description="Publicera erbjudanden som skickats in, eller skicka tillbaka dem för redigering."
      />
      {pending.length === 0 ? (
        <EmptyRow text="Inga erbjudanden väntar just nu." />
      ) : (
        <TableCard>
          <THead>
            <Th>Erbjudande</Th>
            <Th>Företag</Th>
            <Th>Rabatt</Th>
            <Th>Inskickat</Th>
            <Th align="right">Åtgärd</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {pending.map((o) => {
              const company = companies.find((c) => c.id === o.companyId);
              return (
                <tr key={o.id}>
                  <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">{o.title}</td>
                  <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                    {company?.name ?? "–"}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                    {o.discountValue}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onUpdate(o.id, { status: "publicerad" })}
                        className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)]"
                      >
                        <Check className="h-3.5 w-3.5" /> Publicera
                      </button>
                      <button
                        onClick={() => onUpdate(o.id, { status: "utkast" })}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-muted)] hover:border-[#c0392b] hover:text-[#c0392b]"
                      >
                        <X className="h-3.5 w-3.5" /> Skicka tillbaka
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Kampanjer ----------

export function CampaignsSection({
  campaigns,
  companies,
  onUpdateStatus,
}: {
  campaigns: Campaign[];
  companies: CompanyProfile[];
  onUpdateStatus: (id: string, status: CampaignStatus) => void;
}) {
  function companyName(companyId: string) {
    return companies.find((c) => c.id === companyId)?.name ?? "–";
  }

  return (
    <div>
      <SectionHeader
        title="Kampanjer – intresseanmälningar"
        description="Företag som vill betala för extra synlighet i appen under en period."
      />
      {campaigns.length === 0 ? (
        <EmptyRow text="Inga kampanjförfrågningar än." />
      ) : (
        <TableCard>
          <THead>
            <Th>Företag</Th>
            <Th>Meddelande</Th>
            <Th>Status</Th>
            <Th>Inskickad</Th>
            <Th align="right">Åtgärd</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">
                  {companyName(c.companyId)}
                </td>
                <td className="max-w-[280px] px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {c.message || "–"}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={CAMPAIGN_STATUS_VARIANT[c.status]}>
                    {CAMPAIGN_STATUS_LABELS[c.status]}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <select
                    value={c.status}
                    onChange={(e) => onUpdateStatus(c.id, e.target.value as CampaignStatus)}
                    className="rounded-lg border border-[var(--color-brand-border)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]"
                  >
                    {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Tävlingsvärdar ----------

export function ContestHostsSection({ companies }: { companies: CompanyProfile[] }) {
  const contestHosts = companies.filter((c) => c.contestHostInterested);

  return (
    <div>
      <SectionHeader
        title="Tävlingsvärdar"
        description="Företag som anmält att de kan bidra med pris till en tävling i appen."
      />
      {contestHosts.length === 0 ? (
        <EmptyRow text="Inga tävlingsvärdar anmälda än." />
      ) : (
        <TableCard>
          <THead>
            <Th>Företag</Th>
            <Th>Kontakt</Th>
            <Th>Erbjuder som pris</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {contestHosts.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">{c.name}</td>
                <td className="px-5 py-3.5">
                  <ContactCell name={c.contactName} email={c.contactEmail} phone={c.contactPhone} />
                </td>
                <td className="max-w-[320px] px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {c.contestPrizeDescription || "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Alla företag ----------

export function CompaniesSection({
  companies,
  onUpdate,
  onReject,
}: {
  companies: CompanyProfile[];
  onUpdate: (id: string, partial: Partial<CompanyProfile>) => void;
  onReject: (company: CompanyProfile) => void;
}) {
  return (
    <div>
      <SectionHeader
        title="Alla företag"
        description="Full översikt – ändra paket, status och betalning direkt."
      />
      {companies.length === 0 ? (
        <EmptyRow text="Inga företag registrerade ännu." />
      ) : (
        <TableCard>
          <THead>
            <Th>Företag</Th>
            <Th>Kontakt</Th>
            <Th>Kategori</Th>
            <Th>Paket</Th>
            <Th>Status</Th>
            <Th>Betalning</Th>
            <Th>Registrerad</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {companies.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">{c.name}</td>
                <td className="px-5 py-3.5">
                  <ContactCell name={c.contactName} email={c.contactEmail} phone={c.contactPhone} />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {CATEGORY_LABELS[c.category]}
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={c.packageTier}
                    onChange={(e) => onUpdate(c.id, { packageTier: e.target.value as PackageTier })}
                    className="rounded-lg border border-[var(--color-brand-border)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={APPLICATION_STATUS_VARIANT[c.applicationStatus]}>
                      {APPLICATION_STATUS_LABELS[c.applicationStatus]}
                    </Badge>
                    <select
                      value={c.applicationStatus}
                      onChange={(e) => {
                        const next = e.target.value as ApplicationStatus;
                        if (next === "avvisad") {
                          onReject(c);
                        } else {
                          onUpdate(c.id, { applicationStatus: next });
                        }
                      }}
                      className="rounded-lg border border-[var(--color-brand-border)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]"
                    >
                      {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <PaymentToggle
                    confirmed={c.paymentConfirmed}
                    onToggle={() => onUpdate(c.id, { paymentConfirmed: !c.paymentConfirmed })}
                  />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {formatDate(c.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
