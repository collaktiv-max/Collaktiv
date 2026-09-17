"use client";

import { Eye, Plus, Ticket, Trophy, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { BarChart } from "@/components/portal/BarChart";
import { PremiumGate } from "@/components/portal/PremiumGate";
import { OnboardingChecklist } from "@/components/portal/OnboardingChecklist";
import { ReferralCard } from "@/components/portal/ReferralCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAppState } from "@/lib/store";
import { getPopularHours, getWeeklyViews } from "@/lib/mock-stats";

export default function OversiktPage() {
  const { currentCompany, companyOffers, updateCompany } = useAppState();
  if (!currentCompany) return null;

  const totalViews = companyOffers.reduce((sum, o) => sum + o.stats.views, 0);
  const totalRedemptions = companyOffers.reduce((sum, o) => sum + o.stats.redemptions, 0);
  const conversion = totalViews > 0 ? Math.round((totalRedemptions / totalViews) * 100) : 0;
  const topOffer = [...companyOffers].sort((a, b) => b.stats.views - a.stats.views)[0];

  const weeklyViews = getWeeklyViews(currentCompany.id, Math.max(totalViews, 40));
  const popularHours = getPopularHours(currentCompany.id);
  const isPremium = currentCompany.packageTier === "premium";

  return (
    <div>
      <PageHeader
        title={`Hej, ${currentCompany.name}!`}
        subtitle="Här är en översikt av hur ert erbjudande presterar just nu."
        action={
          <Button href="/portal/erbjudanden/nytt" icon={<Plus className="h-4 w-4" />}>
            Nytt erbjudande
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Eye} label="Visningar totalt" value={totalViews.toLocaleString("sv-SE")} trend="+12% denna vecka" />
        <StatCard icon={Ticket} label="Inlösningar" value={totalRedemptions.toLocaleString("sv-SE")} />
        <StatCard icon={TrendingUp} label="Konverteringsgrad" value={`${conversion}%`} />
        <StatCard
          icon={Trophy}
          label="Mest populära erbjudande"
          value={topOffer ? topOffer.title : "–"}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                  Visningar per veckodag
                </h3>
                <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                  Senaste 7 dagarna
                </p>
              </div>
              {!isPremium && <Badge>Standard</Badge>}
            </div>
            <BarChart data={weeklyViews.map((d) => ({ label: d.day, value: d.value }))} />
          </div>

          {isPremium ? (
            <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                    Mest populära tider
                  </h3>
                  <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                    När erbjudandet ses och löses in mest
                  </p>
                </div>
                <Badge variant="accent">Premium</Badge>
              </div>
              <BarChart data={popularHours.map((d) => ({ label: d.hour, value: d.value }))} />
            </div>
          ) : (
            <PremiumGate onUpgrade={() => updateCompany(currentCompany.id, { packageTier: "premium" })}>
              <div className="p-6">
                <h3 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                  Mest populära tider
                </h3>
                <div className="mt-5">
                  <BarChart data={popularHours.map((d) => ({ label: d.hour, value: d.value }))} />
                </div>
              </div>
            </PremiumGate>
          )}

          {isPremium ? (
            <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6">
              <h3 className="mb-4 text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                Erbjudanden i detalj
              </h3>
              <OfferTable offers={companyOffers} />
            </div>
          ) : (
            <PremiumGate
              title="Erbjudanden i detalj"
              description="Se visningar, inlösningar och konvertering per erbjudande med Premium."
              onUpgrade={() => updateCompany(currentCompany.id, { packageTier: "premium" })}
            >
              <div className="p-6">
                <h3 className="mb-4 text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                  Erbjudanden i detalj
                </h3>
                <OfferTable offers={companyOffers} />
              </div>
            </PremiumGate>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <OnboardingChecklist company={currentCompany} />
          <ReferralCard />
        </div>
      </div>
    </div>
  );
}

function OfferTable({ offers }: { offers: { id: string; title: string; stats: { views: number; redemptions: number } }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
            <th className="pb-2 pr-4">Erbjudande</th>
            <th className="pb-2 pr-4">Visningar</th>
            <th className="pb-2 pr-4">Inlösningar</th>
            <th className="pb-2">Konvertering</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-brand-border)]">
          {offers.map((o) => (
            <tr key={o.id} className="font-bold text-[var(--color-brand-ink)]">
              <td className="py-2.5 pr-4">{o.title}</td>
              <td className="py-2.5 pr-4 font-medium text-[var(--color-brand-muted)]">
                {o.stats.views}
              </td>
              <td className="py-2.5 pr-4 font-medium text-[var(--color-brand-muted)]">
                {o.stats.redemptions}
              </td>
              <td className="py-2.5 font-medium text-[var(--color-brand-muted)]">
                {o.stats.views > 0
                  ? `${Math.round((o.stats.redemptions / o.stats.views) * 100)}%`
                  : "–"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
