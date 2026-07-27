"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative w-full min-h-[650px] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://readdy.ai/api/search-image?query=bright%20sunny%20blue%20sky%20over%20elegant%20modern%20British%20townhouse%20row%2C%20vivid%20blue%20sky%20white%20clouds%2C%20clean%20architectural%20lines%2C%20premium%20residential%20properties&width=1920&height=700&seq=hero-bg-blue-sky&orientation=landscape')",
        }}
      />
      <div className="absolute inset-0 bg-[#C28A78]/30" />
      <div className="absolute inset-0 bg-black/5" />

      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_50%,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative w-full px-6 lg:px-12 pt-24 pb-20">
        <div className="max-w-3xl">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            The Complete Property Management Platform Built for the UK Market
          </h1>
          <p className={`text-lg md:text-xl text-white/80 mb-10 max-w-2xl transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            LetHub streamlines property management for UK estate agents, letting agents, and property managers. From tenancy to maintenance to compliance — one platform for your entire portfolio.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 mb-6 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link href="/demo">
              <button className="bg-white hover:bg-white/90 text-[#C28A78] font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors shadow-lg">
                View Demo
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors">
                Start Free Trial
              </button>
            </Link>
            <Link href="/book-demo">
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors">
                Book a Demo
              </button>
            </Link>
          </div>

          <p className={`text-sm text-white/60 mb-10 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>No credit card required. 14-day free trial. Cancel anytime.</p>

          <div className={`flex flex-wrap items-center gap-6 text-white/70 text-sm transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center bg-[#7A9A7E]/20 rounded-full">
                <i className="ri-check-line text-emerald-400 text-xs"></i>
              </div>
              Multi-tenant SaaS
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center bg-[#7A9A7E]/20 rounded-full">
                <i className="ri-check-line text-emerald-400 text-xs"></i>
              </div>
              GDPR Compliant
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center bg-[#7A9A7E]/20 rounded-full">
                <i className="ri-check-line text-emerald-400 text-xs"></i>
              </div>
              UK Hosted
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}