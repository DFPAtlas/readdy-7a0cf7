"use client";

import { useState } from "react";
import Link from "next/link";

const features = [
  {
    id: 1,
    icon: "ri-building-4-line",
    iconBg: "bg-[#C28A78]/10",
    iconColor: "text-[#C28A78]",
    title: "Portfolio Management",
    description: "Manage entire property portfolios across multiple landlords. Track occupancy, rent status, and tenancy history in one centralised dashboard.",
  },
  {
    id: 2,
    icon: "ri-tools-line",
    iconBg: "bg-[#C28A78]/10",
    iconColor: "text-[#C28A78]",
    title: "Maintenance Workflow",
    description: "Automate maintenance requests from tenant to contractor. Track quotes, approvals, and job completion without the email back-and-forth.",
  },
  {
    id: 3,
    icon: "ri-shield-check-line",
    iconBg: "bg-[#C46868]/10",
    iconColor: "text-[#C46868]",
    title: "Compliance Tracking",
    description: "Never miss a certificate expiry. Automated alerts for gas safety, EPC, EICR, and all legal compliance requirements across your portfolio.",
  },
  {
    id: 4,
    icon: "ri-group-line",
    iconBg: "bg-[#8A9FB0]/10",
    iconColor: "text-[#8A9FB0]",
    title: "Multi-User Portals",
    description: "Dedicated portals for agents, landlords, tenants, and contractors. Each role sees exactly what they need, nothing more.",
  },
  {
    id: 5,
    icon: "ri-file-text-line",
    iconBg: "bg-[#C28A78]/10",
    iconColor: "text-[#C28A78]",
    title: "Document Management",
    description: "Store and organise tenancy agreements, certificates, inspection reports, and invoices. Secure cloud storage with instant access.",
  },
  {
    id: 6,
    icon: "ri-bank-card-line",
    iconBg: "bg-[#7A9A7E]/10",
    iconColor: "text-[#7A9A7E]",
    title: "Rent Collection",
    description: "Automate rent collection, track arrears, and reconcile payments. Direct debit integration with Stripe and GoCardless built-in.",
  },
];

export default function ProductFeatures() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section id="features" className="w-full py-24 px-6 lg:px-12 bg-white">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/8 px-4 py-1.5 rounded-full mb-5">
            <i className="ri-sparkling-line"></i>
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3A3F3A] mb-5 leading-tight">
            Everything You Need to Manage Properties
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed">
            LetHub replaces spreadsheets, emails, and paper files with one intelligent platform. From tenancy to maintenance to compliance — we have got it covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group relative bg-white rounded-2xl border p-7 transition-all duration-300 cursor-pointer ${
                hoveredId === feature.id
                  ? "border-[#C28A78] shadow-xl -translate-y-1"
                  : "border-stone-100 hover:border-stone-200 hover:shadow-lg"
              }`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center`}>
                  <i className={`${feature.icon} ${feature.iconColor} text-xl`}></i>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#3A3F3A] mb-3 group-hover:text-[#C28A78] transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-5">
                {feature.description}
              </p>

              <Link href="/features" className="flex items-center gap-1 text-sm font-medium text-[#C28A78] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <i className="ri-arrow-right-line text-sm"></i>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] hover:underline whitespace-nowrap"
          >
            Explore all features
            <i className="ri-arrow-right-line text-sm"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}