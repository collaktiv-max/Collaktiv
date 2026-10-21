"use client";

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CircleDollarSign,
  Clock,
  Gift,
  Headset,
  Loader2,
  LogIn,
  Mail,
  Phone,
  Receipt,
  Rocket,
  ShieldCheck,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { APP_LAUNCHED } from "@/lib/config";
import {
  COMPLIMENTARY_DURATION_OPTIONS,
  complimentaryDurationLabel,
  computeComplimentaryUntil,
  type ComplimentaryDuration,
} from "@/lib/complimentary";
import { fetchJson } from "@/lib/apiClient";
import { BILLING_LABELS, getDiscountedTotal, getPlan, type BillingPeriod, type PlanId } from "@/lib/pricing";
import {
  CATEGORY_LABELS,
  type ApplicationStatus,
  type Campaign,
  type CampaignStatus,
  type CompanyProfile,
  type Offer,
  type PackageTier,
} from "@/lib/types";
import type { AdminTab } from "./AdminTabs";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  utkast: "Utkast",
  inskickad: "Inskickad",
  under_granskning: "Under granskning",
  godkand: "Godkänd",
  avvisad: "Avvisad",
};

const APPLICATION_STATUS_VARIANT: Record<ApplicationStatus, "light" | "accent" | "dark" | "outline"> = {
  utkast: "outline",
  inskickad: "light",
  under_granskning: "light",
  godkand: "accent",
  avvisad: "outline",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  intresseanmald: "Intresseanmäld",
  godkand: "Godkänd",
  aktiv: "Aktiv",
  avvisad: "Avvisad",
};

const CAMPAIGN_STATUS_VARIANT: Record<CampaignStatus, "light" | "accent" | "dark" | "outline"> = {
  intresseanmald: "light",
  godkand: "accent",
  aktiv: "dark",
  avvisad: "outline",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-[var(--color-brand-ink)]">{title}</h1>
      <p className="mt-1.5 text-sm font-medium text-[var(--color-brand-muted)]">{description}</p>
    </div>
  );
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  iconBg,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-extrabold text-[var(--color-brand-ink)]">{value}</p>
      <p className="text-[12.5px] font-bold text-[var(--color-brand-muted)]">{label}</p>
    </div>
  );
}

