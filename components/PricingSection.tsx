"use client";

import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "29",
    description: "For small agencies just getting started",
    features: [
      "Up to 5 properties",
      "2 team members",
      "Landlord portal",
      "Tenant portal",
      "Maintenance workflow",
      "Compliance tracking",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "79",
    description: "For growing agencies with multiple landlords",
    features: [
      "Up to 25 properties",
      "5 team members",
      "Contractor portal",
      "Quote approval workflow",
      "Document management",
      "Inspection reports",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large agencies with complex portfolios",
    features: [
      "Unlimited properties",
      "Unlimited users",
      "Custom integrations",
      "White-label options",
      "Dedicated account manager",
      "SLA guarantee",
      "Onboarding training",
      "Custom reporting",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-[#FBF9F4]">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            No hidden fees. No setup costs. Pay monthly or annually and save 20%. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-xl border p-6 flex flex-col ${
                plan.popular ? "border-[#C28A78] shadow-lg" : "border-[#D5D9D5]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C28A78] text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#3A3F3A]">{plan.name}</h3>
                <p className="text-sm text-stone-500 mt-1">{plan.description}</p>
              </div>
              <div className="mb-6">
                {plan.price === "Custom" ? (
                  <p className="text-3xl font-bold text-[#3A3F3A]">{plan.price}</p>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-stone-500 text-sm">£</span>
                    <span className="text-4xl font-bold text-[#3A3F3A]">{plan.price}</span>
                    <span className="text-stone-500 text-sm">/month</span>
                  </div>
                )}
                <p className="text-xs text-stone-400 mt-1">Billed monthly. Annual plans save 15%.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-stone-600">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <button
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    plan.popular
                      ? "bg-[#C28A78] text-white hover:bg-[#B07A69]"
                      : "border border-[#D5D9D5] text-[#3A3F3A] hover:bg-[#EBE5DA]"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}