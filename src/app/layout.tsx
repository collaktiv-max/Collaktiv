import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/lib/store";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Collaktiv för företag",
  description:
    "Collaktiv belönar kollektivtrafikresande med rabatter hos lokala företag. Nå tusentals hållbara resenärer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[var(--color-brand-ink)]">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
