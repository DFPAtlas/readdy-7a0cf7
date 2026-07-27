"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import PropertyHealthScoreCard from "@/components/property/PropertyHealthScoreCard";
import PropertyQRCode from "@/components/PropertyQRCode";

export interface PropertyDetailData {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  nation: string;
  nationLabel: string;
  status: string;
  rentAmount: number;
  depositAmount: number;
  landlordName: string | null;
  landlordEmail: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
  propertyManager: string | null;
  tenancyStart: string | null;
  tenancyEnd: string | null;
  epcRating: string;
  gasExpiry: string | null;
  eicrExpiry: string | null;
  complianceStatus: string;
  maintenanceOpen: number;
  ownerPortal: string;
  tenantPortal: string;
  isHmo: boolean;
  isFurnished: boolean;
  dateAdded: string;
  image: string;
  isLiveData: boolean;
}

const statusStyles: Record<string, string> = {
  Occupied: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  Available: "bg-[#3B82F6]/10 text-[#3B82F6]",
  Maintenance: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Vacant: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  Pending: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

const complianceStyles: Record<string, string> = {
  Valid: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  "Expiring Soon": "bg-[#F59E0B]/10 text-[#F59E0B]",
  Overdue: "bg-[#EF4444]/10 text-[#EF4444]",
  Missing: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

const portalStyles: Record<string, string> = {
  active: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  invited: "bg-[#3B82F6]/10 text-[#3B82F6]",
  "not-invited": "bg-[#94A3B8]/10 text-[#94A3B8]",
};

const portalLabels: Record<string, string> = {
  active: "Active",
  invited: "Invited",
  "not-invited": "Not Set Up",
};

function getComplianceItems(property: PropertyDetailData) {
  return [
    { type: "Gas Safety (CP12)", expiry: property.gasExpiry || "—", status: property.gasExpiry ? (new Date(property.gasExpiry) < new Date("2026-07-01") ? "overdue" : new Date(property.gasExpiry) < new Date("2026-10-01") ? "expiring" : "valid") : "n-a" },
    { type: "EICR", expiry: property.eicrExpiry || "—", status: property.eicrExpiry ? (new Date(property.eicrExpiry) < new Date("2026-07-01") ? "overdue" : new Date(property.eicrExpiry) < new Date("2026-10-01") ? "expiring" : "valid") : "n-a" },
    { type: "EPC", rating: property.epcRating, expiry: "2028-06-10", status: "valid" },
    { type: "Smoke Alarms", expiry: "2026-12-31", status: "expiring" },
    { type: "Right to Rent", expiry: property.tenantName ? "2026-08-14" : "—", status: property.tenantName ? "valid" : "n-a" },
    { type: "Deposit Protection", expiry: property.depositAmount > 0 ? "2026-08-14" : "—", status: property.depositAmount > 0 ? "valid" : "n-a" },
  ];
}

function getMaintenanceDemo(property: PropertyDetailData) {
  if (!property.isLiveData && property.maintenanceOpen === 0 && property.id !== "1" && property.id !== "3") return [];
  return [
    { id: "m1", title: "Boiler service and inspection", date: "2026-06-18", contractor: "HeatPro Services", cost: 120, status: "Completed", priority: "Routine" },
    { id: "m2", title: "Kitchen tap leak repair", date: "2026-05-03", contractor: "QuickFix Plumbing", cost: 85, status: "Completed", priority: "Urgent" },
    { id: "m3", title: "Front door lock replacement", date: "2026-06-25", contractor: "SecureLock Ltd", cost: 0, status: "Scheduled", priority: "High" },
    { id: "m4", title: "Bathroom extractor fan replacement", date: "2026-04-12", contractor: "SparkGen Electric", cost: 195, status: "Completed", priority: "Routine" },
  ];
}

function getInspectionsDemo() {
  return [
    { id: "i1", type: "Periodic Inspection", date: "2026-05-20", inspector: "Mark Davies", status: "Completed", rating: "Good", report: true },
    { id: "i2", type: "Check-in Inspection", date: "2025-08-15", inspector: "Sarah Jones", status: "Completed", rating: "Excellent", report: true },
    { id: "i3", type: "Compliance Check", date: "2026-07-28", inspector: "Mark Davies", status: "Scheduled", rating: null, report: false },
  ];
}

function getDocumentsDemo() {
  return [
    { id: "d1", name: "Tenancy Agreement", type: "Tenancy Agreement", date: "2025-08-14", size: "2.4 MB", linkedTo: "Tenancy" },
    { id: "d2", name: "Gas Safety Certificate", type: "Gas Safety", date: "2025-10-12", size: "1.1 MB", linkedTo: "Compliance" },
    { id: "d3", name: "EICR Report", type: "EICR", date: "2025-03-05", size: "3.2 MB", linkedTo: "Compliance" },
    { id: "d4", name: "EPC Certificate", type: "EPC", date: "2023-06-10", size: "0.8 MB", linkedTo: "Compliance" },
    { id: "d5", name: "Inventory Report", type: "Inventory", date: "2025-08-14", size: "4.5 MB", linkedTo: "Property" },
    { id: "d6", name: "Deposit Certificate", type: "Deposit Certificate", date: "2025-08-14", size: "0.6 MB", linkedTo: "Tenancy" },
    { id: "d7", name: "Right to Rent Check", type: "Right to Rent", date: "2025-08-10", size: "1.8 MB", linkedTo: "Tenant" },
  ];
}

function getActivityFeed(property: PropertyDetailData) {
  const items = [];
  if (property.tenancyStart) items.push({ icon: "ri-file-text-line", desc: "Tenancy started", related: property.tenantName || "Tenant", time: property.tenancyStart, color: "bg-[#3B82F6]/10 text-[#3B82F6]" });
  if (property.dateAdded) items.push({ icon: "ri-building-4-line", desc: "Property added to portfolio", related: property.address, time: property.dateAdded, color: "bg-[#8B5CF6]/10 text-[#8B5CF6]" });
  items.push({ icon: "ri-shield-check-line", desc: "Compliance check completed", related: "Gas Safety CP12", time: "2026-06-15", color: "bg-[#7A9A7E]/10 text-[#7A9A7E]" });
  items.push({ icon: "ri-money-pound-circle-line", desc: "Rent payment received", related: `£${property.rentAmount.toLocaleString()}`, time: "2026-07-01", color: "bg-[#F59E0B]/10 text-[#F59E0B]" });
  items.push({ icon: "ri-mail-line", desc: "Monthly statement sent to owner", related: property.landlordName || "Owner", time: "2026-07-05", color: "bg-[#C28A78]/10 text-[#C28A78]" });
  return items;
}

function getUpcomingItems(property: PropertyDetailData) {
  const items: { date: string; label: string; type: string; related: string | null; status: string }[] = [];
  const today = new Date("2026-07-22");
  const thisWeek = new Date("2026-07-29");
  const nextWeek = new Date("2026-08-05");

  if (property.rentAmount > 0) {
    items.push({ date: "2026-08-01", label: "Rent Due", type: "Rent", related: property.tenantName, status: "upcoming" });
  }
  if (property.gasExpiry && new Date(property.gasExpiry) < new Date("2026-10-01")) {
    items.push({ date: property.gasExpiry, label: "Gas Safety Renewal", type: "Compliance", related: null, status: new Date(property.gasExpiry) < today ? "overdue" : "expiring" });
  }
  if (property.eicrExpiry && new Date(property.eicrExpiry) < new Date("2027-01-01")) {
    items.push({ date: property.eicrExpiry, label: "EICR Renewal", type: "Compliance", related: null, status: "upcoming" });
  }
  items.push({ date: "2026-07-28", label: "Compliance Check", type: "Inspection", related: "Mark Davies", status: "scheduled" });
  if (property.tenancyEnd) {
    const end = new Date(property.tenancyEnd);
    if (end < new Date("2026-10-01")) {
      items.push({ date: property.tenancyEnd, label: "Tenancy Expires", type: "Tenancy", related: property.tenantName, status: end < today ? "overdue" : "expiring" });
    }
  }
  if (property.maintenanceOpen > 0) {
    items.push({ date: "2026-06-25", label: "Lock replacement", type: "Maintenance", related: "SecureLock Ltd", status: "scheduled" });
  }
  return items.slice(0, 6);
}

function getAttentionItems(property: PropertyDetailData) {
  const items: { priority: "Critical" | "High" | "Normal"; title: string; related: string; due: string; action: string }[] = [];
  if (property.complianceStatus === "Overdue") {
    if (property.gasExpiry && new Date(property.gasExpiry) < new Date("2026-07-01")) {
      items.push({ priority: "Critical", title: "Gas Safety Certificate expired", related: property.address, due: property.gasExpiry, action: "Renew certificate" });
    }
  }
  if (property.maintenanceOpen >= 3) {
    items.push({ priority: "High", title: `${property.maintenanceOpen} open maintenance jobs`, related: property.address, due: "Ongoing", action: "View jobs" });
  }
  if (property.complianceStatus === "Expiring Soon") {
    items.push({ priority: "High", title: "Compliance certificates expiring soon", related: property.address, due: "Within 90 days", action: "Schedule renewal" });
  }
  if (property.status === "Vacant") {
    items.push({ priority: "High", title: "Property vacant — no rental income", related: property.address, due: "Ongoing", action: "Find tenant" });
  }
  if (property.tenantPortal === "not-invited" && property.tenantName) {
    items.push({ priority: "Normal", title: "Tenant portal not set up", related: property.tenantName, due: "—", action: "Send invite" });
  }
  if (property.ownerPortal === "not-invited" && property.landlordName) {
    items.push({ priority: "Normal", title: "Owner portal not set up", related: property.landlordName, due: "—", action: "Send invite" });
  }
  return items.slice(0, 4);
}

export default function PropertyDetailView({
  property,
  loading,
  notFound,
}: {
  property: PropertyDetailData | null;
  loading: boolean;
  notFound: boolean;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showInviteOwner, setShowInviteOwner] = useState(false);
  const [showInviteTenant, setShowInviteTenant] = useState(false);
  const [showResendOwner, setShowResendOwner] = useState(false);
  const [showResendTenant, setShowResendTenant] = useState(false);
  const [showDisableOwner, setShowDisableOwner] = useState(false);
  const [showDisableTenant, setShowDisableTenant] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerMessage, setOwnerMessage] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantMessage, setTenantMessage] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".more-menu-trigger")) setShowMoreMenu(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-9 bg-[#D5D9D5] rounded-lg w-64"></div>
          <div className="h-64 bg-[#D5D9D5] rounded-xl"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-[#D5D9D5] rounded-xl"></div>)}
          </div>
          <div className="h-40 bg-[#D5D9D5] rounded-xl"></div>
        </div>
      </DashboardShell>
    );
  }

  if (notFound || !property) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-building-4-line text-[#94A3B8] text-2xl"></i>
            </div>
            <p className="text-lg font-medium text-[#3A3F3A]">Property not found</p>
            <p className="text-sm text-[#687068] mt-1">This property may have been removed or you don't have access.</p>
            <Link href="/dashboard/portfolio" className="inline-block mt-4 text-sm font-medium text-[#C28A78] hover:underline">
              Back to Portfolio
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const ownerStatus = property.ownerPortal || "not-invited";
  const tenantStatus = property.tenantPortal || "not-invited";

  const attentionItems = getAttentionItems(property);
  const upcomingItems = getUpcomingItems(property);
  const activityFeed = getActivityFeed(property);
  const complianceItems = getComplianceItems(property);
  const maintenanceJobs = getMaintenanceDemo(property);
  const inspectionsData = getInspectionsDemo();
  const documents = getDocumentsDemo();

  const mainAction = (() => {
    if (property.complianceStatus === "Overdue") return { label: "Resolve Compliance", icon: "ri-shield-check-line" };
    if (property.status === "Vacant") return { label: "Add Tenancy", icon: "ri-file-text-line" };
    if (property.maintenanceOpen > 0) return { label: "View Maintenance", icon: "ri-tools-line" };
    if (property.tenantPortal === "not-invited" && property.tenantName) return { label: "Invite Tenant", icon: "ri-user-3-line" };
    if (property.ownerPortal === "not-invited" && property.landlordName) return { label: "Invite Owner", icon: "ri-user-star-line" };
    return { label: "Edit Property", icon: "ri-edit-line" };
  })();

  const tabs = [
    { id: "overview", label: "Overview", icon: "ri-file-list-line" },
    { id: "tenancy", label: "Tenancy & Rent", icon: "ri-money-pound-circle-line" },
    { id: "compliance", label: "Compliance", icon: "ri-shield-check-line" },
    { id: "maintenance", label: "Maintenance", icon: "ri-tools-line" },
    { id: "inspections", label: "Inspections", icon: "ri-clipboard-line" },
    { id: "documents", label: "Documents", icon: "ri-folder-line" },
    { id: "financials", label: "Financials", icon: "ri-line-chart-line" },
    { id: "activity", label: "Activity", icon: "ri-history-line" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* SECTION 1 — Compact Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/portfolio" className="hover:text-[#C28A78] transition-colors">Portfolio</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <Link href="/dashboard/properties" className="hover:text-[#C28A78] transition-colors">Properties</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-[#3A3F3A] font-medium">{property.address}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 hidden sm:block">
                <img src={property.image} alt={property.address} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#3A3F3A]">{property.address}</h1>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[property.status] || "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                    {property.status}
                  </span>
                </div>
                <p className="text-sm text-[#687068] mt-1">{property.city}, {property.postcode} · {property.type} · {property.bedrooms} bed · {property.nationLabel}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Ref: {property.id} · Added {property.dateAdded}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${mainAction.icon} text-sm`}></i>
                </div>
                {mainAction.label}
              </button>
              <div className="relative more-menu-trigger">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-colors"
                >
                  <i className="ri-more-2-fill text-[#687068] text-sm"></i>
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-30 min-w-[200px] py-1">
                    {[
                      { label: "Edit Property", icon: "ri-edit-line" },
                      { label: "Upload Document", icon: "ri-upload-line" },
                      { label: "Generate Report", icon: "ri-file-chart-line" },
                      { label: "Print Summary", icon: "ri-printer-line" },
                      { label: "Manage Portal Access", icon: "ri-macbook-line" },
                      { label: "View Audit History", icon: "ri-history-line" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setShowMoreMenu(false); showToast(`${item.label} — coming soon`); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${item.icon} text-[#687068] text-xs`}></i>
                        </div>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — Attention Required */}
        <div>
          {attentionItems.length > 0 ? (
            <div className="bg-[#FEF9F5] border border-[#F59E0B]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-alert-line text-[#F59E0B] text-sm"></i>
                </div>
                <h2 className="text-sm font-semibold text-[#3A3F3A]">Requires Attention</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {attentionItems.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-[#D5D9D5] p-3.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        item.priority === "Critical" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                        item.priority === "High" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                        "bg-[#3B82F6]/10 text-[#3B82F6]"
                      }`}>{item.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-[#3A3F3A] truncate">{item.title}</p>
                    <p className="text-xs text-[#687068] mt-0.5">{item.related} · {item.due}</p>
                    <button className="mt-2 text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap">
                      {item.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#F0F9F0] border border-[#7A9A7E]/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-check-line text-[#7A9A7E]"></i>
              </div>
              <p className="text-sm text-[#3A3F3A]">No urgent action required — this property is currently up to date.</p>
            </div>
          )}
        </div>

        {/* SECTION 3 — Property Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Occupancy", value: property.status, icon: property.status === "Occupied" ? "ri-user-3-line" : "ri-home-4-line", sub: property.tenantName || "Vacant", status: property.status === "Occupied" ? "good" : property.status === "Vacant" ? "warn" : "neutral" },
            { label: "Monthly Rent", value: property.rentAmount > 0 ? `£${property.rentAmount.toLocaleString()}` : "—", icon: "ri-money-pound-circle-line", sub: property.rentAmount > 0 ? "pcm" : "not set", status: property.rentAmount > 0 ? "good" : "neutral" },
            { label: "Compliance", value: property.complianceStatus, icon: "ri-shield-check-line", sub: property.epcRating ? `EPC ${property.epcRating}` : "—", status: property.complianceStatus === "Valid" ? "good" : property.complianceStatus === "Overdue" ? "bad" : "warn" },
            { label: "Maintenance", value: property.maintenanceOpen > 0 ? `${property.maintenanceOpen} open` : "None", icon: "ri-tools-line", sub: property.maintenanceOpen > 0 ? "needs attention" : "all clear", status: property.maintenanceOpen > 0 ? "warn" : "good" },
            { label: "Health Score", value: "View", icon: "ri-heart-pulse-line", sub: "Property health", status: "neutral" },
          ].map((card) => {
            const statusColor =
              card.status === "good" ? "text-[#7A9A7E]" :
              card.status === "bad" ? "text-[#EF4444]" :
              card.status === "warn" ? "text-[#F59E0B]" : "text-[#687068]";
            const statusBg =
              card.status === "good" ? "bg-[#7A9A7E]/10" :
              card.status === "bad" ? "bg-[#EF4444]/10" :
              card.status === "warn" ? "bg-[#F59E0B]/10" : "bg-[#F1F5F9]";

            if (card.label === "Health Score") {
              return (
                <div key={card.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4">
                  <PropertyHealthScoreCard propertyId={property.id} propertyName={property.address} compact showLink={false} showReasons={false} />
                </div>
              );
            }

            return (
              <button
                key={card.label}
                onClick={() => {
                  if (card.label === "Occupancy") setActiveTab("tenancy");
                  else if (card.label === "Monthly Rent") setActiveTab("financials");
                  else if (card.label === "Compliance") setActiveTab("compliance");
                  else if (card.label === "Maintenance") setActiveTab("maintenance");
                }}
                className="bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:border-[#C28A78] hover:shadow-sm transition-all cursor-pointer"
              >
                <div className={`w-9 h-9 ${statusBg} rounded-lg flex items-center justify-center mb-3`}>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${card.icon} ${statusColor} text-sm`}></i>
                  </div>
                </div>
                <p className={`text-lg font-bold ${card.status === "bad" ? "text-[#EF4444]" : card.status === "warn" ? "text-[#F59E0B]" : "text-[#3A3F3A]"}`}>{card.value}</p>
                <p className="text-xs text-[#687068]">{card.label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{card.sub}</p>
              </button>
            );
          })}
        </div>

        {/* SECTION 4 — Key People */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#3A3F3A]">People &amp; Tenancy</h2>
            <div className="flex items-center gap-2">
              {property.tenantName && <button onClick={() => setShowTenantModal(true)} className="text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap">Change</button>}
              {property.landlordName && <button onClick={() => setShowOwnerModal(true)} className="text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap">Change</button>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${property.tenantName ? "bg-[#8B5CF6]" : "bg-[#D5D9D5]"}`}>
                {property.tenantName ? property.tenantName.split(" ").map((n) => n[0]).join("") : <i className="ri-user-3-line"></i>}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3A3F3A] truncate">{property.tenantName || "Vacant"}</p>
                <p className="text-xs text-[#687068]">Tenant</p>
                {property.tenantName && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${portalStyles[tenantStatus]}`}>{portalLabels[tenantStatus]}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${property.landlordName ? "bg-[#3B82F6]" : "bg-[#D5D9D5]"}`}>
                {property.landlordName ? property.landlordName.split(" ").map((n) => n[0]).join("") : <i className="ri-user-star-line"></i>}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3A3F3A] truncate">{property.landlordName || "Not assigned"}</p>
                <p className="text-xs text-[#687068]">Owner</p>
                {property.landlordName && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${portalStyles[ownerStatus]}`}>{portalLabels[ownerStatus]}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <i className="ri-briefcase-line text-[#687068] text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">{property.propertyManager || "Unassigned"}</p>
                <p className="text-xs text-[#687068]">Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-line text-[#687068] text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">{property.tenancyStart ? `${property.tenancyStart} → ${property.tenancyEnd || "—"}` : "No tenancy"}</p>
                <p className="text-xs text-[#687068]">Tenancy Dates</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 — Upcoming Activity */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#3A3F3A]">Upcoming Activity</h2>
            <Link href={`/dashboard/property/${property.id}`} className="text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap">
              View full timeline →
            </Link>
          </div>
          {upcomingItems.length > 0 ? (
            <div className="space-y-2">
              {upcomingItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[#FBF9F4] transition-colors">
                  <span className="text-xs text-[#687068] w-24 flex-shrink-0">{item.date}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    item.type === "Rent" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                    item.type === "Compliance" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                    item.type === "Inspection" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                    item.type === "Tenancy" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" :
                    "bg-[#7A9A7E]/10 text-[#7A9A7E]"
                  }`}>{item.type}</span>
                  <span className="text-sm text-[#3A3F3A] flex-1 min-w-0 truncate">{item.label}</span>
                  {item.related && <span className="text-xs text-[#687068] flex-shrink-0">{item.related}</span>}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    item.status === "overdue" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                    item.status === "expiring" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                    item.status === "scheduled" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                    "bg-[#7A9A7E]/10 text-[#7A9A7E]"
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#94A3B8]">No upcoming events for this property</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center border-b border-[#D5D9D5] overflow-x-auto px-1 py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors mx-0.5 ${
                  activeTab === tab.id
                    ? "bg-[#C28A78] text-white"
                    : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${tab.icon} text-xs`}></i>
                </div>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
                  <img src={property.image} alt={property.address} className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <i className="ri-hotel-bed-line text-white text-xs"></i>
                      <span className="text-xs text-white font-medium">{property.bedrooms} Beds</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <span className="text-xs text-white font-medium">{property.nationLabel}</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <span className="text-xs text-white font-medium">EPC {property.epcRating}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-5">
                      <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Property Details</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          ["Address", property.address], ["City", property.city], ["Postcode", property.postcode],
                          ["Type", property.type], ["Bedrooms", String(property.bedrooms)], ["Bathrooms", String(property.bathrooms)],
                          ["Nation", property.nationLabel], ["Status", property.status], ["EPC", property.epcRating],
                          ["HMO", property.isHmo ? "Yes" : "No"], ["Furnished", property.isFurnished ? "Yes" : "No"], ["Date Added", property.dateAdded],
                        ].map(([label, val]) => (
                          <div key={label as string}>
                            <p className="text-xs text-[#94A3B8] mb-0.5">{label}</p>
                            <p className="text-sm font-medium text-[#3A3F3A]">{val || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-5">
                      <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Summary</h3>
                      <div className="space-y-3">
                        {[
                          ["Owner", property.landlordName || "—"],
                          ["Tenant", property.tenantName || "—"],
                          ["Tenancy", property.status],
                          ["Compliance", property.complianceStatus || "—"],
                          ["Maintenance", String(property.maintenanceOpen)],
                        ].map(([label, val]) => (
                          <div key={label as string} className="flex items-center justify-between text-sm">
                            <span className="text-[#687068]">{label}</span>
                            <span className={`font-medium ${label === "Compliance" ? (complianceStyles[val] || "text-[#3A3F3A]") : label === "Tenancy" ? (statusStyles[val] || "text-[#3A3F3A]") : label === "Maintenance" && property.maintenanceOpen > 0 ? "text-[#EF4444]" : "text-[#3A3F3A]"}`}>
                              {label === "Compliance" ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${complianceStyles[val] || ""}`}>{val}</span> :
                               label === "Tenancy" ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[val] || ""}`}>{val}</span> : val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-5">
                      <PropertyHealthScoreCard propertyId={property.id} propertyName={property.address} showLink={false} />
                    </div>
                  </div>
                </div>

                {/* Recent Activity in Overview */}
                <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">Recent Activity</h3>
                    <button onClick={() => setActiveTab("activity")} className="text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap">View all</button>
                  </div>
                  <div className="space-y-2">
                    {activityFeed.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <i className={`${item.icon} text-xs`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#3A3F3A]">{item.desc}</p>
                          <p className="text-xs text-[#94A3B8]">{item.related}</p>
                        </div>
                        <span className="text-xs text-[#94A3B8] flex-shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tenancy & Rent Tab */}
            {activeTab === "tenancy" && (
              <div className="space-y-6">
                {property.tenancyStart ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Start Date", value: property.tenancyStart, icon: "ri-calendar-line", color: "bg-[#3B82F6]" },
                        { label: "End Date", value: property.tenancyEnd || "—", icon: "ri-calendar-check-line", color: "bg-[#7A9A7E]" },
                        { label: "Monthly Rent", value: property.rentAmount > 0 ? `£${property.rentAmount.toLocaleString()}` : "—", icon: "ri-money-pound-circle-line", color: "bg-[#F59E0B]" },
                        { label: "Deposit", value: property.depositAmount > 0 ? `£${property.depositAmount.toLocaleString()}` : "—", icon: "ri-bank-line", color: "bg-[#8B5CF6]" },
                      ].map((item) => (
                        <div key={item.label} className="bg-[#FBF9F4] rounded-lg border border-[#D5D9D5] p-4 flex items-center gap-3">
                          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <i className={`${item.icon} text-white text-sm`}></i>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-[#3A3F3A]">{item.value}</p>
                            <p className="text-xs text-[#687068]">{item.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-5">
                      <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Tenancy Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          ["Status", property.status], ["Type", "Assured Shorthold Tenancy (AST)"],
                          ["Tenant", property.tenantName || "—"], ["Landlord", property.landlordName || "—"],
                          ["Deposit Scheme", "DPS (Deposit Protection Service)"], ["Deposit Ref", "DPS-2025-08214-A"],
                          ["Rent Due Date", "15th of each month"], ["Next Review", property.tenancyEnd || "—"],
                        ].map(([label, val]) => (
                          <div key={label as string}>
                            <p className="text-xs text-[#94A3B8] mb-0.5">{label}</p>
                            <p className="text-sm font-medium text-[#3A3F3A]">{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {property.rentAmount > 0 && (
                      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                        <div className="px-5 py-3 border-b border-[#D5D9D5] bg-[#FBF9F4]">
                          <h3 className="text-sm font-semibold text-[#3A3F3A]">Rent Payment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[#D5D9D5]">
                                <th className="text-left px-5 py-3 font-medium text-[#687068]">Period</th>
                                <th className="text-left px-5 py-3 font-medium text-[#687068]">Amount</th>
                                <th className="text-left px-5 py-3 font-medium text-[#687068]">Status</th>
                                <th className="text-left px-5 py-3 font-medium text-[#687068]">Paid On</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D5D9D5]">
                              {[
                                { period: "Jul 2026", amount: `£${property.rentAmount.toLocaleString()}`, status: "Paid", paidOn: "2026-07-03" },
                                { period: "Jun 2026", amount: `£${property.rentAmount.toLocaleString()}`, status: "Paid", paidOn: "2026-06-01" },
                                { period: "May 2026", amount: `£${property.rentAmount.toLocaleString()}`, status: "Paid", paidOn: "2026-05-04" },
                              ].map((entry, idx) => (
                                <tr key={idx} className="hover:bg-[#FBF9F4] transition-colors">
                                  <td className="px-5 py-3 font-medium text-[#3A3F3A]">{entry.period}</td>
                                  <td className="px-5 py-3 text-[#3A3F3A]">{entry.amount}</td>
                                  <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#7A9A7E]/10 text-[#7A9A7E]">{entry.status}</span></td>
                                  <td className="px-5 py-3 text-[#687068]">{entry.paidOn}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-file-text-line text-[#94A3B8] text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">No Tenancy Record</h3>
                    <p className="text-sm text-[#687068] mb-4 max-w-md mx-auto">Create a tenancy to link a tenant to this property with rent, deposit, and date details.</p>
                    <button className="bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
                      Create Tenancy
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === "compliance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Compliance Score", value: property.complianceStatus === "Valid" ? "85/100" : property.complianceStatus === "Expiring Soon" ? "60/100" : "30/100", color: property.complianceStatus === "Valid" ? "text-[#7A9A7E]" : property.complianceStatus === "Expiring Soon" ? "text-[#F59E0B]" : "text-[#EF4444]" },
                    { label: "Items Compliant", value: `${complianceItems.filter((c) => c.status === "valid").length}/${complianceItems.filter((c) => c.status !== "n-a").length}`, color: "text-[#3A3F3A]" },
                    { label: "Expiring Within 90 Days", value: String(complianceItems.filter((c) => c.status === "expiring").length), color: "text-[#F59E0B]" },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#FBF9F4] rounded-lg border border-[#D5D9D5] p-4 text-center">
                      <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-[#687068] mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {["All", "Action Required", "Valid", "Expired"].map((f) => (
                    <button key={f} className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${f === "All" ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"}`}>{f}</button>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                          <th className="text-left px-5 py-3 font-medium text-[#687068]">Certificate</th>
                          <th className="text-left px-5 py-3 font-medium text-[#687068]">Rating</th>
                          <th className="text-left px-5 py-3 font-medium text-[#687068]">Expiry Date</th>
                          <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                          <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D5D9D5]">
                        {complianceItems.map((item) => (
                          <tr key={item.type} className="hover:bg-[#FBF9F4] transition-colors">
                            <td className="px-5 py-3 font-medium text-[#3A3F3A]">{item.type}</td>
                            <td className="px-5 py-3 text-[#687068]">{(item as any).rating || "—"}</td>
                            <td className="px-5 py-3 text-[#687068]">{item.expiry}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                item.status === "valid" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" :
                                item.status === "expiring" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                                item.status === "overdue" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                                "bg-[#94A3B8]/10 text-[#94A3B8]"
                              }`}>
                                {item.status === "valid" ? "Valid" : item.status === "expiring" ? "Expiring" : item.status === "overdue" ? "Overdue" : "N/A"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {complianceItems.some((c) => c.status === "overdue" || c.status === "expiring") && (
                  <div className="bg-[#FEF2F2] rounded-xl border border-[#FECACA] p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <i className="ri-alert-line text-[#EF4444] text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#991B1B]">Compliance Alerts</p>
                        <ul className="mt-2 space-y-1">
                          {complianceItems.filter((c) => c.status === "overdue").map((c) => (
                            <li key={c.type} className="text-sm text-[#B91C1C] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full"></span>
                              {c.type} expired {c.expiry} — action required
                            </li>
                          ))}
                          {complianceItems.filter((c) => c.status === "expiring").map((c) => (
                            <li key={c.type} className="text-sm text-[#B45309] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></span>
                              {c.type} expires {c.expiry} — renew soon
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === "maintenance" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Maintenance Jobs ({maintenanceJobs.length})</h3>
                  <button className="text-sm font-medium text-[#C28A78] hover:text-[#143828] flex items-center gap-1 whitespace-nowrap">
                    <i className="ri-add-line text-sm"></i>
                    Log New Job
                  </button>
                </div>
                {maintenanceJobs.length > 0 ? (
                  <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                            <th className="text-left px-5 py-3 font-medium text-[#687068]">Job</th>
                            <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                            <th className="text-left px-5 py-3 font-medium text-[#687068]">Contractor</th>
                            <th className="text-left px-5 py-3 font-medium text-[#687068]">Priority</th>
                            <th className="text-right px-5 py-3 font-medium text-[#687068]">Cost</th>
                            <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D5D9D5]">
                          {maintenanceJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-[#FBF9F4] transition-colors">
                              <td className="px-5 py-3 font-medium text-[#3A3F3A]">{job.title}</td>
                              <td className="px-5 py-3 text-[#687068]">{job.date}</td>
                              <td className="px-5 py-3 text-[#687068]">{job.contractor}</td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  job.priority === "Urgent" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                                  job.priority === "High" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                                  "bg-[#3B82F6]/10 text-[#3B82F6]"
                                }`}>{job.priority}</span>
                              </td>
                              <td className="px-5 py-3 text-right font-medium text-[#3A3F3A]">{job.cost > 0 ? `£${job.cost}` : "—"}</td>
                              <td className="px-5 py-3 text-center">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                  job.status === "Completed" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" : "bg-[#3B82F6]/10 text-[#3B82F6]"
                                }`}>{job.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-tools-line text-[#94A3B8] text-xl"></i>
                    </div>
                    <p className="text-sm text-[#687068]">No open maintenance jobs — there are currently no reported issues.</p>
                  </div>
                )}
              </div>
            )}

            {/* Inspections Tab */}
            {activeTab === "inspections" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Inspections ({inspectionsData.length})</h3>
                  <button className="text-sm font-medium text-[#C28A78] hover:text-[#143828] flex items-center gap-1 whitespace-nowrap">
                    <i className="ri-add-line text-sm"></i>
                    Schedule Inspection
                  </button>
                </div>
                <PropertyQRCode propertyId={property.id} propertyName={property.address} propertyAddress={`${property.city}, ${property.postcode}`} />
                <div className="space-y-3">
                  {inspectionsData.map((insp) => (
                    <div key={insp.id} className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                            <i className="ri-clipboard-line text-[#3B82F6] text-lg"></i>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-[#3A3F3A]">{insp.type}</p>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                insp.status === "Completed" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" : "bg-[#3B82F6]/10 text-[#3B82F6]"
                              }`}>{insp.status}</span>
                              {insp.rating && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7A9A7E]/10 text-[#7A9A7E]">{insp.rating}</span>}
                            </div>
                            <p className="text-xs text-[#687068] mt-0.5">{insp.date} · {insp.inspector}</p>
                          </div>
                        </div>
                        {insp.report && (
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#D5D9D5] transition-colors">
                            <i className="ri-download-line text-[#687068] text-sm"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Property Documents ({documents.length})</h3>
                  <button className="text-sm font-medium text-[#C28A78] hover:text-[#143828] flex items-center gap-1 whitespace-nowrap">
                    <i className="ri-upload-line text-sm"></i>
                    Upload Document
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                  </div>
                  <input type="text" placeholder="Search documents..." className="flex-1 text-sm text-[#3A3F3A] outline-none bg-transparent" />
                </div>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4 hover:shadow-sm transition-shadow">
                      <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-file-text-line text-[#C28A78] text-lg"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#94A3B8]">{doc.type}</span>
                          <span className="text-xs text-[#94A3B8]">·</span>
                          <span className="text-xs text-[#94A3B8]">{doc.date}</span>
                          <span className="text-xs text-[#94A3B8]">·</span>
                          <span className="text-xs text-[#94A3B8]">{doc.size}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#94A3B8] bg-[#D5D9D5] px-2 py-0.5 rounded-full flex-shrink-0">{doc.linkedTo}</span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#D5D9D5] transition-colors flex-shrink-0">
                        <i className="ri-download-line text-[#687068] text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financials Tab */}
            {activeTab === "financials" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Monthly Rent Income", value: property.rentAmount > 0 ? `£${property.rentAmount.toLocaleString()}` : "—", icon: "ri-money-pound-circle-line", color: "bg-[#7A9A7E]" },
                    { label: "YTD Maintenance Spend", value: "£400", icon: "ri-tools-line", color: "bg-[#F59E0B]" },
                    { label: "Outstanding Arrears", value: "£0", icon: "ri-alert-line", color: "bg-[#3B82F6]" },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#FBF9F4] rounded-lg border border-[#D5D9D5] p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <i className={`${item.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#3A3F3A]">{item.value}</p>
                        <p className="text-xs text-[#687068]">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">Recent Transactions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#D5D9D5]">
                          <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                          <th className="text-left px-5 py-3 font-medium text-[#687068]">Description</th>
                          <th className="text-left px-5 py-3 font-medium text-[#687068]">Category</th>
                          <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D5D9D5]">
                        {[
                          { date: "2026-07-03", desc: `Rent - ${property.tenantName || "Tenant"}`, cat: "Rent Income", amount: property.rentAmount > 0 ? `+£${property.rentAmount.toLocaleString()}` : "—" },
                          { date: "2026-07-01", desc: "Management Fee", cat: "Fees", amount: property.rentAmount > 0 ? `-£${Math.round(property.rentAmount * 0.1).toLocaleString()}` : "—" },
                          { date: "2026-06-25", desc: "Lock replacement", cat: "Maintenance", amount: "—" },
                          { date: "2026-06-01", desc: `Rent - ${property.tenantName || "Tenant"}`, cat: "Rent Income", amount: property.rentAmount > 0 ? `+£${property.rentAmount.toLocaleString()}` : "—" },
                          { date: "2026-05-01", desc: "Periodic Inspection", cat: "Inspection", amount: "-£95" },
                        ].map((tx, idx) => (
                          <tr key={idx} className="hover:bg-[#FBF9F4] transition-colors">
                            <td className="px-5 py-3 text-[#687068]">{tx.date}</td>
                            <td className="px-5 py-3 text-[#3A3F3A]">{tx.desc}</td>
                            <td className="px-5 py-3 text-[#687068]">{tx.cat}</td>
                            <td className={`px-5 py-3 text-right font-medium ${tx.amount.startsWith("+") ? "text-[#7A9A7E]" : tx.amount.startsWith("-") ? "text-[#EF4444]" : "text-[#94A3B8]"}`}>{tx.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {["All", "Payments", "Documents", "Status", "Messages"].map((f) => (
                    <button key={f} className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${f === "All" ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"}`}>{f}</button>
                  ))}
                </div>
                <div className="space-y-2">
                  {activityFeed.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-3 px-4 bg-[#FBF9F4] rounded-lg border border-[#D5D9D5]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <i className={`${item.icon} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3F3A]">{item.desc}</p>
                        <p className="text-xs text-[#94A3B8]">{item.related}</p>
                      </div>
                      <span className="text-xs text-[#94A3B8] flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowOwnerModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">Assign Owner</h3>
              <button onClick={() => setShowOwnerModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <p className="text-sm text-[#687068] mb-4">Search and select an owner to link to this property.</p>
            <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white mb-4">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
              <input type="text" placeholder="Search by name or email..." className="flex-1 text-sm text-[#3A3F3A] outline-none bg-transparent" />
            </div>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {["James Richardson", "Sarah Chen", "David Olu", "Fiona MacLeod", "Gareth Williams", "Amir Khan"].map((name) => (
                <button key={name} className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-[#F1F5F9] text-sm text-[#3A3F3A] transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] text-xs font-bold">
                    {name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {name}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowOwnerModal(false)} className="flex-1 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
              <button onClick={() => { setShowOwnerModal(false); showToast("Owner assigned successfully"); }} className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors">Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTenantModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">Assign Tenant</h3>
              <button onClick={() => setShowTenantModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <p className="text-sm text-[#687068] mb-4">Search and select a tenant to link to this property.</p>
            <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white mb-4">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
              <input type="text" placeholder="Search by name or email..." className="flex-1 text-sm text-[#3A3F3A] outline-none bg-transparent" />
            </div>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {["John Miller", "Emily Watson", "Rachel Green", "Tom Baker", "Lisa Brown"].map((name) => (
                <button key={name} className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-[#F1F5F9] text-sm text-[#3A3F3A] transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-xs font-bold">
                    {name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {name}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowTenantModal(false)} className="flex-1 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
              <button onClick={() => { setShowTenantModal(false); showToast("Tenant assigned successfully"); }} className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors">Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modals */}
      {(showInviteOwner || showInviteTenant || showResendOwner || showResendTenant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setShowInviteOwner(false); setShowInviteTenant(false); setShowResendOwner(false); setShowResendTenant(false); }}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">
                {showResendOwner || showResendTenant ? "Resend Invite" : "Send Invite"} — {showInviteOwner || showResendOwner ? "Owner" : "Tenant"} Portal
              </h3>
              <button onClick={() => { setShowInviteOwner(false); setShowInviteTenant(false); setShowResendOwner(false); setShowResendTenant(false); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#687068] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={showInviteOwner || showResendOwner ? ownerEmail : tenantEmail}
                  onChange={(e) => showInviteOwner || showResendOwner ? setOwnerEmail(e.target.value) : setTenantEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] bg-white"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-xs text-[#687068] block mb-1">Message (optional)</label>
                <textarea
                  value={showInviteOwner || showResendOwner ? ownerMessage : tenantMessage}
                  onChange={(e) => showInviteOwner || showResendOwner ? setOwnerMessage(e.target.value) : setTenantMessage(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] bg-white resize-none"
                  rows={3}
                  placeholder="Add a personal message..."
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowInviteOwner(false); setShowInviteTenant(false); setShowResendOwner(false); setShowResendTenant(false); }} className="flex-1 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
              <button onClick={() => { setShowInviteOwner(false); setShowInviteTenant(false); setShowResendOwner(false); setShowResendTenant(false); showToast("Invite sent successfully!"); }} className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirm Modals */}
      {(showDisableOwner || showDisableTenant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setShowDisableOwner(false); setShowDisableTenant(false); }}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-[#EF4444] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Disable {showDisableOwner ? "Owner" : "Tenant"} Portal?</h3>
            <p className="text-sm text-[#687068] mb-6">This will revoke access. They will need a new invite to access the portal again.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDisableOwner(false); setShowDisableTenant(false); }} className="flex-1 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
              <button onClick={() => { setShowDisableOwner(false); setShowDisableTenant(false); showToast("Portal disabled"); }} className="flex-1 py-2.5 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors">Disable</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#7A9A7E]"></i>
          {toast}
        </div>
      )}
    </DashboardShell>
  );
}