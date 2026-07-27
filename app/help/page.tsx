"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const helpArticles = [
  {
    category: "Getting Started",
    icon: "ri-rocket-line",
    articles: [
      { title: "Creating your LetHub account", description: "Step-by-step guide to setting up your agency account and inviting team members." },
      { title: "Adding your first property", description: "How to add properties manually or import them in bulk via CSV upload." },
      { title: "Setting up your portfolio dashboard", description: "Customising your dashboard widgets, KPIs, and quick actions for your workflow." },
      { title: "Inviting your team", description: "How to add team members, set permissions, and manage access levels." },
      { title: "Connecting your bank account", description: "Setting up open banking for automated rent reconciliation and payment tracking." },
    ],
  },
  {
    category: "Property Management",
    icon: "ri-building-4-line",
    articles: [
      { title: "Managing tenancies", description: "Creating, editing, and ending tenancies — including rent schedules and deposit registration." },
      { title: "Rent collection and arrears", description: "Tracking rent payments, setting up automated reminders, and managing arrears cases." },
      { title: "Maintenance and repairs", description: "Logging maintenance issues, using AI triage, and managing the quote-to-completion workflow." },
      { title: "Property inspections", description: "Scheduling, conducting, and documenting property inspections — including photo evidence." },
      { title: "Portfolio reporting", description: "Generating landlord reports, financial statements, and compliance summaries." },
    ],
  },
  {
    category: "Compliance",
    icon: "ri-shield-check-line",
    articles: [
      { title: "Understanding compliance tracking", description: "How LetHub tracks EPCs, gas safety, EICRs, PAT testing, and other certificates." },
      { title: "Renters' Rights Bill 2025", description: "What the new legislation means for your agency and how LetHub helps you stay compliant." },
      { title: "GDPR and data protection", description: "How LetHub helps you meet your data protection obligations as a data controller." },
      { title: "Right to Rent checks", description: "Managing Right to Rent verification within the platform for England-based tenancies." },
    ],
  },
  {
    category: "Account & Billing",
    icon: "ri-settings-3-line",
    articles: [
      { title: "Managing your subscription", description: "Upgrading, downgrading, or cancelling your LetHub plan." },
      { title: "Understanding your invoice", description: "How to read your monthly or annual LetHub invoice, including VAT breakdown." },
      { title: "Updating payment method", description: "Changing your credit card or switching to direct debit billing." },
      { title: "Account security", description: "Enabling two-factor authentication, managing sessions, and security best practices." },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-question-line"></i>
              Help Centre
            </span>
            <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">How can we help?</h1>
            <p className="text-lg text-[#687068] max-w-2xl mx-auto mb-8">
              Find guides, tutorials, and answers to common questions about using LetHub.
            </p>
            <div className="max-w-xl mx-auto relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-[#94A3B8]"></i>
              </div>
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-12">
            {helpArticles.map((category) => (
              <div key={category.category}>
                <h2 className="text-xl font-bold text-[#3A3F3A] mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C28A78]/10 flex items-center justify-center">
                    <i className={`${category.icon} text-[#C28A78]`}></i>
                  </div>
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.articles.map((article) => (
                    <Link
                      key={article.title}
                      href="#"
                      className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all group"
                    >
                      <h3 className="font-semibold text-[#3A3F3A] mb-1.5 group-hover:text-[#C28A78] transition-colors">{article.title}</h3>
                      <p className="text-sm text-[#687068] leading-relaxed">{article.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-white rounded-2xl border border-[#E2E8F0] p-10">
            <div className="w-14 h-14 rounded-full bg-[#C28A78]/10 flex items-center justify-center mx-auto mb-4">
              <i className="ri-customer-service-2-line text-[#C28A78] text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-[#3A3F3A] mb-2">Still need help?</h2>
            <p className="text-[#687068] text-sm mb-6 max-w-md mx-auto">
              Our support team is available Monday to Friday, 9am–6pm GMT. We typically respond within 2 hours.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/contact"
                className="text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#143828] px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Contact support
              </Link>
              <a
                href="mailto:support@lethub.co.uk"
                className="text-sm font-semibold text-[#3A3F3A] border border-[#E2E8F0] px-6 py-3 rounded-xl hover:border-[#C28A78] transition-colors whitespace-nowrap"
              >
                support@lethub.co.uk
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}