"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { LogoUpload } from "@/components/onboarding/LogoUpload";
import { useAppState } from "@/lib/store";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

// Så enkel som möjligt: 3 steg istället för 4, och bara det som
// faktiskt krävs för att skapa kontot och granska ansökan är
// obligatoriskt. Logotyp, webbadress, adress och beskrivning är
// redan designade som EFTER-registrering-steg (se "Lägg till er
// logotyp"/"Komplettera företagsprofilen" i OnboardingChecklist.tsx,
// som länkar till /portal/profil) – de ska alltså inte blockera
// registreringen. Inloggningsmejlet är samma som kontaktmejlet, inget
// separat fält att fylla i eller ta ställning till.
const STEP_LABELS = ["Företag", "Kontakt", "Skicka in"];

interface FormState {
  name: string;
  logoDataUrl?: string;
  website: string;
  description: string;
  category: Category;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  password: string;
  fullServiceRequested: boolean;
}

const initialForm: FormState = {
  name: "",
  logoDataUrl: undefined,
  website: "",
  description: "",
  category: "mat-dryck",
  address: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  password: "",
  fullServiceRequested: false,
};

export default function RegistreraPage() {
  return (
    <Suspense fallback={null}>
      <RegistreraForm />
    </Suspense>
  );
}

function RegistreraForm() {
  const { registerCompany } = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referredByCompanyId, setReferredByCompanyId] = useState<string | undefined>(undefined);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ref) setReferredByCompanyId(ref);
  }, [searchParams]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canProceed() {
    if (step === 0) return form.name.trim().length > 1;
    if (step === 1)
      return (
        form.contactName.trim().length > 1 &&
        /\S+@\S+\.\S+/.test(form.contactEmail) &&
        form.contactPhone.trim().length > 3 &&
        form.password.length >= 6
      );
    return true;
  }

  function goNext() {
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await registerCompany({
      name: form.name,
      logoDataUrl: form.logoDataUrl,
      website: form.website,
      description: form.description,
      category: form.category,
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      address: form.address,
      password: form.password,
      referredByCompanyId,
      fullServiceRequested: form.fullServiceRequested,
    });
    setSubmitting(false);
    if (result.ok) {
      router.push("/portal");
    } else {
      setError(result.reason ?? "Något gick fel, försök igen.");
      setStep(1);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-brand-secondary)]/40">
      <header className="border-b border-[var(--color-brand-border)] bg-white">
        <Container className="flex h-16 items-center justify-between sm:h-20">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/logga-in"
            className="text-sm font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
          >
            Redan partner? Logga in
          </Link>
        </Container>
      </header>

      <Container className="max-w-2xl py-10 sm:py-14">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-brand-ink)] sm:text-3xl">
            Registrera ert företag
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
            Under fem minuter – inget säljsamtal, ingen bindningstid.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--color-brand-border)] bg-white p-6 shadow-sm sm:p-9">
          <StepIndicator steps={STEP_LABELS} current={step} />

          <div className="mt-8 min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {step === 0 && (
                  <>
                    <Field label="Företagsnamn" required>
                      <Input
                        placeholder="T.ex. Café Björken"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </Field>
                    <Field label="Kategori" required>
                      <Select
                        value={form.category}
                        onChange={(e) => update("category", e.target.value as Category)}
                      >
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <div className="my-1 border-t border-[var(--color-brand-border)]" />
                    <p className="-mb-2 text-xs font-bold text-[var(--color-brand-muted)]">
                      Allt nedan är valfritt – fyll i nu eller lägg till senare i profilen.
                    </p>
                    <Field label="Logotyp" hint="Valfritt – kan läggas till senare">
                      <LogoUpload
                        value={form.logoDataUrl}
                        onChange={(v) => update("logoDataUrl", v)}
                      />
                    </Field>
                    <Field label="Adress" hint="Valfritt – visar er för resenärer nära er i appen">
                      <Input
                        placeholder="Gatuadress, ort"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                      />
                    </Field>
                    <Field label="Webbadress" hint="Valfritt">
                      <Input
                        placeholder="https://"
                        value={form.website}
                        onChange={(e) => update("website", e.target.value)}
                      />
                    </Field>
                    <Field label="Kort beskrivning av företaget" hint="Valfritt">
                      <Textarea
                        placeholder="Vad gör ni, och vad gör er speciella?"
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                      />
                    </Field>
                  </>
                )}

                {step === 1 && (
                  <>
                    <Field label="Kontaktperson" required>
                      <Input
                        placeholder="För- och efternamn"
                        value={form.contactName}
                        onChange={(e) => update("contactName", e.target.value)}
                      />
                    </Field>
                    <Field label="E-post" required hint="Används även för att logga in">
                      <Input
                        type="email"
                        placeholder="namn@foretag.se"
                        value={form.contactEmail}
                        onChange={(e) => update("contactEmail", e.target.value)}
                      />
                    </Field>
                    <Field label="Telefonnummer" required>
                      <Input
                        type="tel"
                        placeholder="070-123 45 67"
                        value={form.contactPhone}
                        onChange={(e) => update("contactPhone", e.target.value)}
                      />
                    </Field>
                    <Field label="Lösenord" required hint="Minst 6 tecken">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                      />
                    </Field>
                    <label className="flex items-start gap-2.5 rounded-xl border border-[var(--color-brand-border)] p-4 text-xs font-semibold text-[var(--color-brand-ink)]">
                      <input
                        type="checkbox"
                        checked={form.fullServiceRequested}
                        onChange={(e) => update("fullServiceRequested", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-brand-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                      <span>
                        Vi vill ha hjälp med allt – hör av er till oss istället för att skapa
                        och publicera erbjudanden själva.
                      </span>
                    </label>
                    {form.fullServiceRequested && (
                      <p className="-mt-2 rounded-xl bg-[var(--color-brand-secondary)] px-4 py-3 text-xs font-semibold leading-relaxed text-[var(--color-brand-ink)]">
                        Standard (grundpaketet) är redan gratis och kräver ingen fakturering.
                        Fakturering blir bara aktuellt om ni även vill att vi hjälper er
                        uppgradera till Premium, som är det enda betalda paketet.
                      </p>
                    )}
                    <div className="flex items-start gap-2 rounded-xl bg-[var(--color-brand-secondary)] p-4 text-xs font-semibold text-[var(--color-brand-muted)]">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
                      Ni loggas in direkt och kan börja skapa erbjudanden helt gratis.
                      Publicering kräver att vi godkänt både kontot och erbjudandet.
                    </div>
                    {error && (
                      <p className="rounded-lg bg-[#fdecea] px-3 py-2 text-xs font-bold text-[#c0392b]">
                        {error}
                      </p>
                    )}
                  </>
                )}

                {step === 2 && (
                  <SummaryStep form={form} onEditStep={setStep} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-9 flex items-center justify-between border-t border-[var(--color-brand-border)] pt-6">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                icon={<ArrowLeft className="h-4 w-4" />}
                iconPosition="left"
              >
                Tillbaka
              </Button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <Button
                onClick={goNext}
                disabled={!canProceed()}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Nästa
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                icon={
                  submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )
                }
              >
                {submitting ? "Skapar konto..." : "Skapa konto och logga in"}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

function SummaryStep({
  form,
  onEditStep,
}: {
  form: FormState;
  onEditStep: (step: number) => void;
}) {
  // Valfria fält (adress, webbadress) visas bara i sammanfattningen om
  // de faktiskt fyllts i – annars bara brus i en lista som ska vara
  // snabb att scanna innan man skickar in.
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Företagsnamn", value: form.name || "–", step: 0 },
    { label: "Kategori", value: CATEGORY_LABELS[form.category], step: 0 },
    ...(form.address ? [{ label: "Adress", value: form.address, step: 0 }] : []),
    ...(form.website ? [{ label: "Webbadress", value: form.website, step: 0 }] : []),
    { label: "Kontaktperson", value: form.contactName || "–", step: 1 },
    { label: "E-post (kontakt och inloggning)", value: form.contactEmail || "–", step: 1 },
    { label: "Telefon", value: form.contactPhone || "–", step: 1 },
  ];

  return (
    <div>
      <p className="text-sm font-bold text-[var(--color-brand-ink)]">
        Kontrollera att allt stämmer innan ni skickar in
      </p>
      <div className="mt-4 divide-y divide-[var(--color-brand-border)] overflow-hidden rounded-xl border border-[var(--color-brand-border)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
                {row.label}
              </p>
              <p className="text-sm font-bold text-[var(--color-brand-ink)]">
                {row.value}
              </p>
            </div>
            <button
              onClick={() => onEditStep(row.step)}
              className="shrink-0 text-xs font-extrabold text-[var(--color-brand-primary)] hover:underline"
            >
              Ändra
            </button>
          </div>
        ))}
      </div>
      {form.fullServiceRequested && (
        <p className="mt-4 rounded-xl bg-[var(--color-brand-secondary)] px-4 py-3 text-xs font-bold text-[var(--color-brand-ink)]">
          ⭐ Ni har valt att vi sköter allt åt er – vi hör av oss så fort ansökan är godkänd,
          istället för att ni behöver logga in och göra det själva.
        </p>
      )}
      <p className="mt-4 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
        Ni loggas in i portalen direkt och kan skapa erbjudanden helt
        kostnadsfritt. Er ansökan går samtidigt till vårt team för
        granskning – publicering kräver att vi godkänt både kontot och
        erbjudandet.
      </p>
    </div>
  );
}
