"use client";

import { useState, useEffect, useRef } from "react";

interface FeatureItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  imageSide: "left" | "right";
  bgClass: string;
}

const features: FeatureItem[] = [
  {
    id: "portfolio",
    icon: "ri-dashboard-line",
    iconBg: "#C28A78",
    iconColor: "#FFFFFF",
    title: "Portfolio Command Centre",
    tagline: "Your whole portfolio, finally under control.",
    description: "See every property, every tenancy, every compliance deadline and every action item from one intelligent dashboard. No more switching between systems or chasing information.",
    bullets: [
      "Manage every property from one dashboard",
      "See what needs action today at a glance",
      "Estate agent and owner workflows built in",
      "Property health scoring at a glance",
      "Real-time portfolio overview"
    ],
    imageSide: "right",
    bgClass: "bg-white"
  },
  {
    id: "compliance",
    icon: "ri-shield-check-line",
    iconBg: "#10B981",
    iconColor: "#FFFFFF",
    title: "Compliance That Watches Itself",
    tagline: "Never let a certificate quietly expire again.",
    description: "Compliance monitoring that never sleeps. Gas safety, EICR, EPC, smoke alarms, CO alarms — all tracked with expiry alerts, risk scoring and automatic reminders before anything lapses.",
    bullets: [
      "Gas safety certificate tracking",
      "EICR electrical safety monitoring",
      "EPC expiry alerts",
      "Smoke and CO alarm schedules",
      "Risk scoring across portfolio",
      "Inspection date management"
    ],
    imageSide: "left",
    bgClass: "bg-[#FBF9F4]"
  },
  {
    id: "mobile",
    icon: "ri-smartphone-line",
    iconBg: "#3B82F6",
    iconColor: "#FFFFFF",
    title: "Mobile Property Checks",
    tagline: "Walk the property. Tap. Capture. Done.",
    description: "Inspect properties from your phone with room-by-room checklists. Capture photos, add notes, collect signatures and record voice notes — then generate professional reports instantly.",
    bullets: [
      "Inspect from your phone",
      "Room-by-room checklist workflow",
      "Photo capture and annotation",
      "Voice notes for quick dictation",
      "Digital signature collection",
      "Instant report generation"
    ],
    imageSide: "right",
    bgClass: "bg-white"
  },
  {
    id: "maintenance",
    icon: "ri-tools-line",
    iconBg: "#F59E0B",
    iconColor: "#FFFFFF",
    title: "Smart Maintenance Workflow",
    tagline: "Repairs stop living in someone's inbox.",
    description: "From tenant report to completed repair — every step tracked. The system creates actions, notifies owners, updates tenants and tracks progress so nothing falls through the cracks.",
    bullets: [
      "Tenant reports issue directly",
      "Inspection findings auto-create actions",
      "Owner automatically notified",
      "Tenant informed of progress",
      "Repair tracked from start to finish",
      "Contractor assignment and updates"
    ],
    imageSide: "left",
    bgClass: "bg-[#FBF9F4]"
  },
  {
    id: "portals",
    icon: "ri-macbook-line",
    iconBg: "#8B5CF6",
    iconColor: "#FFFFFF",
    title: "Owner and Tenant Portals",
    tagline: "Give everyone the right information without another phone call.",
    description: "Owners see only their properties. Tenants see only their tenancy. Shared documents, updates, maintenance reports and inspection notices — all in one place, automatically updated.",
    bullets: [
      "Owners see only their properties",
      "Tenants see only their tenancy",
      "Shared documents and certificates",
      "Maintenance status updates",
      "Inspection reports and notices",
      "No more chasing for information"
    ],
    imageSide: "right",
    bgClass: "bg-white"
  },
  {
    id: "documents",
    icon: "ri-folder-line",
    iconBg: "#EC4899",
    iconColor: "#FFFFFF",
    title: "Drag-and-Drop Documents",
    tagline: "Every document where it belongs.",
    description: "Upload certificates, tenancy agreements, invoices, inspection reports, right-to-rent checks and deposit certificates. Link documents to properties, owners, tenants or tenancies — everything organised.",
    bullets: [
      "Upload certificates and agreements",
      "Store invoices and reports",
      "Right-to-rent document management",
      "Deposit certificate tracking",
      "Link documents to properties",
      "Link to owners, tenants or tenancies"
    ],
    imageSide: "left",
    bgClass: "bg-[#FBF9F4]"
  },
  {
    id: "import",
    icon: "ri-file-upload-line",
    iconBg: "#6366F1",
    iconColor: "#FFFFFF",
    title: "Excel Portfolio Import",
    tagline: "Move from spreadsheet chaos to live management in minutes.",
    description: "Import your entire portfolio — properties, owners, tenants, rent schedules, tenancy dates and compliance records — from a spreadsheet. Field mapping and validation built in.",
    bullets: [
      "Import properties in bulk",
      "Import owners and tenants",
      "Import rent schedules",
      "Import tenancy dates",
      "Import compliance dates",
      "Field mapping and validation"
    ],
    imageSide: "right",
    bgClass: "bg-white"
  },
  {
    id: "rent",
    icon: "ri-bank-card-line",
    iconBg: "#14B8A6",
    iconColor: "#FFFFFF",
    title: "Rent, Payments and Arrears View",
    tagline: "Know who has paid, who has not, and what needs chasing.",
    description: "Track rent due, payments received, arrears and owner summaries from one screen. Traffic-light risk indicators make it instantly clear where attention is needed.",
    bullets: [
      "Rent due tracking",
      "Payment recording",
      "Arrears management",
      "Owner income summaries",
      "Tenant payment visibility",
      "Traffic-light risk indicators"
    ],
    imageSide: "left",
    bgClass: "bg-[#FBF9F4]"
  },
  {
    id: "ai",
    icon: "ri-brain-line",
    iconBg: "#C28A78",
    iconColor: "#FFFFFF",
    title: "AI Property Assistant",
    tagline: "Intelligent automation that works while you sleep.",
    description: "Lethub's AI assistant helps draft communications, flag compliance risks, suggest maintenance priorities and surface insights across your portfolio — like having an analyst on your team.",
    bullets: [
      "Draft tenant communications",
      "Flag compliance risks automatically",
      "Suggest maintenance priorities",
      "Surface portfolio insights",
      "Reduce manual admin work",
      "Available 24/7"
    ],
    imageSide: "right",
    bgClass: "bg-white"
  }
];

