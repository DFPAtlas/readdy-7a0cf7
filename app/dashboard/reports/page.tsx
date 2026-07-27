"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface OwnerReport {
  id: string;
  ownerName: string;
  ownerEmail: string;
  propertyName: string;
  propertyId: string;
  month: number;
  year: number;
  title: string;
  status: string;
  generatedAt: string | null;
  sentAt: string | null;
  reportData: any;
}

interface ComplianceReport {
  id: string;
  propertyName: string;
  reportType: string;
  expiryDate: string;
  status: string;
  issuedDate: string;
  engineer: string;
  certNumber: string;
}

interface InspectionReport {
  id: string;
  propertyName: string;
  type: string;
  date: string;
  inspector: string;
  rating: string;
  status: string;
  notes: string;
}

const DEMO_OWNER_REPORTS: OwnerReport[] = [
  { id: "omr1", ownerName: "James Richardson", ownerEmail: "james.richardson@email.com", propertyName: "Rose Court Flat 2A", propertyId: "prop-001", month: 6, year: 2026, title: "June 2026 — Rose Court Flat 2A", status: "sent", generatedAt: "01 Jul 2026", sentAt: "01 Jul 2026", reportData: { rentReceived: 1850, rentOutstanding: 0, maintenanceSpend: 0, openMaintenance: 1, completedRepairs: 1, complianceStatus: "All valid", inspectionsCompleted: 1, healthScore: 78, keyMessages: "No issues this month. Rent paid on time.", documentsAdded: 2 } },
  { id: "omr2", ownerName: "James Richardson", ownerEmail: "james.richardson@email.com", propertyName: "Rose Court Flat 2A", propertyId: "prop-001", month: 5, year: 2026, title: "May 2026 — Rose Court Flat 2A", status: "sent", generatedAt: "01 Jun 2026", sentAt: "01 Jun 2026", reportData: { rentReceived: 1850, rentOutstanding: 0, maintenanceSpend: 450, openMaintenance: 0, completedRepairs: 2, complianceStatus: "All valid", inspectionsCompleted: 0, healthScore: 78, keyMessages: "Two minor repairs completed: bathroom seal replacement and kitchen tap washer.", documentsAdded: 1 } },
  { id: "omr3", ownerName: "James Richardson", ownerEmail: "james.richardson@email.com", propertyName: "Riverside Court", propertyId: "prop-002", month: 6, year: 2026, title: "June 2026 — Riverside Court", status: "ready", generatedAt: "01 Jul 2026", sentAt: null, reportData: { rentReceived: 1950, rentOutstanding: 0, maintenanceSpend: 120, openMaintenance: 1, completedRepairs: 0, complianceStatus: "EPC expiring Aug 2026", inspectionsCompleted: 0, healthScore: 82, keyMessages: "Rent collected. EPC renewal due August — recommend scheduling now.", documentsAdded: 1 } },
  { id: "omr4", ownerName: "James Richardson", ownerEmail: "james.richardson@email.com", propertyName: "Riverside Court", propertyId: "prop-002", month: 5, year: 2026, title: "May 2026 — Riverside Court", status: "sent", generatedAt: "01 Jun 2026", sentAt: "02 Jun 2026", reportData: { rentReceived: 1950, rentOutstanding: 0, maintenanceSpend: 0, openMaintenance: 0, completedRepairs: 0, complianceStatus: "All valid", inspectionsCompleted: 0, healthScore: 82, keyMessages: "Quiet month. Rent paid on time.", documentsAdded: 0 } },
  { id: "omr6", ownerName: "Michael Brown", ownerEmail: "michael.brown@email.com", propertyName: "Maple Gardens House", propertyId: "prop-003", month: 6, year: 2026, title: "June 2026 — Maple Gardens House", status: "draft", generatedAt: null, sentAt: null, reportData: null },
  { id: "omr7", ownerName: "Margaret Hughes", ownerEmail: "margaret.hughes@email.com", propertyName: "8 The Crescent", propertyId: "prop-005", month: 6, year: 2026, title: "June 2026 — 8 The Crescent", status: "ready", generatedAt: "01 Jul 2026", sentAt: null, reportData: { rentReceived: 1450, rentOutstanding: 0, maintenanceSpend: 320, openMaintenance: 2, completedRepairs: 1, complianceStatus: "Gas Safety due Jul 2026", inspectionsCompleted: 1, healthScore: 55, keyMessages: "Kitchen cupboard repair completed. Two outstanding. Gas Safety renewal due this month.", documentsAdded: 3 } },
];