export function ContactCell({ name, email, phone }: { name: string; email: string; phone: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-bold text-[var(--color-brand-ink)]">{name || "–"}</p>
      <div className="mt-0.5 flex flex-col gap-0.5 text-xs font-medium text-[var(--color-brand-muted)]">
        <span className="flex items-start gap-1.5">
          <Mail className="mt-0.5 h-3 w-3 shrink-0" />
          {/* break-all: en lång e-postadress/telefonnummer har inga
              mellanslag att radbryta vid, så den annars bara rinner
              över in i nästa kolumn istället för att radbrytas. */}
          <span className="min-w-0 break-all">{email}</span>
        </span>
        {phone && (
          <span className="flex items-start gap-1.5">
            <Phone className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="min-w-0 break-all">{phone}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function PaymentToggle({ confirmed, onToggle }: { confirmed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
        confirmed
          ? "bg-[var(--color-brand-accent)]/15 text-[#3f7a1c]"
          : "bg-[#fdecea] text-[#c0392b]"
      }`}
    >
      {confirmed ? <ShieldCheck className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {confirmed ? "Betald" : "Obetald"}
    </button>
  );
}

// Betalningscell som även hanterar kostnadsfri åtkomst (partners vi
// medvetet vill ha med utan att de betalar, t.ex. för
// marknadsföringsbyte) – skiljs från en riktig Stripe-betalning via
// company.complimentary, så den aldrig syns som en riktig betalning i
// fakturahistorik/statistik. Admin väljer löptid (eller tillsvidare);
// en bestämd löptid räknas från lanseringen för resenärer, inte från
// dagen den beviljas (se src/lib/complimentary.ts), och återkallas
// automatiskt av den dagliga cron-sopningen i src/lib/reminders.ts
// när den har löpt ut.
export function PaymentCell({
  company,
  onUpdate,
}: {
  company: CompanyProfile;
  onUpdate: (id: string, partial: Partial<CompanyProfile>) => void;
}) {
  const [pickingDuration, setPickingDuration] = useState(false);
  const [duration, setDuration] = useState<ComplimentaryDuration>("3m");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  if (company.paymentConfirmed && company.complimentary) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">
          <Gift className="h-3.5 w-3.5" />
          {company.complimentaryUntil
            ? `Kostnadsfritt till ${formatDate(company.complimentaryUntil)}`
            : company.complimentaryDuration && company.complimentaryDuration !== "indefinite"
              ? `Kostnadsfritt (${complimentaryDurationLabel(company.complimentaryDuration)} efter lansering)`
              : "Kostnadsfritt"}
        </Badge>
        <button
          onClick={() => {
            if (
              confirm(
                `Ta bort kostnadsfri åtkomst för ${company.name}? Företaget markeras då som obetalt igen.`
              )
            ) {
              onUpdate(company.id, {
                paymentConfirmed: false,
                complimentary: false,
                complimentaryUntil: undefined,
                complimentaryDuration: undefined,
              });
            }
          }}
          className="text-[11px] font-bold text-[var(--color-brand-muted)] underline decoration-dotted hover:text-[#c0392b]"
        >
          Ta bort
        </button>
      </div>
    );
  }

  if (company.paymentConfirmed) {
    return (
      <PaymentToggle confirmed onToggle={() => onUpdate(company.id, { paymentConfirmed: false })} />
    );
  }

  if (pickingDuration) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value as ComplimentaryDuration)}
          className="rounded-lg border border-[var(--color-brand-border)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]"
        >
          {COMPLIMENTARY_DURATION_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            onUpdate(company.id, {
              paymentConfirmed: true,
              complimentary: true,
              packageTier: "standard",
              complimentaryDuration: duration,
              complimentaryUntil: computeComplimentaryUntil(duration),
            });
            setPickingDuration(false);
          }}
          title="Bekräfta"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] text-white transition hover:bg-[var(--color-brand-primary-hover)]"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setPickingDuration(false)}
          title="Avbryt"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] transition hover:border-[#c0392b] hover:text-[#c0392b]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PaymentToggle
        confirmed={false}
        onToggle={() => onUpdate(company.id, { paymentConfirmed: true })}
      />
      <button
        onClick={() => setPickingDuration(true)}
        className="flex items-center gap-1 rounded-full border border-[var(--color-brand-border)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--color-brand-ink)] transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)]"
      >
        <Gift className="h-3 w-3" /> Ge kostnadsfritt
      </button>
      <button
        onClick={() => setInvoiceModalOpen(true)}
        className="flex items-center gap-1 rounded-full border border-[var(--color-brand-border)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--color-brand-ink)] transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)]"
      >
        <Receipt className="h-3 w-3" /> Skicka faktura
      </button>
      {invoiceModalOpen && (
        <InvoiceModal company={company} onClose={() => setInvoiceModalOpen(false)} />
      )}
    </div>
  );
}

// Modal istället för en inline-picker – "Annan faktureringsadress" (för
// stora företag med en egen fakturaavdelning, annan mottagaradress än
// den löpande kontakten) behöver plats för fler fält än en tabellcell
// rymmer. Skickar alltid till company.contactEmail om inget annat
// anges – se billingOverride i src/lib/invoice.ts.
function InvoiceModal({ company, onClose }: { company: CompanyProfile; onClose: () => void }) {
  const [plan, setPlan] = useState<PlanId>("standard");
  const [period, setPeriod] = useState<BillingPeriod>("year");
  const [showOverride, setShowOverride] = useState(false);
  const [overrideEmail, setOverrideEmail] = useState("");
  const [overrideName, setOverrideName] = useState("");
  const [overrideOrgNumber, setOverrideOrgNumber] = useState("");
  const [overrideAddressLine1, setOverrideAddressLine1] = useState("");
  const [overridePostalCode, setOverridePostalCode] = useState("");
  const [overrideCity, setOverrideCity] = useState("");
  const [overrideReference, setOverrideReference] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ email: string; pdfAttached: boolean; invoiceUrl: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const amount = getDiscountedTotal(getPlan(plan), period);
  const recipientEmail = (showOverride && overrideEmail.trim()) || company.contactEmail;

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const data = await fetchJson<{ invoiceUrl: string; pdfAttached: boolean }>(
        `/api/admin/companies/${company.id}/invoice`,
        {
          method: "POST",
          body: JSON.stringify({
            planId: plan,
            period,
            billingOverride: showOverride
              ? {
                  email: overrideEmail.trim() || undefined,
                  name: overrideName.trim() || undefined,
                  orgNumber: overrideOrgNumber.trim() || undefined,
                  addressLine1: overrideAddressLine1.trim() || undefined,
                  postalCode: overridePostalCode.trim() || undefined,
                  city: overrideCity.trim() || undefined,
                  reference: overrideReference.trim() || undefined,
                }
              : undefined,
          }),
        }
      );
      setSent({ email: recipientEmail, pdfAttached: data.pdfAttached, invoiceUrl: data.invoiceUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka fakturan.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 shadow-xl sm:p-7">
        <button
          onClick={onClose}
          aria-label="Stäng"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-secondary)]"
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="py-4 text-center">
            <span
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                sent.pdfAttached
                  ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]"
                  : "bg-[#fdf3e0] text-[#8a5a00]"
              }`}
            >
              {sent.pdfAttached ? <Check className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]">
              {sent.pdfAttached ? "Fakturan skickad!" : "Fakturan skickad – men utan PDF-bilaga"}
            </h2>
            <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
              {sent.pdfAttached ? (
                <>Skickades till {sent.email}.</>
              ) : (
                <>
                  Skickades till {sent.email}, men vi lyckades inte hämta PDF:en från Stripe för att
                  bifoga den i mejlet (fakturan i sig är skapad och skickad som vanligt). Om mottagaren
                  kräver en PDF-bilaga, ladda ner den själv och skicka den manuellt:{" "}
                  <a
                    href={sent.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[var(--color-brand-primary)] underline"
                  >
                    öppna fakturan hos Stripe
                  </a>
                  .
                </>
              )}
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-[var(--color-brand-primary)] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)]"
            >
              Stäng
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-extrabold text-[var(--color-brand-ink)]">
              Skicka faktura till {company.name}
            </h2>
            <p className="mt-1.5 text-sm font-medium text-[var(--color-brand-muted)]">
              Skapas och skickas direkt via Stripe – inget behöver loggas in.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                Paket
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanId)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] bg-white px-3 py-2 text-sm font-bold text-[var(--color-brand-ink)]"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
              <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                Period
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as BillingPeriod)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] bg-white px-3 py-2 text-sm font-bold text-[var(--color-brand-ink)]"
                >
                  {(Object.keys(BILLING_LABELS) as BillingPeriod[]).map((p) => (
                    <option key={p} value={p}>
                      {BILLING_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mt-3 text-sm font-extrabold text-[var(--color-brand-ink)]">{amount} kr</p>

            <button
              onClick={() => setShowOverride((v) => !v)}
              className="mt-4 text-xs font-extrabold text-[var(--color-brand-primary)] hover:underline"
            >
              {showOverride ? "− Dölj annan faktureringsadress" : "+ Annan faktureringsadress"}
            </button>

            {showOverride && (
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[var(--color-brand-border)] p-4">
                <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                  Faktureringsmejl
                  <input
                    type="email"
                    value={overrideEmail}
                    onChange={(e) => setOverrideEmail(e.target.value)}
                    placeholder={company.contactEmail}
                    className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] px-3 py-2 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]"
                  />
                </label>
                <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                  Fakturamottagare (företagsnamn)
                  <input
                    value={overrideName}
                    onChange={(e) => setOverrideName(e.target.value)}
                    placeholder={company.name}
                    className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] px-3 py-2 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]"
                  />
                </label>
                <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                  Organisationsnummer
                  <input
                    value={overrideOrgNumber}
                    onChange={(e) => setOverrideOrgNumber(e.target.value)}
                    placeholder="XXXXXX-XXXX"
                    className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] px-3 py-2 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="col-span-2 block text-xs font-extrabold text-[var(--color-brand-ink)]">
                    Adress
                    <input
                      value={overrideAddressLine1}
                      onChange={(e) => setOverrideAddressLine1(e.target.value)}
                      placeholder="T.ex. Box 177"
                      className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] px-3 py-2 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]"
                    />
                  </label>
                  <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                    Postnummer
                    <input
                      value={overridePostalCode}
                      onChange={(e) => setOverridePostalCode(e.target.value)}
                      placeholder="891 24"
                      className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] px-3 py-2 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]"
                    />
                  </label>
                  <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                    Ort
                    <input
                      value={overrideCity}
                      onChange={(e) => setOverrideCity(e.target.value)}
                      placeholder="Örnsköldsvik"
                      className="mt-1.5 w-full rounded-xl border border-[var(--color-brand-border)] px-3 py-2 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]"
                    />
                  </label>
                </div>
                <label className="block text-xs font-extrabold text-[var(--color-brand-ink)]">
                  Referens/meddelande
                  <textarea
                    value={overrideReference}
                    onChange={(e) => setOverrideReference(e.target.value)}
                    rows={2}
                    placeholder="T.ex. Store 82 – enligt överenskommelse med ..."
                    className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-brand-border)] px-3 py-2 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)]"
                  />
                </label>
              </div>
            )}

            {error && <p className="mt-3 text-xs font-bold text-[#c0392b]">{error}</p>}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Receipt className="h-4 w-4" />
                )}
                {sending ? "Skickar..." : `Skicka till ${recipientEmail}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Ikryssat av företaget vid registrering (se full_service_requested) –
// de vill inte logga in i portalen själva utan vill att vi sköter
// paket, erbjudande och fakturering åt dem. Visas bredvid
// företagsnamnet i Ansökningar/Alla företag.
export function FullServiceBadge() {
  return (
    <span
      title="Vill ha hjälp med allt – hör av er till dem istället för att vänta på att de loggar in"
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#fdf3e0] px-2 py-0.5 text-[10px] font-extrabold text-[#8a5a00]"
    >
      <Headset className="h-3 w-3" /> Vill ha hjälp
    </span>
  );
}

// Loggar in admin SOM företaget (se /api/admin/companies/[id]/impersonate)
// – används för att skapa/publicera erbjudanden och fylla i profilen åt
// företag som inte vill/hinner göra det själva. Öppnas i en ny flik så
// admin-panelen inte stängs eller ersätts i den nuvarande.
export function ImpersonateButton({ company }: { company: CompanyProfile }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await fetchJson(`/api/admin/companies/${company.id}/impersonate`, { method: "POST" });
          window.open("/portal", "_blank");
        } catch (err) {
          alert(err instanceof Error ? err.message : "Kunde inte logga in som företaget.");
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      title="Logga in som företag"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-brand-border)] text-[var(--color-brand-ink)] transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}
    </button>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-white p-6 text-center text-sm font-medium text-[var(--color-brand-muted)]">
      {text}
    </div>
  );
}

// `fixed` ger tabellen låsta kolumnbredder (satta via Th:s width-prop)
// istället för webbläsarens standardbeteende att räkna om ALLA
// kolumners bredd efter innehållet i varje cell – annars flyttar sig
// hela tabellen varje gång en cell i en rad byter innehåll (t.ex. när
// "Ge kostnadsfritt" öppnas i Betalning-kolumnen), vilket flyttar alla
// andra rader och kolumner i sidled också. Används av tabeller med
// PaymentCell, där det här annars märks tydligast.
function TableCard({ children, fixed }: { children: ReactNode; fixed?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-brand-border)] bg-white">
      <table className={`w-full text-left text-sm ${fixed ? "table-fixed min-w-[980px]" : ""}`}>
        {children}
      </table>
    </div>
  );
}

function Th({
  children,
  align,
  width,
}: {
  children: ReactNode;
  align?: "right";
  /** Tailwind-bredd (t.ex. "w-[15%]") – bara verkningsfullt tillsammans
   * med TableCard fixed, se där. */
  width?: string;
}) {
  return (
    <th className={`px-5 py-3 ${align === "right" ? "text-right" : ""} ${width ?? ""}`}>
      {children}
    </th>
  );
}

function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--color-brand-border)] text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-muted)]">
        {children}
      </tr>
    </thead>
  );
}

// ---------- Översikt ----------

export function OversiktSection({
  companies,
  offers,
  campaigns,
  onNavigate,
}: {
  companies: CompanyProfile[];
  offers: Offer[];
  campaigns: Campaign[];
  onNavigate: (tab: AdminTab) => void;
}) {
  const pendingCompanies = companies.filter(
    (c) => c.applicationStatus === "inskickad" || c.applicationStatus === "under_granskning"
  );
  const pendingOffers = offers.filter((o) => o.status === "granskas");
  const payingCompanies = companies.filter((c) => c.paymentConfirmed);
  const pendingCampaigns = campaigns.filter((c) => c.status === "intresseanmald");
  const contestHosts = companies.filter((c) => c.contestHostInterested);

  const actionItems = [
    {
      tab: "ansokningar" as AdminTab,
      label: "Ansökningar att granska",
      count: pendingCompanies.length,
    },
    {
      tab: "erbjudanden" as AdminTab,
      label: "Erbjudanden att granska",
      count: pendingOffers.length,
    },
    {
      tab: "kampanjer" as AdminTab,
      label: "Kampanjer – intresseanmälningar",
      count: pendingCampaigns.length,
    },
  ].filter((item) => item.count > 0);

  return (
    <div>
      <SectionHeader
        title="Översikt"
        description="Läget just nu – hoppa vidare till en kö för att hantera den."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={Building2}
          label="Företag totalt"
          value={companies.length}
          iconBg="bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
        />
        <KpiCard
          icon={Clock}
          label="Väntar på granskning"
          value={pendingCompanies.length}
          iconBg="bg-[#fce8da] text-[#c2703a]"
        />
        <KpiCard
          icon={Ticket}
          label="Erbjudanden att granska"
          value={pendingOffers.length}
          iconBg="bg-[#fdecea] text-[#c0392b]"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Betalande företag"
          value={payingCompanies.length}
          iconBg="bg-[#0f1f18] text-[var(--color-brand-accent)]"
        />
        <KpiCard
          icon={Rocket}
          label="Kampanjintresse"
          value={pendingCampaigns.length}
          iconBg="bg-[var(--color-brand-mint)] text-[var(--color-brand-primary-hover)]"
        />
        <KpiCard
          icon={Gift}
          label="Tävlingsvärdar"
          value={contestHosts.length}
          iconBg="bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
          Kräver åtgärd
        </h2>
        {actionItems.length === 0 ? (
          <div className="mt-3">
            <EmptyRow text="Inget väntar på er just nu – allt är avklarat." />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5">
            {actionItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => onNavigate(item.tab)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-brand-border)] bg-white px-5 py-4 text-left transition hover:border-[var(--color-brand-primary)]/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#e0432c] px-1.5 text-[11px] font-extrabold text-white">
                    {item.count}
                  </span>
                  <span className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--color-brand-muted)]" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Ansökningar ----------

export function ApplicationsSection({
  companies,
  onUpdate,
  onReject,
}: {
  companies: CompanyProfile[];
  onUpdate: (id: string, partial: Partial<CompanyProfile>) => void;
  onReject: (company: CompanyProfile) => void;
}) {
  const pending = companies.filter(
    (c) => c.applicationStatus === "inskickad" || c.applicationStatus === "under_granskning"
  );

  return (
    <div>
      <SectionHeader
        title="Ansökningar att granska"
        description="Godkänn eller avvisa nya företag som skickat in en ansökan."
      />
      {pending.length === 0 ? (
        <EmptyRow text="Inga ansökningar väntar just nu." />
      ) : (
        <TableCard fixed>
          <THead>
            <Th width="w-[15%]">Företag</Th>
            <Th width="w-[20%]">Kontakt</Th>
            <Th width="w-[10%]">Kategori</Th>
            <Th width="w-[10%]">Paket</Th>
            <Th width="w-[22%]">Betalning</Th>
            <Th width="w-[10%]">Inskickad</Th>
            <Th width="w-[13%]" align="right">Åtgärd</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {pending.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">
                  <div className="flex flex-wrap items-center gap-2">
                    {c.name}
                    {c.fullServiceRequested && <FullServiceBadge />}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <ContactCell name={c.contactName} email={c.contactEmail} phone={c.contactPhone} />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {CATEGORY_LABELS[c.category]}
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {c.paymentConfirmed ? (
                    <span className="capitalize">{c.packageTier}</span>
                  ) : (
                    <span className="italic">Inget paket</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <PaymentCell company={c} onUpdate={onUpdate} />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => onUpdate(c.id, { applicationStatus: "godkand" })}
                        className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)]"
                      >
                        <Check className="h-3.5 w-3.5" /> Godkänn
                      </button>
                      <button
                        onClick={() => onReject(c)}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-muted)] hover:border-[#c0392b] hover:text-[#c0392b]"
                      >
                        <X className="h-3.5 w-3.5" /> Avvisa
                      </button>
                    </div>
                    <ImpersonateButton company={c} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Erbjudanden ----------

export function OffersSection({
  offers,
  companies,
  onUpdate,
}: {
  offers: Offer[];
  companies: CompanyProfile[];
  onUpdate: (id: string, partial: Partial<Offer>) => void;
}) {
  const pending = offers.filter((o) => o.status === "granskas");
  const published = offers.filter((o) => o.status === "publicerad");

  return (
    <div>
      <SectionHeader
        title="Erbjudanden att granska"
        description="Publicera erbjudanden som skickats in, eller skicka tillbaka dem för redigering."
      />
      {!APP_LAUNCHED && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--color-brand-accent)]/30 bg-[var(--color-brand-mint)]/30 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-brand-primary)]">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-extrabold text-[var(--color-brand-ink)]">
              Appen är inte lanserad för resenärer än
            </p>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
              {published.length} publicerade erbjudanden ligger redo i databasen (hämtbara via{" "}
              <code className="rounded bg-white px-1 py-0.5 text-[11px]">/api/public/offers</code>)
              och går live automatiskt för resenärer så fort appen lanseras – ni behöver inte
              göra något mer med dem.
            </p>
          </div>
        </div>
      )}
      {pending.length === 0 ? (
        <EmptyRow text="Inga erbjudanden väntar just nu." />
      ) : (
        <TableCard>
          <THead>
            <Th>Erbjudande</Th>
            <Th>Företag</Th>
            <Th>Rabatt</Th>
            <Th>Inskickat</Th>
            <Th align="right">Åtgärd</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {pending.map((o) => {
              const company = companies.find((c) => c.id === o.companyId);
              const companyApproved = company?.applicationStatus === "godkand";
              return (
                <tr key={o.id}>
                  <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">{o.title}</td>
                  <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                    {company?.name ?? "–"}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                    {o.discountValue}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onUpdate(o.id, { status: "publicerad" })}
                          disabled={!companyApproved}
                          title={
                            companyApproved
                              ? undefined
                              : "Godkänn företagets ansökan innan erbjudandet kan publiceras."
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-brand-border)] disabled:text-[var(--color-brand-muted)] disabled:hover:bg-[var(--color-brand-border)]"
                        >
                          <Check className="h-3.5 w-3.5" /> Publicera
                        </button>
                        <button
                          onClick={() => onUpdate(o.id, { status: "utkast" })}
                          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-brand-border)] px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-muted)] hover:border-[#c0392b] hover:text-[#c0392b]"
                        >
                          <X className="h-3.5 w-3.5" /> Skicka tillbaka
                        </button>
                      </div>
                      {!companyApproved && (
                        <span className="text-[11px] font-semibold text-[#c0392b]">
                          Godkänn ansökan först
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Kampanjer ----------

export function CampaignsSection({
  campaigns,
  companies,
  onUpdateStatus,
}: {
  campaigns: Campaign[];
  companies: CompanyProfile[];
  onUpdateStatus: (id: string, status: CampaignStatus) => void;
}) {
  function companyName(companyId: string) {
    return companies.find((c) => c.id === companyId)?.name ?? "–";
  }

  return (
    <div>
      <SectionHeader
        title="Kampanjer – intresseanmälningar"
        description="Företag som vill betala för extra synlighet i appen under en period."
      />
      {campaigns.length === 0 ? (
        <EmptyRow text="Inga kampanjförfrågningar än." />
      ) : (
        <TableCard>
          <THead>
            <Th>Företag</Th>
            <Th>Meddelande</Th>
            <Th>Status</Th>
            <Th>Inskickad</Th>
            <Th align="right">Åtgärd</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">
                  {companyName(c.companyId)}
                </td>
                <td className="max-w-[280px] px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {c.message || "–"}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={CAMPAIGN_STATUS_VARIANT[c.status]}>
                    {CAMPAIGN_STATUS_LABELS[c.status]}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <select
                    value={c.status}
                    onChange={(e) => onUpdateStatus(c.id, e.target.value as CampaignStatus)}
                    className="rounded-lg border border-[var(--color-brand-border)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]"
                  >
                    {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Tävlingsvärdar ----------

export function ContestHostsSection({ companies }: { companies: CompanyProfile[] }) {
  const contestHosts = companies.filter((c) => c.contestHostInterested);

  return (
    <div>
      <SectionHeader
        title="Tävlingsvärdar"
        description="Företag som anmält att de kan bidra med pris till en tävling i appen."
      />
      {contestHosts.length === 0 ? (
        <EmptyRow text="Inga tävlingsvärdar anmälda än." />
      ) : (
        <TableCard>
          <THead>
            <Th>Företag</Th>
            <Th>Kontakt</Th>
            <Th>Erbjuder som pris</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {contestHosts.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">{c.name}</td>
                <td className="px-5 py-3.5">
                  <ContactCell name={c.contactName} email={c.contactEmail} phone={c.contactPhone} />
                </td>
                <td className="max-w-[320px] px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {c.contestPrizeDescription || "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ---------- Alla företag ----------

export function CompaniesSection({
  companies,
  onUpdate,
  onReject,
}: {
  companies: CompanyProfile[];
  onUpdate: (id: string, partial: Partial<CompanyProfile>) => void;
  onReject: (company: CompanyProfile) => void;
}) {
  const [showRejected, setShowRejected] = useState(false);
  const rejectedCount = companies.filter((c) => c.applicationStatus === "avvisad").length;
  // Avvisade företag döljs som standard så de inte skräpar ner den
  // dagliga översikten – de finns kvar i databasen (betalnings-/
  // återbetalningshistorik rörs inte) och går att visa igen via
  // knappen nedan.
  const visibleCompanies = showRejected
    ? companies
    : companies.filter((c) => c.applicationStatus !== "avvisad");

  return (
    <div>
      <SectionHeader
        title="Alla företag"
        description="Full översikt – ändra paket, status och betalning direkt."
      />
      {rejectedCount > 0 && (
        <div className="mb-5 flex justify-end">
          <button
            onClick={() => setShowRejected((v) => !v)}
            className="rounded-full border border-[var(--color-brand-border)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-brand-muted)] transition hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-ink)]"
          >
            {showRejected ? "Dölj avvisade" : `Visa avvisade (${rejectedCount})`}
          </button>
        </div>
      )}
      {visibleCompanies.length === 0 ? (
        <EmptyRow text={showRejected ? "Inga företag registrerade ännu." : "Inga aktiva företag just nu."} />
      ) : (
        <TableCard fixed>
          <THead>
            <Th width="w-[13%]">Företag</Th>
            <Th width="w-[21%]">Kontakt</Th>
            <Th width="w-[9%]">Kategori</Th>
            <Th width="w-[9%]">Paket</Th>
            <Th width="w-[14%]">Status</Th>
            <Th width="w-[19%]">Betalning</Th>
            <Th width="w-[9%]">Registrerad</Th>
            <Th width="w-[6%]" align="right">Åtgärd</Th>
          </THead>
          <tbody className="divide-y divide-[var(--color-brand-border)]">
            {visibleCompanies.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-extrabold text-[var(--color-brand-ink)]">
                  <div className="flex flex-wrap items-center gap-2">
                    {c.name}
                    {c.fullServiceRequested && <FullServiceBadge />}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <ContactCell name={c.contactName} email={c.contactEmail} phone={c.contactPhone} />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {CATEGORY_LABELS[c.category]}
                </td>
                <td className="px-5 py-3.5">
                  {c.paymentConfirmed ? (
                    <select
                      value={c.packageTier}
                      onChange={(e) => onUpdate(c.id, { packageTier: e.target.value as PackageTier })}
                      className="rounded-lg border border-[var(--color-brand-border)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  ) : (
                    <span className="text-xs font-medium italic text-[var(--color-brand-muted)]">
                      Inget paket
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={APPLICATION_STATUS_VARIANT[c.applicationStatus]}>
                      {APPLICATION_STATUS_LABELS[c.applicationStatus]}
                    </Badge>
                    <select
                      value={c.applicationStatus}
                      onChange={(e) => {
                        const next = e.target.value as ApplicationStatus;
                        if (next === "avvisad") {
                          onReject(c);
                        } else {
                          onUpdate(c.id, { applicationStatus: next });
                        }
                      }}
                      className="rounded-lg border border-[var(--color-brand-border)] bg-white px-2 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]"
                    >
                      {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <PaymentCell company={c} onUpdate={onUpdate} />
                </td>
                <td className="px-5 py-3.5 font-medium text-[var(--color-brand-muted)]">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end">
                    <ImpersonateButton company={c} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
