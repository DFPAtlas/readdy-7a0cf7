"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { CONTRACTOR_STATUS, getStatusConfig, isExpiringSoon, isExpired, PRIORITY_CONFIG, type ContractorAction } from "@/lib/contractorSystem";
import ContractorActionCentre from "@/components/dashboard/ContractorActionCentre";

interface ContractorRecord {
  id: string;
  companyName: string;
  contactName: string;
  trade: string;
  phone: string;
  email: string;
  address: string;
  insuranceExpiry: string;
  publicLiabilityAmount: string;
  gasSafeNumber: string;
  niceicNumber: string;
  notes: string;
  activeJobs: number;
  totalJobs: number;
  status: "Active" | "Inactive" | "Pending";
  rating: number;
  avatar: string;
}

const DEMO_CONTRACTORS: ContractorRecord[] = [
  {
    id: "1",
    companyName: "GreenPlumb Ltd",
    contactName: "Mark Davies",
    trade: "Plumber",
    phone: "020 7946 0958",
    email: "jobs@greenplumb.co.uk",
    address: "Unit 4, Industrial Estate, London E2 8AN",
    insuranceExpiry: "31 Dec 2026",
    publicLiabilityAmount: "£5,000,000",
    gasSafeNumber: "GS-123456",
    niceicNumber: "NIC-987654",
    notes: "Our go-to plumbing contractor. Excellent response rate and quality work.",
    activeJobs: 3,
    totalJobs: 48,
    status: "Active",
    rating: 4.9,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20plumber%20contractor%20headshot%20portrait%2C%20work%20uniform%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=1&orientation=squarish",
  },
  {
    id: "2",
    companyName: "SparkPro Electrics",
    contactName: "James Wilson",
    trade: "Electrician",
    phone: "0161 496 0358",
    email: "contact@sparkpro.co.uk",
    address: "22 Cable Street, Manchester M4 1QW",
    insuranceExpiry: "31 Dec 2026",
    publicLiabilityAmount: "£5,000,000",
    gasSafeNumber: "",
    niceicNumber: "NIC-456789",
    notes: "Reliable electrical contractor. Uses digital EICR reports.",
    activeJobs: 2,
    totalJobs: 32,
    status: "Active",
    rating: 4.7,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20electrician%20contractor%20headshot%20portrait%2C%20grey%20work%20shirt%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=2&orientation=squarish",
  },
  {
    id: "3",
    companyName: "SafeGas Solutions",
    contactName: "David Brown",
    trade: "Gas Engineer",
    phone: "0113 496 0123",
    email: "info@safegas.co.uk",
    address: "8 Gas Lane, Leeds LS1 3AB",
    insuranceExpiry: "28 Feb 2027",
    publicLiabilityAmount: "£10,000,000",
    gasSafeNumber: "GS-789012",
    niceicNumber: "",
    notes: "Gas Safe registered for all gas appliance work. Preferred for boiler installations.",
    activeJobs: 1,
    totalJobs: 25,
    status: "Active",
    rating: 4.8,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20gas%20engineer%20contractor%20headshot%20portrait%2C%20blue%20work%20polo%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=3&orientation=squarish",
  },
  {
    id: "4",
    companyName: "SecureFix Locksmiths",
    contactName: "Tom Harris",
    trade: "Locksmith",
    phone: "0121 496 0358",
    email: "info@securefix.co.uk",
    address: "45 Key Road, Birmingham B1 2XY",
    insuranceExpiry: "28 Feb 2027",
    publicLiabilityAmount: "£5,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "24/7 emergency locksmith. Average response time under 30 minutes.",
    activeJobs: 1,
    totalJobs: 21,
    status: "Active",
    rating: 4.8,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20locksmith%20contractor%20headshot%20portrait%2C%20dark%20uniform%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=4&orientation=squarish",
  },
  {
    id: "5",
    companyName: "Top Roof Repairs Ltd",
    contactName: "Steve Clark",
    trade: "Roofer",
    phone: "020 7946 0456",
    email: "steve@toproof.co.uk",
    address: "12 Slate Avenue, London SE1 5CD",
    insuranceExpiry: "15 Aug 2026",
    publicLiabilityAmount: "£5,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "Specialises in flat roof repairs and slate work. Good for period properties.",
    activeJobs: 0,
    totalJobs: 12,
    status: "Active",
    rating: 4.5,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20roofer%20contractor%20headshot%20portrait%2C%20orange%20hi-vis%20vest%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=5&orientation=squarish",
  },
  {
    id: "6",
    companyName: "FreshCoat Decorators",
    contactName: "Andy Mitchell",
    trade: "Decorator",
    phone: "0117 496 0789",
    email: "andy@freshcoat.co.uk",
    address: "33 Paint Street, Bristol BS1 4EF",
    insuranceExpiry: "30 Sep 2026",
    publicLiabilityAmount: "£2,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "Excellent for end-of-tenancy repaints. Clean and fast turnaround.",
    activeJobs: 2,
    totalJobs: 18,
    status: "Active",
    rating: 4.6,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20decorator%20contractor%20headshot%20portrait%2C%20white%20work%20shirt%2C%20friendly%20confident%20smile%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=6&orientation=squarish",
  },
  {
    id: "7",
    companyName: "BuildRight Construction",
    contactName: "Paul Andrews",
    trade: "General Builder",
    phone: "020 7946 0234",
    email: "hello@buildright.co.uk",
    address: "67 Builders Yard, London N1 7GH",
    insuranceExpiry: "30 Jun 2027",
    publicLiabilityAmount: "£10,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "Full-service builder. Handles renovations, extensions, and structural work.",
    activeJobs: 1,
    totalJobs: 67,
    status: "Active",
    rating: 4.5,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20builder%20contractor%20headshot%20portrait%2C%20orange%20hi-vis%20vest%20over%20shirt%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=7&orientation=squarish",
  },
  {
    id: "8",
    companyName: "HandyDan Services",
    contactName: "Dan Carter",
    trade: "Handyman",
    phone: "020 7946 0678",
    email: "dan@handydan.co.uk",
    address: "99 Fixit Lane, London E3 2JK",
    insuranceExpiry: "01 Jan 2027",
    publicLiabilityAmount: "£1,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "Good for small jobs and general maintenance. Reasonable day rate.",
    activeJobs: 4,
    totalJobs: 55,
    status: "Active",
    rating: 4.3,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20handyman%20contractor%20headshot%20portrait%2C%20casual%20work%20shirt%2C%20friendly%20approachable%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=8&orientation=squarish",
  },
  {
    id: "9",
    companyName: "Crystal Clean Services",
    contactName: "Lisa Taylor",
    trade: "Cleaner",
    phone: "020 7946 0901",
    email: "lisa@crystalclean.co.uk",
    address: "14 Mop Street, London SW1 4LM",
    insuranceExpiry: "31 Mar 2027",
    publicLiabilityAmount: "£2,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "End-of-tenancy and regular cleaning. Always reliable and thorough.",
    activeJobs: 2,
    totalJobs: 40,
    status: "Active",
    rating: 4.7,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20female%20cleaner%20contractor%20headshot%20portrait%2C%20neat%20uniform%2C%20friendly%20warm%20smile%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=9&orientation=squarish",
  },
  {
    id: "10",
    companyName: "Inventory Pro UK",
    contactName: "Rachel Green",
    trade: "Inventory Clerk",
    phone: "020 7946 0345",
    email: "rachel@inventorypro.co.uk",
    address: "23 Check Street, London NW1 8PQ",
    insuranceExpiry: "15 Nov 2026",
    publicLiabilityAmount: "£1,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "Digital inventory reports with photos. Usually available on 48h notice.",
    activeJobs: 3,
    totalJobs: 35,
    status: "Active",
    rating: 4.8,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20female%20inventory%20clerk%20contractor%20headshot%20portrait%2C%20smart%20casual%20attire%2C%20friendly%20professional%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=10&orientation=squarish",
  },
  {
    id: "11",
    companyName: "EPC Assess UK",
    contactName: "Mike Parsons",
    trade: "EPC Assessor",
    phone: "020 7946 0567",
    email: "mike@epcassess.co.uk",
    address: "5 Energy House, London EC1 2RS",
    insuranceExpiry: "31 May 2026",
    publicLiabilityAmount: "£1,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "Fast EPC certificates for compliance. Insurance expiring soon — needs renewal.",
    activeJobs: 1,
    totalJobs: 15,
    status: "Active",
    rating: 4.4,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20EPC%20assessor%20contractor%20headshot%20portrait%2C%20smart%20casual%20attire%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=11&orientation=squarish",
  },
  {
    id: "12",
    companyName: "GardenForce Landscaping",
    contactName: "Alan Woods",
    trade: "Cleaner",
    phone: "0113 496 0358",
    email: "team@gardenforce.co.uk",
    address: "88 Green Lane, Leeds LS2 5TY",
    insuranceExpiry: "01 Jan 2027",
    publicLiabilityAmount: "£5,000,000",
    gasSafeNumber: "",
    niceicNumber: "",
    notes: "Landscape design and garden maintenance. Seasonal availability.",
    activeJobs: 0,
    totalJobs: 15,
    status: "Inactive",
    rating: 4.6,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20gardener%20contractor%20headshot%20portrait%2C%20green%20work%20shirt%2C%20friendly%20confident%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&seq=12&orientation=squarish",
  },
];

