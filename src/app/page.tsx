import { PublicHeader } from "@/components/landing/PublicHeader";
import { Hero } from "@/components/landing/Hero";
import { ValueGrid } from "@/components/landing/ValueGrid";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { Impact } from "@/components/landing/Impact";
import { PricingSection } from "@/components/landing/PricingSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    // zoom (inte transform: scale) skalar upp hela innehållet - text,
    // ikoner, mellanrum, allt - proportionerligt tillsammans på breda
    // skärmar, istället för att bara sträcka ut samma innehåll över en
    // bredare yta (vilket Container's max-width annars gör på egen hand).
    <div className="xl:[zoom:1.08] 2xl:[zoom:1.18] 3xl:[zoom:1.3]">
      <PublicHeader />
      <main>
        <Hero />
        <ValueGrid />
        <ComparisonSection />
        <Impact />
        <PricingSection />
        <HowItWorks />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
