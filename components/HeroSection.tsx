"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const certificates = [
  { name: "Gas Safety", status: "Valid", tone: "valid" },
  { name: "EICR", status: "Due in 30 days", tone: "due" },
  { name: "EPC", status: "Valid", tone: "valid" },
  { name: "Right to Rent", status: "Overdue", tone: "overdue" },
];

const toneStyles: Record<string, string> = {
  valid: "bg-[#EEF4EE] text-[#4F7557] border-[#CBDCCE]",
  due: "bg-[#FBF3E6] text-[#8A6A2F] border-[#EBD9BC]",
  overdue: "bg-[#FBEDE9] text-[#A05946] border-[#EBCFC6]",
};

const dotStyles: Record<string, string> = {
  valid: "bg-[#7A9A7E]",
  due: "bg-[#D3A349]",
  overdue: "bg-[#C28A78]",
};

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative w-full bg-[#FBF9F4] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.5] bg-[radial-gradient(circle_at_15%_20%,#F4EDE6_0%,transparent_55%)]" />
      <div className="absolute -right-24 top-1/2 hidden lg:block w-[520px] h-[520px] rounded-full bg-[#F2EDE4] blur-3xl -translate-y-1/2" />

      <div className="relative w-full px-6 lg:px-12 pt-28 pb-20 lg:pt-32 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          <div className="w-full">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5DED2] text-xs font-medium text-[#8A6A5C] mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="w-4 h-4 flex items-center justify-center text-[#C28A78]">
                <i className="ri-shield-check-line text-sm"></i>
              </span>
              Renters&rsquo; Rights Act ready
            </span>

            <h1 className={`text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-[#3A3F3A] leading-[1.1] mb-6 transition-all duration-700 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Lettings software built for the Renters&rsquo; Rights Act
            </h1>

            <p className={`text-lg text-[#5C625C] leading-relaxed mb-9 max-w-xl transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Periodic tenancies, compliance deadlines and landlord reporting in one place, built for UK letting agents from day one, not retrofitted.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 mb-6 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Link href="/register">
                <button className="bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors shadow-sm cursor-pointer">
                  Start free trial
                </button>
              </Link>
              <Link href="/book-demo">
                <button className="bg-transparent hover:bg-[#C28A78]/10 border border-[#C28A78]/60 text-[#A05946] font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer">
                  Book a demo
                </button>
              </Link>
            </div>

            <p className={`text-sm text-[#8A8F8A] transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              No credit card required. 14-day free trial. Cancel anytime.
            </p>
          </div>

          <div className={`w-full transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="relative max-w-md mx-auto lg:max-w-none lg:ml-auto w-full">
              <div className="absolute inset-x-6 -bottom-4 h-24 bg-[#EADFD2]/60 rounded-3xl blur-2xl" />

              <div className="relative bg-white rounded-2xl border border-[#E8E1D6] shadow-[0_18px_40px_-24px_rgba(58,63,58,0.25)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EAE0]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C28A78]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#D9CBA8]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#7A9A7E]"></span>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[#9A9F98]">
                    Compliance
                  </span>
                </div>

                <div className="px-6 pt-5 pb-4">
                  <p className="text-[11px] uppercase tracking-wide text-[#A8ACA6] mb-1">Property</p>
                  <p className="text-sm font-semibold text-[#3A3F3A] leading-snug">
                    42 Marlborough Road, Leeds LS6 3QE
                  </p>
                </div>

                <div className="px-3 pb-4">
                  {certificates.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg hover:bg-[#FBF9F4] transition-colors"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F5F1E9] text-[#8A8F8A] shrink-0">
                          <i className="ri-file-shield-2-line text-xs"></i>
                        </span>
                        <span className="text-sm text-[#49504A] truncate">{item.name}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium whitespace-nowrap shrink-0 ${toneStyles[item.tone]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[item.tone]}`}></span>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-[#FBF9F4] border-t border-[#F0EAE0] flex items-center justify-between">
                  <span className="text-[11px] text-[#8A8F8A]">2 of 4 certificates need attention</span>
                  <span className="w-6 h-6 flex items-center justify-center text-[#C28A78]">
                    <i className="ri-arrow-right-line text-sm"></i>
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex absolute -left-5 bottom-10 items-center gap-2 bg-white rounded-xl border border-[#E8E1D6] shadow-sm px-3.5 py-2.5">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#EEF4EE] text-[#4F7557]">
                  <i className="ri-check-line text-xs"></i>
                </span>
                <span className="text-[11px] font-medium text-[#3A3F3A] whitespace-nowrap">Periodic tenancy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}