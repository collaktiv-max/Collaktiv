import { ImageIcon, Smartphone } from "lucide-react";

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

      <div className="mt-4 flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/40 text-center">
        <ImageIcon className="h-6 w-6 text-[var(--color-brand-muted)]" />
        <p className="px-4 text-[11.5px] font-bold text-[var(--color-brand-muted)]">
          Bild kommer snart
        </p>
      </div>

      <p className="mt-4 text-[12.5px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
        Resenären visar upp en swish-liknande kod på sin mobil i appen. Er
        personal bekräftar koden i kassan för att lösa in erbjudandet.
      </p>
    </div>
  );
}
