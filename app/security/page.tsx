"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "Data encryption",
    icon: "ri-lock-line",
    items: [
      "All data encrypted at rest using AES-256 encryption.",
      "Data in transit protected by TLS 1.3 with perfect forward secrecy.",
      "Encrypted backups stored in geographically separate UK data centres.",
    ],
  },
  {
    title: "Infrastructure security",
    icon: "ri-server-line",
    items: [
      "Platform hosted on AWS (London region, eu-west-2) and Vercel's enterprise infrastructure.",
      "Supabase database hosted in EU (Ireland) with SOC 2 Type II certification.",
      "DDoS protection via AWS Shield and Vercel's edge network.",
      "Web Application Firewall (WAF) blocking OWASP Top 10 attack vectors.",
    ],
  },
  {
    title: "Access control",
    icon: "ri-shield-user-line",
    items: [
      "Multi-factor authentication (MFA) available for all user accounts.",
      "Role-based access control (RBAC) with granular permissions — admin, agent, landlord, tenant, contractor.",
      "Row-Level Security (RLS) in Supabase ensures users only see their own data.",
      "Session timeout after 30 minutes of inactivity (configurable per agency).",
      "Single Sign-On (SSO) via SAML 2.0 available on Enterprise plans.",
    ],
  },
  {
    title: "Application security",
    icon: "ri-code-s-slash-line",
    items: [
      "Secure development lifecycle: code review, static analysis (SAST), dependency scanning.",
      "Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) protections built into the framework.",
      "Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and other security headers enforced.",
      "Responsible disclosure at security@lethub.co.uk.",
    ],
  },
  {
    title: "Compliance",
    icon: "ri-award-line",
    items: [
      "UK GDPR compliant — see our GDPR page for full details.",
      "PCI DSS compliance via Stripe — we never handle raw card data.",
      "Data Processing Agreement (DPA) available for all customers.",
    ],
  },
  {
    title: "Business continuity",
    icon: "ri-refresh-line",
    items: [
      "Real-time database replication with point-in-time recovery (PITR).",
      "Disaster recovery plan with documented runbooks.",
      "24/7 on-call engineering team for critical incidents.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-20 px-6 lg:px-12 bg-[#FAFBFC]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
              <i className="ri-shield-check-line"></i>
              Trust &amp; Security
            </span>
            <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">Enterprise-grade security, built in</h1>
            <p className="text-lg text-[#687068] max-w-2xl mx-auto">
              Security is not an afterthought — it is foundational to everything we build. Here is how we protect your data, your clients' data, and your tenants' data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#C28A78]/10 flex items-center justify-center">
                    <i className={`${section.icon} text-[#C28A78] text-lg`}></i>
                  </div>
                  <h2 className="text-lg font-bold text-[#3A3F3A]">{section.title}</h2>
                </div>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#475569]">
                      <i className="ri-check-line text-[#10B981] mt-0.5 flex-shrink-0"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center bg-white rounded-2xl border border-[#E2E8F0] p-10">
            <div className="w-14 h-14 rounded-full bg-[#C28A78]/10 flex items-center justify-center mx-auto mb-4">
              <i className="ri-mail-check-line text-[#C28A78] text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-[#3A3F3A] mb-2">Report a security issue</h2>
            <p className="text-[#687068] text-sm mb-6 max-w-md mx-auto">
              If you believe you have found a security vulnerability in LetHub, please email us immediately. We take all reports seriously and aim to respond within 24 hours.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a href="mailto:security@lethub.co.uk" className="text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#143828] px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                security@lethub.co.uk
              </a>
              <Link href="/gdpr" className="text-sm font-semibold text-[#3A3F3A] border border-[#E2E8F0] px-6 py-3 rounded-xl hover:border-[#C28A78] transition-colors whitespace-nowrap">
                GDPR compliance
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}