function FeatureCard({ feature }: { feature: FeatureItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const imageContent = (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#C28A78]/5 to-[#C28A78]/10 border border-[#E2E8F0] flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: feature.iconBg + "15" }}>
          <i className={`${feature.icon} text-3xl`} style={{ color: feature.iconBg }}></i>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-1.5 rounded-full bg-[#C28A78]/15" style={{ width: `${[60, 40, 50, 35][i]}%` }} />
        ))}
      </div>
      <div className="absolute top-3 right-3 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
        <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
        <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={`${feature.bgClass}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
          feature.imageSide === "left" ? "lg:flex-row-reverse" : ""
        }`}>
          <div className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${
            feature.imageSide === "left" ? "lg:order-2" : "lg:order-1"
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4" style={{ backgroundColor: feature.iconBg + "10" }}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={feature.icon} style={{ color: feature.iconBg, fontSize: "14px" }}></i>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: feature.iconBg }}>
                {feature.id === "ai" ? "AI-Powered" : "Feature"}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-[#3A3F3A] mb-3">{feature.title}</h3>
            <p className="text-lg font-medium text-[#C28A78] mb-4">{feature.tagline}</p>
            <p className="text-[#687068] leading-relaxed mb-6">{feature.description}</p>

            <ul className="space-y-3">
              {feature.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: feature.iconBg + "15" }}>
                    <i className="ri-check-line text-xs" style={{ color: feature.iconBg }}></i>
                  </div>
                  <span className="text-sm text-[#475569]">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${
            feature.imageSide === "left" ? "lg:order-1" : "lg:order-2"
          }`}>
            {imageContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureShowcase() {
  return (
    <>
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </>
  );
}