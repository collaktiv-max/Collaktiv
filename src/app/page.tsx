import { PublicHeader } from "@/components/landing/PublicHeader";
import { Hero } from "@/components/landing/Hero";
import { ValueGrid } from "@/components/landing/ValueGrid";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main>
        <Hero />
        <ValueGrid />
        <ComparisonSection />
        <HowItWorks />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
