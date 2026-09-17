"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/portal/PageHeader";
import { OfferForm, type OfferFormValues } from "@/components/portal/OfferForm";
import { useAppState } from "@/lib/store";

const emptyValues: OfferFormValues = {
  title: "",
  description: "",
  discountType: "procent",
  discountValue: "",
  pointsCost: 20,
  validTo: "",
  terms: "",
  imageEmoji: "🛍️",
};

export default function NyttErbjudandePage() {
  const { currentCompany, addOffer } = useAppState();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  if (!currentCompany) return null;

  async function handleSave(values: OfferFormValues) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const id = addOffer({
      companyId: currentCompany!.id,
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
      status: "utkast",
    });
    setSaving(false);
    router.push(`/portal/erbjudanden/${id}/publicera`);
  }

  return (
    <div>
      <PageHeader
        title="Nytt erbjudande"
        subtitle="Fyll i informationen nedan – ni ser direkt hur det kommer se ut i appen."
      />
      <OfferForm
        initial={emptyValues}
        companyName={currentCompany.name}
        category={currentCompany.category}
        onSave={handleSave}
        saveLabel="Spara och fortsätt"
        saving={saving}
      />
    </div>
  );
}
