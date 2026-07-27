"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { activateDemoSession } from "@/lib/demoMode";

export default function DemoPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [entering, setEntering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleEnterDemo = () => {
    setEntering(true);
    activateDemoSession();
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="block">
            <img src="https://public.readdy.ai/ai/img_res/7ce16202-554e-416f-9b5b-269607f415ce.png" alt="LetHub" className="h-9 w-auto object-contain" />
          </Link>
          <Link href="/login" className="text-sm font-medium text-[#C28A78] hover:underline whitespace-nowrap">
            Sign In
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16">
        <div className="text-center mb-12">
          <span className={`inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <i className="ri-eye-line"></i>
            Interactive Demo
          </span>
          <h1 className={`text-4xl font-bold text-[#3A3F3A] mb-4 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Estate Agent Demo
          </h1>
          <p className={`text-lg text-[#687068] max-w-2xl mx-auto transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Explore LetHub as London Lettings Demo Agency — a realistic estate agent account with sample properties, tenants, compliance records and more.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <div className="w-12 h-12 bg-[#C28A78]/10 rounded-xl flex items-center justify-center mb-4">
              <i className="ri-building-4-line text-[#C28A78] text-xl"></i>
            </div>
            <h3 className="font-semibold text-[#3A3F3A] mb-2">42 Properties</h3>
            <p className="text-sm text-[#687068]">Browse a realistic portfolio across England, Scotland and Wales with various tenancy statuses.</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mb-4">
              <i className="ri-shield-check-line text-[#3B82F6] text-xl"></i>
            </div>
            <h3 className="font-semibold text-[#3A3F3A] mb-2">Full Compliance</h3>
            <p className="text-sm text-[#687068]">See gas safety, EICR, EPC and smoke alarm tracking with expiry alerts and risk scores.</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <div className="w-12 h-12 bg-[#7A9A7E]/10 rounded-xl flex items-center justify-center mb-4">
              <i className="ri-macbook-line text-[#7A9A7E] text-xl"></i>
            </div>
            <h3 className="font-semibold text-[#3A3F3A] mb-2">Owner & Tenant Portals</h3>
            <p className="text-sm text-[#687068]">Test portal setup — see how owners and tenants access their own data securely.</p>
          </div>
        </div>

        <div className={`bg-white rounded-2xl border border-[#D5D9D5] p-8 mb-12 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-xl font-bold text-[#3A3F3A] mb-6">What you can explore in the demo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "ri-dashboard-line", label: "Agency Dashboard", desc: "KPIs, occupancy trends, compliance overview, recent activity" },
              { icon: "ri-building-4-line", label: "Property Portfolio", desc: "42 properties with owner, tenant, compliance & portal status" },
              { icon: "ri-shield-check-line", label: "Compliance Tracking", desc: "Certificates, expiry alerts, risk-scored properties" },
              { icon: "ri-tools-line", label: "Maintenance Jobs", desc: "Open, in-progress and completed repair jobs" },
              { icon: "ri-clipboard-line", label: "Inspections", desc: "Scheduled and completed inspections with room checklists" },
              { icon: "ri-folder-line", label: "Documents", desc: "Drag-and-drop upload with folder organisation" },
              { icon: "ri-calendar-schedule-line", label: "Rent & Payments", desc: "Rent schedules, payment tracking, arrears management" },
              { icon: "ri-macbook-line", label: "Portal Setup", desc: "Invite owners and tenants to their personal dashboards" },
              { icon: "ri-message-3-line", label: "Communications", desc: "Tenant drafts, landlord updates, system notifications" },
              { icon: "ri-file-upload-line", label: "Bulk Import", desc: "CSV/Excel upload with field mapping and validation" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FBF9F4] transition-colors">
                <div className="w-9 h-9 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className={`${item.icon} text-[#C28A78] text-sm`}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">{item.label}</p>
                  <p className="text-xs text-[#687068]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`text-center transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-[#C28A78] to-[#2D5A3D] rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Ready to explore?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Enter the demo dashboard as London Lettings Demo Agency. No sign-up required. Actions that could affect real data are disabled.
            </p>
            <button
              onClick={handleEnterDemo}
              disabled={entering}
              className="bg-white text-[#C28A78] font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-50 text-lg"
            >
              {entering ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
                  Entering Demo...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enter Demo Dashboard
                  <i className="ri-arrow-right-line"></i>
                </span>
              )}
            </button>
            <p className="text-white/50 text-xs mt-4">Demo session resets when you log out. No data is saved.</p>
          </div>
        </div>
      </div>
    </main>
  );
}