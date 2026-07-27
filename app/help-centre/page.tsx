"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";

interface VideoSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  videos: {
    id: string;
    title: string;
    description: string;
    duration: string;
    embedId: string;
    level: string;
  }[];
}

const videoSections: VideoSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "ri-rocket-2-line",
    description: "Everything you need to set up your LetHub account and start managing properties.",
    color: "bg-[#C28A78]",
    videos: [
      { id: "gs1", title: "Welcome to LetHub — Platform Overview", description: "A tour of the dashboard, key features, and how to navigate the platform.", duration: "4:32", embedId: "dQw4w9WgXcQ", level: "Beginner" },
      { id: "gs2", title: "Creating Your Agency Profile", description: "How to set up your agency details, logo, and branding settings.", duration: "3:15", embedId: "dQw4w9WgXcQ", level: "Beginner" },
      { id: "gs3", title: "Importing Your Portfolio", description: "Bulk import properties via CSV, mapping fields, and validating data.", duration: "6:48", embedId: "dQw4w9WgXcQ", level: "Beginner" },
      { id: "gs4", title: "Adding Properties Manually", description: "Step-by-step guide to adding individual properties with full details.", duration: "4:10", embedId: "dQw4w9WgXcQ", level: "Beginner" },
      { id: "gs5", title: "Inviting Your Team", description: "How to add team members, set permissions, and manage access.", duration: "3:55", embedId: "dQw4w9WgXcQ", level: "Beginner" },
    ],
  },
  {
    id: "compliance",
    title: "Compliance",
    icon: "ri-shield-check-line",
    description: "Learn how LetHub automates compliance tracking so you never miss a deadline.",
    color: "bg-[#EF4444]",
    videos: [
      { id: "cp1", title: "Compliance Dashboard Overview", description: "Understanding the compliance hub, certificate tracking, and expiry alerts.", duration: "5:20", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "cp2", title: "Managing Gas Safety Certificates", description: "How to upload CP12 certificates, set reminders, and track renewals.", duration: "4:45", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "cp3", title: "EPC Compliance Tracking", description: "Energy Performance Certificate management and minimum rating requirements.", duration: "3:30", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "cp4", title: "Renters' Rights Bill 2025 Readiness", description: "What the new legislation means and how LetHub helps you comply.", duration: "7:15", embedId: "dQw4w9WgXcQ", level: "Advanced" },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    icon: "ri-tools-line",
    description: "From logging issues to contractor quotes — master the maintenance workflow.",
    color: "bg-[#F59E0B]",
    videos: [
      { id: "mt1", title: "Logging Maintenance Issues", description: "How to create, categorise, and prioritise maintenance tickets.", duration: "4:10", embedId: "dQw4w9WgXcQ", level: "Beginner" },
      { id: "mt2", title: "AI Maintenance Triage", description: "How the AI triage system auto-categorises and routes maintenance jobs.", duration: "5:25", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "mt3", title: "Quote Approval Workflow", description: "Requesting quotes, contractor submissions, and owner approvals.", duration: "6:00", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "mt4", title: "Managing Contractors", description: "Adding contractors, tracking performance, and managing job assignments.", duration: "5:40", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
    ],
  },
  {
    id: "portals",
    title: "Portals",
    icon: "ri-macbook-line",
    description: "Set up and manage owner and tenant portals for seamless communication.",
    color: "bg-[#3B82F6]",
    videos: [
      { id: "pt1", title: "Setting Up Owner Portals", description: "How to create landlord accounts, set permissions, and customise dashboards.", duration: "5:50", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "pt2", title: "Setting Up Tenant Portals", description: "Give tenants access to rent payments, documents, and maintenance requests.", duration: "4:35", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "pt3", title: "Portal Customisation", description: "White-label your portals with agency branding and custom welcome messages.", duration: "3:20", embedId: "dQw4w9WgXcQ", level: "Advanced" },
      { id: "pt4", title: "Owner Monthly Reports", description: "How to generate, review, and send monthly reports to property owners.", duration: "5:10", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    icon: "ri-folder-line",
    description: "Manage tenancy agreements, certificates, and all property documents in one place.",
    color: "bg-[#8B5CF6]",
    videos: [
      { id: "dc1", title: "Document Hub Overview", description: "How to upload, organise, and search all property documents.", duration: "3:45", embedId: "dQw4w9WgXcQ", level: "Beginner" },
      { id: "dc2", title: "E-Signatures and Tenancy Agreements", description: "Send documents for e-signature and track signing status.", duration: "4:30", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "dc3", title: "Document Expiry Tracking", description: "Set expiry dates on certificates and get automatic renewal reminders.", duration: "3:15", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
    ],
  },
  {
    id: "inspections",
    title: "Inspections",
    icon: "ri-clipboard-line",
    description: "Schedule, conduct, and document property inspections with photo evidence.",
    color: "bg-[#14B8A6]",
    videos: [
      { id: "in1", title: "Scheduling Inspections", description: "How to set up routine, move-in, and move-out inspections.", duration: "4:20", embedId: "dQw4w9WgXcQ", level: "Beginner" },
      { id: "in2", title: "Conducting Digital Inspections", description: "Room-by-room digital inspection with photo capture and condition ratings.", duration: "6:10", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
      { id: "in3", title: "Inspection Reports and Follow-ups", description: "Generating reports, flagging issues, and scheduling remediation.", duration: "4:55", embedId: "dQw4w9WgXcQ", level: "Intermediate" },
    ],
  },
];

export default function HelpCentrePage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const section = videoSections.find((s) => s.id === activeSection) || videoSections[0];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Video Training Hub</h1>
            <p className="text-sm text-[#687068] mt-1">Master LetHub with step-by-step video guides</p>
          </div>
          <Link
            href="/help"
            className="text-sm text-[#C28A78] font-medium hover:underline flex items-center gap-1"
          >
            <i className="ri-question-line text-sm"></i>
            Help Articles
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {videoSections.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setActiveVideo(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === s.id
                  ? `${s.color} text-white`
                  : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
              }`}
            >
              <i className={`${s.icon} text-sm`}></i>
              {s.title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className={`${section.color} px-6 py-5 text-white`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className={`${section.icon} text-lg`}></i>
              </div>
              <div>
                <h2 className="font-semibold text-lg">{section.title}</h2>
                <p className="text-sm text-white/80">{section.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeVideo ? (
              (() => {
                const video = section.videos.find((v) => v.id === activeVideo);
                if (!video) return null;
                return (
                  <div>
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="flex items-center gap-2 text-sm text-[#687068] hover:text-[#3A3F3A] mb-4 transition-colors"
                    >
                      <i className="ri-arrow-left-line text-sm"></i>
                      Back to {section.title}
                    </button>
                    <div className="aspect-video bg-[#0F172A] rounded-xl overflow-hidden mb-4">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.embedId}?rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[#3A3F3A]">{video.title}</h3>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068] whitespace-nowrap">
                            {video.level}
                          </span>
                        </div>
                        <p className="text-sm text-[#687068]">{video.description}</p>
                      </div>
                      <span className="text-sm text-[#94A3B8] flex items-center gap-1 whitespace-nowrap">
                        <i className="ri-time-line text-xs"></i>
                        {video.duration}
                      </span>
                    </div>

                    <div className="mt-8">
                      <h4 className="text-sm font-semibold text-[#3A3F3A] mb-3">More in {section.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.videos
                          .filter((v) => v.id !== activeVideo)
                          .map((v) => (
                            <button
                              key={v.id}
                              onClick={() => setActiveVideo(v.id)}
                              className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-[#FBF9F4] hover:bg-white hover:shadow-sm transition-all text-left"
                            >
                              <div className={`w-8 h-8 ${section.color} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <i className="ri-play-fill text-white text-xs"></i>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#3A3F3A] truncate">{v.title}</p>
                                <p className="text-xs text-[#687068] mt-0.5">{v.duration}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo(video.id)}
                    className="flex items-start gap-4 p-4 rounded-xl border border-[#E2E8F0] bg-[#FBF9F4] hover:bg-white hover:shadow-md hover:border-[#CBD5E1] transition-all text-left group"
                  >
                    <div className="relative w-32 h-20 bg-[#0F172A] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                        <i className="ri-play-fill text-[#C28A78] text-lg ml-0.5"></i>
                      </div>
                      <span className="absolute bottom-2 right-2 text-[10px] font-medium text-white bg-black/60 px-1.5 py-0.5 rounded z-10">
                        {video.duration}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#687068] whitespace-nowrap">
                          {video.level}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#3A3F3A] group-hover:text-[#C28A78] transition-colors line-clamp-2">
                        {video.title}
                      </p>
                      <p className="text-xs text-[#687068] mt-1 line-clamp-2">{video.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center bg-white rounded-xl border border-[#E2E8F0] p-8">
          <div className="w-12 h-12 rounded-full bg-[#C28A78]/10 flex items-center justify-center mx-auto mb-3">
            <i className="ri-customer-service-2-line text-[#C28A78] text-lg"></i>
          </div>
          <h3 className="font-semibold text-[#3A3F3A] mb-1">Need more help?</h3>
          <p className="text-sm text-[#687068] mb-4 max-w-md mx-auto">
            Can&apos;t find what you need? Our support team is here to help with anything LetHub.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/help"
              className="text-sm font-medium text-[#C28A78] border border-[#C28A78]/30 px-4 py-2 rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap"
            >
              Help Articles
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-white bg-[#C28A78] px-4 py-2 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}