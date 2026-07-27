"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-file-text-line"></i>
              Last updated: 15 June 2025
            </span>
            <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">Terms of Service</h1>
            <p className="text-lg text-[#687068]">
              These terms govern your use of the LetHub platform. By creating an account or using our services, you agree to be bound by these terms. Please read them carefully.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">1. Definitions</h2>
              <ul className="space-y-2">
                {[
                  { term: '"LetHub", "we", "us", "our"', def: "LetHub Ltd, a company registered in England and Wales (Company No. 12345678)." },
                  { term: '"Platform"', def: "The LetHub software-as-a-service platform, including all web applications, mobile applications, APIs, and related services." },
                  { term: '"Customer", "you", "your"', def: "The individual or organisation that creates an account and uses the Platform." },
                  { term: '"Subscription"', def: "A paid plan providing access to the Platform for a defined period, as selected during registration or plan change." },
                  { term: '"User"', def: "Any individual authorised by the Customer to access the Platform under the Customer's account." },
                  { term: '"Content"', def: "All data, documents, images, and information uploaded to or generated through the Platform by the Customer or its Users." },
                  { term: '"Effective Date"', def: "The date on which the Customer creates an account or first accesses the Platform." },
                ].map((item) => (
                  <li key={item.term} className="flex items-start gap-2 text-sm text-[#475569]">
                    <span className="font-semibold min-w-[140px] flex-shrink-0">{item.term}</span>
                    <span>{item.def}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">2. Account registration</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                To access the Platform, you must create an account by providing accurate, complete registration information. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You must notify us immediately of any unauthorised use. You must be at least 18 years old and have the legal capacity to enter into a binding contract.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">3. Subscriptions and payment</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Paid subscriptions are billed in advance on a monthly or annual basis, as selected during sign-up. All fees are stated in pounds sterling (£) and are exclusive of VAT, which will be added at the prevailing rate. Subscription fees are non-refundable except as required by law or as explicitly stated in these terms. We reserve the right to change pricing with 30 days' notice; price changes will not affect your current subscription period.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">
                You may upgrade your plan at any time — the prorated difference will be charged immediately. Downgrades take effect at the start of the next billing cycle. Failure to pay may result in suspension or termination of access.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">4. Free trial</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                New Customers may be offered a 14-day free trial of the Platform. At the end of the trial period, you will be prompted to select a paid plan to continue using the Platform. No charges will be made without your explicit authorisation. We reserve the right to modify or discontinue free trial offers at any time.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">5. Acceptable use</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                You agree not to use the Platform for any unlawful purpose or in violation of these terms. Specifically, you must not:
              </p>
              <ul className="space-y-2">
                {[
                  "Upload or transmit any Content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable.",
                  "Use the Platform to send unsolicited commercial communications (spam).",
                  "Attempt to gain unauthorised access to the Platform, other accounts, or related systems.",
                  "Reverse engineer, decompile, or disassemble any part of the Platform.",
                  "Use the Platform in any way that could damage, disable, or impair its functionality.",
                  "Resell, sublicense, or commercially exploit the Platform without our express written permission.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">6. Intellectual property</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                The Platform and all associated software, design, trademarks, and documentation are the exclusive property of LetHub Ltd and are protected by copyright and other intellectual property laws. We grant you a limited, non-exclusive, non-transferable licence to access and use the Platform during your subscription period. You retain all ownership rights in your Content. By uploading Content, you grant us a limited licence to host, store, and process it solely for the purpose of providing the Platform to you.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">7. Data protection</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We process personal data in accordance with our Privacy Policy and applicable data protection laws. Where you upload personal data of tenants, landlords, or other third parties, you warrant that you have the necessary lawful basis to do so. Our Data Processing Agreement (available on request) sets out the specific terms governing our processing of personal data on your behalf.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">8. Service availability</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We use commercially reasonable efforts to maintain 99.9% Platform availability, excluding scheduled maintenance (which we will announce at least 48 hours in advance). We are not liable for downtime caused by circumstances beyond our reasonable control, including internet outages, third-party service failures, or force majeure events.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">9. Limitation of liability</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                To the maximum extent permitted by law, LetHub's total aggregate liability for any claims arising from or relating to these terms or the Platform shall not exceed the total fees paid by you in the 12 months preceding the claim. We shall not be liable for any indirect, consequential, special, or punitive damages, or for loss of profits, revenue, data, or business opportunity.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">
                Nothing in these terms limits or excludes liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by English law.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">10. Termination</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Either party may terminate these terms at any time. You may terminate by closing your account through the Platform settings or by contacting support@lethub.co.uk. We may terminate or suspend your access immediately if you breach these terms, fail to pay fees, or engage in conduct that we reasonably believe violates applicable law or harms other users.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">
                Upon termination, your right to access the Platform ceases immediately. We will retain your Content for 30 days after termination to allow you to export it. After 30 days, your Content will be permanently deleted, subject to our legal retention obligations.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">11. Governing law</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">12. Changes to these terms</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We may modify these terms from time to time. Material changes will be communicated via email and an in-platform notification at least 30 days before they take effect. Continued use after changes take effect constitutes acceptance. If you do not agree to the changes, you may terminate your account before the effective date.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">13. Contact</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                For questions about these terms:<br />
                Email: legal@lethub.co.uk<br />
                Post: Legal Department, LetHub Ltd, 3rd Floor, WeWork, 1 St Peter's Square, Manchester M2 3AE
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}