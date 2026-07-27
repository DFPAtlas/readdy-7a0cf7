"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-shield-check-line"></i>
              Last updated: 15 June 2025
            </span>
            <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">Privacy Policy</h1>
            <p className="text-lg text-[#687068]">
              At LetHub, we take your privacy seriously. This policy explains how we collect, use, store, and protect your personal data in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">1. Who we are</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                LetHub Ltd ("LetHub", "we", "us", or "our") is a company registered in England and Wales (Company No. 12345678) with registered office at 3rd Floor, WeWork, 1 St Peter's Square, Manchester M2 3AE. We are the data controller for the personal data processed through our platform. We are registered with the Information Commissioner's Office (ICO) under registration number ZA123456.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">2. What data we collect</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We collect and process the following categories of personal data:
              </p>
              <ul className="space-y-2">
                {[
                  { label: "Account data", detail: "Your name, email address, phone number, company name, job title, and password (hashed) when you create a LetHub account." },
                  { label: "Property data", detail: "Information about properties you manage, including addresses, EPC ratings, tenancy details, maintenance records, and compliance certificates." },
                  { label: "Financial data", detail: "Rent payment records, arrears information, and billing details. We do not store full credit card numbers — payment processing is handled by our PCI-compliant payment processor." },
                  { label: "Usage data", detail: "How you interact with our platform, including pages visited, features used, and session duration. This helps us improve the product." },
                  { label: "Communication data", detail: "Records of correspondence when you contact our support team, including emails, chat messages, and phone calls." },
                  { label: "Device data", detail: "IP address, browser type, operating system, and device identifiers for security and diagnostic purposes." },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-2 text-sm text-[#475569]">
                    <span className="font-semibold min-w-[140px] flex-shrink-0">{item.label}:</span>
                    <span>{item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">3. How we use your data</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We process your personal data for the following purposes, under the lawful bases indicated:
              </p>
              <ul className="space-y-2">
                {[
                  { purpose: "To provide our services", basis: "Contractual necessity — we need this data to deliver the LetHub platform to you." },
                  { purpose: "To communicate with you", basis: "Legitimate interest — responding to enquiries, sending service updates, and providing support." },
                  { purpose: "To improve our platform", basis: "Legitimate interest — analysing usage patterns to enhance features and fix issues." },
                  { purpose: "To send marketing communications", basis: "Consent — we only send marketing emails if you have opted in. You can unsubscribe at any time." },
                  { purpose: "To comply with legal obligations", basis: "Legal obligation — responding to lawful requests from regulators, law enforcement, or courts." },
                  { purpose: "To prevent fraud and abuse", basis: "Legitimate interest — protecting our platform and users from malicious activity." },
                ].map((item) => (
                  <li key={item.purpose} className="flex items-start gap-2 text-sm text-[#475569]">
                    <span className="font-semibold min-w-[200px] flex-shrink-0">{item.purpose}:</span>
                    <span>{item.basis}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">4. Data retention</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We retain personal data only for as long as necessary to fulfil the purposes for which it was collected. Account data is retained for the duration of your account plus 6 years (to comply with UK tax and property record-keeping requirements). Usage data is anonymised after 26 months. You can request deletion of your data at any time by contacting privacy@lethub.co.uk, subject to our legal obligations to retain certain records.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">5. Data sharing</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We share your data only in limited circumstances:
              </p>
              <ul className="space-y-2">
                {[
                  "With service providers who help us operate the platform (hosting, email delivery, payment processing) — all under strict data processing agreements.",
                  "With professional advisers (lawyers, accountants, auditors) where necessary.",
                  "With regulatory authorities, law enforcement, or courts when legally required.",
                  "In connection with a business transfer, merger, or acquisition — you will be notified in advance.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#475569] leading-relaxed mt-3">
                We never sell your personal data to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">6. International transfers</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Your data is primarily stored and processed within the United Kingdom and the European Economic Area. Where we use service providers based outside these regions, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) and adequacy decisions where applicable.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">7. Your rights</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Under UK data protection law, you have the following rights:
              </p>
              <ul className="space-y-2">
                {[
                  "Right to access — request a copy of the personal data we hold about you.",
                  "Right to rectification — correct any inaccurate or incomplete data.",
                  "Right to erasure — request deletion of your data (subject to legal retention requirements).",
                  "Right to restrict processing — limit how we use your data in certain circumstances.",
                  "Right to data portability — receive your data in a structured, commonly used format.",
                  "Right to object — object to processing based on legitimate interests or direct marketing.",
                  "Rights relating to automated decision-making — we do not currently use automated decision-making that produces legal effects.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#475569] leading-relaxed mt-3">
                To exercise any of these rights, email privacy@lethub.co.uk. We will respond within one month. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">8. Cookies</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We use essential cookies to operate our platform and optional analytics cookies to understand usage. For full details, see our <a href="/cookies" className="text-[#C28A78] underline">Cookie Policy</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">9. Changes to this policy</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We may update this policy from time to time. Material changes will be communicated via email and an in-platform notification. Continued use of LetHub after changes take effect constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">10. Contact us</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                For any privacy-related questions or to exercise your data rights:<br />
                Email: privacy@lethub.co.uk<br />
                Post: Data Protection Officer, LetHub Ltd, 3rd Floor, WeWork, 1 St Peter's Square, Manchester M2 3AE<br />
                ICO registration: ZA123456
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}