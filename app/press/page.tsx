"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PressPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-megaphone-line"></i>
              Press &amp; Media
            </span>
            <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">LetHub in the news</h1>
            <p className="text-lg text-[#687068] max-w-2xl mx-auto">
              Company information, brand assets, and media contact details.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 mb-8">
            <h2 className="text-xl font-bold text-[#3A3F3A] mb-4">About LetHub</h2>
            <p className="text-sm text-[#687068] leading-relaxed mb-4">
              LetHub is a cloud-based property management platform built for UK estate agents, letting agents, and property managers. The platform brings together portfolio management, compliance tracking, maintenance workflows, rent collection, and multi-user portals in one integrated system.
            </p>
            <p className="text-sm text-[#687068] leading-relaxed">
              For press enquiries, interview requests, or speaking opportunities, please contact us through the form below or email{" "}
              <a href="mailto:press@lethub.co.uk" className="text-[#C28A78] underline">press@lethub.co.uk</a>.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 mb-8">
            <h2 className="text-xl font-bold text-[#3A3F3A] mb-4">Brand assets</h2>
            <p className="text-sm text-[#687068] leading-relaxed mb-6">
              Download our logo and brand guidelines. For additional assets or questions, contact our press team.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3A3F3A] bg-[#FBF9F4] border border-[#E2E8F0] px-5 py-3 rounded-xl hover:border-[#C28A78] transition-colors whitespace-nowrap">
                <i className="ri-download-line"></i> Logo pack (ZIP)
              </Link>
              <Link href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3A3F3A] bg-[#FBF9F4] border border-[#E2E8F0] px-5 py-3 rounded-xl hover:border-[#C28A78] transition-colors whitespace-nowrap">
                <i className="ri-palette-line"></i> Brand guidelines (PDF)
              </Link>
              <Link href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3A3F3A] bg-[#FBF9F4] border border-[#E2E8F0] px-5 py-3 rounded-xl hover:border-[#C28A78] transition-colors whitespace-nowrap">
                <i className="ri-image-line"></i> Screenshots (ZIP)
              </Link>
            </div>
          </div>

          <div className="bg-[#C28A78] rounded-2xl p-8 text-white">
            <h2 className="text-xl font-bold mb-4">Media enquiries</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              For press enquiries, interview requests, or speaking opportunities, please contact us.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-[#C28A78] font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Contact press team
                <i className="ri-arrow-right-line"></i>
              </Link>
              <a
                href="mailto:press@lethub.co.uk"
                className="text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                press@lethub.co.uk
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}