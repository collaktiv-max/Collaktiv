"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Eye,
  Loader2,
  Sparkles,
  Ticket,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAppState } from "@/lib/store";
import { estimateExposure } from "@/lib/mock-stats";
import { REGION } from "@/lib/config";
import type { PackageTier } from "@/lib/types";
import {
  PLANS,
  BILLING_LABELS,
  EARLY_BIRD_SLOTS,
  getMonthly,
  getDiscountedMonthly,
  getDiscountedTotal,
  formatKr,
  type BillingPeriod,
} from "@/lib/pricing";

export default function PubliceraErbjudandePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, currentCompany, publishOffer, updateCompany } = useAppState();
  const [selectedTier, setSelectedTier] = useState<PackageTier>(
    currentCompany?.packageTier ?? "standard"
  );
  const [period, setPeriod] = useState<BillingPeriod>("year");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const offer = state.offers.find((o) => o.id === id);

  if (!currentCompany) return null;

  if (!offer) {
    return (
      <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-10 text-center">
        <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
          Erbjudandet hittades inte
        </p>
        <Button href="/portal/erbjudanden" className="mt-4">
          Tillbaka till erbjudanden
        </Button>
      </div>
    );
  }

  const exposure = estimateExposure(offer.id, selectedTier);

  async function handlePublish() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    updateCompany(currentCompany!.id, { packageTier: selectedTier });
    publishOffer(offer!.id);
    setProcessing(false);
    setDone(true);
    setTimeout(() => router.push("/portal/erbjudanden"), 1800);
  }

  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-brand-border)] bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
            <Check className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]">
            Erbjudandet är publicerat!
          </h2>
          <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
            Det är nu live i appen för resenärer i {REGION}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Publicera erbjudande"
        subtitle={`"${offer.title}" är sparat som utkast – se hur mycket exponering ni får innan ni publicerar.`}
        action={
          <Button href={`/portal/erbjudanden/${offer.id}`} variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} iconPosition="left">
            Tillbaka till redigering
          </Button>
        }
      />

      <div className="rounded-2xl border border-[var(--color-brand-primary)]/20 bg-gradient-to-br from-[var(--color-brand-secondary)] to-white p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[var(--color-brand-primary)]">
          <Sparkles className="h-4 w-4" /> Så mycket kan ni nå
        </div>
        <p className="mt-2 max-w-xl text-sm font-medium text-[var(--color-brand-muted)]">
          Uppskattning baserad på er kategori, plats och valt paket – så ni
          vet vad ni får innan ni betalar något.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ExposureStat
            icon={Eye}
            value={exposure.monthlyViews.toLocaleString("sv-SE")}
            label="Visningar / månad"
          />
          <ExposureStat
            icon={Ticket}
            value={exposure.estRedemptions.toLocaleString("sv-SE")}
            label="Uppskattade inlösningar"
          />
          <ExposureStat
            icon={UserPlus}
            value={exposure.estNewCustomers.toLocaleString("sv-SE")}
            label="Möjliga nya stamkunder"
          />
        </div>
      </div>

      <div className="mb-4 mt-9 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
          Välj paket för att publicera
        </h3>
        <div className="inline-flex items-center rounded-full border border-[var(--color-brand-border)] bg-white p-1">
          {(["sixMonths", "year"] as BillingPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
                period === p
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : "text-[var(--color-brand-muted)]"
              }`}
            >
              {BILLING_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-4 -mt-2 text-xs font-bold text-[#e0432c]">
        De {EARLY_BIRD_SLOTS} första företagen får 20% rabatt på hela paketet – priserna nedan visar det.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const active = selectedTier === plan.id;
          const regularMonthly = getMonthly(plan, period);
          const discountedMonthly = getDiscountedMonthly(plan, period);
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedTier(plan.id)}
              className={`rounded-2xl border-2 p-6 text-left transition ${
                active
                  ? "border-[var(--color-brand-primary)] bg-white shadow-md"
                  : "border-[var(--color-brand-border)] bg-white hover:border-[var(--color-brand-primary)]/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-[var(--color-brand-ink)]">
                  {plan.name}
                </span>
                {plan.id === "premium" && <Badge variant="accent">Mest populär</Badge>}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[var(--color-brand-muted)] line-through">
                  {regularMonthly} kr
                </span>
                <span className="text-xl font-extrabold text-[var(--color-brand-primary)]">
                  {discountedMonthly} kr/mån
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--color-brand-muted)]">
                {plan.tagline}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px] font-medium text-[var(--color-brand-ink)]"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand-primary)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <div
                className={`mt-5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  active
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]"
                    : "border-[var(--color-brand-border)]"
                }`}
              >
                {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:flex-row sm:justify-between">
        <p className="text-xs font-medium text-[var(--color-brand-muted)]">
          Ingen bindningstid – pausa eller avsluta när ni vill från portalen.
          Betalning hanteras säkert i nästa steg.
        </p>
        <Button
          onClick={handlePublish}
          disabled={processing}
          size="lg"
          className="w-full sm:w-auto"
          icon={processing ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          {processing
            ? "Publicerar..."
            : `Publicera för ${formatKr(
                getDiscountedTotal(
                  PLANS.find((p) => p.id === selectedTier)!,
                  period
                )
              )} / ${BILLING_LABELS[period].toLowerCase()}`}
        </Button>
      </div>
    </div>
  );
}

function ExposureStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white/70 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-3 text-2xl font-extrabold text-[var(--color-brand-ink)]">{value}</p>
      <p className="text-xs font-bold text-[var(--color-brand-muted)]">{label}</p>
    </div>
  );
}
