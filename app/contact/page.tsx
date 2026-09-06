"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website_alt"]');
    if (honeypot && honeypot.value.trim() !== "") {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    const formData = new FormData(form);
    try {
      await fetch("https://readdy.ai/api/form/d8vdlla181e9e92u8re0", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string,string>).toString(),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
    form.reset();
  };

  const offices = [
    {
      city: "Manchester",
      address: "3rd Floor, WeWork, 1 St Peter's Square, Manchester M2 3AE",
      icon: "ri-building-line",
    },
    {
      city: "London",
      address: "4th Floor, 71-91 Aldwych, London WC2B 4HN",
      icon: "ri-building-2-line",
    },
  ];

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-16 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
            <i className="ri-mail-line"></i>
            Get in touch
          </span>
          <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">We'd love to hear from you</h1>
          <p className="text-lg text-[#687068] max-w-2xl mx-auto">
            Whether you're curious about LetHub, need help with your account, or just want to say hello — drop us a message and we'll get back to you within one working day.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-[#10B981] text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-[#3A3F3A] mb-2">Message sent!</h2>
                <p className="text-[#687068] mb-6">Thanks for reaching out. We'll get back to you within one working day.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-semibold text-[#C28A78] hover:underline whitespace-nowrap"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                data-readdy-form
                id="contact-form"
                className="bg-white rounded-2xl border border-[#E2E8F0] p-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">First name *</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors"
                      placeholder="James"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Last name *</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors"
                      placeholder="Thornton"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors"
                      placeholder="james@agency.co.uk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors"
                      placeholder="+44 161 123 4567"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Company</label>
                  <input
                    type="text"
                    name="company"
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors"
                    placeholder="Your Agency Ltd"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Reason for contact *</label>
                  <div className="relative">
                    <button
                      type="button"
                      id="reason-selector"
                      className="w-full text-left text-sm px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors flex items-center justify-between peer"
                      onClick={() => {
                        const menu = document.getElementById('reason-dropdown');
                        if (menu) menu.classList.toggle('hidden');
                      }}
                    >
                      <span id="reason-label">General enquiry</span>
                      <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                    </button>
                    <input type="hidden" name="reason" value="General enquiry" id="reason-input" />
                    <div id="reason-dropdown" className="hidden absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg">
                      {["General enquiry","Request a demo","Sales question","Partnership opportunity","Press & media","Careers"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className="w-full text-left text-sm px-4 py-2.5 hover:bg-[#FBF9F4] transition-colors whitespace-nowrap"
                          onClick={() => {
                            const label = document.getElementById('reason-label');
                            const input = document.getElementById('reason-input') as HTMLInputElement;
                            const menu = document.getElementById('reason-dropdown');
                            if (label) label.textContent = r;
                            if (input) input.value = r;
                            if (menu) menu.classList.add('hidden');
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Message *</label>
                  <textarea
                    name="message"
                    required
                    maxLength={500}
                    rows={5}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  ></textarea>
                </div>

                <input
                  type="text"
                  name="website_alt"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                />

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#94A3B8]">We'll respond within 1 working day</p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#143828] px-6 py-3 rounded-xl transition-colors whitespace-nowrap disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send message"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-6">
            {offices.map((office) => (
              <div key={office.city} className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="w-10 h-10 rounded-lg bg-[#C28A78]/10 flex items-center justify-center mb-4">
                  <i className={`${office.icon} text-[#C28A78] text-lg`}></i>
                </div>
                <h3 className="font-bold text-[#3A3F3A] mb-2">{office.city}</h3>
                <p className="text-sm text-[#687068] leading-relaxed">{office.address}</p>
              </div>
            ))}

            <div className="bg-[#C28A78] rounded-xl p-6 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <i className="ri-customer-service-2-line text-white text-lg"></i>
              </div>
              <h3 className="font-bold mb-2">Need immediate help?</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                Existing customers can reach our support team directly from the dashboard or call us on:
              </p>
              <p className="text-lg font-bold">0161 234 5678</p>
              <p className="text-xs text-white/60 mt-1">Mon–Fri, 9am–6pm GMT</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">How quickly will you respond?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">We aim to reply to every enquiry within one working day. Existing customers using the in-dashboard support channel typically hear back within two hours during business hours.</p>
            </div>
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">Can I speak to someone directly?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">Yes. Call our Manchester office on 0161 234 5678, Monday to Friday, 9am&ndash;6pm GMT. For account-specific questions, the dashboard support channel is usually the fastest route.</p>
            </div>
            <div className="bg-[#FAFBFC] rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="font-semibold text-[#3A3F3A] mb-2">I&apos;m a journalist or partner — who should I contact?</h3>
              <p className="text-sm text-[#687068] leading-relaxed">Select &quot;Press &amp; media&quot; or &quot;Partnership opportunity&quot; from the reason dropdown and your message will be routed to the right team. We respond to media and partnership enquiries directly.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}