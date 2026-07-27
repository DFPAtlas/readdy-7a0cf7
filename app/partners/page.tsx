"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const partners = [
  {
    category: "Technology Partners",
    items: [
      { name: "Stripe", description: "Enterprise-grade payment processing for rent collection and subscription billing. PCI DSS Level 1 certified.", logo: "ri-bank-card-line" },
      { name: "Plaid / Open Banking", description: "Real-time bank data connectivity for automated rent reconciliation and financial health insights.", logo: "ri-exchange-funds-line" },
      { name: "Google Maps", description: "Property location services, neighbourhood insights, and distance calculations for contractor dispatch.", logo: "ri-map-pin-line" },
    ],
  },
  {
    category: "Integration Partners",
    items: [
      { name: "Xero", description: "Seamless accounting integration — sync rent payments, expenses, and financial reports directly to Xero.", logo: "ri-file-list-3-line" },
      { name: "QuickBooks", description: "Automated bookkeeping for property managers. All transactions flow to QuickBooks in real time.", logo: "ri-file-text-line" },
      { name: "Zapier", description: "Connect LetHub to 5,000+ apps. Automate workflows between your property management and the rest of your stack.", logo: "ri-flashlight-line" },
    ],
  },
  {
    category: "Service Partners",
    items: [
      { name: "DocuSign", description: "Industry-standard e-signatures for tenancy agreements, Section 21 notices, and contractor agreements.", logo: "ri-pen-nib-line" },
      { name: "GoCardless", description: "Direct Debit integration for recurring rent collection with automated mandates.", logo: "ri-bank-line" },
      { name: "Slack", description: "Real-time notifications for maintenance requests, arrears alerts, and compliance deadlines.", logo: "ri-slack-line" },
    ],
  },
];

const programs = [
  {
    title: "Referral Partner",
    icon: "ri-share-forward-line",
    description: "Recommend LetHub to other agencies and earn commission on their subscription. Simple tracking, monthly payouts.",
    cta: "Become a referral partner",
  },
  {
    title: "Technology Partner",
    icon: "ri-code-s-slash-line",
    description: "Build integrations with LetHub's API. Get listed in our marketplace and reach agencies looking for complementary tools.",
    cta: "Explore our API",
  },
  {
    title: "Affiliate Partner",
    icon: "ri-links-line",
    description: "Property bloggers, YouTubers, and industry influencers — earn commission on every LetHub sign-up through your unique link.",
    cta: "Join the affiliate programme",
  },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-hand-heart-line"></i>
              Partners
            </span>
            <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">Grow together</h1>
            <p className="text-lg text-[#687068] max-w-2xl mx-auto">
              We partner with the best technology platforms and service providers to deliver a complete property management ecosystem.
            </p>
          </div>

          <div className="space-y-12 mb-20">
            {partners.map((category) => (
              <div key={category.category}>
                <h2 className="text-xl font-bold text-[#3A3F3A] mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 bg-[#C28A78] rounded-full"></span>
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.items.map((partner) => (
                    <div key={partner.name} className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-lg bg-[#C28A78]/10 flex items-center justify-center mb-4">
                        <i className={`${partner.logo} text-[#C28A78] text-lg`}></i>
                      </div>
                      <h3 className="font-bold text-[#3A3F3A] mb-2">{partner.name}</h3>
                      <p className="text-sm text-[#687068] leading-relaxed">{partner.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">Partnership programmes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {programs.map((program) => (
                <div key={program.title} className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#C28A78]/10 flex items-center justify-center mx-auto mb-4">
                    <i className={`${program.icon} text-[#C28A78] text-xl`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-[#3A3F3A] mb-2">{program.title}</h3>
                  <p className="text-sm text-[#687068] leading-relaxed mb-4">{program.description}</p>
                  <Link
                    href="/contact"
                    className="text-sm font-semibold text-[#C28A78] hover:underline whitespace-nowrap"
                  >
                    {program.cta} <i className="ri-arrow-right-line ml-1"></i>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center bg-gradient-to-r from-[#C28A78] to-[#2D5A3D] rounded-2xl p-10 text-white">
            <h2 className="text-2xl font-bold mb-3">Interested in partnering with LetHub?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Whether you are a technology company or a service provider, we would love to explore how we can work together.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#C28A78] font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Get in touch <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}