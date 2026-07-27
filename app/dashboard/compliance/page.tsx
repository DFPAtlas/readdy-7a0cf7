"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import ComplianceActionCentre from "@/components/dashboard/ComplianceActionCentre";
import CompliancePropertyCard from "@/components/dashboard/CompliancePropertyCard";
import { isDemoAccount } from "@/lib/demoMode";
import { useEntitlements } from "@/lib/useEntitlements";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";
import {
  ComplianceStatusKey,
  getComplianceStatus,
  complianceStatusMap,
  LEGAL_DISCLAIMER,
  ComplianceActionItem,
  requirementTypeIcons,
  requirementTypeColors,
} from "@/lib/complianceStatus";
import {
  complianceItems as mockItems,
  propertyCompliance as mockPropertyCompliance,
  ComplianceItem,
  PropertyCompliance,
} from "./ComplianceData";

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 999;
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function computeStatusKey(daysLeft: number, obligationStatus: string): ComplianceStatusKey {
  const st = (obligationStatus || "").toLowerCase();
  if (st === "overdue" || st === "expired") return "expired";
  if (st === "non_compliant") return "action_required";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring_soon";
  if (daysLeft <= 999) return "valid";
  return "not_applicable";
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const obligationTypeLabels: Record<string, string> = {
  GAS_SAFETY: "Gas Safety Certificate", EICR: "EICR Report", EPC: "EPC Certificate",
  LEGIONELLA: "Legionella Assessment", SMOKE_ALARM: "Smoke Alarm Check", CO_ALARM: "Carbon Monoxide Check",
  HMO_LICENCE: "HMO Compliance", BUILDING_INSURANCE: "Building Insurance", FIRE_RISK: "Fire Risk Assessment",
};

const obligationCategories: Record<string, string> = {
  GAS_SAFETY: "Gas", EICR: "Electrical", EPC: "Energy", LEGIONELLA: "Water",
  SMOKE_ALARM: "Fire", CO_ALARM: "Gas", HMO_LICENCE: "Licensing", BUILDING_INSURANCE: "Insurance", FIRE_RISK: "Fire",
};

export default function CompliancePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [propertyDropdown, setPropertyDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "property" | "timeline">("list");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewItem, setRenewItem] = useState<ComplianceItem | null>(null);
  const [addForm, setAddForm] = useState({
    type: "Gas Safety Certificate", property: "p1", issuer: "", referenceNumber: "", expiryDate: "", notes: "",
  });
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [propertyCompliance, setPropertyCompliance] = useState<PropertyCompliance[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { isReadOnly } = useEntitlements();

  useEffect(() => {
    const demo = isDemoAccount();
    setDemoMode(demo);
    if (demo) {
      setComplianceItems(mockItems);
      setPropertyCompliance(mockPropertyCompliance);
      setLoading(false);
      return;
    }
    async function fetchData() {
      try {
        setLoading(true);
        const { data: items, error: itemsErr } = await supabase
          .from("property_compliance_items")
          .select("id, property_id, obligation_code, status, last_completed, next_due, document_id, exemption_ref");
        if (itemsErr) throw itemsErr;
        const { data: properties, error: propsErr } = await supabase
          .from("properties")
          .select("id, line1, city, postcode, is_hmo, managing_agency_id, bedrooms, epc_rating");
        if (propsErr) throw propsErr;
        const { data: compDocs, error: docsErr } = await supabase
          .from("compliance_documents")
          .select("id, property_id, document_type, certificate_number, issued_date, expiry_date, uploaded_file_url, verification_status, notes");
        if (docsErr) throw docsErr;
        const propMap = new Map<string, any>();
        (properties || []).forEach((p: any) => propMap.set(p.id, p));
        const docsByProp = new Map<string, any[]>();
        (compDocs || []).forEach((d: any) => {
          if (!docsByProp.has(d.property_id)) docsByProp.set(d.property_id, []);
          docsByProp.get(d.property_id)!.push(d);
        });
        const builtItems: ComplianceItem[] = [];
        const propStats = new Map<string, { valid: number; expiring: number; expired: number; total: number }>();
        (items || []).forEach((item: any) => {
          const prop = propMap.get(item.property_id);
          const propName = prop ? `${prop.line1}, ${prop.city} ${prop.postcode}` : item.property_id?.slice(0, 8) || "Unknown";
          const typeLabel = obligationTypeLabels[item.obligation_code] || "Compliance Item";
          const cat = obligationCategories[item.obligation_code] || "Other";
          const dl = daysUntil(item.next_due);
          const sk = computeStatusKey(dl, item.status);
          const sConfig = getComplianceStatus(sk);
          const propDocs = docsByProp.get(item.property_id) || [];
          const matchingDoc = propDocs.find((d: any) => d.document_type === typeLabel || d.document_type === item.obligation_code);
          builtItems.push({
            id: item.id, type: typeLabel, category: cat,
            propertyId: item.property_id, propertyName: propName,
            propertyAddress: prop ? `${prop.line1}, ${prop.city} ${prop.postcode}` : "",
            status: sConfig.label, expiryDate: formatDate(item.next_due), daysLeft: dl,
            issuedDate: matchingDoc?.issued_date ? formatDate(matchingDoc.issued_date) : formatDate(item.last_completed),
            issuer: matchingDoc?.certificate_number || "—", referenceNumber: matchingDoc?.certificate_number || "—",
            documentUrl: matchingDoc?.uploaded_file_url || "#", notes: matchingDoc?.notes || "",
            icon: requirementTypeIcons[typeLabel] || "ri-shield-check-line", color: requirementTypeColors[typeLabel] || "bg-[#687068]",
            requiredByLaw: true, renewalPeriod: "", lastAction: item.status, lastActionDate: formatDate(item.last_completed),
          });
          const pid = item.property_id;
          if (!propStats.has(pid)) propStats.set(pid, { valid: 0, expiring: 0, expired: 0, total: 0 });
          const ps = propStats.get(pid)!; ps.total++;
          if (sConfig.key === "valid" || sConfig.key === "not_applicable") ps.valid++;
          else if (sConfig.key === "expiring_soon") ps.expiring++;
          else ps.expired++;
        });
        setComplianceItems(builtItems);
        const builtProps: PropertyCompliance[] = [];
        propStats.forEach((stats, pid) => {
          const prop = propMap.get(pid);
          let overall = "Compliant";
          if (stats.expired > 0) overall = "Critical";
          else if (stats.expiring > 0) overall = "Attention";
          builtProps.push({
            propertyId: pid, propertyName: prop ? prop.line1 : pid.slice(0, 8),
            address: prop?.line1 || "", city: prop?.city || "", postcode: prop?.postcode || "",
            type: prop?.is_hmo ? "HMO" : "Standard", isHMO: prop?.is_hmo || false,
            complianceItems: [], overallStatus: overall,
            compliantCount: stats.valid, expiringSoonCount: stats.expiring, expiredCount: stats.expired, totalCount: stats.total,
            lastAuditDate: "—",
            image: "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20property%20exterior%2C%20brick%20facade%2C%20well%20maintained%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20muted%20tones%20and%20warm%20neutral%20colours%2C%20overcast%20British%20sky&width=320&height=200&seq=comp-prop-a1&orientation=landscape",
          });
        });
        setPropertyCompliance(builtProps);
      } catch (err: any) {
        setError(err.message || "Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useRealtimeSubscription({
    table: "property_compliance_items", event: "*",
    onChange: () => {
      if (demoMode) return;
      async function refetch() {
        try {
          const { data: items } = await supabase.from("property_compliance_items").select("id, property_id, obligation_code, status, last_completed, next_due, document_id, exemption_ref");
          if (!items || items.length === 0) { setComplianceItems([]); setPropertyCompliance([]); return; }
          const propertyIds = [...new Set(items.map((i: any) => i.property_id))];
          const { data: properties } = await supabase.from("properties").select("id, line1, city, postcode, is_hmo").in("id", propertyIds);
          const { data: compDocs } = await supabase.from("compliance_documents").select("id, property_id, document_type, certificate_number, issued_date, expiry_date, uploaded_file_url, verification_status, notes").in("property_id", propertyIds);
          const propMap = new Map<string, any>(); (properties || []).forEach((p: any) => propMap.set(p.id, p));
          const docsByProp = new Map<string, any[]>(); (compDocs || []).forEach((d: any) => { if (!docsByProp.has(d.property_id)) docsByProp.set(d.property_id, []); docsByProp.get(d.property_id)!.push(d); });
          const builtItems: ComplianceItem[] = [];
          const propStats = new Map<string, { valid: number; expiring: number; expired: number; total: number }>();
          (items || []).forEach((item: any) => {
            const prop = propMap.get(item.property_id); const typeLabel = obligationTypeLabels[item.obligation_code] || "Compliance Item";
            const dl = daysUntil(item.next_due); const sk = computeStatusKey(dl, item.status); const sConfig = getComplianceStatus(sk);
            const propDocs = docsByProp.get(item.property_id) || []; const matchingDoc = propDocs.find((d: any) => d.document_type === typeLabel || d.document_type === item.obligation_code);
            builtItems.push({
              id: item.id, type: typeLabel, category: obligationCategories[item.obligation_code] || "Other",
              propertyId: item.property_id, propertyName: prop ? `${prop.line1}, ${prop.city} ${prop.postcode}` : "Unknown",
              propertyAddress: prop ? `${prop.line1}, ${prop.city} ${prop.postcode}` : "",
              status: sConfig.label, expiryDate: formatDate(item.next_due), daysLeft: dl,
              issuedDate: matchingDoc?.issued_date ? formatDate(matchingDoc.issued_date) : formatDate(item.last_completed),
              issuer: matchingDoc?.certificate_number || "—", referenceNumber: matchingDoc?.certificate_number || "—",
              documentUrl: matchingDoc?.uploaded_file_url || "#", notes: matchingDoc?.notes || "",
              icon: requirementTypeIcons[typeLabel] || "ri-shield-check-line", color: requirementTypeColors[typeLabel] || "bg-[#687068]",
              requiredByLaw: true, renewalPeriod: "", lastAction: item.status, lastActionDate: formatDate(item.last_completed),
            });
            const pid = item.property_id;
            if (!propStats.has(pid)) propStats.set(pid, { valid: 0, expiring: 0, expired: 0, total: 0 });
            const ps = propStats.get(pid)!; ps.total++;
            if (sk === "valid" || sk === "not_applicable") ps.valid++; else if (sk === "expiring_soon") ps.expiring++; else ps.expired++;
          });
          setComplianceItems(builtItems);
          const builtProps: PropertyCompliance[] = [];
          propStats.forEach((stats, pid) => {
            const prop = propMap.get(pid);
            builtProps.push({
              propertyId: pid, propertyName: prop ? prop.line1 : pid.slice(0, 8),
              address: prop?.line1 || "", city: prop?.city || "", postcode: prop?.postcode || "",
              type: prop?.is_hmo ? "HMO" : "Standard", isHMO: prop?.is_hmo || false, complianceItems: [],
              overallStatus: stats.expired > 0 ? "Critical" : stats.expiring > 0 ? "Attention" : "Compliant",
              compliantCount: stats.valid, expiringSoonCount: stats.expiring, expiredCount: stats.expired, totalCount: stats.total,
              lastAuditDate: "—",
              image: "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20property%20exterior%2C%20brick%20facade%2C%20well%20maintained%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20muted%20tones%20and%20warm%20neutral%20colours%2C%20overcast%20British%20sky&width=320&height=200&seq=comp-prop-a1&orientation=landscape",
            });
          });
          setPropertyCompliance(builtProps);
        } catch {}
      }
      refetch();
    },
    channelName: "rt-compliance-items", debounceMs: 500,
  });

  const criticalCount = complianceItems.filter((i) => i.status === "Critical").length;
  const expiredCount = complianceItems.filter((i) => i.status === "Expired").length;
  const expiringCount = complianceItems.filter((i) => i.status === "Expiring Soon").length;
  const validCount = complianceItems.filter((i) => i.status === "Valid").length;
  const actionCount = complianceItems.filter((i) => i.status === "Action Required").length;

  const totalCriticalExpiredMissing = criticalCount + expiredCount + actionCount;
  const portfolioRate = complianceItems.length > 0 ? Math.round((validCount / complianceItems.length) * 100) : 0;

  const filteredItems = useMemo(() => {
    return complianceItems.filter((item) => {
      const matchesSearch = item.type.toLowerCase().includes(search.toLowerCase()) || item.propertyName.toLowerCase().includes(search.toLowerCase()) || item.referenceNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesProperty = propertyFilter === "All" || item.propertyId === propertyFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesProperty;
    });
  }, [search, statusFilter, categoryFilter, propertyFilter, complianceItems]);

  const filteredByTab = useMemo(() => {
    if (activeTab === "all") return filteredItems;
    if (activeTab === "critical") return filteredItems.filter((i) => i.status === "Critical");
    if (activeTab === "expired") return filteredItems.filter((i) => i.status === "Expired");
    if (activeTab === "expiring") return filteredItems.filter((i) => i.status === "Expiring Soon");
    if (activeTab === "action") return filteredItems.filter((i) => i.status === "Action Required");
    if (activeTab === "valid") return filteredItems.filter((i) => i.status === "Valid");
    return filteredItems;
  }, [filteredItems, activeTab]);

  const actionItems: ComplianceActionItem[] = useMemo(() => {
    const actions = complianceItems
      .filter((i) => i.status === "Critical" || i.status === "Expired" || i.status === "Action Required" || i.status === "Expiring Soon")
      .slice(0, 6)
      .map((i): ComplianceActionItem => ({
        id: i.id,
        priority: i.status === "Critical" ? "critical" : i.status === "Expired" ? "critical" : i.status === "Action Required" ? "warning" : "warning",
        title: `${i.type} ${i.status === "Critical" ? "Critical" : i.status === "Expired" ? "Expired" : i.status === "Action Required" ? "Requires Action" : "Expiring Soon"}`,
        property: i.propertyName,
        requirementType: i.type,
        status: (complianceStatusMap[i.status] || "expired") as ComplianceStatusKey,
        deadline: i.expiryDate,
        responsiblePerson: i.issuer,
        actionLabel: i.status === "Expiring Soon" ? "Schedule Renewal" : "Resolve Now",
        propertyId: i.propertyId,
      }));
    return actions;
  }, [complianceItems]);

  const categories = [
    { label: "All", value: "All" },
    { label: "Gas", value: "Gas" },
    { label: "Electrical", value: "Electrical" },
    { label: "Energy", value: "Energy" },
    { label: "Water", value: "Water" },
    { label: "Fire", value: "Fire" },
    { label: "Licensing", value: "Licensing" },
    { label: "Insurance", value: "Insurance" },
  ];

  const handleRenew = () => { setShowRenewModal(false); setRenewItem(null); };
  const handleAdd = () => {
    setShowAddModal(false);
    setAddForm({ type: "Gas Safety Certificate", property: "p1", issuer: "", referenceNumber: "", expiryDate: "", notes: "" });
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-[#687068]">Loading compliance data...</span>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#FEF2F2] rounded-full flex items-center justify-center">
            <i className="ri-error-warning-line text-[#C46868] text-2xl"></i>
          </div>
          <p className="text-sm font-medium text-[#C46868]">Failed to load compliance data</p>
          <p className="text-xs text-[#687068] mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#C28A78] font-medium hover:underline">Try again</button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Compliance</h1>
            <p className="text-sm text-[#687068] mt-1">Track certificates, legal requirements and expiry dates across your portfolio</p>
          </div>
          {demoMode && (
            <DemoHelperTip id="compliance-overview" title="Compliance Monitoring">
              Compliance records are monitored by n8n agents for expiry dates, alerts and risk scoring. Each certificate type — gas safety, EICR, EPC — has its own renewal cycle. Properties are risk-scored based on compliance health.
            </DemoHelperTip>
          )}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/compliance-advisor" className="text-sm text-[#8A9FB0] hover:text-[#C28A78] font-medium flex items-center gap-1 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[#EBE5DA] transition-colors">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-brain-line text-sm"></i>
              </div>
              Advisor
            </Link>
            <Link href="/dashboard/compliance-timeline" className="text-sm text-[#8A9FB0] hover:text-[#C28A78] font-medium flex items-center gap-1 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[#EBE5DA] transition-colors">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-calendar-line text-sm"></i>
              </div>
              Timeline
            </Link>
            <Link href="/dashboard/compliance-marketplace" className="text-sm text-[#8A9FB0] hover:text-[#C28A78] font-medium flex items-center gap-1 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[#EBE5DA] transition-colors">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-store-2-line text-sm"></i>
              </div>
              Marketplace
            </Link>
            {isReadOnly ? (
              <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2 text-sm text-[#DC2626]">
                <i className="ri-lock-line text-sm"></i>
                <span className="whitespace-nowrap">Upgrade to add</span>
              </div>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line text-sm"></i>
                </div>
                Add Record
              </button>
            )}
          </div>
        </div>

        {totalCriticalExpiredMissing > 0 && (
          <div className="flex items-start gap-3 bg-[#C46868]/10 border border-[#C46868]/20 rounded-lg px-4 py-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#C46868] rounded-lg flex-shrink-0 mt-0.5">
              <i className="ri-error-warning-line text-white text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#C46868]">
                {totalCriticalExpiredMissing} compliance issue{totalCriticalExpiredMissing > 1 ? "s" : ""} require{totalCriticalExpiredMissing === 1 ? "s" : ""} attention
              </p>
              <p className="text-xs text-[#687068]">{criticalCount} critical · {expiredCount} expired · {actionCount} action required</p>
            </div>
            <button onClick={() => setActiveTab("expired")} className="text-xs font-medium text-[#C46868] hover:underline whitespace-nowrap mt-1">
              View issues
            </button>
          </div>
        )}

        {expiringCount > 0 && totalCriticalExpiredMissing === 0 && (
          <div className="flex items-center gap-3 bg-[#D4A85C]/10 border border-[#D4A85C]/20 rounded-lg px-4 py-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#D4A85C] rounded-lg flex-shrink-0">
              <i className="ri-time-line text-white text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#D4A85C]">{expiringCount} certificate{expiringCount > 1 ? "s" : ""} expiring within 30 days</p>
              <p className="text-xs text-[#687068]">Schedule renewals before expiry</p>
            </div>
            <button onClick={() => setActiveTab("expiring")} className="text-xs font-medium text-[#D4A85C] hover:underline whitespace-nowrap">
              View expiring
            </button>
          </div>
        )}

        <ComplianceActionCentre
          actions={actionItems}
          onActionClick={(action) => {
            const item = complianceItems.find((i) => i.id === action.id);
            if (item) setSelectedItem(item);
          }}
          onViewAll={() => setActiveTab("expired")}
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Critical Issues", value: criticalCount + expiredCount, key: "critical", bg: "bg-[#C46868]", icon: "ri-error-warning-line", color: "text-[#C46868]" },
            { label: "Expiring Soon", value: expiringCount, key: "expiring", bg: "bg-[#D4A85C]", icon: "ri-time-line", color: "text-[#D4A85C]" },
            { label: "Scheduled", value: 0, key: "scheduled", bg: "bg-[#8A9FB0]", icon: "ri-calendar-check-line", color: "text-[#8A9FB0]" },
            { label: "Valid", value: validCount, key: "valid", bg: "bg-[#7A9A7E]", icon: "ri-check-line", color: "text-[#7A9A7E]" },
            { label: "Portfolio Rate", value: `${portfolioRate}%`, key: "rate", bg: "bg-[#8B5CF6]", icon: "ri-pie-chart-line", color: "text-[#8B5CF6]" },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => {
                if (stat.key === "critical") { setActiveTab("expired"); setViewMode("list"); }
                else if (stat.key === "expiring") { setActiveTab("expiring"); setViewMode("list"); }
                else if (stat.key === "valid") { setActiveTab("valid"); setViewMode("list"); }
                else if (stat.key === "scheduled") { setViewMode("timeline"); }
              }}
              className="bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:shadow-md hover:border-[#C28A78] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 flex items-center justify-center ${stat.bg} rounded-md`}>
                  <i className={`${stat.icon} text-white text-xs`}></i>
                </div>
                <span className="text-xs text-[#687068]">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-[#D5D9D5] bg-white p-1">
            {([
              { key: "list", label: "Requirements", icon: "ri-list-check-2" },
              { key: "property", label: "By Property", icon: "ri-building-line" },
              { key: "timeline", label: "Timeline", icon: "ri-calendar-line" },
            ]).map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key as "list" | "property" | "timeline")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === v.key ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <i className={`${v.icon} text-xs`}></i>
                </div>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certificates, properties..." className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
          </div>
          <div className="relative">
            <button onClick={() => setStatusDropdown(!statusDropdown)} className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]">
              <span>Status: {statusFilter}</span>
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i></div>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[160px]">
                {["All", "Critical", "Expired", "Action Required", "Expiring Soon", "Valid", "N/A"].map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setStatusDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#EBE5DA]">{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setCategoryDropdown(!categoryDropdown)} className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]">
              <span>Category: {categoryFilter}</span>
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i></div>
            </button>
            {categoryDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[160px]">
                {categories.map((c) => (
                  <button key={c.value} onClick={() => { setCategoryFilter(c.value); setCategoryDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#EBE5DA]">{c.label}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setPropertyDropdown(!propertyDropdown)} className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]">
              <span>Property: {propertyFilter === "All" ? "All" : propertyCompliance.find((p) => p.propertyId === propertyFilter)?.propertyName || propertyFilter}</span>
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i></div>
            </button>
            {propertyDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[200px]">
                {[{ propertyId: "All", propertyName: "All Properties" }, ...propertyCompliance].map((p) => (
                  <button key={p.propertyId} onClick={() => { setPropertyFilter(p.propertyId); setPropertyDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#EBE5DA]">{p.propertyName}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "expired", label: "Expired" },
            { key: "expiring", label: "Expiring Soon" },
            { key: "action", label: "Action Required" },
            { key: "valid", label: "Valid" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.key ? "bg-[#C28A78] text-white" : "bg-[#EBE5DA] text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredByTab.map((item) => {
              const sKey = complianceStatusMap[item.status] || "valid";
              const sConfig = getComplianceStatus(sKey as ComplianceStatusKey);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#D5D9D5] p-5 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 ${requirementTypeColors[item.type] || item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className={`${requirementTypeIcons[item.type] || item.icon} text-white text-lg`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#3A3F3A] truncate">{item.type}</h3>
                      <p className="text-xs text-[#687068] truncate">{item.propertyName}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sConfig.bg}/10 ${sConfig.color}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#687068]">Expiry</span>
                      <span className="text-sm font-medium text-[#3A3F3A]">{item.expiryDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#687068]">Days left</span>
                      <span className={`text-sm font-medium ${item.daysLeft < 0 ? "text-[#C46868]" : item.daysLeft <= 30 ? "text-[#D4A85C]" : "text-[#7A9A7E]"}`}>
                        {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : item.daysLeft > 500 ? "N/A" : `${item.daysLeft}d`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#687068]">Reference</span>
                      <span className="text-xs font-medium text-[#3A3F3A] font-mono">{item.referenceNumber}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#D5D9D5] flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      className="flex-1 text-center text-xs font-medium text-[#C28A78] hover:text-[#143828] py-1.5 rounded-lg hover:bg-[#EBE5DA] transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setRenewItem(item); setShowRenewModal(true); }}
                      className="flex-1 text-center text-xs font-medium text-[#C28A78] hover:text-[#143828] py-1.5 rounded-lg hover:bg-[#EBE5DA] transition-colors"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "property" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertyCompliance
              .filter((p) => propertyFilter === "All" || p.propertyId === propertyFilter)
              .map((property) => {
                const items = complianceItems.filter((i) => i.propertyId === property.propertyId);
                const nextDeadline = items
                  .filter((i) => i.status !== "Valid" && i.status !== "N/A")
                  .sort((a, b) => {
                    const da = new Date(a.expiryDate).getTime();
                    const db = new Date(b.expiryDate).getTime();
                    return da - db;
                  })[0];
                return (
                  <CompliancePropertyCard
                    key={property.propertyId}
                    property={{
                      ...property,
                      criticalCount: property.expiredCount,
                      nextDeadline: nextDeadline ? `${nextDeadline.type}: ${nextDeadline.expiryDate}` : "None",
                      validCount: property.compliantCount,
                    }}
                    onClick={() => setSelectedItem(items[0] || null)}
                  />
                );
              })}
          </div>
        )}

        {viewMode === "timeline" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-[#EBE5DA] rounded-full">
              <i className="ri-calendar-line text-[#8A9FB0] text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#3A3F3A] mb-1">Compliance Timeline</p>
            <p className="text-xs text-[#687068] mb-4">View all upcoming expiries and scheduled renewals in a timeline view</p>
            <Link href="/dashboard/compliance-timeline" className="inline-block bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              Open Timeline
            </Link>
          </div>
        )}

        {filteredByTab.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#D5D9D5]">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-[#EBE5DA] rounded-full">
              <i className="ri-file-search-line text-[#94A3B8] text-xl"></i>
            </div>
            <p className="text-sm text-[#687068]">No compliance items found</p>
            <p className="text-xs text-[#94A3B8] mt-1">Try adjusting your filters or add a new record</p>
          </div>
        )}

        {showDisclaimer && (
          <div className="bg-[#EBE5DA]/50 rounded-lg p-3 text-xs text-[#687068] italic">
            {LEGAL_DISCLAIMER}
          </div>
        )}

        <button
          onClick={() => setShowDisclaimer(!showDisclaimer)}
          className="text-xs text-[#94A3B8] hover:text-[#687068] underline"
        >
          {showDisclaimer ? "Hide guidance" : "Important guidance about compliance information"}
        </button>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-[#D5D9D5]">
              <div className={`w-10 h-10 ${requirementTypeColors[selectedItem.type] || selectedItem.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${requirementTypeIcons[selectedItem.type] || selectedItem.icon} text-white text-lg`}></i>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">{selectedItem.type}</h3>
                <p className="text-xs text-[#687068]">{selectedItem.propertyName}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getComplianceStatus(complianceStatusMap[selectedItem.status] as ComplianceStatusKey || "valid").bg}/10 ${getComplianceStatus(complianceStatusMap[selectedItem.status] as ComplianceStatusKey || "valid").color}`}>
                {selectedItem.status}
              </span>
              <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[#94A3B8] mb-1">Reference</p><p className="text-sm font-medium text-[#3A3F3A] font-mono">{selectedItem.referenceNumber}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Category</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.category}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Issued</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.issuedDate}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Expiry</p><p className={`text-sm font-medium ${selectedItem.daysLeft < 0 ? "text-[#C46868]" : selectedItem.daysLeft <= 30 ? "text-[#D4A85C]" : "text-[#3A3F3A]"}`}>{selectedItem.expiryDate}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Issuer</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.issuer}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Required</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.requiredByLaw ? "Yes" : "No"}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Renewal</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.renewalPeriod}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Last Action</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.lastAction}</p></div>
              </div>
              <div><p className="text-xs text-[#94A3B8] mb-1">Notes</p><p className="text-sm text-[#3A3F3A]">{selectedItem.notes || "No notes"}</p></div>
              <div className="flex items-center gap-3 pt-2">
                <button className="flex-1 bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Download</button>
                <button
                  onClick={() => { setSelectedItem(null); setRenewItem(selectedItem); setShowRenewModal(true); }}
                  className="flex-1 border border-[#D5D9D5] text-sm font-medium py-2.5 rounded-lg hover:bg-[#EBE5DA] transition-colors text-[#3A3F3A]"
                >Renew</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRenewModal && renewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRenewModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#D5D9D5]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Renew Certificate</h3>
              <button onClick={() => setShowRenewModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-[#FBF9F4] rounded-lg p-3">
                <p className="text-xs text-[#94A3B8] mb-1">Certificate</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{renewItem.type}</p>
                <p className="text-xs text-[#687068]">{renewItem.propertyName}</p>
              </div>
              <div><label className="text-xs text-[#687068] mb-1 block">New Expiry Date</label><input type="date" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-xs text-[#687068] mb-1 block">New Reference Number</label><input type="text" placeholder="Enter new reference number" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-xs text-[#687068] mb-1 block">Notes</label><textarea placeholder="Add renewal notes..." maxLength={500} rows={3} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] resize-none"></textarea></div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowRenewModal(false)} className="flex-1 border border-[#D5D9D5] text-sm font-medium py-2.5 rounded-lg hover:bg-[#EBE5DA] transition-colors text-[#3A3F3A]">Cancel</button>
                <button onClick={handleRenew} className="flex-1 bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Confirm Renewal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#D5D9D5]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Add Compliance Record</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-[#687068] mb-1 block">Requirement Type</label>
                <div className="relative">
                  <select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] pr-8 appearance-none bg-white">
                    <option>Gas Safety Certificate</option><option>EICR Report</option><option>EPC Certificate</option><option>Legionella Assessment</option><option>Smoke Alarm Check</option><option>Carbon Monoxide Check</option><option>HMO Compliance</option><option>Building Insurance</option><option>Fire Risk Assessment</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none"><i className="ri-arrow-down-s-line text-[#94A3B8] text-sm"></i></div>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#687068] mb-1 block">Property</label>
                <div className="relative">
                  <select value={addForm.property} onChange={(e) => setAddForm({ ...addForm, property: e.target.value })} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] pr-8 appearance-none bg-white">
                    {propertyCompliance.map((p) => (<option key={p.propertyId} value={p.propertyId}>{p.propertyName} - {p.address}</option>))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none"><i className="ri-arrow-down-s-line text-[#94A3B8] text-sm"></i></div>
                </div>
              </div>
              <div><label className="text-xs text-[#687068] mb-1 block">Issuer / Provider</label><input type="text" value={addForm.issuer} onChange={(e) => setAddForm({ ...addForm, issuer: e.target.value })} placeholder="e.g. SafeGas Engineers Ltd" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-xs text-[#687068] mb-1 block">Reference Number</label><input type="text" value={addForm.referenceNumber} onChange={(e) => setAddForm({ ...addForm, referenceNumber: e.target.value })} placeholder="e.g. GSC-2026-04589" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-xs text-[#687068] mb-1 block">Expiry Date</label><input type="date" value={addForm.expiryDate} onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-xs text-[#687068] mb-1 block">Notes</label><textarea value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} placeholder="Add any notes..." maxLength={500} rows={3} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] resize-none"></textarea></div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 border border-[#D5D9D5] text-sm font-medium py-2.5 rounded-lg hover:bg-[#EBE5DA] transition-colors text-[#3A3F3A]">Cancel</button>
                <button onClick={handleAdd} className="flex-1 bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Add Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}