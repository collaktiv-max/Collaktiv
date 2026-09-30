"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fel lösenord.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1f18] px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo textClassName="text-white" />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-7 backdrop-blur"
        >
          <h1 className="text-center text-lg font-extrabold text-white">Adminpanel</h1>
          <Field label="Lösenord" required>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                type="password"
                required
                autoFocus
                placeholder="••••••••"
                className="border-white/15 bg-white/10 pl-11 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/10"
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
            variant="white"
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
        </form>
      </div>
    </div>
  );
}
