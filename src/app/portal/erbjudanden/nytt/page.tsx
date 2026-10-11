"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { OfferForm, type OfferFormValues } from "@/components/portal/OfferForm";
import { ContactHelpModal } from "@/components/portal/ContactHelpModal";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/store";

const emptyValues: OfferFormValues = {
  title: "",
  description: "",
  discountType: "procent",
  discountValue: "",
  discountValueKr: 0,
  pointsCost: 20,
  validTo: "",
  terms: "",
  imageEmoji: "🛍️",
};

export default function NyttErbjudandePage() {
  const { currentCompany, addOffer } = useAppState();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  if (!currentCompany) return null;

  async function handleSave(values: OfferFormValues) {
    setSaving(true);
    const id = await addOffer({
      title: values.title,
      description: values.description,
      discountType: values.discountType,
      discountValue: values.discountValue,
      discountValueKr: values.discountValueKr,
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
        action={
          <div className="flex flex-nowrap items-center justify-end gap-2.5">
            <span className="max-w-[120px] shrink-0 text-right text-[11px] font-semibold leading-tight text-[var(--color-brand-muted)]">
              Har du frågor om hur man skapar erbjudande?
            </span>
            <Button onClick={() => setHelpOpen(true)} icon={<LifeBuoy className="h-4 w-4" />}>
              Kontakta oss
            </Button>
          </div>
        }
      />
      <OfferForm
        initial={emptyValues}
        companyName={currentCompany.name}
        category={currentCompany.category}
        initialTier={currentCompany.packageTier}
        onSave={handleSave}
        saveLabel="Spara och fortsätt"
        saving={saving}
      />
      <ContactHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
