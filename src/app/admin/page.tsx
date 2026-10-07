"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/apiClient";
import type { Campaign, CampaignStatus, CompanyProfile, Offer } from "@/lib/types";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { AdminTab } from "@/components/admin/AdminTabs";
import {
  ApplicationsSection,
  CampaignsSection,
  CompaniesSection,
  ContestHostsSection,
  OffersSection,
  OversiktSection,
} from "@/components/admin/AdminSections";

export default function AdminPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("oversikt");

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
      manualRefundAmount?: number;
      manualRefundNotes?: string[];
    }>(`/api/admin/companies/${id}`, { method: "PATCH", body: JSON.stringify(partial) });
    setCompanies((cs) => cs.map((c) => (c.id === id ? data.company : c)));
    return data;
  }

  // Att avvisa ett betalt företag återbetalar automatiskt via Stripe –
  // men bara om betalningen faktiskt gick via Stripe (kort, eller en
  // faktura betald på Stripes sida). En faktura betald via
  // banköverjöring har Stripe aldrig haft pengarna för och kan inte
  // återbetala automatiskt – det måste göras manuellt. Be om en extra
  // bekräftelse och visa vad som faktiskt kommer/kan hända.
  async function handleReject(company: CompanyProfile) {
    let confirmText = `Avvisa ${company.name}?`;
    if (company.paymentConfirmed) {
      const { payments } = await fetchJson<{
        payments: { amount: number; status: string; stripePaymentIntentId: string | null }[];
      }>(`/api/admin/payments/${company.id}`);
      const paid = payments.filter((p) => p.status === "paid");
      const autoRefundable = paid.filter((p) => p.stripePaymentIntentId).reduce((s, p) => s + p.amount, 0);
      const manualOnly = paid.filter((p) => !p.stripePaymentIntentId).reduce((s, p) => s + p.amount, 0);
      if (autoRefundable > 0 && manualOnly > 0) {
        confirmText = `${company.name} har betalat ${autoRefundable + manualOnly} kr. ${autoRefundable} kr återbetalas automatiskt via Stripe, men ${manualOnly} kr betalades via banköverföring och måste återbetalas manuellt av er. Fortsätta?`;
      } else if (autoRefundable > 0) {
        confirmText = `${company.name} har betalat ${autoRefundable} kr. Om ni avvisar återbetalas beloppet automatiskt via Stripe. Fortsätta?`;
      } else if (manualOnly > 0) {
        confirmText = `${company.name} har betalat ${manualOnly} kr via banköverföring (faktura). Stripe kan inte återbetala det automatiskt – ni måste återbetala manuellt. Fortsätta ändå med avvisningen?`;
      } else {
        confirmText = `${company.name} har betalat, men beloppet är redan återbetalat. Avvisa ändå?`;
      }
    }
    if (!confirm(confirmText)) return;

    const { refundedAmount, refundErrors, manualRefundAmount, manualRefundNotes } = await updateCompany(
      company.id,
      { applicationStatus: "avvisad" }
    );
    if (refundedAmount && refundedAmount > 0) {
      alert(`${company.name} avvisades. ${refundedAmount} kr återbetalades automatiskt via Stripe.`);
    }
    if (manualRefundAmount && manualRefundAmount > 0) {
      alert(
        `Obs! ${manualRefundAmount} kr måste återbetalas MANUELLT (betalades via banköverföring, inte kort):\n${(manualRefundNotes ?? []).join("\n")}`
      );
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

  const pendingCompaniesCount = companies.filter(
    (c) => c.applicationStatus === "inskickad" || c.applicationStatus === "under_granskning"
  ).length;
  const pendingOffersCount = offers.filter((o) => o.status === "granskas").length;
  const pendingCampaignsCount = campaigns.filter((c) => c.status === "intresseanmald").length;

  const badgeCounts: Partial<Record<AdminTab, number>> = {
    ansokningar: pendingCompaniesCount,
    erbjudanden: pendingOffersCount,
    kampanjer: pendingCampaignsCount,
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-secondary)]/30 lg:flex">
      <AdminSidebar
        activeTab={activeTab}
        onSelect={setActiveTab}
        badgeCounts={badgeCounts}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        {activeTab === "oversikt" && (
          <OversiktSection
            companies={companies}
            offers={offers}
            campaigns={campaigns}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "ansokningar" && (
          <ApplicationsSection
            companies={companies}
            onUpdate={updateCompany}
            onReject={handleReject}
          />
        )}
        {activeTab === "erbjudanden" && (
          <OffersSection offers={offers} companies={companies} onUpdate={updateOffer} />
        )}
        {activeTab === "kampanjer" && (
          <CampaignsSection
            campaigns={campaigns}
            companies={companies}
            onUpdateStatus={updateCampaignStatus}
          />
        )}
        {activeTab === "tavlingsvardar" && <ContestHostsSection companies={companies} />}
        {activeTab === "foretag" && (
          <CompaniesSection companies={companies} onUpdate={updateCompany} onReject={handleReject} />
        )}
      </main>
    </div>
  );
}
