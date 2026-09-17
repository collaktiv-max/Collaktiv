import { type LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]">
          <Icon className="h-5 w-5" />
        </span>
        {trend && (
          <span className="rounded-full bg-[var(--color-brand-accent)]/15 px-2.5 py-1 text-[11px] font-extrabold text-[#3f7a1c]">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold text-[var(--color-brand-ink)]">
        {value}
      </p>
      <p className="text-[12.5px] font-bold text-[var(--color-brand-muted)]">{label}</p>
    </div>
  );
}