const DEMO_COMPLIANCE_REPORTS: ComplianceReport[] = [
  { id: "cr1", propertyName: "Rose Court Flat 2A", reportType: "Gas Safety Certificate", expiryDate: "13 Mar 2027", status: "Valid", issuedDate: "13 Mar 2026", engineer: "SafeGas Solutions", certNumber: "GSC-2026-0342" },
  { id: "cr2", propertyName: "Rose Court Flat 2A", reportType: "EPC Certificate", expiryDate: "15 Aug 2028", status: "Valid", issuedDate: "15 Aug 2023", engineer: "Green EPC Assessors", certNumber: "EPC-2023-8912" },
  { id: "cr3", propertyName: "Rose Court Flat 2A", reportType: "EICR", expiryDate: "22 Nov 2028", status: "Valid", issuedDate: "22 Nov 2023", engineer: "NICEIC Spark Ltd", certNumber: "EICR-2023-4501" },
  { id: "cr4", propertyName: "Riverside Court", reportType: "Gas Safety Certificate", expiryDate: "05 Jan 2027", status: "Valid", issuedDate: "05 Jan 2026", engineer: "GreenPlumb Ltd", certNumber: "GSC-2026-0128" },
  { id: "cr5", propertyName: "Riverside Court", reportType: "EPC Certificate", expiryDate: "20 Aug 2026", status: "Expiring Soon", issuedDate: "20 Aug 2016", engineer: "Alpha EPC Services", certNumber: "EPC-2016-2204" },
  { id: "cr6", propertyName: "Riverside Court", reportType: "EICR", expiryDate: "03 Sep 2026", status: "Expiring Soon", issuedDate: "03 Sep 2021", engineer: "Volt Check Ltd", certNumber: "EICR-2021-6783" },
  { id: "cr7", propertyName: "Maple Gardens House", reportType: "Gas Safety Certificate", expiryDate: "14 Feb 2027", status: "Valid", issuedDate: "14 Feb 2026", engineer: "SafeGas Solutions", certNumber: "GSC-2026-0194" },
  { id: "cr8", propertyName: "8 The Crescent", reportType: "Gas Safety Certificate", expiryDate: "30 Jul 2026", status: "Expiring Soon", issuedDate: "30 Jul 2025", engineer: "GreenPlumb Ltd", certNumber: "GSC-2025-0782" },
];

const DEMO_INSPECTION_REPORTS: InspectionReport[] = [
  { id: "ir1", propertyName: "Rose Court Flat 2A", type: "Routine Inspection", date: "10 Feb 2026", inspector: "Sarah Collins", rating: "Good", status: "Completed", notes: "Property well maintained. Bathroom seal noted for replacement." },
  { id: "ir2", propertyName: "Rose Court Flat 2A", type: "Check-Out Inspection", date: "15 Sep 2025", inspector: "Sarah Collins", rating: "Good", status: "Completed", notes: "Minor scuffs on hallway wall." },
  { id: "ir3", propertyName: "Riverside Court", type: "Mid-Term Inspection", date: "15 Jan 2026", inspector: "Sarah Collins", rating: "Excellent", status: "Completed", notes: "Immaculate condition." },
  { id: "ir4", propertyName: "Riverside Court", type: "Routine Inspection", date: "12 Jun 2025", inspector: "Sarah Collins", rating: "Good", status: "Completed", notes: "Garden needs maintenance." },
  { id: "ir5", propertyName: "Maple Gardens House", type: "Routine Inspection", date: "08 Apr 2026", inspector: "Sarah Collins", rating: "Good", status: "Completed", notes: "Kitchen extractor fan noisy." },
  { id: "ir6", propertyName: "8 The Crescent", type: "Move-In Inspection", date: "02 Jan 2026", inspector: "Sarah Collins", rating: "Excellent", status: "Completed", notes: "Full inventory completed." },
  { id: "ir7", propertyName: "8 The Crescent", type: "Routine Inspection", date: "18 Jun 2026", inspector: "Sarah Collins", rating: "Fair", status: "Completed", notes: "Several minor issues noted." },
];

