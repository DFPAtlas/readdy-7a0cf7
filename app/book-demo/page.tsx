"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [propertyCount, setPropertyCount] = useState("");
  const [countDropdown, setCountDropdown] = useState(false);

  const propertyRanges = ["100 - 250", "250 - 500", "500 - 1000", "1000+"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = form.querySelector<HTMLInputElement>('input[name="phone_alt"]');
    if (honeypot && honeypot.value.trim() !== "") {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    setError("");
    const formData = new FormData(form);
    formData.set("properties_count", propertyCount);
    try {
      const resp = await fetch("https://readdy.ai/api/form/d8vvjv46ci2plld1o9r0", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string,string>).toString(),
      });
      if (!resp.ok) throw new Error("Failed");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
    form.reset();
    setPropertyCount("");
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <Header />

      <div className="pt-24 pb-16 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-4">
            <i className="ri-building-4-line"></i>
            Enterprise Demo
          </span>
          <h1 className="text-3xl font-bold text-[#3A3F3A] mb-4">
            Book a Demo
          </h1>
          <p className="text-lg text-[#687068] mb-10">
            See how LetHub Enterprise can transform your property management operations. Fill in the form and our team will be in touch within 24 hours.
          </p>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-left">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-[#10B981] text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold text-[#3A3F3A] mb-2">Thank you!</h2>
                <p className="text-[#687068] mb-6">Our team will contact you within 24 hours to schedule your demo.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-semibold text-[#C28A78] hover:underline whitespace-nowrap"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} data-readdy-form id="book-demo-form" className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#DC2626]">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Full Name</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-white focus-within:border-[#C28A78]">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-user-line text-[#94A3B8] text-sm"></i>
                      </div>
                      <input name="full_name" type="text" placeholder="Your name" className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Company</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-white focus-within:border-[#C28A78]">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-building-line text-[#94A3B8] text-sm"></i>
                      </div>
                      <input name="company" type="text" placeholder="Company name" className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" required />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Work Email</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-white focus-within:border-[#C28A78]">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-mail-line text-[#94A3B8] text-sm"></i>
                    </div>
                    <input name="email" type="email" placeholder="you@company.com" className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Phone Number</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-white focus-within:border-[#C28A78]">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-phone-line text-[#94A3B8] text-sm"></i>
                    </div>
                    <input name="phone" type="tel" placeholder="+44" className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Number of Properties</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCountDropdown(!countDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#3A3F3A]"
                    >
                      <span>{propertyCount || "Select range"}</span>
                      <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                    </button>
                    {countDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-20">
                        {propertyRanges.map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => { setPropertyCount(range); setCountDropdown(false); }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]"
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">What are you interested in?</label>
                  <textarea
                    name="message"
                    placeholder="Tell us about your requirements..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] resize-none"
                  ></textarea>
                </div>
                <input
                  type="text"
                  name="phone_alt"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C28A78] hover:bg-[#143828] text-white font-semibold py-3 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Request Demo"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "ri-shield-check-line", title: "Dedicated Manager", desc: "Personal account manager for onboarding and support" },
              { icon: "ri-settings-4-line", title: "Custom Setup", desc: "Tailored to your exact workflows and integrations" },
              { icon: "ri-phone-line", title: "24/7 Support", desc: "Round-the-clock priority assistance" },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 bg-white rounded-xl border border-[#E2E8F0]">
                <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className={`${item.icon} text-[#C28A78] text-lg`}></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">{item.title}</h3>
                <p className="text-xs text-[#687068]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}