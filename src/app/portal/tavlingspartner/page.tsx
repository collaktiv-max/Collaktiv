"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Mail, Rocket, Send, Trophy } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Textarea } from "@/components/ui/Field";
import { useAppState } from "@/lib/store";
import type { CampaignStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; variant: "light" | "accent" | "dark" | "outline" }
> = {
  intresseanmald: { label: "Intresseanmäld", variant: "light" },
  godkand: { label: "Godkänd", variant: "accent" },
  aktiv: { label: "Aktiv", variant: "dark" },
  avvisad: { label: "Avvisad", variant: "outline" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

const STEPS = [
  {
    title: "Anmäl er",
    text: "Kryssa i att ni vill vara tävlingspartner och beskriv kort vad ni kan bidra med som pris.",
  },
  {
    title: "Vi hör av oss",
    text: "Vårt team tar kontakt för att stämma av detaljerna inför nästa tävling i appen.",
  },
  {
    title: "Tävlingen går live",
    text: "Ni syns som partner för resenärer som tävlar om priset – ren, kostnadsfri exponering.",
  },
];

// Slogs tidigare ihop med "Kampanj i appen" på en delad sida
// (/portal/kampanjer) – användaren ville ha tävlingspartner som ett eget,
// tydligare menyval, med kampanj kvar men nedprioriterad längre ner på
// samma sida eftersom den inte är igång än.
export default function TavlingspartnerPage() {
  const { currentCompany, companyCampaigns, createCampaign, updateCompany } = useAppState();

  const [contestInterested, setContestInterested] = useState(
    currentCompany?.contestHostInterested ?? false
  );
  const [prizeDescription, setPrizeDescription] = useState(
    currentCompany?.contestPrizeDescription ?? ""
  );
  const [savingContest, setSavingContest] = useState(false);
  const [contestSaved, setContestSaved] = useState(false);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!currentCompany) return null;

  async function handleSaveContest() {
    setSavingContest(true);
    try {
      await updateCompany(currentCompany!.id, {
        contestHostInterested: contestInterested,
        contestPrizeDescription: prizeDescription,
      });
      setContestSaved(true);
      setTimeout(() => setContestSaved(false), 2000);
    } finally {
      setSavingContest(false);
    }
  }

  async function handleSubmitCampaign(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await createCampaign({ message: message || undefined });
      setSent(true);
      setMessage("");
      setTimeout(() => setSent(false), 2500);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Tävlingspartner"
        subtitle="Bidra med ett pris till en tävling för resenärer i appen – kostnadsfri exponering utöver era vanliga erbjudanden."
      />

      <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
            <Trophy className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-[var(--color-brand-ink)]">
              Bli tävlingspartner
            </h2>
            <p className="mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-[var(--color-brand-muted)]">
              Har ni något ni vill ge bort till våra användare – ett presentkort, en
              produkt eller en upplevelse? Som tävlingspartner syns ni extra tydligt när
              resenärer tävlar om priset i appen, helt kostnadsfritt.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 border-y border-[var(--color-brand-border)] py-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xs font-extrabold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">{step.title}</p>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setContestInterested((v) => !v)}
            className="flex w-fit items-center gap-2.5 text-sm font-extrabold text-[var(--color-brand-ink)]"
          >
            <span
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                contestInterested
                  ? "justify-end bg-[var(--color-brand-primary)]"
                  : "justify-start bg-[var(--color-brand-border)]"
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white shadow" />
            </span>
            Vi vill vara tävlingspartner
          </button>

          {contestInterested && (
            <Field
              label="Vad kan ni erbjuda som pris?"
              hint="T.ex. presentkort, produkter eller en upplevelse"
            >
              <Textarea
                placeholder="Beskriv vad ni kan bidra med"
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
              />
            </Field>
          )}

          <div className="flex items-center justify-end gap-3">
            {contestSaved && (
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-brand-primary)]">
                <Check className="h-3.5 w-3.5" /> Sparat
              </span>
            )}
            <Button
              onClick={handleSaveContest}
              disabled={savingContest}
              icon={savingContest ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              Spara
            </Button>
          </div>
        </div>
      </div>

      {/* Kampanj i appen – inte igång än, därför en mindre, nedtonad ruta
          längre ner istället för ett eget menyval. */}
      <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/20 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-brand-muted)]">
            <Rocket className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                Kampanj i appen
              </h3>
              <Badge variant="light">Kommer snart</Badge>
            </div>
            <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
              Betala för extra synlighet i appen under en period ni väljer. Inte igång
              än, men ni kan redan nu anmäla intresse så hör vi av oss.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmitCampaign}
          className="mt-4 flex flex-col gap-3 border-t border-[var(--color-brand-border)] pt-4"
        >
          <Field label="Meddelande" hint="Valfritt">
            <Textarea
              placeholder="Berätta gärna mer om vad ni är ute efter"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </Field>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={sending}
              icon={
                sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )
              }
            >
              {sent ? "Skickat!" : "Anmäl intresse"}
            </Button>
          </div>
        </form>

        {companyCampaigns.length > 0 && (
          <div className="mt-3 divide-y divide-[var(--color-brand-border)] border-t border-[var(--color-brand-border)]">
            {companyCampaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-xs font-bold text-[var(--color-brand-ink)]">
                    Intresseanmälan {formatDate(c.createdAt)}
                  </p>
                  {c.message && (
                    <p className="text-[11px] font-medium text-[var(--color-brand-muted)]">
                      {c.message}
                    </p>
                  )}
                </div>
                <Badge variant={STATUS_CONFIG[c.status].variant}>
                  {STATUS_CONFIG[c.status].label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand-muted)]">
        <Mail className="h-3.5 w-3.5" />
        Frågor om tävlingspartnerskap? Mejla{" "}
        <a href="mailto:partner@collaktiv.se" className="font-bold text-[var(--color-brand-primary)] underline">
          partner@collaktiv.se
        </a>
      </p>
    </div>
  );
}
