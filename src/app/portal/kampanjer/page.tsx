"use client";

import { useState, type FormEvent } from "react";
import { Gift, Loader2, Rocket, Send } from "lucide-react";
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

export default function KampanjerPage() {
  const { currentCompany, companyCampaigns, createCampaign, updateCompany } = useAppState();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [contestInterested, setContestInterested] = useState(
    currentCompany?.contestHostInterested ?? false
  );
  const [prizeDescription, setPrizeDescription] = useState(
    currentCompany?.contestPrizeDescription ?? ""
  );
  const [savingContest, setSavingContest] = useState(false);
  const [contestSaved, setContestSaved] = useState(false);

  if (!currentCompany) return null;

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

  return (
    <div>
      <PageHeader
        title="Kampanjer"
        subtitle="Köp extra synlighet i appen under en period, eller bidra med ett pris till en tävling för resenärer."
      />

      <div className="flex flex-col gap-6">
        {/* Kampanj i appen */}
        <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
              <Rocket className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                  Kampanj i appen
                </h2>
                <Badge variant="light">Kommer snart</Badge>
              </div>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-[var(--color-brand-muted)]">
                Betala direkt i portalen för att synas extra i appen under en period ni
                väljer – t.ex. inför en högsäsong eller en särskild satsning. Vi jobbar
                fortfarande på exakt vilket värde en kampanj ger er och vad den ska
                kosta, men ni kan redan nu anmäla intresse – så hör vi av oss så fort
                den går att köpa.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmitCampaign}
            className="mt-5 flex flex-col gap-4 border-t border-[var(--color-brand-border)] pt-5"
          >
            <Field label="Meddelande" hint="Valfritt – t.ex. när ni skulle vilja köra en kampanj">
              <Textarea
                placeholder="Berätta gärna mer om vad ni är ute efter"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="submit"
                size="sm"
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
            <div className="mt-5 divide-y divide-[var(--color-brand-border)] border-t border-[var(--color-brand-border)]">
              {companyCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-brand-ink)]">
                      Intresseanmälan {formatDate(c.createdAt)}
                    </p>
                    {c.message && (
                      <p className="text-xs font-medium text-[var(--color-brand-muted)]">
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

        {/* Tävlingsvärd */}
        <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
              <Gift className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                Bli tävlingsvärd
              </h2>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-[var(--color-brand-muted)]">
                Har ni något ni vill ge bort till våra användare? Anmäl er som
                tävlingsvärd så hör vi av oss när vi sätter ihop nästa tävling i appen.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-[var(--color-brand-border)] pt-5">
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
              Vi vill vara tävlingsvärd
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
                <span className="text-xs font-extrabold text-[var(--color-brand-primary)]">
                  Sparat
                </span>
              )}
              <Button
                size="sm"
                onClick={handleSaveContest}
                disabled={savingContest}
                icon={savingContest ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                Spara
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