const tradeColorMap: Record<string, string> = {
  Plumber: "bg-blue-500",
  Electrician: "bg-amber-500",
  "Gas Engineer": "bg-red-500",
  Locksmith: "bg-gray-600",
  Roofer: "bg-orange-600",
  Decorator: "bg-pink-500",
  "General Builder": "bg-orange-500",
  Handyman: "bg-teal-500",
  Cleaner: "bg-cyan-500",
  "Inventory Clerk": "bg-purple-500",
  "EPC Assessor": "bg-emerald-600",
  "Fire Safety Contractor": "bg-red-600",
  "EICR Contractor": "bg-indigo-500",
  "Plumbing & Heating": "bg-blue-500",
  electrical: "bg-amber-500",
};

function mapStatus(legacyStatus: string): string {
  const s = (legacyStatus || "").toLowerCase();
  if (s === "active") return "active";
  if (s === "inactive" || s === "suspended") return "suspended";
  if (s === "pending") return "under_review";
  return "active";
}

function mapPerfToContractor(perf: any, profile?: any): ContractorRecord {
  const trade = perf.trade || "General";
  return {
    id: perf.id,
    companyName: perf.business_name || "Unknown Contractor",
    contactName: profile?.contact_name || perf.business_name?.split(" ")[0] || "—",
    trade,
    phone: profile?.phone || "—",
    email: profile?.email || "—",
    address: profile?.address || "—",
    insuranceExpiry: profile?.insurance_expiry ? new Date(profile.insurance_expiry).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
    publicLiabilityAmount: profile?.public_liability_amount || "—",
    gasSafeNumber: profile?.gas_safe_reg_number || "",
    niceicNumber: profile?.niceic_reg_number || "",
    notes: profile?.notes || "",
    activeJobs: Math.max(0, (perf.total_jobs || 0) - (perf.jobs_completed || 0)),
    totalJobs: perf.total_jobs || 0,
    status: profile?.status === "active" ? "Active" : profile?.status === "inactive" ? "Inactive" : "Active",
    rating: Number(perf.rating) || 0,
    avatar: "https://readdy.ai/api/search-image?query=Professional%20contractor%20headshot%20portrait%2C%20friendly%20expression%2C%20clean%20neutral%20studio%20background%2C%20professional%20corporate%20photography%2C%20soft%20lighting&width=100&height=100&orientation=squarish&seq=1",
  };
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<ContractorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tradeDropdown, setTradeDropdown] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<ContractorRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (isDemoAccount()) {
        setContractors(DEMO_CONTRACTORS);
        setLoading(false);
        return;
      }
      const { data: perfData, error: perfErr } = await supabase
        .from("contractor_performance")
        .select("*")
        .order("combined_score", { ascending: false });

      if (perfErr) {
        setError(perfErr.message);
        setLoading(false);
        return;
      }

      const perfRecords = perfData || [];

      const contractorIds = perfRecords
        .filter((p: any) => p.contractor_id)
        .map((p: any) => p.contractor_id);

      let profilesMap: Record<string, any> = {};
      if (contractorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("contractor_profiles")
          .select("*")
          .in("id", contractorIds);
        if (profiles) {
          profiles.forEach((p: any) => {
            profilesMap[p.id] = p;
          });
        }
      }

      const mapped = perfRecords.map((perf: any) =>
        mapPerfToContractor(perf, profilesMap[perf.contractor_id])
      );

      setContractors(mapped);
      setLoading(false);
    }

    loadData();
  }, []);

  const allTrades = Array.from(new Set(contractors.map((c) => c.trade)));

  const statusesToFilter = ["All", "active", "under_review", "documents_required", "suspended", "archived"];

  const filtered = contractors.filter((c) => {
    const matchesSearch = search === "" ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.trade.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesTrade = tradeFilter === "All" || c.trade === tradeFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesTrade && matchesStatus;
  });

  const activeCount = contractors.filter((c) => c.status === "Active").length;
  const availableCount = contractors.filter((c) => c.status === "Active" && c.activeJobs < 3).length;
  const underReviewCount = contractors.filter((c) => c.status === "Pending").length;
  const docsNeededCount = contractors.filter((c) => isExpiringSoon(c.insuranceExpiry) || isExpired(c.insuranceExpiry)).length;
  const atRiskCount = contractors.filter((c) => c.status === "Inactive").length;

  const actionItems: ContractorAction[] = [
    ...contractors
      .filter((c) => c.status === "Pending")
      .map((c): ContractorAction => ({
        id: `review-${c.id}`,
        contractorId: c.id,
        contractorName: c.companyName,
        trade: c.trade,
        issue: "Application awaiting review",
        deadline: "No deadline set",
        priority: "high",
        actionLabel: "Review",
      })),
    ...contractors
      .filter((c) => isExpired(c.insuranceExpiry))
      .map((c): ContractorAction => ({
        id: `insurance-${c.id}`,
        contractorId: c.id,
        contractorName: c.companyName,
        trade: c.trade,
        issue: `Insurance expired — ${c.insuranceExpiry}`,
        deadline: "Overdue",
        priority: "critical",
        actionLabel: "Request",
      })),
    ...contractors
      .filter((c) => isExpiringSoon(c.insuranceExpiry) && !isExpired(c.insuranceExpiry))
      .map((c): ContractorAction => ({
        id: `expiring-${c.id}`,
        contractorId: c.id,
        contractorName: c.companyName,
        trade: c.trade,
        issue: `Insurance expiring — ${c.insuranceExpiry}`,
        deadline: c.insuranceExpiry,
        priority: "high",
        actionLabel: "Remind",
      })),
  ].slice(0, 6);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#94A3B8]">Loading contractors...</p>
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
            <h2 className="text-lg font-semibold text-[#3A3F3A] mb-2">Failed to load contractors</h2>
            <p className="text-sm text-[#687068] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (contractors.length === 0) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Contractors</h1>
              <p className="text-sm text-[#687068] mt-1">Manage your approved contractor database, documents, and assignments</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-add-line text-sm"></i>
              </div>
              Add Contractor
            </button>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="w-14 h-14 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-briefcase-line text-[#94A3B8] text-2xl"></i>
              </div>
              <h2 className="text-lg font-semibold text-[#3A3F3A] mb-2">No contractors yet</h2>
              <p className="text-sm text-[#687068] mb-4">Your contractor database is empty. Add your first contractor to start managing maintenance assignments.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap"
              >
                Add First Contractor
              </button>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Contractors</h1>
            <p className="text-sm text-[#687068] mt-1">Manage your approved contractor database, documents, and assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-add-line text-sm"></i>
              </div>
              Add Contractor
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Active Contractors", value: activeCount, icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
            { label: "Available Now", value: availableCount, icon: "ri-user-star-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
            { label: "Under Review", value: underReviewCount, icon: "ri-search-line", color: "text-[#D4A85C]", bg: "bg-[#D4A85C]/10" },
            { label: "Documents Needed", value: docsNeededCount, icon: "ri-file-warning-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
            { label: "At Risk", value: atRiskCount, icon: "ri-alert-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
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

        <ContractorActionCentre actions={actionItems} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, trade, email..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="w-4 h-4 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8] text-xs"></i>
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setTradeDropdown(!tradeDropdown); setStatusDropdown(false); }}
              className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
            >
              Trade: {tradeFilter}
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </div>
            </button>
            {tradeDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[180px] max-h-[280px] overflow-y-auto">
                {["All", ...allTrades].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTradeFilter(t); setTradeDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setStatusDropdown(!statusDropdown); setTradeDropdown(false); }}
              className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
            >
              Status: {statusFilter === "All" ? "All" : (CONTRACTOR_STATUS[statusFilter]?.label || statusFilter)}
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </div>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[180px]">
                {statusesToFilter.map((s) => {
                  const cfg = s === "All" ? { label: "All" } : CONTRACTOR_STATUS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setStatusDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap"
                    >
                      {cfg?.label || s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Contractors Table */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                  <th className="text-left px-4 py-3 font-medium text-[#687068] whitespace-nowrap">Contractor</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068] whitespace-nowrap">Trade</th>
                  <th className="text-center px-4 py-3 font-medium text-[#687068] whitespace-nowrap hidden sm:table-cell">Active Jobs</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068] whitespace-nowrap hidden lg:table-cell">Compliance</th>
                  <th className="text-center px-4 py-3 font-medium text-[#687068] whitespace-nowrap">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-[#687068] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.contactName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <button
                            onClick={() => { setSelectedContractor(c); setShowProfile(true); }}
                            className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors text-left truncate block"
                          >
                            {c.companyName}
                          </button>
                          <p className="text-xs text-[#94A3B8] truncate">{c.contactName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${tradeColorMap[c.trade] || "bg-[#687068]"}`}>
                        {c.trade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-sm font-bold ${c.activeJobs > 0 ? "text-[#C28A78]" : "text-[#94A3B8]"}`}>{c.activeJobs}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {c.insuranceExpiry && c.insuranceExpiry !== "\u2014" ? (
                        <div>
                          <span className={`text-xs font-medium ${isExpired(c.insuranceExpiry) ? "text-[#EF4444]" : isExpiringSoon(c.insuranceExpiry) ? "text-[#D4A85C]" : "text-[#10B981]"}`}>
                            {isExpired(c.insuranceExpiry) ? "Expired" : isExpiringSoon(c.insuranceExpiry) ? "Expiring" : "Valid"}
                          </span>
                          <p className="text-xs text-[#94A3B8]">{c.insuranceExpiry}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">\u2014</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const mapped = mapStatus(c.status);
                        const cfg = CONTRACTOR_STATUS[mapped];
                        return (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg?.bg || "bg-[#94A3B8]/10"} ${cfg?.color || "text-[#94A3B8]"}`}>
                            {cfg?.label || c.status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedContractor(c); setShowProfile(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <i className="ri-eye-line text-[#C28A78] text-sm"></i>
                        </button>
                        <Link href={`/dashboard/contractors/${c.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors" title="View Details">
                          <i className="ri-arrow-right-s-line text-[#687068] text-sm"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                  {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-search-line text-[#94A3B8] text-xl"></i>
                      </div>
                      <p className="text-sm text-[#94A3B8]">No contractors found matching your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfile && selectedContractor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5] sticky top-0 bg-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <img src={selectedContractor.avatar} alt={selectedContractor.companyName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <h2 className="font-semibold text-[#3A3F3A]">{selectedContractor.companyName}</h2>
                    <p className="text-xs text-[#687068]">{selectedContractor.trade} · Rating {selectedContractor.rating}</p>
                  </div>
                </div>
                <button onClick={() => setShowProfile(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-user-line text-[#94A3B8] text-xs"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Contact Name</p>
                          <p className="text-sm text-[#3A3F3A]">{selectedContractor.contactName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-phone-line text-[#94A3B8] text-xs"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Phone</p>
                          <p className="text-sm text-[#3A3F3A]">{selectedContractor.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-mail-line text-[#94A3B8] text-xs"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Email</p>
                          <p className="text-sm text-[#3A3F3A]">{selectedContractor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-map-pin-line text-[#94A3B8] text-xs"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Address</p>
                          <p className="text-sm text-[#3A3F3A]">{selectedContractor.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">Compliance & Insurance</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-shield-check-line text-[#94A3B8] text-xs"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Public Liability</p>
                          <p className="text-sm text-[#3A3F3A]">{selectedContractor.publicLiabilityAmount}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-calendar-line text-[#94A3B8] text-xs"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Insurance Expiry</p>
                          <p className={`text-sm ${isExpired(selectedContractor.insuranceExpiry) ? "text-[#EF4444] font-medium" : "text-[#3A3F3A]"}`}>
                            {selectedContractor.insuranceExpiry}
                            {isExpiringSoon(selectedContractor.insuranceExpiry) && !isExpired(selectedContractor.insuranceExpiry) && (
                              <span className="text-[#D4A85C] text-xs ml-2">(Expiring soon)</span>
                            )}
                            {isExpired(selectedContractor.insuranceExpiry) && (
                              <span className="text-[#EF4444] text-xs ml-2">(Expired)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {selectedContractor.gasSafeNumber && (
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-fire-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Gas Safe Number</p>
                            <p className="text-sm text-[#3A3F3A]">{selectedContractor.gasSafeNumber}</p>
                          </div>
                        </div>
                      )}
                      {selectedContractor.niceicNumber && (
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-flashlight-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">NICEIC Number</p>
                            <p className="text-sm text-[#3A3F3A]">{selectedContractor.niceicNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {selectedContractor.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#3A3F3A] mb-2">Notes</h3>
                    <p className="text-sm text-[#687068] bg-[#FBF9F4] rounded-lg p-3">{selectedContractor.notes}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-[#D5D9D5]">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{selectedContractor.totalJobs}</p>
                      <p className="text-xs text-[#94A3B8]">Total Jobs</p>
                    </div>
                    <div className="w-px h-8 bg-[#D5D9D5]"></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{selectedContractor.activeJobs}</p>
                      <p className="text-xs text-[#94A3B8]">Active</p>
                    </div>
                    <div className="w-px h-8 bg-[#D5D9D5]"></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{selectedContractor.rating}</p>
                      <p className="text-xs text-[#94A3B8]">Rating</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${selectedContractor.email}`} className="px-3 py-2 border border-[#D5D9D5] rounded-lg text-xs font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">
                      Email
                    </a>
                    <Link href={`/dashboard/contractors?id=${selectedContractor.id}`} className="px-3 py-2 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">
                      View Full Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Contractor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Add New Contractor</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Company Name</label>
                    <input className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="e.g., GreenPlumb Ltd" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Contact Name</label>
                    <input className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="e.g., Mark Davies" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Trade</label>
                    <select className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78] pr-8">
                      <option value="">Select trade...</option>
                      {allTrades.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Status</label>
                    <select className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78] pr-8">
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Phone</label>
                    <input className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="020 7946 0000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Email</label>
                    <input type="email" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="email@company.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Address</label>
                  <input className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Insurance Expiry</label>
                    <input type="date" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Public Liability (£)</label>
                    <input className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="e.g., £5,000,000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Gas Safe Number</label>
                    <input className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="e.g., GS-123456" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">NICEIC Number</label>
                    <input className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" placeholder="e.g., NIC-987654" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Notes</label>
                  <textarea rows={2} maxLength={500} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" placeholder="Internal notes about this contractor..." />
                  <p className="text-xs text-[#94A3B8] mt-1 text-right">0/500</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">
                  Cancel
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">
                  Add Contractor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}