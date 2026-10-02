"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CreditCard,
  Download,
  Gift,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LogoUpload } from "@/components/onboarding/LogoUpload";
import { useAppState } from "@/lib/store";
import { fetchJson } from "@/lib/apiClient";
import { generateStatsPdf } from "@/lib/pdf";
import { getPlan, BILLING_LABELS, formatKr, type BillingPeriod } from "@/lib/pricing";
import { CATEGORY_LABELS, type Category, type CompanyProfile, type Payment } from "@/lib/types";

function SavedPill({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-brand-primary)]">
      <Check className="h-3.5 w-3.5" /> Sparat
    </span>
  );
}

export default function ProfilPage() {
  const { currentCompany, updateCompany } = useAppState();
  if (!currentCompany) return null;

  return (
    <div>
      <PageHeader title="Profil" subtitle="Hantera företagsinformation, konto och paket." />
      <div className="flex flex-col gap-6">
        <CompanyInfoCard
          companyId={currentCompany.id}
          initial={currentCompany}
          checklist={currentCompany.onboardingChecklist}
          updateCompany={updateCompany}
        />
        <ContactCard companyId={currentCompany.id} initial={currentCompany} updateCompany={updateCompany} />
        <AccountCard email={currentCompany.contactEmail} />
        <BillingCard company={currentCompany} />
      </div>
    </div>
  );
}

type UpdateFn = (id: string, partial: Record<string, unknown>) => void;

function CompanyInfoCard({
  companyId,
  initial,
  checklist,
  updateCompany,
}: {
  companyId: string;
  initial: {
    name: string;
    logoDataUrl?: string;
    website?: string;
    description?: string;
    category: Category;
    address?: string;
  };
  checklist: { logo: boolean; firstOffer: boolean; profileComplete: boolean; firstPublish: boolean };
  updateCompany: UpdateFn;
}) {
  const [name, setName] = useState(initial.name);
  const [logo, setLogo] = useState(initial.logoDataUrl);
  const [website, setWebsite] = useState(initial.website ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [category, setCategory] = useState<Category>(initial.category);
  const [address, setAddress] = useState(initial.address ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateCompany(companyId, {
      name,
      logoDataUrl: logo,
      website,
      description,
      category,
      address,
      onboardingChecklist: {
        ...checklist,
        logo: !!logo,
        profileComplete: !!(name && description),
      },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
      <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">Företagsinfo</h2>
      <div className="mt-5 flex flex-col gap-5">
        <Field label="Logotyp">
          <LogoUpload value={logo} onChange={setLogo} />
        </Field>
        <Field label="Företagsnamn" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Webbadress">
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
          </Field>
          <Field label="Kategori" required>
            <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Adress" hint="Används för att visa er för resenärer nära er i appen">
          <Input
            placeholder="Gatuadress, ort"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>
        <Field label="Beskrivning">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--color-brand-border)] pt-5">
        <SavedPill show={saved} />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          Spara
        </Button>
      </div>
    </div>
  );
}

function ContactCard({
  companyId,
  initial,
  updateCompany,
}: {
  companyId: string;
  initial: { contactName: string; contactEmail: string; contactPhone: string };
  updateCompany: UpdateFn;
}) {
  const [contactName, setContactName] = useState(initial.contactName);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateCompany(companyId, { contactName, contactEmail, contactPhone });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
      <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">Kontaktperson</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Namn" required>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </Field>
        <Field label="Telefon" required>
          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </Field>
        <Field label="E-post" required className="sm:col-span-2">
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </Field>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--color-brand-border)] pt-5">
        <SavedPill show={saved} />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          Spara
        </Button>
      </div>
    </div>
  );
}

function AccountCard({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!password) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/company/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunde inte uppdatera lösenordet.");
      setSaved(true);
      setPassword("");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte uppdatera lösenordet.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
      <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">Konto</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Inloggnings-e-post">
          <Input value={email} disabled className="opacity-60" />
        </Field>
        <Field label="Nytt lösenord" hint="Lämna tomt för att behålla nuvarande">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-[#fdecea] px-3 py-2 text-xs font-bold text-[#c0392b]">
          {error}
        </p>
      )}
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--color-brand-border)] pt-5">
        <SavedPill show={saved} />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !password}
          icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          Uppdatera lösenord
        </Button>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

