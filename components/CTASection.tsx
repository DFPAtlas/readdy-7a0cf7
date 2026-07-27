"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative w-full py-24 px-6 lg:px-12 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://readdy.ai/api/search-image?query=Abstract%20modern%20technology%20background%20with%20soft%20gradient%20mesh%2C%20clean%20minimalist%20design%2C%20floating%20geometric%20shapes%2C%20subtle%20blue%20and%20green%20tones%2C%20professional%20SaaS%20product%20background%2C%20clean%20simple%20background%20with%20soft%20neutral%20lighting%2C%20digital%20platform%20aesthetic&width=1920&height=600&seq=cta-bg-1&orientation=landscape')",
        }}
      />
      <div className="absolute inset-0 bg-[#3A3F3A]/80" />

      <div className="relative w-full text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Transform Your Property Management?
        </h2>
        <p className="text-lg text-white/80 mb-8">
          Join UK agencies already using LetHub to streamline operations, delight landlords, and grow their portfolios.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <button className="bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors shadow-lg">
              Start Free Trial
            </button>
          </Link>
          <Link href="/book-demo">
            <button className="bg-white hover:bg-white/90 text-[#3A3F3A] font-medium px-8 py-3.5 rounded-lg whitespace-nowrap transition-colors shadow-lg">
              Book a Demo
            </button>
          </Link>
        </div>
        <p className="text-sm text-white/60 mt-6">No credit card required. 14-day free trial. Cancel anytime.</p>
      </div>
    </section>
  );
}