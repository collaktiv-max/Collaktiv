"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  CircleDollarSign,
  Clock,
  Gift,
  LogOut,
  Mail,
  Phone,
  Rocket,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { fetchJson } from "@/lib/apiClient";
import {
  CATEGORY_LABELS,
  type ApplicationStatus,
  type Campaign,
  type CampaignStatus,
  type CompanyProfile,
  type Offer,
  type PackageTier,
} from "@/lib/types";

const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
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

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ companies }, { offers }, { campaigns }] = await Promise.all([
        fetchJson<{ companies: CompanyProfile[] }>("/api/admin/companies"),
        fetchJson<{ offers: Offer[] }>("/api/admin/offers"),
        fetchJson<{ campaigns: Campaign[] }>("/api/admin/campaigns"),
      ]);
      if (cancelled) return;
      setCompanies(companies);
      setOffers(offers);
      setCampaigns(campaigns);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateCompany(id: string, partial: Partial<CompanyProfile>) {
    const data = await fetchJson<{
      company: CompanyProfile;
      refundedAmount?: number;
      refundErrors?: string[];
    }>(`/api/admin/companies/${id}`, { method: "PATCH", body: JSON.stringify(partial) });
    setCompanies((cs) => cs.map((c) => (c.id === id ? data.company : c)));
    return data;
  }

  // Att avvisa ett betalt företag återbetalar automatiskt – be om en
  // extra bekräftelse och visa vad som faktiskt hände.
  async function handleReject(company: CompanyProfile) {
    let confirmText = `Avvisa ${company.name}?`;
    if (company.paymentConfirmed) {
      const { payments } = await fetchJson<{ payments: { amount: number; status: string }[] }>(
        `/api/admin/payments/${company.id}`
      );
      const unpaidTotal = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0);
      confirmText =
        unpaidTotal > 0
          ? `${company.name} har betalat ${unpaidTotal} kr. Om ni avvisar återbetalas beloppet automatiskt via Stripe. Fortsätta?`
          : `${company.name} har betalat, men beloppet är redan återbetalat. Avvisa ändå?`;
    }
    if (!confirm(confirmText)) return;

    const { refundedAmount, refundErrors } = await updateCompany(company.id, {
      applicationStatus: "avvisad",
    });
    if (refundedAmount && refundedAmount > 0) {
      alert(`${company.name} avvisades. ${refundedAmount} kr återbetalades automatiskt.`);
    }
    if (refundErrors && refundErrors.length > 0) {
      alert(`Obs! Återbetalning misslyckades:\n${refundErrors.join("\n")}`);
    }
  }

  async function updateOffer(id: string, partial: Partial<Offer>) {
    const { offer } = await fetchJson<{ offer: Offer }>(`/api/admin/offers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(partial),
    });
    setOffers((os) => os.map((o) => (o.id === id ? offer : o)));
  }

  async function updateCampaignStatus(id: string, status: CampaignStatus) {
    const { campaign } = await fetchJson<{ campaign: Campaign }>(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setCampaigns((cs) => cs.map((c) => (c.id === id ? campaign : c)));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-brand-secondary)]/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent" />
      </div>
    );
  }

  const pendingCompanies = companies.filter(
    (c) => c.applicationStatus === "inskickad" || c.applicationStatus === "under_granskning"
  );
  const pendingOffers = offers.filter((o) => o.status === "granskas");
  const payingCompanies = companies.filter((c) => c.paymentConfirmed);
  const pendingCampaigns = campaigns.filter((c) => c.status === "intresseanmald");
  const contestHosts = companies.filter((c) => c.contestHostInterested);

  function companyName(companyId: string) {
    return companies.find((c) => c.id === companyId)?.name ?? "–";
  }

  return (
    <div className="min-h-screen bg-[var(--color-brand-secondary)]/30">
      <header className="border-b border-[var(--color-brand-border)] bg-[#0f1f18]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo textClassName="text-white" />
            <Badge variant="translucent">Adminpanel</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-white/50">
              Endast för internt bruk
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-extrabold text-white/80 hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Logga ut
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <h1 className="text-2xl font-extrabold text-[var(--color-brand-ink)]">
          Ansökningar, granskning &amp; betalningar
        </h1>
        <p className="mt-1.5 text-sm font-medium text-[var(--color-brand-muted)]">
          Hantera företagens ansökningar, erbjudanden och kontaktuppgifter på ett ställe.
        </p>

        {/* KPI-rad */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard icon={Building2} label="Företag totalt" value={companies.length} />
          <KpiCard icon={Clock} label="Väntar på granskning" value={pendingCompanies.length} />
          <KpiCard icon={Ticket} label="Erbjudanden att granska" value={pendingOffers.length} />
          <KpiCard icon={CircleDollarSign} label="Betalande företag" value={payingCompanies.length} />
          <KpiCard icon={Rocket} label="Kampanjintresse" value={pendingCampaigns.length} />
          <KpiCard icon={Gift} label="Tävlingsvärdar" value={contestHosts.length} />
        </div>

        {/* Ansökningar att granska */}
        <section className="mt-10">
          <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
            Ansökningar att granska
          </h2>
          <p className="mt-1 text-xs font-medium text-[var(--color-brand-muted)]">
            Godkänn eller avvisa nya företag som skickat in en ansökan.
          </p>

          {pendingCompanies.length === 0 ? (
            <EmptyRow text="Inga ansökningar väntar just nu." />
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                    <th className="px-5 py-3">Företag</th>
                    <th className="px-5 py-3">Kontakt</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Paket</th>
                    <th className="px-5 py-3">Betalning</th>
                    <th className="px-5 py-3">Inskickad</th>
                    <th className="px-5 py-3 text-right">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-brand-border)]">
                  {pendingCompanies.map((c) => (
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
                          onToggle={() => updateCompany(c.id, { paymentConfirmed: !c.paymentConfirmed })}
                        />
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateCompany(c.id, { applicationStatus: "godkand" })}
                            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)]"
                          >
                            <Check className="h-3.5 w-3.5" /> Godkänn
                          </button>
                          <button
                            onClick={() => handleReject(c)}
                            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-muted)] hover:border-[#c0392b] hover:text-[#c0392b]"
                          >
                            <X className="h-3.5 w-3.5" /> Avvisa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Erbjudanden att granska */}
        <section className="mt-10">
          <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
            Erbjudanden att granska
          </h2>
          <p className="mt-1 text-xs font-medium text-[var(--color-brand-muted)]">
            Publicera erbjudanden som skickats in, eller skicka tillbaka dem för redigering.
          </p>

          {pendingOffers.length === 0 ? (
            <EmptyRow text="Inga erbjudanden väntar just nu." />
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                    <th className="px-5 py-3">Erbjudande</th>
                    <th className="px-5 py-3">Företag</th>
                    <th className="px-5 py-3">Rabatt</th>
                    <th className="px-5 py-3">Inskickat</th>
                    <th className="px-5 py-3 text-right">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-brand-border)]">
                  {pendingOffers.map((o) => {
                    const company = companies.find((c) => c.id === o.companyId);
                    return (
                      <tr key={o.id}>
                        <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">
                          {o.title}
                        </td>
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
                              onClick={() => updateOffer(o.id, { status: "publicerad" })}
                              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)]"
                            >
                              <Check className="h-3.5 w-3.5" /> Publicera
                            </button>
                            <button
                              onClick={() => updateOffer(o.id, { status: "utkast" })}
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
              </table>
            </div>
          )}
        </section>

        {/* Kampanjförfrågningar */}
        <section className="mt-10">
          <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
            Kampanjer – intresseanmälningar
          </h2>
          <p className="mt-1 text-xs font-medium text-[var(--color-brand-muted)]">
            Företag som vill betala för extra synlighet på riktade platser i appen.
          </p>

          {campaigns.length === 0 ? (
            <EmptyRow text="Inga kampanjförfrågningar än." />
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                    <th className="px-5 py-3">Företag</th>
                    <th className="px-5 py-3">Platser</th>
                    <th className="px-5 py-3">Meddelande</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Inskickad</th>
                    <th className="px-5 py-3 text-right">Åtgärd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-brand-border)]">
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">
                        {companyName(c.companyId)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                        {c.targetLocations}
                      </td>
                      <td className="max-w-[220px] px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
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
                      <td className="px-5 py-3.5">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            updateCampaignStatus(c.id, e.target.value as CampaignStatus)
                          }
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
              </table>
            </div>
          )}
        </section>

        {/* Tävlingsvärdar */}
        <section className="mt-10">
          <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
            Tävlingsvärdar
          </h2>
          <p className="mt-1 text-xs font-medium text-[var(--color-brand-muted)]">
            Företag som anmält att de kan bidra med pris till en tävling i appen.
          </p>

          {contestHosts.length === 0 ? (
            <EmptyRow text="Inga tävlingsvärdar anmälda än." />
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-brand-border)] bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                    <th className="px-5 py-3">Företag</th>
                    <th className="px-5 py-3">Kontakt</th>
                    <th className="px-5 py-3">Erbjuder som pris</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-brand-border)]">
                  {contestHosts.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">
                        {c.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <ContactCell name={c.contactName} email={c.contactEmail} phone={c.contactPhone} />
                      </td>
                      <td className="max-w-[320px] px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                        {c.contestPrizeDescription || "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Alla företag */}
        <section className="mt-10">
          <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
            Alla företag
          </h2>
          <p className="mt-1 text-xs font-medium text-[var(--color-brand-muted)]">
            Full översikt – ändra paket, status och betalning direkt.
          </p>

          {companies.length === 0 ? (
            <EmptyRow text="Inga företag registrerade ännu." />
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-brand-border)] bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-brand-border)] text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                    <th className="px-5 py-3">Företag</th>
                    <th className="px-5 py-3">Kontakt</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Paket</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Betalning</th>
                    <th className="px-5 py-3">Registrerad</th>
                  </tr>
                </thead>
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
                          onChange={(e) =>
                            updateCompany(c.id, { packageTier: e.target.value as PackageTier })
                          }
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
                                handleReject(c);
                              } else {
                                updateCompany(c.id, { applicationStatus: next });
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
                          onToggle={() => updateCompany(c.id, { paymentConfirmed: !c.paymentConfirmed })}
                        />
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-extrabold text-[var(--color-brand-ink)]">{value}</p>
      <p className="text-[12.5px] font-bold text-[var(--color-brand-muted)]">{label}</p>
    </div>
  );
}

function ContactCell({ name, email, phone }: { name: string; email: string; phone: string }) {
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

function PaymentToggle({ confirmed, onToggle }: { confirmed: boolean; onToggle: () => void }) {
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

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-white p-6 text-center text-sm font-medium text-[var(--color-brand-muted)]">
      {text}
    </div>
  );
}
