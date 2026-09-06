import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturesHero from "./FeaturesHero";
import FeatureShowcase from "./FeatureShowcase";
import AgentWorkforce from "./AgentWorkforce";
import SavingsComparison from "./SavingsComparison";
import FeaturesCTA from "./FeaturesCTA";

export const metadata: Metadata = {
  title: "Platform Features | LetHub",
  description:
    "Discover LetHub's full feature set — tenancy management, compliance tracking, maintenance, rent collection and AI-powered portals.",
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <Header />
      <FeaturesHero />
      <FeatureShowcase />
      <AgentWorkforce />
      <SavingsComparison />
      <FeaturesCTA />
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">Feature FAQs</h2>
          <div className="space-y-4">
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">Is LetHub suitable for my portfolio size?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">Yes. LetHub scales from single-property landlords to agencies managing thousands of properties, with plans and role-based permissions that grow alongside your portfolio.</p>
            </div>
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">Do tenants and contractors need their own licences?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">No. Owner, tenant and contractor portals are included in every plan — you simply invite people to access their own dashboards at no extra cost.</p>
            </div>
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">Can I import my existing data?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">Yes. You can bulk-import properties, tenancies and contacts via CSV, with field mapping and validation to catch errors before anything goes live.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}