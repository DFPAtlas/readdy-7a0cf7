"use client";

import { useRef, useState, useEffect } from "react";

const agents = [
  { icon: "ri-shield-check-line", name: "Compliance Monitor Agent", desc: "Scans every property daily for expiring certificates and flags risks before they become problems.", color: "#10B981" },
  { icon: "ri-file-check-line", name: "Document Verification Agent", desc: "Checks uploaded documents for completeness, flags missing files and organises everything automatically.", color: "#3B82F6" },
  { icon: "ri-tools-line", name: "Maintenance Ticket Agent", desc: "Creates repair actions from tenant reports and inspection findings, assigns contractors and tracks progress.", color: "#F59E0B" },
  { icon: "ri-file-chart-line", name: "Report Builder Agent", desc: "Generates owner reports, compliance summaries and portfolio overviews without anyone having to build them.", color: "#8B5CF6" },
  { icon: "ri-alert-line", name: "Portfolio Risk Agent", desc: "Scores every property on compliance, arrears and maintenance risk so you know where to focus.", color: "#EF4444" },
  { icon: "ri-message-3-line", name: "Tenant Communication Agent", desc: "Drafts and sends updates to tenants when maintenance progresses, inspections are due or documents are shared.", color: "#14B8A6" },
  { icon: "ri-building-4-line", name: "Landlord Update Agent", desc: "Keeps owners informed with automatic updates on their properties, rent collected and compliance status.", color: "#EC4899" },
  { icon: "ri-eye-line", name: "Admin Oversight Agent", desc: "Monitors system activity, flags unusual patterns and ensures nothing slips through the cracks across the entire portfolio.", color: "#6366F1" },
];

export default function AgentWorkforce() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full bg-gradient-to-b from-white to-[#F8FAFC] py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-4">
            <i className="ri-robot-line"></i>
            Automation Engine
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A] mb-4">
            Meet the agents working behind the scenes
          </h2>
          <p className="text-lg text-[#687068] max-w-2xl mx-auto">
            Lethub&apos;s automation agents do the background checking, sorting, reminding and reporting that normally eats hours of staff time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent, i) => (
            <div
              key={agent.name}
              className={`bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-lg hover:border-transparent transition-all duration-500 group ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: agent.color + "15" }}
              >
                <i className={`${agent.icon} text-xl`} style={{ color: agent.color }}></i>
              </div>
              <h3 className="font-semibold text-[#3A3F3A] mb-2 text-sm">{agent.name}</h3>
              <p className="text-xs text-[#687068] leading-relaxed">{agent.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}