import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div>
      {/* Mobil: kompakt progressbar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--color-brand-muted)]">
          <span>
            Steg {current + 1} av {steps.length}
          </span>
          <span className="text-[var(--color-brand-primary)]">{steps[current]}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-brand-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-brand-primary)] transition-all duration-300"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: full stepper */}
      <div className="hidden items-center sm:flex">
        {steps.map((label, i) => {
          const isDone = i < current;
          const isActive = i === current;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold transition-colors",
                    isDone && "bg-[var(--color-brand-primary)] text-white",
                    isActive &&
                      "bg-white text-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]",
                    !isDone && !isActive && "bg-[var(--color-brand-secondary)] text-[var(--color-brand-muted)]"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-bold",
                    isActive || isDone
                      ? "text-[var(--color-brand-ink)]"
                      : "text-[var(--color-brand-muted)]"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-0.5 flex-1 rounded-full transition-colors",
                    isDone ? "bg-[var(--color-brand-primary)]" : "bg-[var(--color-brand-border)]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
