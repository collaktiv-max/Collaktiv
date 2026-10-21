"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, Loader2, Receipt } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { fetchJson } from "@/lib/apiClient";
import { getPlan, getDiscountedTotal, BILLING_LABELS, type BillingPeriod, type PlanId } from "@/lib/pricing";

// Länken i "Glöm inte välja paket"-påminnelsen (se sendPaymentReminderEmail)
// – ett företag kan begära en faktura härifrån helt utan att logga in.
// Tokenen i URL:en (se invoiceRequestToken.ts) är själva autentiseringen,
// giltig i 30 dagar och knuten bara till just det här (skapa en faktura
// åt sig själva), inte en vanlig inloggning.
export default function BegarFakturaPage() {
  return (
    <Suspense fallback={null}>
      <BegarFakturaForm />
    </Suspense>
  );
}

function BegarFakturaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  const [planId, setPlanId] = useState<PlanId>("standard");
  const [period, setPeriod] = useState<BillingPeriod>("year");
  const [name, setName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [reference, setReference] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ email: string; dueInDays: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTokenError("Länken saknar information och kan inte användas.");
      setLoading(false);
      return;
    }
    fetchJson<{ company: { name: string; contactEmail: string } }>(
      `/api/invoice-request?token=${encodeURIComponent(token)}`
    )
      .then(({ company }) => {
        setCompanyName(company.name);
        setCompanyEmail(company.contactEmail);
        setName(company.name);
        setEmail(company.contactEmail);
      })
      .catch((err) => setTokenError(err instanceof Error ? err.message : "Länken är ogiltig."))
      .finally(() => setLoading(false));
  }, [token]);

  const plan = getPlan(planId);
  const amount = getDiscountedTotal(plan, period);
  const canSubmit =
    termsAccepted &&
    name.trim() &&
    orgNumber.trim() &&
    addressLine1.trim() &&
    postalCode.trim() &&
    city.trim();

  async function handleSubmit() {
    setSending(true);
    setError(null);
    try {
      const data = await fetchJson<{ recipientEmail: string; dueInDays: number }>(
        "/api/invoice-request",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            planId,
            period,
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
        }
      );
      setSent({ email: data.recipientEmail, dueInDays: data.dueInDays ?? 30 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka fakturan. Försök igen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-brand-secondary)]/40">
      <header className="border-b border-[var(--color-brand-border)] bg-white">
        <Container className="flex h-16 items-center sm:h-20">
          <Link href="/">
            <Logo />
          </Link>
        </Container>
      </header>

      <div className="flex flex-1 items-start justify-center px-5 py-10 sm:py-14">
        <Container className="max-w-xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-primary)]" />
            </div>
          ) : tokenError ? (
            <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-[#c0392b]" />
              <h1 className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]">
                Länken fungerar inte längre
              </h1>
              <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">{tokenError}</p>
              <Button href="/logga-in" className="mt-5">
                Logga in istället
              </Button>
            </div>
          ) : sent ? (
            <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                <Check className="h-7 w-7" />
              </span>
              <h1 className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]">
                Faktura skickad!
              </h1>
              <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
                Vi har skickat en faktura till <strong>{sent.email}</strong> med {sent.dueInDays} dagars
                betalningsvillkor. Så fort den är betald är paketet aktivt.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-3xl">
                Begär faktura
              </h1>
              <p className="mt-1.5 text-sm font-medium text-[var(--color-brand-muted)]">
                Hej {companyName}! Inget konto behövs – välj paket och fyll i era fakturauppgifter, så
                skickar vi fakturan som PDF till {companyEmail} (eller en annan adress nedan).
              </p>

              <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Paket">
                    <Select value={planId} onChange={(e) => setPlanId(e.target.value as PlanId)}>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </Select>
                  </Field>
                  <Field label="Period">
                    <Select value={period} onChange={(e) => setPeriod(e.target.value as BillingPeriod)}>
                      {(Object.keys(BILLING_LABELS) as BillingPeriod[]).map((p) => (
                        <option key={p} value={p}>
                          {BILLING_LABELS[p]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <p className="-mt-1 text-sm font-extrabold text-[var(--color-brand-ink)]">{amount} kr</p>

                <div className="my-1 border-t border-[var(--color-brand-border)]" />

                <Field label="Företagsnamn (fakturamottagare)" required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
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
                <Field label="Referens/meddelande" hint="Valfritt">
                  <Textarea
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    rows={2}
                  />
                </Field>

                <label className="mt-1 flex items-start gap-2.5 text-xs font-semibold text-[var(--color-brand-ink)]">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-brand-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                  <span>
                    Jag har läst och godkänner Collaktivs{" "}
                    <Link
                      href="/villkor"
                      target="_blank"
                      className="font-bold text-[var(--color-brand-primary)] underline"
                    >
                      villkor
                    </Link>
                    , inklusive betalningsvillkoren.
                  </span>
                </label>

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
            </>
          )}
        </Container>
      </div>
    </div>
  );
}
