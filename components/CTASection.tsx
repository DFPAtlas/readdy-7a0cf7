"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative w-full py-24 px-6 lg:px-12 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, rgba(194,138,120,0.45), transparent 55%), radial-gradient(circle at 80% 80%, rgba(122,154,126,0.45), transparent 55%)",
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
        <p className="text-sm text-white/60 mt-6">14-day free trial. No charge until it ends. Cancel anytime.</p>
      </div>
    </section>
  );
}