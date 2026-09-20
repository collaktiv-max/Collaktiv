"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { OfferForm, type OfferFormValues } from "@/components/portal/OfferForm";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/store";

export default function RedigeraErbjudandePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, currentCompany, updateOffer } = useAppState();
  const [saving, setSaving] = useState(false);

  const offer = state.offers.find((o) => o.id === id);

  if (!currentCompany) return null;

  if (!offer) {
    return (
      <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-10 text-center">
        <p className="text-sm font-extrabold text-[var(--color-brand-ink)]">
          Erbjudandet hittades inte
        </p>
        <Button href="/portal/erbjudanden" className="mt-4">
          Tillbaka till erbjudanden
        </Button>
      </div>
    );
  }

  const initial: OfferFormValues = {
    title: offer.title,
    description: offer.description,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    pointsCost: offer.pointsCost,
    validTo: offer.validTo ?? "",
    terms: offer.terms ?? "",
    imageEmoji: offer.imageEmoji,
    imageDataUrl: offer.imageDataUrl,
    imageOptimized: offer.imageOptimized,
  };

  async function handleSave(values: OfferFormValues) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateOffer(offer!.id, {
      title: values.title,
      description: values.description,
      discountType: values.discountType,
      discountValue: values.discountValue,
      pointsCost: values.pointsCost,
      validTo: values.validTo || undefined,
      terms: values.terms || undefined,
      imageEmoji: values.imageEmoji,
      imageDataUrl: values.imageDataUrl,
      imageOptimized: values.imageOptimized,
    });
    setSaving(false);
    router.push("/portal/erbjudanden");
  }

  return (
    <div>
      <PageHeader
        title="Redigera erbjudande"
        subtitle="Ändringar sparas till erbjudandet."
        action={
          offer.status === "utkast" && (
            <Button
              href={`/portal/erbjudanden/${offer.id}/publicera`}
              variant="outline"
              icon={<Rocket className="h-4 w-4" />}
            >
              Gå till publicering
            </Button>
          )
        }
      />
      <OfferForm
        initial={initial}
        companyName={currentCompany.name}
        category={currentCompany.category}
        onSave={handleSave}
        saveLabel="Spara ändringar"
        saving={saving}
      />
    </div>
  );
}
