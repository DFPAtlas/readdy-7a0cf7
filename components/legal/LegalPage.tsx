import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/companyDetails";

export function LegalPage({
  title,
  intro,
  icon = "ri-file-text-line",
  children,
}: {
  title: string;
  intro: ReactNode;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className={icon}></i>
              Last updated: {COMPANY.legalPagesLastUpdated}
            </span>
            <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">{title}</h1>
            <div className="text-lg text-[#687068] leading-relaxed">{intro}</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-8">{children}</div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">{heading}</h2>
      <div className="space-y-3 text-sm text-[#475569] leading-relaxed">{children}</div>
    </div>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
