"use client";

import { useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LogoUpload } from "@/components/onboarding/LogoUpload";
import { useAppState } from "@/lib/store";
import { CATEGORY_LABELS, type Category, type PackageTier } from "@/lib/types";

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
        <BillingCard tier={currentCompany.packageTier} companyId={currentCompany.id} updateCompany={updateCompany} />
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
  initial: { name: string; logoDataUrl?: string; website?: string; description?: string; category: Category };
  checklist: { logo: boolean; firstOffer: boolean; profileComplete: boolean; firstPublish: boolean };
  updateCompany: UpdateFn;
}) {
  const [name, setName] = useState(initial.name);
  const [logo, setLogo] = useState(initial.logoDataUrl);
  const [website, setWebsite] = useState(initial.website ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [category, setCategory] = useState<Category>(initial.category);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateCompany(companyId, {
      name,
      logoDataUrl: logo,
      website,
      description,
      category,
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
    await new Promise((r) => setTimeout(r, 400));
    updateCompany(companyId, { contactName, contactEmail, contactPhone });
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

  async function handleSave() {
    if (!password) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setPassword("");
    setTimeout(() => setSaved(false), 2000);
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

const PLAN_DETAILS: Record<PackageTier, { name: string; price: string }> = {
  standard: { name: "Standard", price: "499 kr/mån" },
  premium: { name: "Premium", price: "999 kr/mån" },
};

function BillingCard({
  tier,
  companyId,
  updateCompany,
}: {
  tier: PackageTier;
  companyId: string;
  updateCompany: UpdateFn;
}) {
  const [switching, setSwitching] = useState(false);
  const other: PackageTier = tier === "premium" ? "standard" : "premium";

  async function handleSwitch() {
    setSwitching(true);
    await new Promise((r) => setTimeout(r, 700));
    updateCompany(companyId, { packageTier: other });
    setSwitching(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
      <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">Paket & fakturering</h2>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                {PLAN_DETAILS[tier].name}
              </p>
              {tier === "premium" && <Badge variant="accent">Aktivt</Badge>}
            </div>
            <p className="text-xs font-medium text-[var(--color-brand-muted)]">
              {PLAN_DETAILS[tier].price} · Nästa fakturering 1:a nästa månad
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSwitch}
          disabled={switching}
          icon={switching ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          {other === "premium" ? "Uppgradera till Premium" : "Byt till Standard"}
        </Button>
      </div>
    </div>
  );
}
