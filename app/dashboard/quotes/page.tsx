"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { useEntitlements } from "@/lib/useEntitlements";
import { QUOTE_STATUS, getStatusConfig } from "@/lib/contractorSystem";

interface QuoteItem {
  id: string;
  quoteNumber: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  ownerId: string;
  ownerName: string;
  contractorId: string;
  contractorName: string;
  contractorTrade: string;
  contractorAvatar: string;
  maintenanceJobTitle: string;
  maintenanceJobPriority: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  quoteFileUrl: string | null;
  status: "requested" | "submitted" | "owner_review" | "approved" | "rejected" | "expired";
  requestedAt: string;
  submittedAt: string | null;
  ownerReviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
}

const DEMO_QUOTES: QuoteItem[] = [
  {
    id: "q1", quoteNumber: "QTE-2026-001", title: "Boiler replacement at Rose Court",
    description: "Full boiler replacement required. Current unit is 14 years old and parts unavailable.", propertyId: "prop-001", propertyName: "Rose Court Flat 2A", propertyAddress: "12 Rose Avenue, London E1 6AN", ownerId: "own-001", ownerName: "James Richardson",
    contractorId: "ctr-003", contractorName: "SafeGas Solutions", contractorTrade: "Gas Engineer",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20gas%20engineer%20contractor%20headshot%20portrait%2C%20blue%20work%20polo%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-1&orientation=squarish",
    maintenanceJobTitle: "Boiler pressure loss", maintenanceJobPriority: "High", amount: 2340, vatAmount: 468, totalAmount: 2808, quoteFileUrl: null,
    status: "submitted", requestedAt: "12 Jun 2026", submittedAt: "14 Jun 2026", ownerReviewedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q2", quoteNumber: "QTE-2026-002", title: "Bathroom extractor fan replacement",
    description: "Replace noisy bathroom extractor fan. Supply and fit new Manrose MF100T fan.", propertyId: "prop-001", propertyName: "Rose Court Flat 2A", propertyAddress: "12 Rose Avenue, London E1 6AN", ownerId: "own-001", ownerName: "James Richardson",
    contractorId: "ctr-002", contractorName: "SparkPro Electrics", contractorTrade: "Electrician",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20electrician%20contractor%20headshot%20portrait%2C%20grey%20work%20shirt%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-2&orientation=squarish",
    maintenanceJobTitle: "Bathroom extractor fan noisy", maintenanceJobPriority: "Medium", amount: 145, vatAmount: 29, totalAmount: 174, quoteFileUrl: null,
    status: "approved", requestedAt: "03 Jun 2026", submittedAt: "05 Jun 2026", ownerReviewedAt: "06 Jun 2026", approvedAt: "06 Jun 2026", rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q3", quoteNumber: "QTE-2026-003", title: "Living room radiator repair",
    description: "TRV replacement on living room radiator. Radiator not heating.", propertyId: "prop-001", propertyName: "Rose Court Flat 2A", propertyAddress: "12 Rose Avenue, London E1 6AN", ownerId: "own-001", ownerName: "James Richardson",
    contractorId: "ctr-001", contractorName: "GreenPlumb Ltd", contractorTrade: "Plumber",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20plumber%20contractor%20headshot%20portrait%2C%20work%20uniform%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-3&orientation=squarish",
    maintenanceJobTitle: "Living room radiator not heating", maintenanceJobPriority: "High", amount: 185, vatAmount: 37, totalAmount: 222, quoteFileUrl: null,
    status: "approved", requestedAt: "20 May 2026", submittedAt: "21 May 2026", ownerReviewedAt: "22 May 2026", approvedAt: "22 May 2026", rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q4", quoteNumber: "QTE-2026-004", title: "Roof gutter cleaning and repair",
    description: "Clear all guttering at Riverside Court. Replace broken brackets.", propertyId: "prop-002", propertyName: "Riverside Court", propertyAddress: "Unit 3, Riverside Court, Bristol BS1 4ST", ownerId: "own-001", ownerName: "James Richardson",
    contractorId: "ctr-005", contractorName: "Top Roof Repairs Ltd", contractorTrade: "Roofer",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20roofer%20contractor%20headshot%20portrait%2C%20orange%20hi-vis%20vest%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-4&orientation=squarish",
    maintenanceJobTitle: "Roof gutter cleaning", maintenanceJobPriority: "Low", amount: 0, vatAmount: 0, totalAmount: 0, quoteFileUrl: null,
    status: "requested", requestedAt: "18 Jun 2026", submittedAt: null, ownerReviewedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q5", quoteNumber: "QTE-2026-005", title: "Kitchen tap replacement",
    description: "Cold water tap dripping. Replace washer or full tap unit.", propertyId: "prop-001", propertyName: "Rose Court Flat 2A", propertyAddress: "12 Rose Avenue, London E1 6AN", ownerId: "own-001", ownerName: "James Richardson",
    contractorId: "ctr-001", contractorName: "GreenPlumb Ltd", contractorTrade: "Plumber",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20plumber%20contractor%20headshot%20portrait%2C%20work%20uniform%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-5&orientation=squarish",
    maintenanceJobTitle: "Kitchen tap washer replacement", maintenanceJobPriority: "Low", amount: 95, vatAmount: 19, totalAmount: 114, quoteFileUrl: null,
    status: "owner_review", requestedAt: "15 Jun 2026", submittedAt: "17 Jun 2026", ownerReviewedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q6", quoteNumber: "QTE-2026-006", title: "Garden fence panel replacement",
    description: "Two fence panels blown down in storm. Replace with new pressure-treated panels.", propertyId: "prop-003", propertyName: "Maple Gardens House", propertyAddress: "34 Maple Gardens, Cardiff CF10 3BZ", ownerId: "own-002", ownerName: "Michael Brown",
    contractorId: "ctr-007", contractorName: "BuildRight Construction", contractorTrade: "General Builder",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20builder%20contractor%20headshot%20portrait%2C%20orange%20hi-vis%20vest%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-6&orientation=squarish",
    maintenanceJobTitle: "Garden fence repair", maintenanceJobPriority: "Medium", amount: 480, vatAmount: 96, totalAmount: 576, quoteFileUrl: null,
    status: "rejected", requestedAt: "01 Jun 2026", submittedAt: "04 Jun 2026", ownerReviewedAt: "07 Jun 2026", approvedAt: null, rejectedAt: "07 Jun 2026", rejectionReason: "Too expensive",
  },
  {
    id: "q7", quoteNumber: "QTE-2026-007", title: "End-of-tenancy deep clean",
    description: "Full end-of-tenancy professional clean for 2-bed flat.", propertyId: "prop-004", propertyName: "Flat 4B Oak Street", propertyAddress: "Flat 4B Oak Street, Manchester M1 2AB", ownerId: "own-003", ownerName: "David Thompson",
    contractorId: "ctr-009", contractorName: "Crystal Clean Services", contractorTrade: "Cleaner",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20female%20cleaner%20contractor%20headshot%20portrait%2C%20neat%20uniform%2C%20friendly%20warm%20smile%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-7&orientation=squarish",
    maintenanceJobTitle: "End of tenancy cleaning required", maintenanceJobPriority: "Medium", amount: 285, vatAmount: 57, totalAmount: 342, quoteFileUrl: null,
    status: "owner_review", requestedAt: "13 Jun 2026", submittedAt: "15 Jun 2026", ownerReviewedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q8", quoteNumber: "QTE-2026-008", title: "EPC assessment for 45 Baker Street",
    description: "Full EPC assessment required. Certificate expires end of month.", propertyId: "prop-005", propertyName: "45 Baker Street", propertyAddress: "45 Baker Street, Manchester M1 2CD", ownerId: "own-004", ownerName: "Susan Wright",
    contractorId: "ctr-011", contractorName: "EPC Assess UK", contractorTrade: "EPC Assessor",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20EPC%20assessor%20contractor%20headshot%20portrait%2C%20smart%20casual%20attire%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-8&orientation=squarish",
    maintenanceJobTitle: "EPC certificate expiring", maintenanceJobPriority: "High", amount: 0, vatAmount: 0, totalAmount: 0, quoteFileUrl: null,
    status: "requested", requestedAt: "19 Jun 2026", submittedAt: null, ownerReviewedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q9", quoteNumber: "QTE-2026-009", title: "Front door lock mechanism replacement",
    description: "Lock mechanism worn and sticking. Replace with British Standard 5-lever mortice lock.", propertyId: "prop-001", propertyName: "Rose Court Flat 2A", propertyAddress: "12 Rose Avenue, London E1 6AN", ownerId: "own-001", ownerName: "James Richardson",
    contractorId: "ctr-004", contractorName: "SecureFix Locksmiths", contractorTrade: "Locksmith",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20male%20locksmith%20contractor%20headshot%20portrait%2C%20dark%20uniform%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-9&orientation=squarish",
    maintenanceJobTitle: "Front door lock sticking", maintenanceJobPriority: "Medium", amount: 65, vatAmount: 13, totalAmount: 78, quoteFileUrl: null,
    status: "approved", requestedAt: "10 May 2026", submittedAt: "11 May 2026", ownerReviewedAt: "12 May 2026", approvedAt: "12 May 2026", rejectedAt: null, rejectionReason: null,
  },
  {
    id: "q10", quoteNumber: "QTE-2026-010", title: "Inventory check-in report",
    description: "Full digital inventory check-in for new tenancy at 8 The Crescent.", propertyId: "prop-006", propertyName: "8 The Crescent", propertyAddress: "8 The Crescent, Birmingham B2 3CD", ownerId: "own-005", ownerName: "Margaret Hughes",
    contractorId: "ctr-010", contractorName: "Inventory Pro UK", contractorTrade: "Inventory Clerk",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20female%20inventory%20clerk%20contractor%20headshot%20portrait%2C%20smart%20casual%20attire%2C%20friendly%20professional%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=q-ctr-10&orientation=squarish",
    maintenanceJobTitle: "New tenancy inventory required", maintenanceJobPriority: "Medium", amount: 165, vatAmount: 33, totalAmount: 198, quoteFileUrl: null,
    status: "expired", requestedAt: "20 May 2026", submittedAt: "22 May 2026", ownerReviewedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null,
  },
];

const statusTabConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  requested: { label: "Requested", icon: "ri-mail-send-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  submitted: { label: "Submitted", icon: "ri-file-list-3-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  owner_review: { label: "Awaiting Owner", icon: "ri-user-star-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  approved: { label: "Approved", icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  rejected: { label: "Rejected", icon: "ri-close-circle-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  expired: { label: "Expired", icon: "ri-time-line", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" },
};

const priorityConfig: Record<string, string> = {
  High: "bg-[#EF4444]/10 text-[#EF4444]",
  Medium: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Low: "bg-[#10B981]/10 text-[#10B981]",
};

function mapQuoteToItem(q: any, propertyMap: Record<string, any>, contractorMap: Record<string, any>, jobMap: Record<string, any>): QuoteItem {
  const prop = propertyMap[q.property_id] || {};
  const ctr = contractorMap[q.contractor_id] || {};
  const job = jobMap[q.maintenance_job_id] || {};
  const status = (q.status || "requested") as QuoteItem["status"];
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  return {
    id: q.id,
    quoteNumber: q.quote_number || `QTE-${q.id?.slice(0, 4)}`,
    title: q.title || job.title || "Untitled Quote",
    description: q.description || job.description || q.notes || "",
    propertyId: q.property_id || "",
    propertyName: prop.line1 || "Unknown Property",
    propertyAddress: [prop.line1, prop.city, prop.postcode].filter(Boolean).join(", ") || "—",
    ownerId: q.owner_id || "",
    ownerName: "—",
    contractorId: q.contractor_id || "",
    contractorName: ctr.business_name || ctr.contact_name || "—",
    contractorTrade: ctr.trade || "—",
    contractorAvatar: "https://readdy.ai/api/search-image?query=Professional%20contractor%20headshot%20portrait%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&orientation=squarish&seq=1",
    maintenanceJobTitle: job.title || "—",
    maintenanceJobPriority: "Medium",
    amount: Number(q.labour_cost) || Number(q.amount) || 0,
    vatAmount: Number(q.vat_amount) || 0,
    totalAmount: Number(q.total_amount) || 0,
    quoteFileUrl: q.quote_file_url || null,
    status,
    requestedAt: q.requested_at ? formatDate(q.requested_at) || "—" : q.created_at ? formatDate(q.created_at) || "—" : "—",
    submittedAt: q.submitted_at ? formatDate(q.submitted_at) : q.sent_at ? formatDate(q.sent_at) : null,
    ownerReviewedAt: q.owner_reviewed_at ? formatDate(q.owner_reviewed_at) : null,
    approvedAt: q.approved_at ? formatDate(q.approved_at) : null,
    rejectedAt: q.rejected_at ? formatDate(q.rejected_at) : null,
    rejectionReason: q.rejection_reason || null,
  };
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [propertyDropdown, setPropertyDropdown] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const demoMode = isDemoAccount();
  const { entitlements, loading: entitlementsLoading } = useEntitlements();

  const hasQuoteWorkflow = entitlementsLoading || entitlements?.plan?.has_quote_workflow || entitlements?.isDemo;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (demoMode) {
        setQuotes(DEMO_QUOTES);
        setLoading(false);
        return;
      }

      const { data: quotesData, error: quotesErr } = await supabase
        .from("contractor_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (quotesErr) {
        setError(quotesErr.message);
        setLoading(false);
        return;
      }

      const allQuotes = (quotesData || []);

      const propIds = [...new Set(allQuotes.filter((q: any) => q.property_id).map((q: any) => q.property_id))];
      const ctrIds = [...new Set(allQuotes.filter((q: any) => q.contractor_id).map((q: any) => q.contractor_id))];
      const jobIds = [...new Set(allQuotes.filter((q: any) => q.maintenance_action_id || q.maintenance_job_id).map((q: any) => q.maintenance_action_id || q.maintenance_job_id))];

      const [propRes, ctrRes, jobRes] = await Promise.all([
        propIds.length > 0 ? supabase.from("properties").select("*").in("id", propIds) : Promise.resolve({ data: [] }),
        ctrIds.length > 0 ? supabase.from("contractor_profiles").select("*").in("id", ctrIds) : Promise.resolve({ data: [] }),
        jobIds.length > 0 ? supabase.from("maintenance_jobs").select("*").in("id", jobIds) : Promise.resolve({ data: [] }),
      ]);

      const propMap: Record<string, any> = {};
      (propRes.data || []).forEach((p: any) => { propMap[p.id] = p; });
      const ctrMap: Record<string, any> = {};
      (ctrRes.data || []).forEach((c: any) => { ctrMap[c.id] = c; });
      const jobMap: Record<string, any> = {};
      (jobRes.data || []).forEach((j: any) => { jobMap[j.id] = j; });

      const mapped = allQuotes.map((q: any) => mapQuoteToItem(q, propMap, ctrMap, jobMap));
      setQuotes(mapped);
      setLoading(false);
    }

    loadData();
  }, [demoMode]);

  const allProperties = Array.from(new Set(quotes.map((q) => q.propertyName)));

  const tabs = [
    { id: "all", label: "All Quotes", count: quotes.length },
    { id: "requested", label: "Requested", count: quotes.filter((q) => q.status === "requested").length },
    { id: "submitted", label: "Submitted", count: quotes.filter((q) => q.status === "submitted").length },
    { id: "owner_review", label: "Awaiting Owner", count: quotes.filter((q) => q.status === "owner_review").length },
    { id: "approved", label: "Approved", count: quotes.filter((q) => q.status === "approved").length },
    { id: "rejected", label: "Rejected", count: quotes.filter((q) => q.status === "rejected").length },
  ];

  const filtered = quotes.filter((q) => {
    const matchesTab = activeTab === "all" || q.status === activeTab;
    const matchesSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.propertyName.toLowerCase().includes(search.toLowerCase()) || q.contractorName.toLowerCase().includes(search.toLowerCase()) || q.quoteNumber.toLowerCase().includes(search.toLowerCase());
    const matchesProperty = propertyFilter === "All" || q.propertyName === propertyFilter;
    return matchesTab && matchesSearch && matchesProperty;
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === "requested" || q.status === "submitted" || q.status === "owner_review").length,
    approved: quotes.filter((q) => q.status === "approved").length,
    totalValue: quotes.filter((q) => q.status === "approved").reduce((sum, q) => sum + q.totalAmount, 0),
  };

  if (!hasQuoteWorkflow) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-lock-line text-[#94A3B8] text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-[#3A3F3A] mb-2">Quote Workflow Unavailable</h2>
            <p className="text-sm text-[#687068] mb-6">Quote workflow is available on Professional, Business and Enterprise plans.</p>
            <Link href="/dashboard/billing" className="inline-flex items-center gap-2 bg-[#C28A78] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
              <i className="ri-arrow-up-circle-line"></i>
              Upgrade Plan
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#94A3B8]">Loading quotes...</p>
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
            <h2 className="text-lg font-semibold text-[#3A3F3A] mb-2">Failed to load quotes</h2>
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
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Quotes</h1>
            <p className="text-sm text-[#687068] mt-1">Manage maintenance quotes from request to owner approval</p>
          </div>
          <div className="flex items-center gap-2">
            {demoMode && (
              <span className="text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1.5 rounded-full">Demo Mode — preview only</span>
            )}
            <button
              onClick={() => { if (demoMode) return; setShowRequestModal(true); }}
              className={`bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line text-sm"></i></div>
              Request Quote
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total Quotes", value: stats.total, icon: "ri-file-list-3-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
            { label: "Awaiting Response", value: quotes.filter((q) => q.status === "requested").length, icon: "ri-time-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
            { label: "Ready to Compare", value: quotes.filter((q) => q.status === "submitted").length, icon: "ri-bar-chart-grouped-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
            { label: "Awaiting Approval", value: quotes.filter((q) => q.status === "owner_review").length, icon: "ri-shield-check-line", color: "text-[#D4A85C]", bg: "bg-[#D4A85C]/10" },
            { label: "Approved Value", value: `£${stats.totalValue.toLocaleString()}`, icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} ${stat.color} text-lg`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-search-line text-[#94A3B8] text-sm"></i></div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotes, properties, contractors..." className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
            {search && (
              <button onClick={() => setSearch("")} className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#94A3B8] text-xs"></i></button>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setPropertyDropdown(!propertyDropdown)} className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap">
              Property: {propertyFilter}
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i></div>
            </button>
            {propertyDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[200px] max-h-[280px] overflow-y-auto">
                {["All", ...allProperties].map((p) => (
                  <button key={p} onClick={() => { setPropertyFilter(p); setPropertyDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap">{p}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const config = statusTabConfig[tab.id] || statusTabConfig.requested;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${isActive ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"}`}>
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-[#D5D9D5] text-[#687068]"}`}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D5D9D5] p-12 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-file-list-3-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">{quotes.length === 0 ? "No quotes yet — request your first quote to get started" : "No quotes found in this category"}</p>
            </div>
          ) : (
            filtered.map((quote) => {
              const statusCfg = statusTabConfig[quote.status];
              const isExpanded = expandedId === quote.id;
              return (
                <div key={quote.id} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden hover:border-[#CBD5E1] transition-colors">
                  <button onClick={() => setExpandedId(isExpanded ? null : quote.id)} className="w-full flex items-start gap-4 px-5 py-4 hover:bg-[#FBF9F4] transition-colors text-left">
                    <div className={`w-10 h-10 ${statusCfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`${statusCfg.icon} ${statusCfg.color} text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-[#94A3B8] font-mono">{quote.quoteNumber}</span>
                          <p className="text-sm font-semibold text-[#3A3F3A]">{quote.title}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityConfig[quote.maintenanceJobPriority]}`}>{quote.maintenanceJobPriority}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {quote.totalAmount > 0 ? <span className="text-sm font-bold text-[#C28A78]">£{quote.totalAmount.toLocaleString()}</span> : <span className="text-xs text-[#94A3B8]">Awaiting price</span>}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#687068] flex-wrap">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 flex items-center justify-center"><i className="ri-building-4-line text-[#94A3B8] text-[10px]"></i></div>{quote.propertyName}</span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 flex items-center justify-center"><i className="ri-tools-line text-[#94A3B8] text-[10px]"></i></div>{quote.maintenanceJobTitle}</span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span>{quote.contractorName}</span>
                        {quote.submittedAt && (<><span className="text-[#CBD5E1]">·</span><span>Submitted {quote.submittedAt}</span></>)}
                      </div>
                      {quote.status === "rejected" && quote.rejectionReason && (
                        <p className="text-xs text-[#EF4444] mt-1.5 bg-[#FEF2F2] rounded-lg px-2 py-1 inline-block">Reason: {quote.rejectionReason}</p>
                      )}
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${isExpanded ? "rotate-180" : ""}`}></i>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-[#D5D9D5] space-y-4 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs text-[#94A3B8] uppercase tracking-wide font-medium">Property</p>
                          <p className="text-sm font-medium text-[#3A3F3A]">{quote.propertyName}</p>
                          <p className="text-xs text-[#687068]">{quote.propertyAddress}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-[#94A3B8] uppercase tracking-wide font-medium">Contractor</p>
                          <div className="flex items-center gap-2">
                            <img src={quote.contractorAvatar} alt={quote.contractorName} className="w-7 h-7 rounded-full object-cover" />
                            <div><p className="text-sm font-medium text-[#3A3F3A]">{quote.contractorName}</p><p className="text-xs text-[#687068]">{quote.contractorTrade}</p></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-[#94A3B8] uppercase tracking-wide font-medium">Timeline</p>
                          <div className="space-y-1 text-xs">
                            <p className="text-[#687068]">Requested: <span className="text-[#3A3F3A]">{quote.requestedAt}</span></p>
                            {quote.submittedAt && <p className="text-[#687068]">Submitted: <span className="text-[#3A3F3A]">{quote.submittedAt}</span></p>}
                            {quote.ownerReviewedAt && <p className="text-[#687068]">Reviewed: <span className="text-[#3A3F3A]">{quote.ownerReviewedAt}</span></p>}
                            {quote.approvedAt && <p className="text-[#687068]">Approved: <span className="text-[#10B981] font-medium">{quote.approvedAt}</span></p>}
                            {quote.rejectedAt && <p className="text-[#687068]">Rejected: <span className="text-[#EF4444] font-medium">{quote.rejectedAt}</span></p>}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-[#94A3B8] uppercase tracking-wide font-medium mb-1">Description</p>
                        <p className="text-sm text-[#3A3F3A] leading-relaxed">{quote.description}</p>
                      </div>

                      {quote.totalAmount > 0 && (
                        <div className="bg-[#FBF9F4] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div><p className="text-xs text-[#94A3B8]">Labour</p><p className="text-sm font-semibold text-[#3A3F3A]">£{quote.amount.toLocaleString()}</p></div>
                          <div><p className="text-xs text-[#94A3B8]">VAT</p><p className="text-sm font-semibold text-[#3A3F3A]">£{quote.vatAmount.toLocaleString()}</p></div>
                          <div><p className="text-xs text-[#94A3B8]">Total</p><p className="text-lg font-bold text-[#C28A78]">£{quote.totalAmount.toLocaleString()}</p></div>
                          <div><p className="text-xs text-[#94A3B8]">Maintenance Job</p><p className="text-sm font-medium text-[#3B82F6]">{quote.maintenanceJobTitle}</p></div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-[#D5D9D5]">
                        {quote.status === "requested" && <span className="text-xs text-[#3B82F6] font-medium flex items-center gap-1"><i className="ri-time-line"></i> Awaiting contractor response</span>}
                        {quote.status === "submitted" && (<>
                          <button onClick={() => { if (demoMode) return; }} className={`px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143728] transition-colors whitespace-nowrap ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}>Send to Owner</button>
                          <button onClick={() => { if (demoMode) return; }} className={`px-3 py-1.5 border border-[#F59E0B] text-[#F59E0B] rounded-lg text-xs font-medium hover:bg-[#F59E0B]/10 transition-colors whitespace-nowrap ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}>Request Revision</button>
                        </>)}
                        {quote.status === "owner_review" && (<>
                          <button onClick={() => { if (demoMode) return; }} className={`px-3 py-1.5 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-[#059669] transition-colors whitespace-nowrap ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}>Approve</button>
                          <button onClick={() => { if (demoMode) return; setShowRejectModal(quote.id); }} className={`px-3 py-1.5 border border-[#EF4444] text-[#EF4444] rounded-lg text-xs font-medium hover:bg-[#EF4444]/10 transition-colors whitespace-nowrap ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}>Reject</button>
                        </>)}
                        {quote.status === "approved" && <span className="text-xs text-[#10B981] font-medium flex items-center gap-1"><i className="ri-check-double-line"></i> Approved — work in progress</span>}
                        {quote.status === "rejected" && <span className="text-xs text-[#EF4444] font-medium flex items-center gap-1"><i className="ri-close-circle-line"></i> Rejected</span>}
                        {quote.status === "expired" && <span className="text-xs text-[#94A3B8] font-medium flex items-center gap-1"><i className="ri-time-line"></i> Quote expired — re-request if needed</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRequestModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Request Quote</h2>
              <button onClick={() => setShowRequestModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Maintenance Job</label>
                <select className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78] pr-8">
                  <option value="">Select maintenance job...</option>
                  <option value="boiler">Boiler pressure loss — Rose Court</option>
                  <option value="gutter">Roof gutter cleaning — Riverside Court</option>
                  <option value="epc">EPC assessment — 45 Baker Street</option>
                  <option value="fence">Garden fence repair — Maple Gardens</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Contractor</label>
                <select className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78] pr-8">
                  <option value="">Select contractor...</option>
                  <option value="greenplumb">GreenPlumb Ltd — Plumber</option>
                  <option value="sparkpro">SparkPro Electrics — Electrician</option>
                  <option value="safegas">SafeGas Solutions — Gas Engineer</option>
                  <option value="toproof">Top Roof Repairs — Roofer</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Quote Title</label><input className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="e.g., Boiler replacement quote" /></div>
              <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Description</label><textarea rows={3} maxLength={500} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" placeholder="Describe what the contractor needs to quote for..." /></div>
              <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Due Date</label><input type="date" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Notes for Contractor</label><textarea rows={2} maxLength={500} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" placeholder="Access instructions, tenant details..." /></div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
              <button onClick={() => setShowRequestModal(false)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">Cancel</button>
              <button onClick={() => { if (demoMode) return; setShowRequestModal(false); }} className={`flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}>Request Quote</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRejectModal(null)}>
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]"><h2 className="font-semibold text-[#3A3F3A]">Reject Quote</h2><button onClick={() => setShowRejectModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button></div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#687068]">Please provide a reason for rejecting this quote. The contractor will be notified.</p>
              <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Rejection Reason</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} maxLength={500} placeholder="e.g., Too expensive, seeking alternative quotes..." className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#EF4444] resize-none" />
                <p className="text-xs text-[#94A3B8] mt-1 text-right">{rejectionReason.length}/500</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">Cancel</button>
              <button onClick={() => { if (demoMode) return; setShowRejectModal(null); setRejectionReason(""); }} className={`flex-1 px-4 py-2.5 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors whitespace-nowrap ${demoMode ? "opacity-50 cursor-not-allowed" : ""}`}>Reject Quote</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}