"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

export function LogoUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/50 text-[var(--color-brand-muted)] transition hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Logotyp" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6" />
        )}
      </button>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-extrabold text-[var(--color-brand-primary)]"
        >
          {value ? "Byt logotyp" : "Ladda upp logotyp"}
        </button>
        <p className="mt-0.5 text-xs font-medium text-[var(--color-brand-muted)]">
          PNG eller JPG, minst 200×200px
        </p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="mt-1 flex items-center gap-1 text-xs font-bold text-[var(--color-brand-muted)] hover:text-[#c0392b]"
          >
            <X className="h-3.5 w-3.5" /> Ta bort
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
