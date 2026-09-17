"use client";

import Link from "next/link";
import { Eye, Pencil, Plus, Rocket, Ticket, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAppState } from "@/lib/store";
import type { OfferStatus } from "@/lib/types";

const STATUS_CONFIG: Record<OfferStatus, { label: string; variant: "light" | "accent" | "dark" | "outline" }> = {
  utkast: { label: "Utkast", variant: "outline" },
  vantar_pa_betalning: { label: "Väntar på publicering", variant: "light" },
  publicerad: { label: "Publicerad", variant: "accent" },
  arkiverad: { label: "Arkiverad", variant: "outline" },
};

export default function ErbjudandenPage() {
  const { companyOffers, deleteOffer } = useAppState();

  return (
    <div>
      <PageHeader
        title="Erbjudanden"
        subtitle="Skapa, redigera och publicera era erbjudanden i appen."
        action={
          <Button href="/portal/erbjudanden/nytt" icon={<Plus className="h-4 w-4" />}>
            Nytt erbjudande
          </Button>
        }
      />

      {companyOffers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-brand-border)] bg-white p-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
            <Ticket className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-extrabold text-[var(--color-brand-ink)]">
            Inga erbjudanden ännu
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-brand-muted)]">
            Skapa ert första erbjudande – det tar bara någon minut.
          </p>
          <Button href="/portal/erbjudanden/nytt" className="mt-5">
            Skapa erbjudande
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companyOffers.map((offer) => {
            const status = STATUS_CONFIG[offer.status];
            return (
              <div
                key={offer.id}
                className="flex flex-col rounded-2xl border border-[var(--color-brand-border)] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-xl">
                    {offer.imageDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={offer.imageDataUrl}
                        alt=""
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      offer.imageEmoji
                    )}
                  </span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <h3 className="mt-3 text-[15px] font-extrabold text-[var(--color-brand-ink)]">
                  {offer.title}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-[13px] font-medium leading-relaxed text-[var(--color-brand-muted)]">
                  {offer.description}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs font-bold text-[var(--color-brand-muted)]">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {offer.stats.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" /> {offer.stats.redemptions}
                  </span>
                  <span className="ml-auto font-extrabold text-[var(--color-brand-primary)]">
                    {offer.pointsCost} p
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-brand-border)] pt-4">
                  <Link
                    href={`/portal/erbjudanden/${offer.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-brand-border)] py-2 text-xs font-extrabold text-[var(--color-brand-ink)] transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)]"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Redigera
                  </Link>
                  {offer.status !== "publicerad" && (
                    <Link
                      href={`/portal/erbjudanden/${offer.id}/publicera`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-brand-primary)] py-2 text-xs font-extrabold text-white transition hover:bg-[var(--color-brand-primary-hover)]"
                    >
                      <Rocket className="h-3.5 w-3.5" /> Publicera
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Ta bort "${offer.title}"?`)) deleteOffer(offer.id);
                    }}
                    aria-label="Ta bort"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-brand-muted)] hover:bg-[#fdecea] hover:text-[#c0392b]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
