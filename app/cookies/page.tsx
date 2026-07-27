"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CookiesPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-archive-line"></i>
              Last updated: 15 June 2025
            </span>
            <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">Cookie Policy</h1>
            <p className="text-lg text-[#687068]">
              This policy explains what cookies are, how we use them on the LetHub platform, and your choices regarding their use.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">1. What are cookies?</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to website operators. Cookies may be "session cookies" (deleted when you close your browser) or "persistent cookies" (remain until they expire or you delete them).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">2. How we use cookies</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We use cookies for the following purposes:
              </p>
              <div className="space-y-4">
                {[
                  { cat: "Strictly necessary cookies", desc: "These are essential for the Platform to function. They enable core features like authentication, session management, and security. The Platform cannot operate without these cookies.", examples: "Authentication tokens, session identifiers, CSRF protection tokens." },
                  { cat: "Functional cookies", desc: "These remember your preferences and settings to enhance your experience. They are not essential but improve usability.", examples: "Language preferences, dashboard layout preferences, billing period selection (monthly/annual)." },
                  { cat: "Analytics cookies", desc: "These help us understand how users interact with the Platform so we can improve performance and design. All data is anonymised and aggregated.", examples: "Page views, feature usage, session duration, error tracking." },
                ].map((item) => (
                  <div key={item.cat} className="bg-[#FAFBFC] rounded-lg p-4 border border-[#E2E8F0]">
                    <h3 className="font-bold text-[#3A3F3A] text-sm mb-2">{item.cat}</h3>
                    <p className="text-sm text-[#475569] leading-relaxed mb-2">{item.desc}</p>
                    <p className="text-xs text-[#94A3B8]"><span className="font-medium">Examples:</span> {item.examples}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">3. Third-party cookies</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Some cookies on our Platform are set by trusted third-party services we use:
              </p>
              <ul className="space-y-2">
                {[
                  { provider: "Supabase", purpose: "Authentication and database services. Sets session and security cookies.", policy: "supabase.com/privacy" },
                  { provider: "Stripe", purpose: "Payment processing. Sets cookies for fraud prevention and session management.", policy: "stripe.com/privacy" },
                  { provider: "Vercel", purpose: "Hosting and analytics. Sets performance monitoring cookies.", policy: "vercel.com/legal/privacy-policy" },
                ].map((item) => (
                  <li key={item.provider} className="flex items-start gap-2 text-sm text-[#475569]">
                    <span className="font-semibold min-w-[100px] flex-shrink-0">{item.provider}:</span>
                    <span>{item.purpose} <a href={`https://${item.policy}`} className="text-[#C28A78] underline text-xs" target="_blank" rel="noopener noreferrer">Privacy policy</a></span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">4. Your choices</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                When you first visit LetHub, you will see a cookie banner allowing you to accept or manage your cookie preferences. You can update your preferences at any time through your account settings.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Most web browsers allow you to manage cookies through browser settings. You can usually:
              </p>
              <ul className="space-y-2">
                {[
                  "View cookies stored on your device and delete them individually or in bulk.",
                  "Block third-party cookies.",
                  "Block all cookies from specific sites.",
                  "Block all cookies from all sites.",
                  "Delete all cookies when you close your browser.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#475569] leading-relaxed mt-3">
                Please note that blocking strictly necessary cookies will prevent the Platform from functioning correctly. You may not be able to log in or use core features.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">5. Cookie list</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Cookie name</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Type</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Duration</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "sb-access-token", type: "Necessary", duration: "Session", purpose: "Authentication session" },
                      { name: "sb-refresh-token", type: "Necessary", duration: "Session", purpose: "Session refresh" },
                      { name: "lethub_prefs", type: "Functional", duration: "1 year", purpose: "User preferences" },
                      { name: "lethub_analytics", type: "Analytics", duration: "26 months", purpose: "Usage analytics" },
                      { name: "_ga", type: "Analytics", duration: "2 years", purpose: "Google Analytics" },
                    ].map((cookie) => (
                      <tr key={cookie.name} className="border-b border-[#E2E8F0]">
                        <td className="py-2 px-3 text-[#475569] font-mono text-xs">{cookie.name}</td>
                        <td className="py-2 px-3 text-[#475569]">{cookie.type}</td>
                        <td className="py-2 px-3 text-[#475569]">{cookie.duration}</td>
                        <td className="py-2 px-3 text-[#475569]">{cookie.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">6. Changes to this policy</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We may update this policy from time to time. Changes will be posted on this page. For material changes, we will notify you through the Platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">7. Contact</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Questions about cookies? Email privacy@lethub.co.uk or visit our <a href="/contact" className="text-[#C28A78] underline">contact page</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}