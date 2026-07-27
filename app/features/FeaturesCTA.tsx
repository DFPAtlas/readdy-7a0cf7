"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function FeaturesCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full bg-white py-20 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <div className={`bg-gradient-to-br from-[#0F1F17] via-[#C28A78] to-[#1A3A2E] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden transition-all duration-700 ${
          inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981] rounded-full blur-3xl"></div>
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#10B981] bg-[#10B981]/20 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-rocket-line"></i>
              Ready to transform your property business?
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See what your property business looks like when the admin starts running itself.
            </h2>

            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Join UK agencies already managing their properties with LetHub.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="bg-white text-[#C28A78] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-black/10 whitespace-nowrap flex items-center gap-2 text-base"
              >
                <i className="ri-eye-line"></i>
                View Estate Agent Demo
              </Link>
              <Link
                href="/register"
                className="bg-[#10B981] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/25 whitespace-nowrap flex items-center gap-2 text-base"
              >
                Start 14-Day Free Trial
              </Link>
              <Link
                href="/book-demo"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all whitespace-nowrap flex items-center gap-2 text-base"
              >
                <i className="ri-calendar-line"></i>
                Book a Walkthrough
              </Link>
            </div>

            <p className="text-white/40 text-sm mt-6">
              No credit card required · 14-day free trial · Full access to all features
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}