const OBLIGATION_LABELS: Record<string, string> = {
  GAS_SAFETY: "Gas Safety Certificate",
  EICR: "EICR",
  EPC: "EPC Certificate",
  SMOKE_ALARM: "Smoke Alarm Check",
  CO_ALARM: "CO Alarm Check",
  RIGHT_TO_RENT: "Right to Rent Check",
};

const statusBadge: Record<string, string> = {
  draft: "bg-[#94A3B8]/10 text-[#94A3B8]",
  ready: "bg-[#F59E0B]/10 text-[#F59E0B]",
  sent: "bg-[#10B981]/10 text-[#10B981]",
  archived: "bg-[#6366F1]/10 text-[#6366F1]",
};

const complianceStatusBadge: Record<string, string> = {
  "Valid": "bg-[#10B981]/10 text-[#10B981]",
  "Expiring Soon": "bg-[#F59E0B]/10 text-[#F59E0B]",
  "Expired": "bg-[#EF4444]/10 text-[#EF4444]",
  "compliant": "bg-[#10B981]/10 text-[#10B981]",
  "expiring_soon": "bg-[#F59E0B]/10 text-[#F59E0B]",
  "overdue": "bg-[#EF4444]/10 text-[#EF4444]",
};

const inspectionRatingBadge: Record<string, string> = {
  "Excellent": "bg-[#10B981]/10 text-[#10B981]",
  "Good": "bg-[#3B82F6]/10 text-[#3B82F6]",
  "Fair": "bg-[#F59E0B]/10 text-[#F59E0B]",
  "Poor": "bg-[#EF4444]/10 text-[#EF4444]",
};

function getComplianceStatus(nextDue: string | null): string {
  if (!nextDue) return "compliant";
  const due = new Date(nextDue);
  const now = new Date();
  if (due < now) return "overdue";
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 60) return "expiring_soon";
  return "compliant";
}

