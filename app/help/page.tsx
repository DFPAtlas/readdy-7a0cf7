"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HELP_ARTICLES, HELP_CATEGORIES } from "@/lib/helpArticles";

export default function HelpPage() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_ARTICLES;
    return HELP_ARTICLES.filter((a) => {
      const text = [a.title, a.summary, ...a.body.flatMap((b) => ("items" in b ? b.items : [b.text]))].join(" ").toLowerCase();
      return q.split(/\s+/).every((word) => text.includes(word));
    });
  }, [query]);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-question-line" aria-hidden="true"></i>
              Help Centre
            </span>
            <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">How can we help?</h1>
            <p className="text-lg text-[#687068] max-w-2xl mx-auto mb-8">
              Step-by-step guides to setting up and running your agency on LetHub.
            </p>
            <div className="max-w-xl mx-auto relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-[#94A3B8]" aria-hidden="true"></i>
              </div>
              <label htmlFor="help-search" className="sr-only">Search help articles</label>
              <input
                id="help-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors"
              />
            </div>
          </div>

          {matches.length === 0 ? (
            <p className="text-center text-[#687068]">
              No articles match &ldquo;{query}&rdquo;. Try another word, or email{" "}
              <a href="mailto:support@lethub.uk" className="text-[#C28A78] underline">support@lethub.uk</a>.
            </p>
          ) : (
            <div className="space-y-12">
              {HELP_CATEGORIES.map((category) => {
                const articles = matches.filter((a) => a.category === category.id);
                if (articles.length === 0) return null;
                return (
                  <div key={category.id}>
                    <h2 className="text-xl font-bold text-[#3A3F3A] mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#C28A78]/10 flex items-center justify-center">
                        <i className={`${category.icon} text-[#C28A78]`} aria-hidden="true"></i>
                      </span>
                      {category.title}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {articles.map((article) => (
                        <Link
                          key={article.slug}
                          href={`/help/${article.slug}`}
                          className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all group"
                        >
                          <h3 className="font-semibold text-[#3A3F3A] mb-1.5 group-hover:text-[#C28A78] transition-colors">{article.title}</h3>
                          <p className="text-sm text-[#687068] leading-relaxed">{article.summary}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center bg-white rounded-2xl border border-[#E2E8F0] p-10">
            <div className="w-14 h-14 rounded-full bg-[#C28A78]/10 flex items-center justify-center mx-auto mb-4">
              <i className="ri-customer-service-2-line text-[#C28A78] text-xl" aria-hidden="true"></i>
            </div>
            <h2 className="text-xl font-bold text-[#3A3F3A] mb-2">Still need help?</h2>
            <p className="text-[#687068] text-sm mb-6 max-w-md mx-auto">
              Email us and we aim to reply within one working day.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/contact" className="text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#B07A69] px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                Contact support
              </Link>
              <a href="mailto:support@lethub.uk" className="text-sm font-semibold text-[#3A3F3A] border border-[#E2E8F0] px-6 py-3 rounded-xl hover:border-[#C28A78] transition-colors whitespace-nowrap">
                support@lethub.uk
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
