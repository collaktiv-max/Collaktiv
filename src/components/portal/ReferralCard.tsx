"use client";

import { useState } from "react";
import { Gift, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAppState } from "@/lib/store";

export function ReferralCard() {
  const { state, inviteReferral } = useAppState();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 500));
    inviteReferral(email);
    setSending(false);
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 2500);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-gradient-to-br from-[#0f1f18] to-[#163627] p-6 text-white">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[var(--color-brand-accent)]">
        <Gift className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-[15px] font-extrabold">
        Bjud in ett annat företag
      </h3>
      <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-white/70">
        För varje företag som registrerar sig via er inbjudan får ni en
        månad extra exponering på Premium – helt gratis.
      </p>

      <form onSubmit={handleInvite} className="mt-4 flex gap-2">
        <Input
          type="email"
          required
          placeholder="foretag@exempel.se"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/10"
        />
        <Button
          type="submit"
          size="sm"
          variant="white"
          disabled={sending}
          icon={
            sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )
          }
        >
          {sent ? "Skickat!" : "Bjud in"}
        </Button>
      </form>

      {state.referrals.length > 0 && (
        <p className="mt-3 text-[11px] font-bold text-white/50">
          {state.referrals.length} inbjudan{state.referrals.length === 1 ? "" : "ar"} skickade hittills
        </p>
      )}
    </div>
  );
}
