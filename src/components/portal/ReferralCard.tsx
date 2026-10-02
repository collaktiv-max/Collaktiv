"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, Mail } from "lucide-react";
import { useAppState } from "@/lib/store";

export function ReferralCard() {
  const { currentCompany, referralCount } = useAppState();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  if (!currentCompany) return null;

  const link = origin ? `${origin}/registrera?ref=${currentCompany.id}` : "";

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard-API kan vara blockerad – länken går fortfarande att
      // markera och kopiera manuellt ur fältet.
    }
  }

  const mailBody = `Hej!\n\nJag vill tipsa er om Collaktiv – en plattform där ni syns för hållbara resenärer i Gävleborg.\n\nRegistrera ert företag här: ${link}\n\nHälsningar ${currentCompany.name}`;
  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    "Tips: bli partner på Collaktiv"
  )}&body=${encodeURIComponent(mailBody)}`;

  return (
    <div
      id="bjud-in-foretag"
      className="rounded-2xl border border-[var(--color-brand-border)] bg-gradient-to-br from-[#0f1f18] to-[#163627] p-6 text-white scroll-mt-6"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[var(--color-brand-accent)]">
        <Gift className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-[15px] font-extrabold">
        Bjud in ett annat företag
      </h3>
      <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-white/70">
        Dela er personliga länk. När ett företag registrerar sig via den
        och betalar för sitt första paket får ni en gratis bonusmånad –
        Standard om ni inget paket har, annars förlängs ert nuvarande
        paket en månad.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          readOnly
          value={link}
          placeholder="Laddar länk..."
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!link}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-[var(--color-brand-primary)] transition hover:bg-white/90 disabled:opacity-60"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Kopierat!" : "Kopiera"}
        </button>
      </div>

      <a
        href={mailtoHref}
        className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-white/80 hover:text-white"
      >
        <Mail className="h-3.5 w-3.5" /> Dela via mejl
      </a>

      {referralCount > 0 && (
        <p className="mt-3 text-[11px] font-bold text-white/50">
          {referralCount} företag har registrerat sig via er länk
        </p>
      )}
    </div>
  );
}
