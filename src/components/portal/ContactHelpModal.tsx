"use client";

import { useState } from "react";
import { Check, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const HELP_TOPICS = [
  "Hur skapar jag ett erbjudande på bästa sätt?",
  "Problem med att ladda upp bild",
  "Osäker på vilket paket jag ska välja",
  "Problem med betalningen",
  "Annat",
];

export function ContactHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function handleClose() {
    onClose();
    // Nollställs efter stängning (inte direkt) så formuläret inte
    // hoppar till tomt state medan stängningsanimationen pågår.
    setTimeout(() => {
      setSelectedTopics([]);
      setMessage("");
      setSent(false);
      setError(null);
    }, 200);
  }

  async function handleSubmit() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: selectedTopics, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Kunde inte skicka meddelandet.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skicka meddelandet. Försök igen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-brand-border)] bg-white p-6 shadow-xl sm:p-7">
        <button
          onClick={handleClose}
          aria-label="Stäng"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-secondary)]"
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="py-4 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
              <Check className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-[var(--color-brand-ink)]">
              Meddelandet är skickat!
            </h2>
            <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
              Vi återkommer till er så snart vi kan.
            </p>
            <Button onClick={handleClose} className="mt-5">
              Stäng
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-extrabold text-[var(--color-brand-ink)]">Kontakta oss</h2>
            <p className="mt-1.5 text-sm font-medium text-[var(--color-brand-muted)]">
              Berätta vad ni behöver hjälp med så hör vi av oss.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {HELP_TOPICS.map((topic) => {
                const checked = selectedTopics.includes(topic);
                return (
                  <label
                    key={topic}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-sm font-semibold transition cursor-pointer ${
                      checked
                        ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-secondary)]/40 text-[var(--color-brand-ink)]"
                        : "border-[var(--color-brand-border)] text-[var(--color-brand-ink)] hover:border-[var(--color-brand-primary)]/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTopic(topic)}
                      className="h-4 w-4 shrink-0 rounded border-[var(--color-brand-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    />
                    {topic}
                  </label>
                );
              })}
            </div>

            <label className="mt-4 block text-xs font-extrabold text-[var(--color-brand-ink)]">
              Beskriv gärna mer
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Skriv här..."
                className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-brand-border)] p-3 text-sm font-medium text-[var(--color-brand-ink)] placeholder:text-[var(--color-brand-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none"
              />
            </label>

            {error && (
              <p className="mt-3 text-xs font-bold text-[#c0392b]">{error}</p>
            )}

            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={sending || (selectedTopics.length === 0 && !message.trim())}
                icon={sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              >
                {sending ? "Skickar..." : "Skicka"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
