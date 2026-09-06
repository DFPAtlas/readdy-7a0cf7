import type { Metadata } from "next";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ProductFeatures from "@/components/ProductFeatures";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LetHub | Property Management Software for UK Agents & Landlords",
  description:
    "LetHub is the complete property management platform for UK estate agents and landlords — run tenancies, compliance, maintenance and rent collection from one dashboard.",
};

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
      <section className="px-6 lg:px-12 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#3A3F3A] mb-6">Property management software built for the UK</h2>
          <div className="space-y-4 text-[#475569] leading-relaxed">
            <p>LetHub brings every part of your lettings operation into a single platform. From the moment a tenancy begins to the day a deposit is returned, agents and landlords use LetHub to manage tenancies, track compliance, log maintenance, collect rent and keep owners and tenants informed — all without switching between spreadsheets and disconnected tools.</p>
            <p>Designed specifically for the UK market, LetHub embeds English, Welsh, Scottish and Northern Irish regulatory requirements directly into the workflow. Gas safety certificates, EPCs, EICRs, Right to Rent checks and deposit protection are tracked automatically, with expiry alerts so nothing slips through the cracks.</p>
            <p>Whether you manage five properties or five thousand, LetHub scales with you. Estate agents get a full agency dashboard, landlords get a dedicated owner portal, and tenants and contractors get self-service access — reducing admin, cutting arrears and keeping every party on the same page.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}