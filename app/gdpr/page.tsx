"use client";

import { COMPANY } from "@/lib/companyDetails";
import { SUB_PROCESSORS } from "@/lib/subProcessors";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function GDPRPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-lock-2-line"></i>
              Last updated: {COMPANY.legalPagesLastUpdated}
            </span>
            <h1 className="text-4xl font-bold text-[#3A3F3A] mb-4">GDPR Compliance</h1>
            <p className="text-lg text-[#687068]">
              LetHub is fully committed to compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. This page outlines the measures we take to protect personal data and uphold data subject rights.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">1. Our role under GDPR</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                LetHub acts as a <strong>data processor</strong> for the personal data our customers upload to the Platform (tenant data, landlord data, property records). Our customers are the <strong>data controllers</strong> for this data. For our own business operations (customer account data, billing records, support communications), LetHub acts as a <strong>data controller</strong>. Both roles are fully documented in our Records of Processing Activities (ROPA), which are maintained and reviewed quarterly.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">2. Lawful basis for processing</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We process personal data under the following lawful bases, as defined in Article 6 of the UK GDPR:
              </p>
              <ul className="space-y-2">
                {[
                  "Contractual necessity — to deliver the Platform and services you have subscribed to.",
                  "Legitimate interest — to improve our Platform, communicate service updates, and prevent fraud.",
                  "Consent — for marketing communications (you may withdraw consent at any time).",
                  "Legal obligation — to comply with tax, regulatory, and law enforcement requirements.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">3. Data subject rights</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We fully support all data subject rights under the UK GDPR. Our processes ensure we can respond to requests within the statutory one-month timeframe:
              </p>
              <ul className="space-y-2">
                {[
                  "Right of access (Article 15) — request a copy of personal data we hold.",
                  "Right to rectification (Article 16) — correct inaccurate data.",
                  "Right to erasure (Article 17) — request deletion of data.",
                  "Right to restrict processing (Article 18) — limit how data is used.",
                  "Right to data portability (Article 20) — receive data in a structured format.",
                  "Right to object (Article 21) — object to processing based on legitimate interests.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#475569] leading-relaxed mt-3">
                To exercise any of these rights, contact our Data Protection Officer at dpo@lethub.uk. We will verify your identity before processing any request.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">4. Data Processing Agreement (DPA)</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Our standard Data Processing Agreement (DPA) incorporates the mandatory clauses required by Article 28 of the UK GDPR. The DPA covers:
              </p>
              <ul className="space-y-2">
                {[
                  "Subject matter, nature, and duration of processing.",
                  "Categories of data subjects and personal data.",
                  "Our obligations as a processor, including confidentiality, security, and sub-processing.",
                  "Your rights and obligations as a controller.",
                  "Technical and organisational measures (TOMs) we implement.",
                  "Procedures for data breach notification (within 72 hours).",
                  "Procedures for data subject access requests.",
                  "Data deletion or return upon contract termination.",
                  "Audit rights and compliance verification.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#475569] leading-relaxed mt-3">
                You can request a copy of our DPA by emailing legal@lethub.uk. The DPA forms part of our Terms of Service and is automatically incorporated when you create an account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">5. International data transfers</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                Our database and file storage are hosted in the United Kingdom. Some sub-processors (listed below) are based outside the UK. Where personal data is transferred outside the UK, we rely on the safeguards in each provider's data processing terms, such as the UK International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses, or on UK adequacy regulations where they apply. Our measures include:
              </p>
              <ul className="space-y-2">
                {[
                  "Transfer risk assessments for transfers outside the UK.",
                  "Encryption of data in transit and at rest.",
                  "Review of each sub-processor's security and data protection terms before use.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">6. Data breach procedures</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                We maintain a comprehensive data breach response plan. In the event of a personal data breach, we will:
              </p>
              <ul className="space-y-2 mt-3">
                {[
                  "Contain and investigate the breach immediately upon detection.",
                  "Notify the ICO within 72 hours if the breach poses a risk to individuals' rights and freedoms.",
                  "Notify affected data controllers without undue delay.",
                  "Notify affected data subjects if the breach poses a high risk.",
                  "Document all breaches, actions taken, and lessons learned in our breach register.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">7. Technical and organisational measures</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk:
              </p>
              <ul className="space-y-2">
                {[
                  "Encryption of data at rest (AES-256) and in transit (TLS 1.3).",
                  "Multi-factor authentication for all staff accounts.",
                  "Role-based access control with principle of least privilege.",
                  "Continuous security monitoring, vulnerability scanning, and penetration testing.",
                  "Regular data protection training for all employees.",
                  "Secure development lifecycle with code review and security testing.",
                  "Business continuity and disaster recovery plan tested annually.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <i className="ri-arrow-right-s-line text-[#C28A78] mt-0.5 flex-shrink-0"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">8. Sub-processors</h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-3">
                We use the following sub-processors to deliver the Platform. The same list, with how we notify changes, is in our <a href="/dpa" className="text-[#C28A78] underline">Data Processing Agreement</a>:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Sub-processor</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Purpose</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#3A3F3A]">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUB_PROCESSORS.map((sp) => (
                      <tr key={sp.name} className="border-b border-[#E2E8F0]">
                        <td className="py-2 px-3 text-[#475569] font-medium">{sp.name}</td>
                        <td className="py-2 px-3 text-[#475569]">{sp.purpose}</td>
                        <td className="py-2 px-3 text-[#475569]">{sp.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#3A3F3A] mb-3">9. Contact our DPO</h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Our Data Protection Officer can be reached at:<br />
                Email: dpo@lethub.uk<br />
                Post: Data Protection, {COMPANY.legalName}, {COMPANY.registeredOffice}<br /><br />
                You also have the right to lodge a complaint with the Information Commissioner's Office (ICO):<br />
                Website: ico.org.uk<br />
                Phone: 0303 123 1113
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}