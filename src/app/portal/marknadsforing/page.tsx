import { Clock, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";

export default function MarknadsforingPage() {
  return (
    <div>
      <PageHeader
        title="Marknadsföring"
        subtitle="Färdigt material för sociala medier och tryck – automatiskt fyllt med er information."
      />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-white p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
          <Megaphone className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-lg font-extrabold text-[var(--color-brand-ink)]">
          Marknadsföringsmaterial kommer snart
        </h2>
        <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-[var(--color-brand-muted)]">
          Här kommer ni snart kunna ladda ner färdiga mallar för sociala
          medier och tryck, automatiskt fyllda med ert erbjudande och er
          information.
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-secondary)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-brand-primary)]">
          <Clock className="h-3.5 w-3.5" /> Kommer snart
        </span>
      </div>
    </div>
  );
}
