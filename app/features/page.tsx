import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturesHero from "./FeaturesHero";
import FeatureShowcase from "./FeatureShowcase";
import AgentWorkforce from "./AgentWorkforce";
import SavingsComparison from "./SavingsComparison";
import FeaturesCTA from "./FeaturesCTA";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <FeaturesHero />
      <FeatureShowcase />
      <AgentWorkforce />
      <SavingsComparison />
      <FeaturesCTA />
      <Footer />
    </main>
  );
}