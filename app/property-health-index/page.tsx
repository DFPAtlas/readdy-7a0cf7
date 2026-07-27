import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PropertyHealthHero from "./PropertyHealthHero"
import PropertyHealthCalculator from "./PropertyHealthCalculator"
import { ScoreBreakdownSection, DimensionDetailSection } from "./ScoreBreakdown"
import BenchmarkSection from "./BenchmarkSection"
import PHICTA from "./PHICTA"

export default function PropertyHealthIndexPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <PropertyHealthHero />
      <div id="calculator">
        <PropertyHealthCalculator />
      </div>
      <ScoreBreakdownSection />
      <BenchmarkSection />
      <DimensionDetailSection />
      <PHICTA />
      <Footer />
    </main>
  )
}