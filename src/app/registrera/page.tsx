"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const STEP_LABELS = ["Företagsinfo", "Kontaktinfo", "Konto", "Skicka in"];

interface FormState {
  name: string;
  logoDataUrl?: string;
  website: string;
  description: string;
  category: Category;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  accountEmail: string;
  password: string;
}

const initialForm: FormState = {
  name: "",
  logoDataUrl: undefined,
  website: "",
  description: "",
  category: "mat-dryck",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  accountEmail: "",
  password: "",
};

export default function RegistreraPage() {
  const { registerCompany, login } = useAppState();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canProceed() {
    if (step === 0) return form.name.trim().length > 1;
    if (step === 1)
      return (
        form.contactName.trim().length > 1 &&
        /\S+@\S+\.\S+/.test(form.contactEmail) &&
        form.contactPhone.trim().length > 3
      );
    if (step === 2)
      return /\S+@\S+\.\S+/.test(form.accountEmail) && form.password.length >= 6;
    return true;
  }

  function goNext() {
    if (step === 1 && !form.accountEmail) {
      update("accountEmail", form.contactEmail);
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const email = form.accountEmail || form.contactEmail;
    registerCompany({
      name: form.name,
      logoDataUrl: form.logoDataUrl,
      website: form.website,
      description: form.description,
      category: form.category,
      contactName: form.contactName,
      contactEmail: email,
      contactPhone: form.contactPhone,
    });
    login(email, form.password);
    router.push("/portal");
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
                    <Field label="Logotyp" hint="Valfritt – kan läggas till senare">
                      <LogoUpload
                        value={form.logoDataUrl}
                        onChange={(v) => update("logoDataUrl", v)}
                      />
                    </Field>
                    <Field label="Webbadress" hint="Valfritt">
                      <Input
                        placeholder="https://"
                        value={form.website}
                        onChange={(e) => update("website", e.target.value)}
                      />
                    </Field>
                    <Field label="Kort beskrivning av företaget">
                      <Textarea
                        placeholder="Vad gör ni, och vad gör er speciella?"
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
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
                    <Field label="E-post" required>
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
                  </>
                )}

                {step === 2 && (
                  <>
                    <Field
                      label="E-post för inloggning"
                      required
                      hint="Förifylld från föregående steg – ändra vid behov"
                    >
                      <Input
                        type="email"
                        value={form.accountEmail || form.contactEmail}
                        onChange={(e) => update("accountEmail", e.target.value)}
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
                    <div className="flex items-start gap-2 rounded-xl bg-[var(--color-brand-secondary)] p-4 text-xs font-semibold text-[var(--color-brand-muted)]">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
                      Ni loggas in direkt och kan börja skapa erbjudanden.
                      Publicering kräver att vi godkänt både kontot och
                      erbjudandet.
                    </div>
                  </>
                )}

                {step === 3 && (
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

            {step < 3 ? (
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
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Företagsnamn", value: form.name || "–", step: 0 },
    { label: "Kategori", value: CATEGORY_LABELS[form.category], step: 0 },
    { label: "Webbadress", value: form.website || "–", step: 0 },
    { label: "Kontaktperson", value: form.contactName || "–", step: 1 },
    { label: "E-post (kontakt)", value: form.contactEmail || "–", step: 1 },
    { label: "Telefon", value: form.contactPhone || "–", step: 1 },
    {
      label: "Inloggning",
      value: form.accountEmail || form.contactEmail || "–",
      step: 2,
    },
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
      <p className="mt-4 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
        Ni loggas in i portalen direkt och kan skapa erbjudanden helt
        kostnadsfritt. Er ansökan går samtidigt till vårt team för
        granskning – publicering kräver att vi godkänt både kontot och
        erbjudandet.
      </p>
    </div>
  );
}
