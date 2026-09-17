"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OfferPreviewPhone } from "./OfferPreviewPhone";
import {
  generateOfferSuggestions,
  improveOfferCopy,
  suggestPointsRange,
  wait,
} from "@/lib/ai-mock";
import type { Category, DiscountType } from "@/lib/types";

export interface OfferFormValues {
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  pointsCost: number;
  validTo: string;
  terms: string;
  imageEmoji: string;
  imageDataUrl?: string;
  imageOptimized?: boolean;
}

const EMOJI_OPTIONS = ["🛍️", "☕", "🍔", "💪", "🎬", "✂️", "🌿", "🎁", "✨", "🥗"];

export function OfferForm({
  initial,
  companyName,
  category,
  onSave,
  saveLabel = "Spara utkast",
  saving = false,
}: {
  initial: OfferFormValues;
  companyName: string;
  category: Category;
  onSave: (values: OfferFormValues) => void;
  saveLabel?: string;
  saving?: boolean;
}) {
  const [values, setValues] = useState<OfferFormValues>(initial);
  const [suggestions, setSuggestions] = useState<
    { title: string; description: string; discountValue: string }[] | null
  >(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [improving, setImproving] = useState(false);
  const [pointsRange, setPointsRange] = useState<{ min: number; max: number; recommended: number } | null>(null);
  const [optimizingImage, setOptimizingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  useEffect(() => {
    let cancelled = false;
    suggestPointsRange(values.discountType, values.discountValue).then((r) => {
      if (!cancelled) setPointsRange(r);
    });
    return () => {
      cancelled = true;
    };
  }, [values.discountType, values.discountValue]);

  async function handleGenerateSuggestions() {
    setLoadingSuggestions(true);
    const result = await generateOfferSuggestions(category);
    setSuggestions(result);
    setLoadingSuggestions(false);
  }

  function applySuggestion(s: { title: string; description: string; discountValue: string }) {
    setValues((v) => ({
      ...v,
      title: s.title,
      description: s.description,
      discountValue: s.discountValue,
      discountType: "procent",
    }));
    setSuggestions(null);
  }

  async function handleImprove() {
    setImproving(true);
    const result = await improveOfferCopy(values.title, values.description);
    setValues((v) => ({ ...v, title: result.title, description: result.description }));
    setImproving(false);
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      update("imageDataUrl", reader.result as string);
      update("imageOptimized", false);
      setOptimizingImage(true);
      await wait(1100);
      setOptimizingImage(false);
      update("imageOptimized", true);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="flex flex-col gap-6">
        {/* AI-förslag */}
        <div className="rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)]">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                  Låt AI föreslå ett erbjudande
                </p>
                <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                  Baserat på er kategori och liknande företag
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateSuggestions}
              disabled={loadingSuggestions}
              icon={
                loadingSuggestions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )
              }
            >
              {loadingSuggestions ? "Genererar..." : "Generera förslag"}
            </Button>
          </div>

          {suggestions && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s.title}
                  onClick={() => applySuggestion(s)}
                  className="rounded-xl border border-[var(--color-brand-border)] bg-white p-4 text-left transition hover:border-[var(--color-brand-primary)] hover:shadow-sm"
                >
                  <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                    {s.title}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--color-brand-muted)]">
                    {s.description}
                  </p>
                  <span className="mt-2 inline-block text-xs font-extrabold text-[var(--color-brand-primary)]">
                    Använd förslag →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Field
          label="Titel"
          required
          hint="Kort och tydligt, t.ex. '20% rabatt på hela köpet'"
        >
          <div className="flex gap-2">
            <Input
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="T.ex. 20% rabatt på hela köpet"
            />
            <button
              type="button"
              onClick={handleImprove}
              disabled={improving}
              title="Förbättra text med AI"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-brand-border)] px-3 text-xs font-extrabold text-[var(--color-brand-primary)] transition hover:bg-[var(--color-brand-secondary)] disabled:opacity-60"
            >
              {improving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>
        </Field>

        <Field label="Beskrivning" required>
          <Textarea
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Vad ingår i erbjudandet, och hur löser man in det?"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Typ av rabatt" required>
            <Select
              value={values.discountType}
              onChange={(e) => update("discountType", e.target.value as DiscountType)}
            >
              <option value="procent">Procent</option>
              <option value="belopp">Kronor</option>
              <option value="erbjudande">Fritt erbjudande</option>
            </Select>
          </Field>
          <Field label="Rabattvärde" required>
            <Input
              value={values.discountValue}
              onChange={(e) => update("discountValue", e.target.value)}
              placeholder={
                values.discountType === "procent"
                  ? "T.ex. 20%"
                  : values.discountType === "belopp"
                  ? "T.ex. 100 kr"
                  : "T.ex. 1 gratis fika"
              }
            />
          </Field>
        </div>

        <Field
          label="Poängkostnad"
          required
          hint={
            pointsRange
              ? `Föreslaget intervall för denna rabatt: ${pointsRange.min}–${pointsRange.max} poäng`
              : undefined
          }
        >
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              value={values.pointsCost}
              onChange={(e) => update("pointsCost", Number(e.target.value))}
              className="max-w-[140px]"
            />
            {pointsRange && (
              <button
                type="button"
                onClick={() => update("pointsCost", pointsRange.recommended)}
                className="text-xs font-extrabold text-[var(--color-brand-primary)] hover:underline"
              >
                Använd rekommenderat ({pointsRange.recommended})
              </button>
            )}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Giltigt till" hint="Lämna tomt för löpande erbjudande">
            <Input
              type="date"
              value={values.validTo}
              onChange={(e) => update("validTo", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Villkor" hint="Valfritt, t.ex. begränsningar eller undantag">
          <Textarea
            value={values.terms}
            onChange={(e) => update("terms", e.target.value)}
            placeholder="T.ex. gäller ej redan nedsatta varor"
          />
        </Field>

        <Field label="Bild">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/50 text-xl"
            >
              {values.imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.imageDataUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-5 w-5 text-[var(--color-brand-muted)]" />
              )}
            </button>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-left text-sm font-extrabold text-[var(--color-brand-primary)]"
              >
                {values.imageDataUrl ? "Byt bild" : "Ladda upp bild"}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      update("imageEmoji", emoji);
                      update("imageDataUrl", undefined);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition ${
                      values.imageEmoji === emoji && !values.imageDataUrl
                        ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-secondary)]"
                        : "border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {values.imageDataUrl && (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  {optimizingImage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-brand-primary)]" />
                      <span className="text-[var(--color-brand-muted)]">
                        AI anpassar bilden till rätt format...
                      </span>
                    </>
                  ) : values.imageOptimized ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" />
                      <span className="text-[var(--color-brand-primary)]">
                        Optimerad för appen (1080×720)
                      </span>
                    </>
                  ) : null}
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
            />
          </div>
        </Field>

        <div className="flex items-center justify-between border-t border-[var(--color-brand-border)] pt-6">
          <Badge variant="outline">Sparas automatiskt som utkast</Badge>
          <Button
            onClick={() => onSave(values)}
            disabled={saving || !values.title || !values.description}
            icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {saveLabel}
          </Button>
        </div>
      </div>

      <div className="hidden lg:block">
        <OfferPreviewPhone
          companyName={companyName}
          category={category}
          title={values.title}
          description={values.description}
          discountType={values.discountType}
          discountValue={values.discountValue}
          pointsCost={values.pointsCost}
          emoji={values.imageEmoji}
          imageDataUrl={values.imageDataUrl}
        />
      </div>
    </div>
  );
}