function InfoRow({ icon: Icon, label, description }: { icon: typeof ShieldCheck; label: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-extrabold text-[var(--color-brand-ink)]">{label}</p>
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function BillingCard({ company }: { company: CompanyProfile }) {
  const router = useRouter();
  const { companyOffers } = useAppState();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExportPdf() {
    setExporting(true);
    try {
      generateStatsPdf(company, companyOffers);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchJson<{ payments: Payment[] }>("/api/payments")
      .then((data) => {
        if (!cancelled) setPayments(data.payments);
      })
      .catch(() => {
        if (!cancelled) setPayments([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goToPackages = () => router.push("/portal/erbjudanden");
  const latestPaid = payments?.find((p) => p.status === "paid");

  if (!company.paymentConfirmed) {
    return (
      <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
        <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">Paket & fakturering</h2>
        <div className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-brand-muted)]">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">Inget aktivt paket</p>
              <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                Välj Standard eller Premium och betala när ni publicerar ert erbjudande.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={goToPackages}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Se paket och betala
          </Button>
        </div>
      </div>
    );
  }

  const plan = getPlan(company.packageTier);

  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
      <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">Paket & fakturering</h2>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">{plan.name}</p>
              <Badge variant="accent">Betalt</Badge>
            </div>
            <p className="text-xs font-medium text-[var(--color-brand-muted)]">
              {latestPaid
                ? `${formatKr(latestPaid.amount)} · ${BILLING_LABELS[latestPaid.period as BillingPeriod] ?? latestPaid.period} · betalat ${formatDate(latestPaid.createdAt)}`
                : plan.tagline}
            </p>
          </div>
        </div>
        {company.packageTier === "standard" && (
          <Button size="sm" variant="outline" onClick={goToPackages}>
            Uppgradera till Premium
          </Button>
        )}
      </div>

      {company.bonusAccessUntil && new Date(company.bonusAccessUntil) > new Date() && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--color-brand-accent)]/30 bg-[var(--color-brand-mint)]/30 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-brand-primary)]">
            <Gift className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-extrabold text-[var(--color-brand-ink)]">
              Bonus från inbjudningar
            </p>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
              Ett företag ni bjöd in har registrerat sig och betalat – ni
              har fått en gratis bonusmånad inräknad till och med{" "}
              {formatDate(company.bonusAccessUntil)}.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 border-t border-[var(--color-brand-border)] pt-5 sm:grid-cols-3">
        <InfoRow
          icon={ShieldCheck}
          label="Ingen bindningstid"
          description="Pausa eller avsluta när ni vill – nästa publicering är alltid ett fritt val."
        />
        <InfoRow
          icon={RefreshCcw}
          label="Automatisk återbetalning"
          description="Om er ansökan eller ett erbjudande nekas efter betalning återbetalas beloppet automatiskt till ert kort."
        />
        <InfoRow
          icon={Mail}
          label="Kvitto"
          description="Ett kvitto för varje betalning skickas automatiskt till er e-post av Stripe."
        />
      </div>

      <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-brand-primary)]">
            <Download className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-extrabold text-[var(--color-brand-ink)]">Statistikrapport</p>
            <p className="text-xs font-medium text-[var(--color-brand-muted)]">
              {company.packageTier === "premium"
                ? "Full rapport med statistik per erbjudande."
                : "Rapport med totala visningar. Uppgradera till Premium för fullständig statistik."}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportPdf}
          disabled={exporting}
          icon={exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        >
          Exportera PDF
        </Button>
      </div>

      {payments && payments.length > 0 && (
        <div className="mt-6 border-t border-[var(--color-brand-border)] pt-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
            Betalningshistorik
          </p>
          <div className="mt-2 divide-y divide-[var(--color-brand-border)]">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-[var(--color-brand-ink)]">
                    {getPlan(p.planId as CompanyProfile["packageTier"]).name} ·{" "}
                    {BILLING_LABELS[p.period as BillingPeriod] ?? p.period}
                  </p>
                  <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--color-brand-ink)]">{formatKr(p.amount)}</p>
                  <Badge variant={p.status === "refunded" ? "outline" : "accent"}>
                    {p.status === "refunded" ? "Återbetald" : "Betald"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
