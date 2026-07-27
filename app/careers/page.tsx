"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const roles = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Manchester (Hybrid)",
    type: "Full-time",
    description: "We're looking for an experienced full-stack engineer to help build the next generation of LetHub's platform. You'll work across our React frontend, Node.js backend, and Supabase infrastructure, shipping features used by hundreds of agencies across the UK.",
    requirements: [
      "5+ years experience with TypeScript and React",
      "Strong understanding of relational databases (PostgreSQL preferred)",
      "Experience building real-time features (WebSockets, Supabase Realtime)",
      "Familiarity with UK property or fintech domain a plus",
    ],
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "London (Hybrid)",
    type: "Full-time",
    description: "We need a product designer who can turn complex property management workflows into intuitive, delightful interfaces. You'll own the end-to-end design process from user research through to high-fidelity prototypes, working closely with engineers and product managers.",
    requirements: [
      "3+ years experience in product design for SaaS products",
      "Strong portfolio demonstrating complex workflow simplification",
      "Proficiency with Figma and design systems",
      "Experience conducting user research and usability testing",
    ],
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Manchester (Hybrid)",
    type: "Full-time",
    description: "As a CSM, you'll be the primary point of contact for our agency partners, ensuring they get maximum value from LetHub. You'll onboard new customers, conduct regular check-ins, identify expansion opportunities, and advocate for customer needs within the product team.",
    requirements: [
      "2+ years in a customer-facing role in SaaS",
      "Excellent communication and presentation skills",
      "Experience with property management or proptech preferred",
      "Proactive problem-solver who thrives on building relationships",
    ],
  },
  {
    title: "Marketing Manager",
    department: "Marketing",
    location: "London or Manchester (Hybrid)",
    type: "Full-time",
    description: "We're looking for a creative, data-driven marketing manager to lead our demand generation efforts. You'll own content strategy, SEO, paid acquisition, events, and partner marketing — building the LetHub brand as the go-to platform for UK property professionals.",
    requirements: [
      "4+ years B2B SaaS marketing experience",
      "Proven track record with content marketing and SEO",
      "Experience with HubSpot, Google Analytics, and paid ad platforms",
      "Knowledge of the UK property industry is a significant advantage",
    ],
  },
  {
    title: "Technical Support Specialist",
    department: "Engineering",
    location: "Manchester (On-site)",
    type: "Full-time",
    description: "Join our support team as the first line of defence for customer issues. You'll troubleshoot technical problems, write help documentation, and work with the engineering team to resolve bugs. This role is ideal for someone who loves solving puzzles and helping people.",
    requirements: [
      "1+ years in technical support or similar role",
      "Basic understanding of web technologies (HTML, APIs, databases)",
      "Excellent written communication skills",
      "Empathetic and patient — you genuinely enjoy helping people",
    ],
  },
];

const perks = [
  { icon: "ri-money-pound-circle-line", title: "Competitive salary", desc: "Benchmarked against London/Manc proptech market rates with annual reviews." },
  { icon: "ri-stock-line", title: "Share options", desc: "Meaningful equity so you share in our success as we grow together." },
  { icon: "ri-calendar-check-line", title: "Flexible working", desc: "Hybrid model with 2-3 office days. We trust you to manage your time." },
  { icon: "ri-mental-health-line", title: "Health & wellbeing", desc: "Private medical insurance, mental health support, and a wellness budget." },
  { icon: "ri-book-open-line", title: "Learning budget", desc: "£1,000 per year for courses, books, and conferences of your choice." },
  { icon: "ri-suitcase-line", title: "Holiday", desc: "25 days annual leave + bank holidays + your birthday off." },
  { icon: "ri-parent-line", title: "Parental leave", desc: "Enhanced maternity, paternity, and adoption leave from day one." },
  { icon: "ri-team-line", title: "Great team", desc: "Regular socials, team off-sites, and a genuinely supportive culture." },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 pb-16 px-6 lg:px-12 bg-gradient-to-b from-[#FAFBFC] to-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C28A78] bg-[#C28A78]/10 px-4 py-1.5 rounded-full mb-6">
            <i className="ri-briefcase-line"></i>
            Join the team
          </span>
          <h1 className="text-5xl font-bold text-[#3A3F3A] mb-4">Help us build the future of property management</h1>
          <p className="text-lg text-[#687068] max-w-2xl mx-auto">
            We're a team of engineers, designers, and property nerds on a mission to modernise UK property management. Come build something that makes a real difference.
          </p>
        </div>

        {/* Perks */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">Why work at LetHub?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {perks.map((perk) => (
              <div key={perk.title} className="bg-white rounded-xl border border-[#E2E8F0] p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-[#C28A78]/10 flex items-center justify-center mx-auto mb-3">
                  <i className={`${perk.icon} text-[#C28A78] text-lg`}></i>
                </div>
                <h3 className="font-bold text-[#3A3F3A] text-sm mb-1">{perk.title}</h3>
                <p className="text-xs text-[#687068] leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Roles */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#3A3F3A] text-center mb-8">Open positions</h2>
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.title} className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-md hover:border-[#CBD5E1] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#3A3F3A]">{role.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full whitespace-nowrap">{role.department}</span>
                      <span className="text-xs text-[#687068]">{role.location}</span>
                      <span className="text-xs text-[#687068]">{role.type}</span>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#143828] px-5 py-2 rounded-lg transition-colors whitespace-nowrap text-center"
                  >
                    Apply now
                  </Link>
                </div>
                <p className="text-sm text-[#687068] leading-relaxed mb-3">{role.description}</p>
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase mb-2">What we're looking for</p>
                  <ul className="space-y-1">
                    {role.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2 text-xs text-[#687068]">
                        <i className="ri-check-line text-[#10B981] mt-0.5 flex-shrink-0"></i>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-[#687068] text-sm mb-4">
            Don't see a role that fits? We're always interested in meeting talented people.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C28A78] hover:underline whitespace-nowrap"
          >
            Send us an open application <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}