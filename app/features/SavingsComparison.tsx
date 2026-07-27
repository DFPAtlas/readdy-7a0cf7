"use client";

import { useRef, useState, useEffect } from "react";

const savingsCards = [
  { icon: "ri-shield-check-line", label: "Fewer missed certificates", color: "#7A9A7E" },
  { icon: "ri-phone-line", label: "Fewer admin calls", color: "#3B82F6" },
  { icon: "ri-clipboard-line", label: "Faster inspections", color: "#8B5CF6" },
  { icon: "ri-building-4-line", label: "Faster owner updates", color: "#EC4899" },
  { icon: "ri-user-heart-line", label: "Better tenant communication", color: "#14B8A6" },
  { icon: "ri-file-excel-2-line", label: "Less spreadsheet work", color: "#6366F1" },
  { icon: "ri-user-settings-line", label: "Less duplicated admin", color: "#F59E0B" },
  { icon: "ri-error-warning-line", label: "Lower compliance risk", color: "#EF4444" },
];

const comparisonRows = [
  { without: "Spreadsheets everywhere", with: "Live portfolio dashboard" },
  { without: "Documents in inboxes", with: "Documents linked properly" },
  { without: "Compliance dates missed", with: "Compliance monitored automatically" },
  { without: "Repairs chased manually", with: "Repairs tracked end-to-end" },
  { without: "Tenants calling for updates", with: "Portals update users automatically" },
  { without: "Owners asking for reports", with: "Reports generated on demand" },
  { without: "Inspections typed up later", with: "Mobile inspections captured on-site" },
  { without: "No single source of truth", with: "One connected platform" },
];

export default function SavingsComparison() {
  const saveRef = useRef<HTMLDivElement>(null);
  const compRef = useRef<HTMLDivElement>(null);
  const [saveInView, setSaveInView] = useState(false);
  const [compInView, setCompInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === saveRef.current && entry.isIntersecting) setSaveInView(true);
          if (entry.target === compRef.current && entry.isIntersecting) setCompInView(true);
        });
      },
      { threshold: 0.1 }
    );
    if (saveRef.current) observer.observe(saveRef.current);
    if (compRef.current) observer.observe(compRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section ref={saveRef} className="w-full bg-white py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#7A9A7E] bg-[#7A9A7E]/10 px-4 py-1.5 rounded-full mb-4">
              <i className="ri-time-line"></i>
              Real Results
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A] mb-4">
              Save hours every week. Save money every month.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {savingsCards.map((card, i) => (
              <div
                key={card.label}
                className={`bg-[#FBF9F4] border border-[#E2E8F0] rounded-xl p-5 text-center hover:shadow-md hover:border-transparent transition-all duration-500 ${
                  saveInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: card.color + "15" }}
                >
                  <i className={`${card.icon} text-lg`} style={{ color: card.color }}></i>
                </div>
                <p className="text-sm font-medium text-[#3A3F3A] leading-snug">{card.label}</p>
              </div>
            ))}
          </div>

          <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${saveInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-lg text-[#687068] leading-relaxed">
              Lethub does not replace your team. It gives your team more hours back, fewer mistakes to fix and a clearer view of every property.
            </p>
          </div>
        </div>
      </section>

      <section ref={compRef} className="w-full bg-[#FBF9F4] py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-4">
              <i className="ri-scales-line"></i>
              The Difference
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A]">
              Managing property before and after Lethub
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="grid grid-cols-2">
              <div className="bg-[#FEF2F2] px-6 py-4 border-b border-[#FECACA]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-close-circle-line text-[#EF4444] text-sm"></i>
                  </div>
                  <span className="text-sm font-semibold text-[#991B1B]">Without Lethub</span>
                </div>
              </div>
              <div className="bg-[#ECFDF5] px-6 py-4 border-b border-[#A7F3D0]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-checkbox-circle-line text-[#7A9A7E] text-sm"></i>
                  </div>
                  <span className="text-sm font-semibold text-[#065F46]">With Lethub</span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {comparisonRows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-2 transition-all duration-500 ${
                    compInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 px-6 py-4 bg-[#FFF5F5]/50">
                    <div className="w-6 h-6 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                      <i className="ri-close-line text-[#EF4444] text-xs"></i>
                    </div>
                    <span className="text-sm text-[#687068]">{row.without}</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-[#F0FDF4]/50">
                    <div className="w-6 h-6 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                      <i className="ri-check-line text-[#7A9A7E] text-xs"></i>
                    </div>
                    <span className="text-sm font-medium text-[#3A3F3A]">{row.with}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}