"use client";

import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { ADMIN_TABS, type AdminTab } from "./AdminTabs";

function NavButton({
  id,
  label,
  Icon,
  active,
  count,
  onClick,
}: {
  id: AdminTab;
  label: string;
  Icon: (typeof ADMIN_TABS)[number]["icon"];
  active: boolean;
  count?: number;
  onClick: (id: AdminTab) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-[var(--color-brand-primary)] text-white"
          : "text-[var(--color-brand-ink)]/75 hover:bg-[var(--color-brand-secondary)]"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span className="flex-1 text-left">{label}</span>
      {!!count && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-extrabold ${
            active ? "bg-white/20 text-white" : "bg-[#e0432c] text-white"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function AdminSidebar({
  activeTab,
  onSelect,
  badgeCounts,
  onLogout,
}: {
  activeTab: AdminTab;
  onSelect: (id: AdminTab) => void;
  badgeCounts: Partial<Record<AdminTab, number>>;
  onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function select(id: AdminTab) {
    onSelect(id);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-brand-border)] bg-white lg:flex">
        <div className="flex h-20 items-center gap-2 px-6">
          <Logo />
          <Badge variant="outline">Admin</Badge>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4">
          {ADMIN_TABS.map((tab) => (
            <NavButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              Icon={tab.icon}
              active={activeTab === tab.id}
              count={badgeCounts[tab.id]}
              onClick={select}
            />
          ))}
        </nav>
        <div className="border-t border-[var(--color-brand-border)] p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#c0392b] hover:bg-[#fdecea]"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logga ut
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--color-brand-border)] bg-white/90 px-5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Logo />
          <Badge variant="outline">Admin</Badge>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Öppna meny"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-brand-ink)]"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-white p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo />
                <Badge variant="outline">Admin</Badge>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Stäng meny"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-brand-ink)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1">
              {ADMIN_TABS.map((tab) => (
                <NavButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  Icon={tab.icon}
                  active={activeTab === tab.id}
                  count={badgeCounts[tab.id]}
                  onClick={select}
                />
              ))}
            </nav>
            <button
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#c0392b] hover:bg-[#fdecea]"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Logga ut
            </button>
          </div>
        </div>
      )}
    </>
  );
}
