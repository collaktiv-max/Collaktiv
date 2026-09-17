import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
  variant = "light",
}: {
  children: ReactNode;
  className?: string;
  variant?: "light" | "accent" | "dark" | "outline" | "translucent";
}) {
  const variants = {
    light:
      "bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]",
    accent: "bg-[var(--color-brand-accent)]/15 text-[#3f7a1c]",
    dark: "bg-[#0f1f18] text-white",
    outline: "border border-[var(--color-brand-border)] text-[var(--color-brand-muted)]",
    translucent: "bg-white/10 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
