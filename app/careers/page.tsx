"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CareersPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-28 pb-24 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
            <i className="ri-briefcase-line"></i>
            Careers
          </span>
          <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">We&apos;re not hiring right now</h1>
          <p className="text-lg text-[#687068] leading-relaxed">
            LetHub is a small team getting ready for launch. We don&apos;t have any open roles at the moment, but we&apos;re always
            happy to hear from people who know UK lettings or build great software.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#C28A78] hover:bg-[#B07A69] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
