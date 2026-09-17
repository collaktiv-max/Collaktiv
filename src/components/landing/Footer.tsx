import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-brand-border)] py-10">
      <Container className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold text-[var(--color-brand-muted)]">
          <a href="#varfor" className="hover:text-[var(--color-brand-primary)]">
            Varför Collaktiv
          </a>
          <a href="#sa-funkar-det" className="hover:text-[var(--color-brand-primary)]">
            Så funkar det
          </a>
          <a href="#faq" className="hover:text-[var(--color-brand-primary)]">
            Vanliga frågor
          </a>
          <Link href="/logga-in" className="hover:text-[var(--color-brand-primary)]">
            Logga in
          </Link>
        </nav>
        <p className="text-xs font-medium text-[var(--color-brand-muted)]">
          © {new Date().getFullYear()} Collaktiv
        </p>
      </Container>
    </footer>
  );
}
