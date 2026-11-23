import { Smartphone, Store } from "lucide-react";

export function RedemptionGuideCard() {
  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
        <Smartphone className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-[15px] font-extrabold text-[var(--color-brand-ink)]">
        Så löser en resenär in ett erbjudande
      </h3>
      <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
        Visa gärna er personal hur det ser ut, så de känner igen det i kassan.
      </p>

      <RedemptionScreenPreview />

      <p className="mt-4 text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
        Resenären visar upp en swish-liknande sida på sin mobil i appen. Er
        personal bekräftar den i kassan för att lösa in erbjudandet.
      </p>
    </div>
  );
}

// Generisk, statisk återgivning av resenärsappens inlösensida (ett eget
// projekt - collaktiv-lac.vercel.app - inte den här kodbasen) med
// "Ditt företag"/"Ditt erbjudande" istället för ett riktigt exempel,
// så den funkar som guide oavsett vilket företag som tittar på den.
function RedemptionScreenPreview() {
  const circumference = 2 * Math.PI * 54;
  return (
    <div className="mt-4 flex justify-center">
      <div
        className="flex w-full max-w-[220px] flex-col items-center gap-5 rounded-[1.75rem] px-5 py-7 text-center shadow-sm"
        style={{ backgroundColor: "var(--color-brand-primary)" }}
      >
        <div className="flex items-center gap-2 self-start">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
            <Store className="h-3.5 w-3.5" />
          </span>
          <span className="text-[12px] font-extrabold text-white">Ditt företag</span>
        </div>

        <div>
          <p
            className="text-[26px] font-extrabold leading-[1.05]"
            style={{ color: "var(--color-brand-accent)" }}
          >
            Ditt erbjudande
          </p>
          <p className="mt-1.5 text-[11.5px] font-bold text-white/85">
            Så ser det ut för kunden
          </p>
        </div>

        <div className="relative flex h-[116px] w-[116px] items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-brand-accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.17}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[22px] font-extrabold leading-none text-white">08:40</span>
            <span className="mt-1 text-[9.5px] font-bold text-white/70">kvar</span>
          </div>
        </div>

        <span className="w-full rounded-full border border-white/25 py-2 text-[12px] font-extrabold text-white">
          Klar
        </span>
      </div>
    </div>
  );
}