function getStatusLabel(s: string): string {
  if (s === "compliant") return "Valid";
  if (s === "expiring_soon") return "Expiring Soon";
  if (s === "overdue") return "Expired";
  return s;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"owner" | "compliance" | "inspection">("owner");
  const [ownerReports, setOwnerReports] = useState<OwnerReport[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [inspectionReports, setInspectionReports] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<OwnerReport | null>(null);
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const demoMode = isDemoAccount();
  const [generateForm, setGenerateForm] = useState({ owner: "", property: "", month: "6", year: "2026" });

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      if (demoMode) {
        setOwnerReports(DEMO_OWNER_REPORTS);
        setComplianceReports(DEMO_COMPLIANCE_REPORTS);
        setInspectionReports(DEMO_INSPECTION_REPORTS);
        setLoading(false);
        return;
      }

      try {
        const [ownerRes, compRes, inspRes, propRes] = await Promise.all([
          supabase.from("owner_monthly_reports").select("*").order("created_at", { ascending: false }),
          supabase.from("property_compliance_items").select("*").order("next_due", { ascending: true }),
          supabase.from("inspections").select("*").order("scheduled_date", { ascending: false }),
          supabase.from("properties").select("id, line1, city, postcode"),
        ]);

        const propMap: Record<string, any> = {};
        (propRes.data || []).forEach((p: any) => { propMap[p.id] = p; });

        const owners: OwnerReport[] = (ownerRes.data || []).map((r: any) => {
          const prop = propMap[r.property_id] || {};
          return {
            id: r.id,
            ownerName: "—",
            ownerEmail: "—",
            propertyName: prop.line1 || "Unknown",
            propertyId: r.property_id || "",
            month: r.report_month || 1,
            year: r.report_year || 2026,
            title: r.title || "",
            status: r.status || "draft",
            generatedAt: r.generated_at ? new Date(r.generated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null,
            sentAt: r.sent_at ? new Date(r.sent_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null,
            reportData: r.report_data || null,
          };
        });

        const comps: ComplianceReport[] = (compRes.data || []).map((c: any) => {
          const prop = propMap[c.property_id] || {};
          const status = getComplianceStatus(c.next_due);
          return {
            id: c.id,
            propertyName: prop.line1 || "Unknown",
            reportType: OBLIGATION_LABELS[c.obligation_code] || c.obligation_code || "Compliance Item",
            expiryDate: c.next_due ? new Date(c.next_due).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
            status: getStatusLabel(status),
            issuedDate: c.last_completed ? new Date(c.last_completed).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
            engineer: "—",
            certNumber: c.exemption_ref || c.id?.slice(0, 8) || "—",
          };
        });

        const insps: InspectionReport[] = (inspRes.data || []).map((i: any) => {
          const prop = propMap[i.property_id] || {};
          const ratingText = i.status === "completed" ? (i.inspector_notes?.toLowerCase().includes("excellent") ? "Excellent" : i.inspector_notes?.toLowerCase().includes("fair") ? "Fair" : "Good") : "—";
          return {
            id: i.id,
            propertyName: prop.line1 || "Unknown",
            type: i.inspection_type === "routine" ? "Routine Inspection" : i.inspection_type === "check_in" ? "Move-In Inspection" : i.inspection_type === "check_out" ? "Check-Out Inspection" : i.inspection_type || "Inspection",
            date: i.scheduled_date ? new Date(i.scheduled_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
            inspector: i.inspector_name || "—",
            rating: ratingText,
            status: i.status === "completed" ? "Completed" : i.status === "scheduled" ? "Scheduled" : i.status || "—",
            notes: i.inspector_notes || "—",
          };
        });

        setOwnerReports(owners);
        setComplianceReports(comps);
        setInspectionReports(insps);
      } catch (e: any) {
        setError(e.message || "Failed to load reports");
      }
      setLoading(false);
    }

    loadAll();
  }, [demoMode]);

  const ownerOptions = [...new Set(ownerReports.map(r => r.ownerName))];

  const filteredOwnerReports = ownerReports.filter(r => {
    if (ownerFilter !== "all" && r.ownerName !== ownerFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const getPropertiesForOwner = (ownerName: string) => {
    const reports = ownerReports.filter(r => r.ownerName === ownerName);
    return [...new Map(reports.map(r => [r.propertyId, { id: r.propertyId, name: r.propertyName }])).values()];
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#94A3B8]">Loading reports...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-[#EF4444] text-2xl"></i>
            </div>
            <h2 className="text-lg font-semibold text-[#3A3F3A] mb-2">Failed to load reports</h2>
            <p className="text-sm text-[#687068] mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">Retry</button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Reports</h1>
            <p className="text-sm text-[#687068] mt-1">Owner monthly reports, compliance and inspection summaries</p>
          </div>
          {activeTab === "owner" && (
            <button onClick={() => setShowGenerateModal(true)} className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line text-sm"></i></div>
              Generate Monthly Report
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-xl p-1 w-fit">
          {(["owner", "compliance", "inspection"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}>
              {tab === "owner" && "Owner Reports"}
              {tab === "compliance" && "Compliance Reports"}
              {tab === "inspection" && "Inspection Reports"}
            </button>
          ))}
        </div>

        {activeTab === "owner" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Reports", value: ownerReports.length, color: "text-[#3A3F3A]" },
                { label: "Drafts", value: ownerReports.filter(r => r.status === "draft").length, color: "text-[#94A3B8]" },
                { label: "Ready", value: ownerReports.filter(r => r.status === "ready").length, color: "text-[#F59E0B]" },
                { label: "Sent", value: ownerReports.filter(r => r.status === "sent").length, color: "text-[#10B981]" },
                { label: "Archived", value: ownerReports.filter(r => r.status === "archived").length, color: "text-[#6366F1]" },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4">
                  <p className="text-xs text-[#687068] mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <button onClick={() => { const el = document.getElementById("ownerFilterDropdown"); if (el) el.classList.toggle("hidden"); }} className="flex items-center gap-2 px-3 py-1.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]">
                  <i className="ri-user-3-line text-[#94A3B8] text-sm"></i>
                  {ownerFilter === "all" ? "All Owners" : ownerFilter}
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </button>
                <div id="ownerFilterDropdown" className="hidden absolute top-full left-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                  <button onClick={() => { setOwnerFilter("all"); document.getElementById("ownerFilterDropdown")?.classList.add("hidden"); }} className="w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#FBF9F4] whitespace-nowrap">All Owners</button>
                  {ownerOptions.map(o => (
                    <button key={o} onClick={() => { setOwnerFilter(o); document.getElementById("ownerFilterDropdown")?.classList.add("hidden"); }} className="w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#FBF9F4] whitespace-nowrap">{o}</button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <button onClick={() => { const el = document.getElementById("statusFilterDropdown"); if (el) el.classList.toggle("hidden"); }} className="flex items-center gap-2 px-3 py-1.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]">
                  <i className="ri-flag-line text-[#94A3B8] text-sm"></i>
                  {statusFilter === "all" ? "All Statuses" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </button>
                <div id="statusFilterDropdown" className="hidden absolute top-full left-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-20 min-w-[150px] overflow-hidden">
                  {["all","draft","ready","sent","archived"].map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); document.getElementById("statusFilterDropdown")?.classList.add("hidden"); }} className="w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#FBF9F4] whitespace-nowrap">{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>
              {demoMode && <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2.5 py-1 rounded-full">Demo Mode</span>}
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Owner</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Property</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Month</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Generated</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Sent</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[#687068]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredOwnerReports.map(report => (
                      <tr key={report.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="px-5 py-3.5"><p className="text-sm font-medium text-[#3A3F3A]">{report.ownerName}</p><p className="text-xs text-[#94A3B8]">{report.ownerEmail}</p></td>
                        <td className="px-5 py-3.5"><p className="text-sm text-[#3A3F3A]">{report.propertyName}</p></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#3A3F3A]">{monthNames[report.month - 1]} {report.year}</span></td>
                        <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[report.status]}`}>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#687068]">{report.generatedAt || "—"}</span></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#687068]">{report.sentAt || "—"}</span></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {report.reportData && (
                              <button onClick={() => setShowDetailModal(report)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#D5D9D5] transition-colors" title="View Report">
                                <i className="ri-eye-line text-[#687068] text-sm"></i>
                              </button>
                            )}
                            {report.status === "ready" && (
                              <button onClick={() => { if (demoMode) return; }} className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#D5D9D5] transition-colors ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`} title="Mark as Sent">
                                <i className="ri-send-plane-line text-[#3B82F6] text-sm"></i>
                              </button>
                            )}
                            {report.status === "sent" && (
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#D5D9D5] transition-colors" title="Download PDF">
                                <i className="ri-download-line text-[#687068] text-sm"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOwnerReports.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-file-list-3-line text-[#94A3B8] text-xl"></i>
                  </div>
                  <p className="text-sm text-[#94A3B8]">{ownerReports.length === 0 ? "No owner reports yet — generate your first monthly report" : "No reports match your filters"}</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "compliance" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Property</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Report Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Certificate No.</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Issued</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Expires</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Engineer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {complianceReports.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center"><p className="text-sm text-[#94A3B8]">No compliance records found</p></td></tr>
                  ) : (
                    complianceReports.map(cr => (
                      <tr key={cr.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="px-5 py-3.5"><p className="text-sm font-medium text-[#3A3F3A]">{cr.propertyName}</p></td>
                        <td className="px-5 py-3.5"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-[#C28A78]/10 rounded flex items-center justify-center"><i className="ri-shield-check-line text-[#C28A78] text-xs"></i></div><span className="text-sm text-[#3A3F3A]">{cr.reportType}</span></div></td>
                        <td className="px-5 py-3.5"><span className="text-xs text-[#687068] font-mono">{cr.certNumber}</span></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#687068]">{cr.issuedDate}</span></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#687068]">{cr.expiryDate}</span></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#687068]">{cr.engineer}</span></td>
                        <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2 py-1 rounded-full ${complianceStatusBadge[cr.status] || "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>{cr.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "inspection" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Property</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Inspector</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Rating</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#687068]">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {inspectionReports.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center"><p className="text-sm text-[#94A3B8]">No inspection reports found</p></td></tr>
                  ) : (
                    inspectionReports.map(ir => (
                      <tr key={ir.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="px-5 py-3.5"><p className="text-sm font-medium text-[#3A3F3A]">{ir.propertyName}</p></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#3A3F3A]">{ir.type}</span></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#687068]">{ir.date}</span></td>
                        <td className="px-5 py-3.5"><span className="text-sm text-[#687068]">{ir.inspector}</span></td>
                        <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2 py-1 rounded-full ${inspectionRatingBadge[ir.rating] || "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>{ir.rating}</span></td>
                        <td className="px-5 py-3.5"><span className="text-xs font-medium px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">{ir.status}</span></td>
                        <td className="px-5 py-3.5 max-w-[220px]"><p className="text-xs text-[#687068] truncate">{ir.notes}</p></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowGenerateModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Generate Monthly Report</h2>
                <button onClick={() => setShowGenerateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#687068] mb-1.5">Owner</label>
                  <select value={generateForm.owner} onChange={(e) => setGenerateForm({ ...generateForm, owner: e.target.value, property: "" })} className="w-full appearance-none px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white focus:outline-none focus:border-[#C28A78] pr-8">
                    <option value="">Select owner...</option>
                    {ownerOptions.map(o => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                {generateForm.owner && (
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Property</label>
                    <select value={generateForm.property} onChange={(e) => setGenerateForm({ ...generateForm, property: e.target.value })} className="w-full appearance-none px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white focus:outline-none focus:border-[#C28A78] pr-8">
                      <option value="">Select property...</option>
                      {getPropertiesForOwner(generateForm.owner).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Month</label>
                    <select value={generateForm.month} onChange={(e) => setGenerateForm({ ...generateForm, month: e.target.value })} className="w-full appearance-none px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white focus:outline-none focus:border-[#C28A78] pr-8">
                      {monthNames.map((m, i) => (<option key={m} value={String(i + 1)}>{m}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Year</label>
                    <select value={generateForm.year} onChange={(e) => setGenerateForm({ ...generateForm, year: e.target.value })} className="w-full appearance-none px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white focus:outline-none focus:border-[#C28A78] pr-8">
                      {["2024","2025","2026"].map(y => (<option key={y} value={y}>{y}</option>))}
                    </select>
                  </div>
                </div>
                <div className="bg-[#F0FDF4] rounded-lg p-3 border border-[#BBF7D0]">
                  <p className="text-xs text-[#10B981] flex items-center gap-1.5"><i className="ri-information-line"></i>The report will be built from existing maintenance, rent, compliance and inspection data.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
                <button onClick={() => setShowGenerateModal(false)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">Cancel</button>
                <button onClick={() => { if (demoMode) return; setShowGenerateModal(false); }} className={`flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}>Generate Report</button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && showDetailModal.reportData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
                <div><h3 className="font-semibold text-[#3A3F3A]">{showDetailModal.title}</h3><p className="text-xs text-[#687068]">{showDetailModal.ownerName} · {showDetailModal.propertyName}</p></div>
                <button onClick={() => setShowDetailModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#94A3B8]"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#FBF9F4] rounded-lg p-3 text-center"><p className="text-xs text-[#94A3B8] mb-0.5">Status</p><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[showDetailModal.status]}`}>{showDetailModal.status.charAt(0).toUpperCase() + showDetailModal.status.slice(1)}</span></div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3 text-center"><p className="text-xs text-[#94A3B8] mb-0.5">Generated</p><p className="text-sm font-medium text-[#3A3F3A]">{showDetailModal.generatedAt || "Pending"}</p></div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3 text-center"><p className="text-xs text-[#94A3B8] mb-0.5">Sent</p><p className="text-sm font-medium text-[#3A3F3A]">{showDetailModal.sentAt || "—"}</p></div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Financial Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-[#F0FDF4] rounded-lg p-3 border border-[#BBF7D0]"><p className="text-xs text-[#687068]">Rent Received</p><p className="text-lg font-bold text-[#10B981]">£{showDetailModal.reportData.rentReceived.toLocaleString()}</p></div>
                    <div className="bg-[#FFF7ED] rounded-lg p-3 border border-[#FED7AA]"><p className="text-xs text-[#687068]">Outstanding</p><p className="text-lg font-bold text-[#F59E0B]">£{showDetailModal.reportData.rentOutstanding.toLocaleString()}</p></div>
                    <div className="bg-[#FBF9F4] rounded-lg p-3 border border-[#D5D9D5]"><p className="text-xs text-[#687068]">Maintenance Spend</p><p className="text-lg font-bold text-[#3A3F3A]">£{showDetailModal.reportData.maintenanceSpend.toLocaleString()}</p></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Operations</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#FBF9F4] rounded-lg p-3 text-center"><p className="text-xs text-[#94A3B8]">Open Issues</p><p className="text-lg font-bold text-[#F59E0B]">{showDetailModal.reportData.openMaintenance}</p></div>
                    <div className="bg-[#FBF9F4] rounded-lg p-3 text-center"><p className="text-xs text-[#94A3B8]">Completed</p><p className="text-lg font-bold text-[#10B981]">{showDetailModal.reportData.completedRepairs}</p></div>
                    <div className="bg-[#FBF9F4] rounded-lg p-3 text-center"><p className="text-xs text-[#94A3B8]">Inspections</p><p className="text-lg font-bold text-[#3B82F6]">{showDetailModal.reportData.inspectionsCompleted}</p></div>
                    <div className="bg-[#FBF9F4] rounded-lg p-3 text-center"><p className="text-xs text-[#94A3B8]">Documents</p><p className="text-lg font-bold text-[#8B5CF6]">{showDetailModal.reportData.documentsAdded}</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FBF9F4] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-2">Property Health Score</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 border-4 border-[#F59E0B] flex items-center justify-center"><span className="text-sm font-bold text-[#F59E0B]">{showDetailModal.reportData.healthScore}</span></div>
                      <div><p className="text-sm font-medium text-[#3A3F3A]">{showDetailModal.reportData.healthScore >= 80 ? "Excellent" : showDetailModal.reportData.healthScore >= 60 ? "Good" : "Needs Attention"}</p><p className="text-xs text-[#687068]">out of 100</p></div>
                    </div>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-4"><p className="text-xs text-[#94A3B8] mb-2">Compliance</p><p className="text-sm font-medium text-[#3A3F3A]">{showDetailModal.reportData.complianceStatus}</p></div>
                </div>
                <div><h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Key Messages</h4><div className="bg-[#EFF6FF] rounded-lg p-4 border border-[#BFDBFE]"><p className="text-sm text-[#3A3F3A] leading-relaxed">{showDetailModal.reportData.keyMessages}</p></div></div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4]">
                <button onClick={() => setShowDetailModal(null)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-white transition-colors whitespace-nowrap">Close</button>
                {showDetailModal.status === "sent" && <button className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap flex items-center justify-center gap-2"><i className="ri-download-line text-sm"></i> Download PDF</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}