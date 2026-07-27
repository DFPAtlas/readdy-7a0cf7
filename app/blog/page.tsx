"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const posts = [
  {
    slug: "renters-rights-bill-2025",
    title: "What the Renters' Rights Bill 2025 means for letting agents",
    excerpt: "The long-awaited Renters' Rights Bill is now law. Here's everything letting agents need to know about the abolition of Section 21, the new ombudsman, and the property portal — and how LetHub helps you stay compliant.",
    date: "12 June 2025",
    category: "Compliance",
    readTime: "6 min read",
    image: "https://readdy.ai/api/search-image?query=modern%20British%20parliamentary%20building%20interior%20with%20natural%20light%20streaming%20through%20large%20windows%20legal%20documents%20on%20a%20wooden%20desk%20professional%20photography%20clean%20composition&width=600&height=400&seq=10&orientation=landscape",
  },
  {
    slug: "ai-maintenance-triage-guide",
    title: "How AI maintenance triage cuts response times by 60%",
    excerpt: "We analyzed data from 200+ agencies using LetHub's AI triage system. The results are clear: automated issue classification and smart contractor matching dramatically reduces time-to-resolution.",
    date: "3 June 2025",
    category: "Product",
    readTime: "4 min read",
    image: "https://readdy.ai/api/search-image?query=modern%20smart%20home%20interior%20with%20a%20tablet%20showing%20property%20management%20dashboard%20on%20a%20kitchen%20counter%20warm%20lighting%20clean%20minimalist%20design&width=600&height=400&seq=11&orientation=landscape",
  },
  {
    slug: "epc-regulation-changes-2028",
    title: "Preparing for the 2028 EPC deadline: a practical guide",
    excerpt: "By 2028, all rental properties in England and Wales must achieve an EPC rating of C or above. We break down the timeline, the costs, the exemptions, and how to plan your portfolio upgrades now.",
    date: "28 May 2025",
    category: "Compliance",
    readTime: "5 min read",
    image: "https://readdy.ai/api/search-image?query=energy%20efficiency%20rating%20certificate%20on%20a%20wall%20next%20to%20a%20modern%20British%20terraced%20house%20exterior%20with%20solar%20panels%20bright%20daylight%20photography&width=600&height=400&seq=12&orientation=landscape",
  },
  {
    slug: "open-banking-rent-collection",
    title: "Open banking is transforming rent collection — here's how",
    excerpt: "Manual bank reconciliation is becoming a thing of the past. Open banking APIs now enable real-time rent tracking, automated arrears detection, and instant payment confirmation. We explore what this means for agency operations.",
    date: "21 May 2025",
    category: "Product",
    readTime: "5 min read",
    image: "https://readdy.ai/api/search-image?query=modern%20fintech%20office%20with%20large%20screen%20displaying%20banking%20dashboard%20graphs%20and%20charts%20clean%20professional%20environment%20natural%20daylight&width=600&height=400&seq=13&orientation=landscape",
  },
  {
    slug: "landlord-digital-transformation",
    title: "Why landlords are switching to all-digital property management",
    excerpt: "The pandemic accelerated digital adoption in property management, but the shift is permanent. We surveyed 500 UK landlords about their tech habits — and the findings might surprise you.",
    date: "15 May 2025",
    category: "Insights",
    readTime: "4 min read",
    image: "https://readdy.ai/api/search-image?query=modern%20British%20living%20room%20with%20a%20laptop%20on%20a%20coffee%20table%20showing%20property%20management%20interface%20comfortable%20setting%20natural%20light&width=600&height=400&seq=14&orientation=landscape",
  },
  {
    slug: "letting-agency-growth-strategies",
    title: "5 growth strategies for letting agencies in 2025",
    excerpt: "The lettings market is more competitive than ever. We share five practical strategies — from portfolio diversification to tech-enabled service models — that high-growth agencies are using to pull ahead.",
    date: "8 May 2025",
    category: "Insights",
    readTime: "7 min read",
    image: "https://readdy.ai/api/search-image?query=modern%20office%20meeting%20room%20with%20professionals%20discussing%20around%20a%20table%20glass%20walls%20city%20view%20professional%20photography&width=600&height=400&seq=15&orientation=landscape",
  },
  {
    slug: "digital-signatures-legal-guide",
    title: "Are digital signatures legally binding for tenancy agreements?",
    excerpt: "A comprehensive guide to the legal status of e-signatures in England, Wales, Scotland, and Northern Ireland — and why digital signing is now the standard for modern tenancy agreements.",
    date: "1 May 2025",
    category: "Compliance",
    readTime: "5 min read",
    image: "https://readdy.ai/api/search-image?query=close%20up%20of%20a%20hand%20holding%20a%20stylus%20signing%20on%20a%20tablet%20screen%20with%20a%20tenancy%20agreement%20document%20visible%20professional%20legal%20setting%20clean%20lighting&width=600&height=400&seq=16&orientation=landscape",
  },
  {
    slug: "property-portfolio-reporting",
    title: "Building better portfolio reports: what investors actually want",
    excerpt: "We talked to 50 property investors about what makes a great portfolio report. The answer isn't more data — it's better data, presented clearly. Here's our guide to reporting that landlords love.",
    date: "24 April 2025",
    category: "Insights",
    readTime: "6 min read",
    image: "https://readdy.ai/api/search-image?query=professional%20desk%20with%20financial%20reports%20charts%20and%20a%20coffee%20cup%20modern%20office%20setting%20with%20warm%20lighting%20clean%20photography%20style&width=600&height=400&seq=17&orientation=landscape",
  },
  {
    slug: "tenant-communication-best-practices",
    title: "Tenant communication: what the best agencies do differently",
    excerpt: "Communication is the number one driver of tenant satisfaction — and tenant retention. We analyze the communication patterns of top-rated agencies and share practical templates and workflows.",
    date: "17 April 2025",
    category: "Insights",
    readTime: "5 min read",
    image: "https://readdy.ai/api/search-image?query=modern%20British%20apartment%20interior%20with%20a%20person%20reading%20a%20message%20on%20their%20phone%20comfortable%20setting%20warm%20natural%20lighting&width=600&height=400&seq=18&orientation=landscape",
  },
];

const categories = ["All", "Product", "Compliance", "Insights"];
import { useState } from "react";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-16 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
            <i className="ri-article-line"></i>
            LetHub Blog
          </span>
          <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">Insights for modern property professionals</h1>
          <p className="text-lg text-[#687068] max-w-2xl mx-auto">
            Practical guides, compliance updates, and industry insights to help you run a better property business.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#C28A78] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#687068] hover:border-[#C28A78] hover:text-[#C28A78]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.slug}
              className="group bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-lg hover:border-[#CBD5E1] transition-all cursor-pointer"
            >
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-[#C28A78] bg-[#C28A78]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {post.category}
                  </span>
                  <span className="text-xs text-[#94A3B8]">{post.readTime}</span>
                </div>
                <h3 className="font-bold text-[#3A3F3A] mb-2 group-hover:text-[#C28A78] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-[#687068] leading-relaxed line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <p className="text-xs text-[#94A3B8]">{post.date}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
              <i className="ri-inbox-line text-[#94A3B8] text-2xl"></i>
            </div>
            <p className="text-[#687068]">No posts in this category yet. Check back soon!</p>
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-xs text-[#94A3B8]">
            Full articles coming soon. Check back for in-depth property management guides and compliance updates.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}