"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const integrations = [
  {
    category: "Accounting",
    icon: "ri-calculator-line",
    items: [
      {
        name: "Xero",
        description: "Sync rent payments, expenses, and financial reports directly to Xero. Automatic reconciliation with bank feeds.",
        status: "Available",
      },
      {
        name: "QuickBooks",
        description: "Automated bookkeeping for property managers. All transactions flow to QuickBooks in real time.",
        status: "Available",
      },
      {
        name: "Sage",
        description: "Integration with Sage Accounting for agencies running on Sage's platform.",
        status: "Available",
      },
    ],
  },
  {
    category: "Banking & Payments",
    icon: "ri-bank-line",
    items: [
      {
        name: "Stripe",
        description: "Accept rent payments, deposits, and subscription fees securely. PCI DSS Level 1 certified processing.",
        status: "Available",
      },
      {
        name: "GoCardless",
        description: "Direct Debit integration for recurring rent collection. Reduce late payments with automated mandates.",
        status: "Available",
      },
      {
        name: "Plaid",
        description: "Open banking connectivity for real-time bank transaction data and automated reconciliation.",
        status: "Available",
      },
    ],
  },
  {
    category: "Property Portals",
    icon: "ri-global-line",
    items: [
      {
        name: "Rightmove",
        description: "Automated listing feed to Rightmove. Properties update in real time as you manage them in LetHub.",
        status: "Available",
      },
      {
        name: "Zoopla",
        description: "Push listings directly to Zoopla with one click. Sync property details, images, and availability.",
        status: "Available",
      },
      {
        name: "OnTheMarket",
        description: "Integration with OnTheMarket for instant property listing syndication.",
        status: "Available",
      },
    ],
  },
  {
    category: "Workflow & Automation",
    icon: "ri-flashlight-line",
    items: [
      {
        name: "Zapier",
        description: "Connect LetHub to 5,000+ apps. Automate workflows without writing a single line of code.",
        status: "Available",
      },
      {
        name: "Slack",
        description: "Get real-time notifications for maintenance requests, arrears alerts, and compliance deadlines in Slack.",
        status: "Available",
      },
      {
        name: "Make (Integromat)",
        description: "Advanced workflow automation platform for complex multi-step integrations.",
        status: "Available",
      },
    ],
  },
  {
    category: "E-Signature & Documents",
    icon: "ri-pen-nib-line",
    items: [
      {
        name: "DocuSign",
        description: "Industry-standard e-signatures for tenancy agreements, Section 21 notices, and contractor agreements.",
        status: "Available",
      },
      {
        name: "Adobe Sign",
        description: "Adobe's e-signature solution integrated directly into your document workflow.",
        status: "Available",
      },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-16 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
            <i className="ri-puzzle-line"></i>
            Integrations
          </span>
          <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">Connect your entire property stack</h1>
          <p className="text-lg text-[#687068] max-w-2xl mx-auto">
            LetHub integrates with the tools you already use. Accounting, banking, portals, documents — all connected, all in sync.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-10">
          {integrations.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C28A78]/10 flex items-center justify-center">
                  <i className={`${cat.icon} text-[#C28A78] text-sm`}></i>
                </div>
                {cat.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cat.items.map((item) => (
                  <div key={item.name} className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-[#3A3F3A]">{item.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                        item.status === "Available"
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "bg-[#F59E0B]/10 text-[#F59E0B]"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#687068] leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center bg-gradient-to-r from-[#C28A78] to-[#2D5A3D] rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Don't see your tool?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            We're constantly adding new integrations. Let us know what you'd like to see, or explore building your own with our API.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/contact" className="bg-white text-[#C28A78] font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap">
              Request an integration
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">Integration FAQs</h2>
          <div className="space-y-4">
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">How do integrations work?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">LetHub connects to your tools through secure APIs and pre-built connectors. Once linked, data such as rent payments, financial records and property listings sync automatically, so you stop re-keying information between systems.</p>
            </div>
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">Can I build my own integration?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">Yes. Our API gives developers full access to properties, tenancies, maintenance and compliance data, with per-key permissions and full audit logging for every request.</p>
            </div>
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">Which integration should I set up first?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">Most agencies start with accounting (Xero or QuickBooks) and rent collection (GoCardless or Stripe), then add property portals like Rightmove and Zoopla once their listings are ready to syndicate.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}