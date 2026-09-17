"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const links = [
  { href: "#varfor", label: "Varför Collaktiv" },
  { href: "#sa-funkar-det", label: "Så funkar det" },
  { href: "#faq", label: "Vanliga frågor" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-brand-border)] bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-[var(--color-brand-ink)]/80 transition hover:text-[var(--color-brand-primary)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="/logga-in" variant="ghost" size="sm">
            Logga in
          </Button>
          <Button href="/registrera" variant="primary" size="sm">
            Registrera ert företag
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-brand-ink)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Öppna meny"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-[var(--color-brand-border)] bg-white px-5 py-5 md:hidden animate-slide-up">
          <nav className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-bold text-[var(--color-brand-ink)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-5 flex flex-col gap-3">
            <Button href="/logga-in" variant="outline">
              Redan partner? Logga in
            </Button>
            <Button href="/registrera" variant="primary">
              Registrera ert företag
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
