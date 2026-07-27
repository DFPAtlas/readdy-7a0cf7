import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ProductFeatures from "@/components/ProductFeatures";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <ProductFeatures />
      <Testimonials />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}