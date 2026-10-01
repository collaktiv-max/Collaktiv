"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Clock, Eye, Plus, Ticket, Trophy, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { PremiumGate } from "@/components/portal/PremiumGate";
import { OnboardingChecklist } from "@/components/portal/OnboardingChecklist";
import { RedemptionGuideCard } from "@/components/portal/RedemptionGuideCard";
import { ReferralCard } from "@/components/portal/ReferralCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAppState } from "@/lib/store";

const UNLOCK_DESCRIPTION = "Lås upp genom att välja ett paket när ni publicerar ett erbjudande.";
const UNLOCK_CTA = "Lås upp med ett paket";

export default function OversiktPage() {
  const { currentCompany, companyOffers } = useAppState();
  const router = useRouter();
  if (!currentCompany) return null;

  const totalViews = companyOffers.reduce((sum, o) => sum + o.stats.views, 0);
  const totalRedemptions = companyOffers.reduce((sum, o) => sum + o.stats.redemptions, 0);
  const conversion = totalViews > 0 ? Math.round((totalRedemptions / totalViews) * 100) : 0;
  const topOffer = [...companyOffers].sort((a, b) => b.stats.views - a.stats.views)[0];

  // All statistik kräver ett betalt paket. Vilken statistik som sedan
  // låses upp beror på Standard eller Premium.
  const hasPaid = currentCompany.paymentConfirmed;
  const isPremium = currentCompany.packageTier === "premium";
  const premiumUnlocked = hasPaid && isPremium;

  const goUnlock = () => router.push("/portal/erbjudanden");

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

      {(currentCompany.applicationStatus === "inskickad" ||
        currentCompany.applicationStatus === "under_granskning") && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[var(--color-brand-accent)]/30 bg-[var(--color-brand-secondary)] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)]">
            <Clock className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
              Ert konto granskas
            </p>
            <p className="text-xs font-medium text-[var(--color-brand-muted)]">
              Ni kan skapa och förbereda erbjudanden fritt under tiden. Publicering
              kräver att vi godkänt både kontot och erbjudandet – ni får besked via
              e-post inom 1–2 dagar.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Visningar totalt"
          value={totalViews.toLocaleString("sv-SE")}
          locked={!hasPaid}
          lockReason="payment"
          onUpgrade={goUnlock}
        />
        <StatCard
          icon={Ticket}
          label="Inlösningar"
          value={totalRedemptions.toLocaleString("sv-SE")}
          locked={!premiumUnlocked}
          lockReason={hasPaid ? "premium" : "payment"}
          onUpgrade={goUnlock}
        />
        <StatCard
          icon={TrendingUp}
          label="Konverteringsgrad"
          value={`${conversion}%`}
          locked={!premiumUnlocked}
          lockReason={hasPaid ? "premium" : "payment"}
          onUpgrade={goUnlock}
        />
        <StatCard
          icon={Trophy}
          label="Mest populära erbjudande"
          value={topOffer ? topOffer.title : "–"}
          locked={!premiumUnlocked}
          lockReason={hasPaid ? "premium" : "payment"}
          onUpgrade={goUnlock}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {hasPaid ? (
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
              <StatsPlaceholder />
            </div>
          ) : (
            <PremiumGate
              title="Visningar per veckodag"
              description={UNLOCK_DESCRIPTION}
              ctaLabel={UNLOCK_CTA}
              onUpgrade={goUnlock}
            />
          )}

          {premiumUnlocked ? (
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
              <StatsPlaceholder />
            </div>
          ) : (
            <PremiumGate
              title="Mest populära tider"
              description={
                hasPaid
                  ? "Uppgradera till Premium för att se när erbjudandet ses och löses in mest."
                  : UNLOCK_DESCRIPTION
              }
              ctaLabel={hasPaid ? "Uppgradera till Premium" : UNLOCK_CTA}
              onUpgrade={goUnlock}
            />
          )}

          {premiumUnlocked ? (
            <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6">
              <h3 className="mb-4 text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                Erbjudanden i detalj
              </h3>
              <OfferTable offers={companyOffers} />
            </div>
          ) : (
            <PremiumGate
              title="Erbjudanden i detalj"
              description={
                hasPaid
                  ? "Se visningar, inlösningar och konvertering per erbjudande med Premium."
                  : UNLOCK_DESCRIPTION
              }
              ctaLabel={hasPaid ? "Uppgradera till Premium" : UNLOCK_CTA}
              onUpgrade={goUnlock}
            />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <OnboardingChecklist company={currentCompany} />
          <RedemptionGuideCard />
          <ReferralCard />
        </div>
      </div>
    </div>
  );
}

function StatsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-secondary)]/60 py-12 text-center">
      <BarChart3 className="h-5 w-5 text-[var(--color-brand-muted)]" />
      <p className="text-xs font-bold text-[var(--color-brand-ink)]">Ingen statistik ännu</p>
      <p className="max-w-[240px] text-[11px] font-medium text-[var(--color-brand-muted)]">
        Kopplas in så snart appen har lanserat och erbjudandet börjar synas
        för resenärer.
      </p>
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
