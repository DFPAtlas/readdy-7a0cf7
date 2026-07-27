"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const values = [
  {
    icon: "ri-shield-star-line",
    title: "Trust & Transparency",
    description: "We believe in building lasting relationships through honesty. Every feature we build, every decision we make is grounded in earning the trust of the agents and landlords who rely on us daily.",
  },
  {
    icon: "ri-flashlight-line",
    title: "Innovation First",
    description: "The property industry has been held back by legacy software for too long. We are relentlessly pushing boundaries with AI, automation, and intuitive design to bring property management into the modern era.",
  },
  {
    icon: "ri-user-heart-line",
    title: "Customer Obsession",
    description: "Every pixel, every workflow, every integration exists because it solves a real problem for our users. We do not ship features for investors — we ship them for property professionals on the ground.",
  },
  {
    icon: "ri-global-line",
    title: "UK Compliance by Design",
    description: "Born and built in the UK. Our platform embeds English, Welsh, Scottish, and Northern Irish regulatory requirements directly into the workflow — not as an afterthought, not as a bolt-on module.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
            <i className="ri-building-2-line"></i>
            Our story
          </span>
          <h1 className="text-5xl font-bold text-[#3A3F3A] mb-6 leading-tight">
            Building the future of property management
          </h1>
          <p className="text-lg text-[#687068] max-w-2xl mx-auto leading-relaxed">
            LetHub was born from a simple frustration: why is property management software still stuck in 2005? We are on a mission to give every letting agent, landlord, and property manager in the UK the tools they deserve — modern, intelligent, and a joy to use.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#3A3F3A] text-center mb-4">What we stand for</h2>
          <p className="text-[#687068] text-center mb-12 max-w-2xl mx-auto">The principles that guide every decision we make — from product design to hiring.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
                <div className="w-10 h-10 rounded-lg bg-[#C28A78]/10 flex items-center justify-center mb-4">
                  <i className={`${v.icon} text-[#C28A78] text-lg`}></i>
                </div>
                <h3 className="text-lg font-bold text-[#3A3F3A] mb-2">{v.title}</h3>
                <p className="text-sm text-[#687068] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-[#C28A78] to-[#2D5A3D] rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Want to learn more?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            See how LetHub can transform your property management operations or get in touch with our team.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/demo" className="bg-white text-[#C28A78] font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap">
              View Demo
            </Link>
            <Link href="/contact" className="text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition-colors whitespace-nowrap">
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}