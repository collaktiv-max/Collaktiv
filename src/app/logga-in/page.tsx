"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, Loader2, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Field, Input } from "@/components/ui/Field";
import { useAppState } from "@/lib/store";

export default function LoggaInPage() {
  const router = useRouter();
  const { login } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = login(email, password);
    setLoading(false);
    if (result.ok) {
      router.push("/portal");
    } else {
      setError(result.reason ?? "Något gick fel, försök igen.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-brand-secondary)]/40">
      <header className="border-b border-[var(--color-brand-border)] bg-white">
        <Container className="flex h-16 items-center justify-between sm:h-20">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/registrera"
            className="text-sm font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
          >
            Nytt företag? Registrera er
          </Link>
        </Container>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[var(--color-brand-ink)]">
              Logga in på er portal
            </h1>
            <p className="mt-2 text-sm font-medium text-[var(--color-brand-muted)]">
              Hantera erbjudanden, statistik och marknadsföring.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-4 rounded-[1.75rem] border border-[var(--color-brand-border)] bg-white p-7 shadow-sm"
          >
            <Field label="E-post" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                <Input
                  type="email"
                  required
                  placeholder="namn@foretag.se"
                  className="pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Lösenord" required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Field>

            {error && (
              <p className="rounded-lg bg-[#fdecea] px-3 py-2 text-xs font-bold text-[#c0392b]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 w-full justify-center"
              icon={
                loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )
              }
            >
              {loading ? "Loggar in..." : "Logga in"}
            </Button>

            <div className="flex items-start gap-2 rounded-xl bg-[var(--color-brand-secondary)] p-3.5 text-xs font-semibold leading-relaxed text-[var(--color-brand-muted)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
              Vill ni bara testa portalen? Ange valfri e-post och lösenord så
              öppnar vi en demo-portal med exempeldata.
            </div>
          </form>

          <p className="mt-6 text-center text-sm font-bold text-[var(--color-brand-muted)]">
            Inte partner än?{" "}
            <Link href="/registrera" className="text-[var(--color-brand-primary)] hover:underline">
              Registrera ert företag
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
