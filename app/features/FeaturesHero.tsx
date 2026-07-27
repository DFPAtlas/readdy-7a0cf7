"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const floatingCards = [
  { icon: "ri-shield-check-line", label: "Compliance\nMonitored", color: "#10B981", x: "left-[5%]", y: "top-[15%]", delay: "0" },
  { icon: "ri-tools-line", label: "Repairs\nTracked", color: "#F59E0B", x: "right-[7%]", y: "top-[20%]", delay: "200" },
  { icon: "ri-folder-line", label: "Documents\nOrganised", color: "#3B82F6", x: "left-[3%]", y: "bottom-[25%]", delay: "400" },
  { icon: "ri-user-heart-line", label: "Tenants\nUpdated", color: "#8B5CF6", x: "right-[5%]", y: "bottom-[30%]", delay: "600" },
  { icon: "ri-building-4-line", label: "Owners\nInformed", color: "#EC4899", x: "right-[12%]", y: "top-[50%]", delay: "300" },
  { icon: "ri-bank-card-line", label: "Rent\nVisible", color: "#14B8A6", x: "left-[10%]", y: "top-[50%]", delay: "500" },
  { icon: "ri-clipboard-line", label: "Inspections\nCaptured", color: "#6366F1", x: "left-[8%]", y: "bottom-[55%]", delay: "700" },
];

export default function FeaturesHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <>
      <section className="relative w-full min-h-[680px] flex items-center overflow-hidden bg-gradient-to-br from-[#0F1F17] via-[#C28A78] to-[#1A3A2E]">
        <style>{`
          @keyframes floatCard {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%)"
          }} />
        </div>

        <div className="absolute inset-0 hidden lg:block">
          {floatingCards.map((card) => (
            <div
              key={card.label}
              className={`absolute ${card.x} ${card.y} transition-all duration-1000`}
              style={{ animationDelay: `${card.delay}ms`, animation: `floatCard 6s ease-in-out ${card.delay}ms infinite` }}
            >
              <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}20` }}>
                  <i className={`${card.icon} text-sm`} style={{ color: card.color }}></i>
                </div>
                <span className="text-xs font-semibold text-white/90 whitespace-pre-line leading-tight">{card.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative w-full px-6 lg:px-12 pt-24 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <span className={`inline-flex items-center gap-2 text-sm font-medium text-[#10B981] bg-[#10B981]/10 px-4 py-1.5 rounded-full mb-6 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <i className="ri-sparkling-line"></i>
              Always-on digital property team
            </span>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 transition-all duration-500 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Your 24/7 Digital Property Team
            </h1>

            <p className={`text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto transition-all duration-500 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Lethub helps estate agents and property owners manage portfolios, compliance, documents, repairs, rent, portals and inspections from one intelligent platform — like having extra staff working around the clock.
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-500 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="/register"
                className="bg-white text-[#C28A78] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-black/10 whitespace-nowrap text-base"
              >
                Start 14-Day Free Trial
                <i className="ri-arrow-right-line ml-2"></i>
              </Link>
              <Link
                href="/demo"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all whitespace-nowrap text-base flex items-center gap-2"
              >
                <i className="ri-play-circle-line text-lg"></i>
                View Demo
              </Link>
            </div>

            <p className={`text-sm text-white/40 mt-6 transition-all duration-500 delay-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAFBFC] to-transparent"></div>
      </section>

      <section className="w-full bg-[#FAFBFC] py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-full px-4 py-1.5 mb-6 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <i className="ri-alert-line text-[#EF4444] text-sm"></i>
            <span className="text-sm font-medium text-[#991B1B]">We see this every day</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#3A3F3A] mb-6">
            Stop running your property business from spreadsheets, inboxes and memory.
          </h2>

          <p className="text-lg text-[#687068] max-w-3xl mx-auto leading-relaxed">
            Estate agents and landlords lose time every day chasing documents, checking certificates, replying to tenants, updating owners, tracking repairs and wondering what has been missed. Lethub brings it all into one place and lets automation do the heavy lifting.
          </p>
        </div>
      </section>
    </>
  );
}