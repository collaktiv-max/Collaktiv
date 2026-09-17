"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { downloadCanvas, renderMarketingAsset, type AssetConfig } from "@/lib/canvas-assets";

export function AssetCard({
  label,
  meta,
  width,
  height,
  variant = "dark",
  qr = false,
  companyName,
  offerTitle,
  discountValue,
  previewHeightClass = "h-44",
  filename,
}: {
  label: string;
  meta?: string;
  width: number;
  height: number;
  variant?: AssetConfig["variant"];
  qr?: boolean;
  companyName: string;
  offerTitle: string;
  discountValue: string;
  previewHeightClass?: string;
  filename: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderMarketingAsset(canvasRef.current, {
      width,
      height,
      companyName: companyName || "Ert företag",
      offerTitle: offerTitle || "Erbjudandets titel",
      discountValue: discountValue || "-20%",
      variant,
      qr,
    });
  }, [width, height, companyName, offerTitle, discountValue, variant, qr]);

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-brand-border)] bg-white p-4">
      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl bg-[var(--color-brand-secondary)]/50 ${previewHeightClass}`}
      >
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[13.5px] font-extrabold text-[var(--color-brand-ink)]">{label}</p>
          {meta && <p className="text-[11px] font-semibold text-[var(--color-brand-muted)]">{meta}</p>}
        </div>
        <button
          onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, filename)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-border)] text-[var(--color-brand-primary)] transition hover:bg-[var(--color-brand-secondary)]"
          aria-label={`Ladda ner ${label}`}
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
