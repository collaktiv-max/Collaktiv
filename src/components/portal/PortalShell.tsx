"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Plus, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/store";
import { navItems } from "./nav-items";
import { CATEGORY_LABELS } from "@/lib/types";

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function PortalShell({ children }: { children: ReactNode }) {
  const { ready, currentCompany, logout } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !currentCompany) {
      router.replace("/logga-in");
    }
  }, [ready, currentCompany, router]);

  if (!ready || !currentCompany) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-brand-secondary)]/40">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-brand-secondary)]/30 lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-brand-border)] bg-white lg:flex">
        <div className="flex h-20 items-center px-6">
          <Link href="/portal">
            <Logo />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item && item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-[var(--color-brand-primary)] text-white"
                    : "text-[var(--color-brand-ink)]/75 hover:bg-[var(--color-brand-secondary)]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--color-brand-border)] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--color-brand-secondary)] p-3">
            <CompanyAvatar name={currentCompany.name} logo={currentCompany.logoDataUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-[var(--color-brand-ink)]">
                {currentCompany.name}
              </p>
              <p className="truncate text-[11px] font-bold text-[var(--color-brand-muted)]">
                {CATEGORY_LABELS[currentCompany.category]}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              aria-label="Logga ut"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-brand-muted)] hover:bg-white hover:text-[#c0392b]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--color-brand-border)] bg-white/90 px-5 backdrop-blur lg:hidden">
          <Link href="/portal">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Button href="/portal/erbjudanden/nytt" size="sm" icon={<Plus className="h-4 w-4" />}>
              Nytt
            </Button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Öppna meny"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-brand-ink)]"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-72 flex-col bg-white p-5 animate-slide-up">
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Stäng meny"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-brand-ink)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-[var(--color-brand-secondary)] p-3">
                <CompanyAvatar name={currentCompany.name} logo={currentCompany.logoDataUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[var(--color-brand-ink)]">
                    {currentCompany.name}
                  </p>
                  <p className="truncate text-[11px] font-bold text-[var(--color-brand-muted)]">
                    {CATEGORY_LABELS[currentCompany.category]}
                  </p>
                </div>
              </div>
              <nav className="flex flex-1 flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href, "exact" in item && item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                        active
                          ? "bg-[var(--color-brand-primary)] text-white"
                          : "text-[var(--color-brand-ink)]/75 hover:bg-[var(--color-brand-secondary)]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                  router.push("/");
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#c0392b] hover:bg-[#fdecea]"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Logga ut
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="sticky bottom-0 z-30 grid grid-cols-4 border-t border-[var(--color-brand-border)] bg-white/95 backdrop-blur lg:hidden">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, "exact" in item && item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold ${
                  active ? "text-[var(--color-brand-primary)]" : "text-[var(--color-brand-muted)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function CompanyAvatar({ name, logo }: { name: string; logo?: string }) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-lg object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] text-sm font-extrabold text-white">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
