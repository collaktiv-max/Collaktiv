import { Smartphone, Star, Store } from "lucide-react";

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

// Stjärnorna som tonar in/ut bakom ringen i resenärsappens riktiga
// inlösensida - här som en alltid synlig, mjukt pulserande dekoration
// (ingen video behövs) istället för att bara råka fångas i en enda
// stillbild. Position/storlek/fördröjning är bara kosmetiska, inte
// data - fasta värden räcker.
const STARS = [
  { top: "8%", left: "72%", size: 14, delay: "0s", opacity: "opacity-25" },
  { top: "18%", left: "14%", size: 10, delay: "0.4s", opacity: "opacity-20" },
  { top: "38%", left: "86%", size: 11, delay: "0.9s", opacity: "opacity-30" },
  { top: "62%", left: "10%", size: 13, delay: "0.2s", opacity: "opacity-20" },
  { top: "78%", left: "78%", size: 9, delay: "0.7s", opacity: "opacity-25" },
  { top: "90%", left: "30%", size: 10, delay: "1.1s", opacity: "opacity-20" },
];

// Generisk, statisk återgivning av resenärsappens inlösensida (ett eget
// projekt - collaktiv-lac.vercel.app - inte den här kodbasen) med
// "Ditt företag"/"Ditt erbjudande" istället för ett riktigt exempel,
// så den funkar som guide oavsett vilket företag som tittar på den.
function RedemptionScreenPreview() {
  const circumference = 2 * Math.PI * 54;
  return (
    <div className="mt-4 flex justify-center">
      <div
        className="relative flex w-full max-w-[150px] flex-col items-center gap-2.5 overflow-hidden rounded-2xl px-3.5 py-4 text-center shadow-sm"
        style={{ backgroundColor: "var(--color-brand-primary)" }}
      >
        {STARS.map((star, i) => (
          <Star
            key={i}
            className={`pointer-events-none absolute animate-pulse fill-current text-white ${star.opacity}`}
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: "2.2s",
            }}
          />
        ))}

        <div className="relative flex items-center gap-1.5 self-start">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
            <Store className="h-2.5 w-2.5" />
          </span>
          <span className="text-[9.5px] font-extrabold text-white">Ditt företag</span>
        </div>

        <div className="relative">
          <p
            className="text-[16px] font-extrabold leading-[1.05]"
            style={{ color: "var(--color-brand-accent)" }}
          >
            Ditt erbjudande
          </p>
          <p className="mt-1 text-[8.5px] font-bold text-white/85">
            Så ser det ut för kunden
          </p>
        </div>

        <div className="relative flex h-[66px] w-[66px] items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-brand-accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.17}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[12.5px] font-extrabold leading-none text-white">08:40</span>
            <span className="mt-0.5 text-[7px] font-bold text-white/70">kvar</span>
          </div>
        </div>

        <span className="relative w-full rounded-full border border-white/25 py-1 text-[9px] font-extrabold text-white">
          Klar
        </span>
      </div>
    </div>
  );
}
