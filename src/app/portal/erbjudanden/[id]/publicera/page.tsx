"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { FeatureList } from "@/components/ui/FeatureList";
import { useAppState } from "@/lib/store";
import { REGION } from "@/lib/config";
import type { CompanyProfile, Offer as OfferT, PackageTier } from "@/lib/types";
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
  const searchParams = useSearchParams();
  const { companyOffers, currentCompany, syncCompany, syncOffer, submitOfferForReview } =
    useAppState();
  const [selectedTier, setSelectedTier] = useState<PackageTier>(
    currentCompany?.packageTier ?? "standard"
  );
  const [period, setPeriod] = useState<BillingPeriod>("year");
  const [processing, setProcessing] = useState(false);
  const [invoicing, setInvoicing] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState<{ email: string; dueInDays: number } | null>(
    null
  );
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offer = companyOffers.find((o) => o.id === id);

  // Efter en lyckad Stripe Checkout skickas kunden tillbaka hit med
  // ?session_id=... – servern verifierar betalningen mot Stripe och
  // markerar erbjudandet som inskickat innan den svarar.
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || !currentCompany || !offer) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerifying(true);
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data: { paid?: boolean; company?: CompanyProfile; offer?: OfferT }) => {
        if (!data.paid || !data.company || !data.offer) {
          setError("Betalningen kunde inte bekräftas. Försök igen.");
          return;
        }
        syncCompany(data.company);
        syncOffer(data.offer);
        setDone(true);
        router.replace(`/portal/erbjudanden/${offer.id}/publicera`);
      })
      .catch(() => setError("Kunde inte verifiera betalningen. Försök igen."))
      .finally(() => setVerifying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentCompany, offer]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push("/portal/erbjudanden"), 2800);
    return () => clearTimeout(t);
  }, [done, router]);

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

  const companyApproved = currentCompany.applicationStatus === "godkand";

  // Redan betalat för det valda paketet (t.ex. ett erbjudande som
  // skickades tillbaka för redigering) – skicka bara in på nytt utan
  // att dra en ny betalning.
  const alreadyPaidForTier =
    currentCompany.paymentConfirmed && currentCompany.packageTier === selectedTier;

  async function handlePublish() {
    setProcessing(true);
    setError(null);

    if (alreadyPaidForTier) {
      try {
        await submitOfferForReview(offer!.id);
        setDone(true);
      } catch {
        setError("Kunde inte skicka in erbjudandet. Försök igen om en stund.");
      } finally {
        setProcessing(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer!.id,
          planId: selectedTier,
          period,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Kunde inte starta betalningen.");
      }
      window.location.assign(data.url);
    } catch {
      setError("Kunde inte starta betalningen. Försök igen om en stund.");
      setProcessing(false);
    }
  }

  async function handleInvoice() {
    setInvoicing(true);
    setError(null);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer!.id,
          planId: selectedTier,
          period,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Kunde inte skicka fakturan.");
      }
      setInvoiceSent({ email: currentCompany!.contactEmail, dueInDays: data.dueInDays ?? 30 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka fakturan. Försök igen.");
    } finally {
      setInvoicing(false);
    }
  }

  if (invoiceSent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-brand-border)] bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
            <Check className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]">
            Faktura skickad!
          </h2>
          <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
            Vi har skickat en faktura till <strong>{invoiceSent.email}</strong> med{" "}
            {invoiceSent.dueInDays} dagars betalningsvillkor. Så fort den är betald skickas
            erbjudandet automatiskt in för granskning.
          </p>
          <Button href="/portal/erbjudanden" className="mt-5">
            Tillbaka till erbjudanden
          </Button>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-primary)]" />
          <p className="text-sm font-bold text-[var(--color-brand-muted)]">
            Bekräftar betalningen...
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-brand-border)] bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
            <Check className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]">
            Skickat in för granskning!
          </h2>
          <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
            {companyApproved
              ? "Vi granskar erbjudandet innan det går live i appen för resenärer i " + REGION + ". Godkända partners brukar få besked snabbt."
              : "Vi granskar både er ansökan och erbjudandet. Så fort ni är godkända går det live i appen för resenärer i " + REGION + " – ni får besked via e-post."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Publicera erbjudande"
        subtitle={`"${offer.title}" är sparat som utkast – välj paket för att publicera det.`}
        action={
          <Button href={`/portal/erbjudanden/${offer.id}`} variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} iconPosition="left">
            Tillbaka till redigering
          </Button>
        }
      />

      {(error || searchParams.get("canceled")) && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#f3c9c2] bg-[#fdecea] p-4">
          <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#c0392b]" />
          <p className="text-sm font-semibold text-[#c0392b]">
            {error ?? "Betalningen avbröts – inget har dragits. Försök igen när ni är redo."}
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        {PLANS.map((plan) => {
          const active = selectedTier === plan.id;
          const isPremium = plan.id === "premium";
          const regularMonthly = getMonthly(plan, period);
          const discountedMonthly = getDiscountedMonthly(plan, period);
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl transition ${
                isPremium
                  ? `border-2 bg-gradient-to-b from-[var(--color-brand-secondary)]/70 to-white p-7 pt-8 shadow-lg shadow-[var(--color-brand-primary)]/10 sm:-mt-3 sm:pb-9 ${
                      active
                        ? "border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)] ring-offset-2"
                        : "border-[var(--color-brand-primary)]/60 hover:border-[var(--color-brand-primary)]"
                    }`
                  : `border-2 bg-white p-6 ${
                      active
                        ? "border-[var(--color-brand-primary)] shadow-md"
                        : "border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]/40"
                    }`
              }`}
            >
              {isPremium && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--color-brand-primary)] px-3.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-white shadow-md">
                  Mest populär
                </span>
              )}
              <span
                className={`font-extrabold text-[var(--color-brand-ink)] ${
                  isPremium ? "text-lg" : "text-base"
                }`}
              >
                {plan.name}
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[var(--color-brand-muted)] line-through">
                  {regularMonthly} kr
                </span>
                <span
                  className={`font-extrabold text-[#e0432c] ${isPremium ? "text-2xl" : "text-xl"}`}
                >
                  {discountedMonthly} kr/mån
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--color-brand-muted)]">
                {plan.tagline}
              </p>
              <FeatureList
                features={plan.features}
                checkClassName="text-[var(--color-brand-primary)]"
                className="mt-4"
              />
              <button
                type="button"
                onClick={() => setSelectedTier(plan.id)}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-extrabold transition ${
                  isPremium
                    ? "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)]"
                    : "border-2 border-[var(--color-brand-primary)]/25 bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50"
                }`}
              >
                {active && <Check className="h-4 w-4" strokeWidth={3} />}
                Välj {plan.name}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:flex-row sm:justify-between">
        <p className="text-xs font-medium text-[var(--color-brand-muted)]">
          Ingen bindningstid – pausa eller avsluta när ni vill från portalen.
          {companyApproved
            ? " Vi granskar erbjudandet innan det går live."
            : " Vi granskar er ansökan och erbjudandet tillsammans innan det går live."}
          {!alreadyPaidForTier &&
            " Om er ansökan eller erbjudandet nekas återbetalas beloppet automatiskt."}
        </p>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <Button
            onClick={handlePublish}
            disabled={processing || invoicing}
            size="lg"
            className="w-full sm:w-auto"
            icon={processing ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {processing
              ? "Skickar in..."
              : alreadyPaidForTier
                ? "Skicka in för granskning – redan betalt"
                : `Skicka in för ${formatKr(
                    getDiscountedTotal(
                      PLANS.find((p) => p.id === selectedTier)!,
                      period
                    )
                  )} / ${BILLING_LABELS[period].toLowerCase()}`}
          </Button>
          {!alreadyPaidForTier && (
            <button
              type="button"
              onClick={handleInvoice}
              disabled={processing || invoicing}
              className="text-xs font-bold text-[var(--color-brand-muted)] underline decoration-dotted underline-offset-2 hover:text-[var(--color-brand-primary)] disabled:opacity-50"
            >
              {invoicing ? "Skickar faktura..." : "Betala mot faktura istället (30 dagars betalningsvillkor)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
