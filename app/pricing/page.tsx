"use client";

import { useState } from "react";
import Link from "next/link";
import { pricingPlans, billingFAQ } from "./PricingData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <Header />

      <div className="pt-24 pb-16 px-6 lg:px-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-4">
            <i className="ri-sparkling-line"></i>
            Simple, transparent pricing
          </span>
          <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">
            Choose the right plan for your portfolio
          </h1>
          <p className="text-lg text-[#687068] max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isAnnual ? "text-[#3A3F3A]" : "text-[#94A3B8]"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? "bg-[#C28A78]" : "bg-[#D5D9D5]"}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isAnnual ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? "text-[#3A3F3A]" : "text-[#94A3B8]"}`}>
            Annual
          </span>
          <span className="text-xs font-medium text-[#7A9A7E] bg-[#7A9A7E]/10 px-2 py-1 rounded-full">
            Save up to 17%
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-[#C28A78] shadow-md scale-[1.02]"
                  : "border-[#D5D9D5]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C28A78] text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#3A3F3A]" style={{ color: plan.color !== "#687068" ? plan.color : undefined }}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#687068] mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.monthlyPrice ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-[#3A3F3A]">
                          £{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-sm text-[#94A3B8]">/month</span>
                      </div>
                      {isAnnual && plan.monthlyPrice && (
                        <p className="text-xs text-[#7A9A7E] mt-1">
                          £{plan.monthlyPrice * 12} billed annually ({plan.annualDiscount}% off)
                        </p>
                      )}
                      {!isAnnual && (
                        <p className="text-xs text-[#94A3B8] mt-1">
                          Billed monthly. Switch to annual to save {plan.annualDiscount}%
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-[#3A3F3A]">Custom</span>
                      <p className="text-sm text-[#94A3B8] mt-1">Tailored to your needs</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#687068] mb-4">
                  <i className="ri-check-line text-[#7A9A7E] mr-1"></i>
                  {plan.trialDays}-day free trial
                </p>

                <Link
                  href={plan.id === "enterprise" ? "/book-demo" : `/register?plan=${plan.id}&billing=${isAnnual ? "annual" : "monthly"}`}
                  className={`block w-full text-center text-sm font-semibold py-3 rounded-xl transition-all whitespace-nowrap ${
                    plan.popular
                      ? "bg-[#C28A78] text-white hover:bg-[#143828]"
                      : "bg-[#FBF9F4] text-[#3A3F3A] border border-[#D5D9D5] hover:border-[#C28A78] hover:text-[#C28A78]"
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </div>

              <div className="px-6 pb-6 border-t border-[#D5D9D5] pt-4">
                <p className="text-xs font-semibold text-[#687068] uppercase tracking-wider mb-3">
                  Included
                </p>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#475569]">
                      <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.notIncluded.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mt-4 mb-3">
                      Not included
                    </p>
                    <ul className="space-y-2">
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                          <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <i className="ri-close-line text-[#94A3B8] text-sm"></i>
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">
            Full feature comparison
          </h2>
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FBF9F4]">
                  <th className="text-left px-6 py-4 font-semibold text-[#3A3F3A]">Feature</th>
                  <th className="text-center px-4 py-4 font-semibold text-[#3A3F3A]">Starter</th>
                  <th className="text-center px-4 py-4 font-semibold text-[#C28A78]">Professional</th>
                  <th className="text-center px-4 py-4 font-semibold text-[#3A3F3A]">Business</th>
                  <th className="text-center px-4 py-4 font-semibold text-[#3A3F3A]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-3 font-semibold text-[#3A3F3A] bg-[#FBF9F4]" colSpan={5}>
                    Property Management
                  </td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Properties</td>
                  <td className="text-center px-4 py-3 text-[#475569]">5</td>
                  <td className="text-center px-4 py-3 text-[#C28A78] font-medium">25</td>
                  <td className="text-center px-4 py-3 text-[#475569]">100</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Unlimited</td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Team members</td>
                  <td className="text-center px-4 py-3 text-[#475569]">2</td>
                  <td className="text-center px-4 py-3 text-[#C28A78] font-medium">5</td>
                  <td className="text-center px-4 py-3 text-[#475569]">15</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Unlimited</td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Tenancy management</td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Tenant portal</td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3 text-[#475569]">White-label</td>
                  <td className="text-center px-4 py-3 text-[#475569]">White-label</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-semibold text-[#3A3F3A] bg-[#FBF9F4]" colSpan={5}>
                    Maintenance & Contractors
                  </td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Maintenance tracking</td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Quote workflow</td>
                  <td className="text-center px-4 py-3"><i className="ri-close-line text-[#94A3B8]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Contractor management</td>
                  <td className="text-center px-4 py-3"><i className="ri-close-line text-[#94A3B8]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-semibold text-[#3A3F3A] bg-[#FBF9F4]" colSpan={5}>
                    Compliance & Documents
                  </td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Compliance tracking</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Basic</td>
                  <td className="text-center px-4 py-3 text-[#C28A78] font-medium">Full</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Full</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Full</td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Document storage</td>
                  <td className="text-center px-4 py-3 text-[#475569]">5GB</td>
                  <td className="text-center px-4 py-3 text-[#C28A78] font-medium">50GB</td>
                  <td className="text-center px-4 py-3 text-[#475569]">200GB</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-semibold text-[#3A3F3A] bg-[#FBF9F4]" colSpan={5}>
                    AI & Support
                  </td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">AI Property Assistant</td>
                  <td className="text-center px-4 py-3"><i className="ri-close-line text-[#94A3B8]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">API access</td>
                  <td className="text-center px-4 py-3"><i className="ri-close-line text-[#94A3B8]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-close-line text-[#94A3B8]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                  <td className="text-center px-4 py-3"><i className="ri-check-line text-[#7A9A7E]"></i></td>
                </tr>
                <tr className="border-t border-[#D5D9D5]">
                  <td className="px-6 py-3 text-[#475569]">Support</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Community</td>
                  <td className="text-center px-4 py-3 text-[#C28A78] font-medium">Priority</td>
                  <td className="text-center px-4 py-3 text-[#475569]">Phone</td>
                  <td className="text-center px-4 py-3 text-[#475569]">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {billingFAQ.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-[#3A3F3A]">{faq.question}</span>
                  <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${expandedFAQ === index ? "rotate-180" : ""}`}></i>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-[#687068] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#C28A78] to-[#2D5A3D] rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
            <p className="text-white/80 mb-6">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/register"
                className="bg-white text-[#C28A78] font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                className="text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}