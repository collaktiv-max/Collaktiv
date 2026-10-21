"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2, Receipt } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { useAppState } from "@/lib/store";
import { getPlan, getDiscountedTotal, BILLING_LABELS, type BillingPeriod, type PlanId } from "@/lib/pricing";

// Egen sida för fakturauppgifter istället för att skicka fakturan
// direkt från paket-/publiceringssidan – en riktig svensk faktura
// behöver företagets juridiska namn, organisationsnummer och
// fakturaadress, som inte nödvändigtvis är desamma som kontaktnamnet/
// adressen från registreringen. Navigeras hit med plan/period (och
// offerId när betalningen hör ihop med en publicering) som query-
// parametrar, se /portal/paket och /portal/erbjudanden/[id]/publicera.
export default function FakturaPage() {
  return (
    <Suspense fallback={null}>
      <FakturaForm />
    </Suspense>
  );
}

function FakturaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentCompany } = useAppState();

  const planId = (searchParams.get("planId") as PlanId) || "standard";
  const period = (searchParams.get("period") as BillingPeriod) || "year";
  const offerId = searchParams.get("offerId") ?? undefined;
  const termsAccepted = searchParams.get("termsAccepted") === "1";

  const [name, setName] = useState(currentCompany?.name ?? "");
  const [orgNumber, setOrgNumber] = useState("");
  const [email, setEmail] = useState(currentCompany?.contactEmail ?? "");
  const [addressLine1, setAddressLine1] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [reference, setReference] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ email: string; dueInDays: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentCompany) return null;

  const plan = getPlan(planId);
  const amount = getDiscountedTotal(plan, period);
  const canSubmit =
    name.trim() && orgNumber.trim() && addressLine1.trim() && postalCode.trim() && city.trim();

  async function handleSubmit() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          period,
          offerId,
          termsAccepted,
          billingOverride: {
            name: name.trim(),
            orgNumber: orgNumber.trim(),
            email: email.trim() || undefined,
            addressLine1: addressLine1.trim(),
            postalCode: postalCode.trim(),
            city: city.trim(),
            reference: reference.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Kunde inte skicka fakturan.");
      }
      setSent({ email: data.recipientEmail ?? email.trim(), dueInDays: data.dueInDays ?? 30 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka fakturan. Försök igen.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
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
            Vi har skickat en faktura till <strong>{sent.email}</strong> med {sent.dueInDays} dagars
            betalningsvillkor. Så fort den är betald är paketet aktivt.
          </p>
          <Button href="/portal" className="mt-5">
            Till översikten
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Fakturauppgifter"
        subtitle={`${plan.name} · ${BILLING_LABELS[period]} · ${amount} kr. Ange företagets uppgifter så vi ställer ut fakturan rätt.`}
        action={
          <Button
            variant="ghost"
            onClick={() => router.back()}
            icon={<ArrowLeft className="h-4 w-4" />}
            iconPosition="left"
          >
            Tillbaka
          </Button>
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
        <Field label="Företagsnamn (fakturamottagare)" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Naturkompaniet AB" />
        </Field>
        <Field label="Organisationsnummer" required>
          <Input
            value={orgNumber}
            onChange={(e) => setOrgNumber(e.target.value)}
            placeholder="XXXXXX-XXXX"
          />
        </Field>
        <Field label="Fakturamejl" hint="Dit fakturan och betalningslänken skickas">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <Field label="Adress" required className="sm:col-span-3 sm:order-1">
            <Input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Gatuadress eller box"
            />
          </Field>
          <Field label="Postnummer" required className="sm:order-2">
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="123 45" />
          </Field>
          <Field label="Ort" required className="sm:col-span-2 sm:order-3">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
        </div>
        <Field label="Referens/meddelande" hint="Valfritt – t.ex. butiksnummer eller en kontaktperson">
          <Textarea
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            rows={2}
            placeholder="T.ex. Store 82, enligt överenskommelse med ..."
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-[#fdecea] px-3 py-2 text-xs font-bold text-[#c0392b]">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || sending}
          size="lg"
          className="mt-2 w-full sm:w-auto sm:self-end"
          icon={sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
        >
          {sending ? "Skickar faktura..." : "Skicka faktura"}
        </Button>
      </div>
    </div>
  );
}
