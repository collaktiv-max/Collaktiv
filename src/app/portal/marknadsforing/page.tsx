"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Printer,
  Sparkles,
  Wand2,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, Textarea } from "@/components/ui/Field";
import { AssetCard } from "@/components/marketing/AssetCard";
import { useAppState } from "@/lib/store";
import { generateMarketingVariants, type MarketingVariant } from "@/lib/ai-mock";

const FREE_VARIANT_LIMIT = 3;

export default function MarknadsforingPage() {
  const { currentCompany, companyOffers } = useAppState();
  const [selectedOfferId, setSelectedOfferId] = useState<string>(companyOffers[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [variants, setVariants] = useState<MarketingVariant[]>([]);
  const [generating, setGenerating] = useState(false);
  const [variantAllowance, setVariantAllowance] = useState(FREE_VARIANT_LIMIT);
  const [unlocking, setUnlocking] = useState(false);

  const offer = useMemo(
    () => companyOffers.find((o) => o.id === selectedOfferId) ?? companyOffers[0],
    [companyOffers, selectedOfferId]
  );

  if (!currentCompany) return null;

  async function handleGenerate() {
    if (variants.length >= variantAllowance) return;
    setGenerating(true);
    const remaining = variantAllowance - variants.length;
    const result = await generateMarketingVariants(
      currentCompany!.name,
      offer?.title ?? "Erbjudande",
      Math.min(3, remaining)
    );
    setVariants((v) => [...v, ...result]);
    setGenerating(false);
  }

  async function handleUnlockMore() {
    setUnlocking(true);
    await new Promise((r) => setTimeout(r, 900));
    setVariantAllowance((n) => n + 6);
    setUnlocking(false);
  }

  const atLimit = variants.length >= variantAllowance;

  return (
    <div>
      <PageHeader
        title="Marknadsföring"
        subtitle="Färdigt material för sociala medier och tryck – automatiskt fyllt med er information."
      />

      {companyOffers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-white p-10 text-center">
          <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
            Skapa ett erbjudande först
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-brand-muted)]">
            Marknadsföringsmaterialet fylls automatiskt med ert erbjudande.
          </p>
          <Button href="/portal/erbjudanden/nytt" className="mt-5">
            Skapa erbjudande
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-[var(--color-brand-border)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                Erbjudande som används i materialet
              </p>
              <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                Byt erbjudande för att uppdatera alla mallar direkt.
              </p>
            </div>
            <Select
              value={offer?.id}
              onChange={(e) => setSelectedOfferId(e.target.value)}
              className="sm:w-64"
            >
              {companyOffers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </Select>
          </div>

          {/* Digitalt */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[var(--color-brand-ink)]">Digitalt</h2>
              <Badge variant="light">Sociala medier</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AssetCard
                label="Instagram-inlägg"
                meta="1080 × 1080 px"
                width={1080}
                height={1080}
                variant="dark"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                filename="instagram-inlagg.png"
              />
              <AssetCard
                label="Instagram-story"
                meta="1080 × 1920 px"
                width={1080}
                height={1920}
                variant="accent"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                previewHeightClass="h-64"
                filename="instagram-story.png"
              />
              <AssetCard
                label="Facebook-inlägg"
                meta="1200 × 630 px"
                width={1200}
                height={630}
                variant="light"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                filename="facebook-inlagg.png"
              />
            </div>

            {/* AI-generator */}
            <div className="mt-6 rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-secondary)]/50 p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)]">
                  <Wand2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
                    Låt AI skapa fler varianter
                  </p>
                  <p className="text-xs font-medium text-[var(--color-brand-muted)]">
                    Beskriv stil eller budskap, så tar vår AI fram förslag åt er
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="T.ex. 'en somrig variant med glada färger' eller 'mer minimalistisk stil'"
                  className="min-h-[52px] flex-1 bg-white"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={generating || atLimit}
                  className="shrink-0"
                  icon={
                    generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )
                  }
                >
                  {generating ? "Genererar..." : "Generera varianter"}
                </Button>
              </div>

              {variants.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {variants.map((v) => (
                    <AssetCard
                      key={v.id}
                      label="AI-genererad variant"
                      meta="1080 × 1080 px"
                      width={1080}
                      height={1080}
                      variant={["dark", "accent", "light"][variants.indexOf(v) % 3] as "dark" | "accent" | "light"}
                      companyName={v.subline}
                      offerTitle={v.headline}
                      discountValue={`${v.emoji} AI`}
                      qr
                      filename={`ai-variant-${v.id}.png`}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--color-brand-muted)]">
                  {variants.length} av {variantAllowance} varianter använda den här månaden
                </p>
                {atLimit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUnlockMore}
                    disabled={unlocking}
                    icon={unlocking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : undefined}
                  >
                    {unlocking ? "Låser upp..." : "Köp 6 fler varianter – 79 kr"}
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Analogt */}
          <section className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[var(--color-brand-ink)]">Analogt</h2>
              <Badge variant="light">Skriv ut själva</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AssetCard
                label="Affisch (A4)"
                meta="För skyltfönster"
                width={1000}
                height={1414}
                variant="dark"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                previewHeightClass="h-56"
                filename="affisch-a4.png"
              />
              <AssetCard
                label="Flyer"
                meta="För utdelning"
                width={1000}
                height={1414}
                variant="light"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                previewHeightClass="h-56"
                filename="flyer.png"
              />
              <AssetCard
                label="Kort"
                meta="Kassakort"
                width={1050}
                height={600}
                variant="accent"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                filename="kort.png"
              />
              <AssetCard
                label="Bordsställ"
                meta="För bord/disk"
                width={900}
                height={1200}
                variant="dark"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                previewHeightClass="h-56"
                filename="bordsstall.png"
              />
              <AssetCard
                label="Klistermärke"
                meta="Dörr/skyltfönster"
                width={600}
                height={600}
                variant="light"
                qr
                companyName={currentCompany.name}
                offerTitle={offer?.title ?? ""}
                discountValue={offer?.discountValue ?? ""}
                filename="klistermarke.png"
              />

              <div className="flex flex-col justify-between rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-white p-5">
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
                    <Printer className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-[13.5px] font-extrabold text-[var(--color-brand-ink)]">
                    Beställ tryckt material
                  </p>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                    Snart kan ni beställa affischer och kort i premiumfinish,
                    tryckta och levererade direkt till er – via samma mallar.
                  </p>
                </div>
                <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-brand-secondary)] px-3 py-1.5 text-[11px] font-extrabold text-[var(--color-brand-primary)]">
                  <Clock className="h-3.5 w-3.5" /> Kommer snart
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
