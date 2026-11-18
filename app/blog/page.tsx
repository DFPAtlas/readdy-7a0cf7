"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-28 pb-24 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
            <i className="ri-article-line"></i>
            Blog
          </span>
          <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">Guides for UK letting agents</h1>
          <p className="text-lg text-[#687068] leading-relaxed">
            We&apos;re writing practical guides on the Renters&apos; Rights Act, possession grounds, compliance deadlines and
            running a lettings business. The first articles will be published around our launch in 2027.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/help-centre" className="bg-[#C28A78] hover:bg-[#B07A69] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Visit the help centre
            </Link>
            <Link href="/contact" className="border border-[#D5D9D5] text-[#3A3F3A] font-semibold px-6 py-3 rounded-xl hover:bg-white transition-colors">
              Suggest a topic
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
