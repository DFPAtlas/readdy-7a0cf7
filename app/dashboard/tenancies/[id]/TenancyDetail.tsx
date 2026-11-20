"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { sendPortalInvite } from "@/lib/portalInvites";
import { tenancies, tenancyStatusBadge, tenancyStatusLabel, portalStatusBadge, portalStatusLabel, TenancyRecord } from "../TenanciesData";

const tabs = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "property", label: "Property", icon: "ri-building-4-line" },
  { id: "tenants", label: "Tenants", icon: "ri-user-3-line" },
  { id: "owner", label: "Owner", icon: "ri-user-star-line" },
  { id: "rent", label: "Rent", icon: "ri-money-pound-circle-line" },
  { id: "documents", label: "Documents", icon: "ri-folder-line" },
  { id: "maintenance", label: "Maintenance", icon: "ri-tools-line" },
  { id: "portal", label: "Portal Access", icon: "ri-macbook-line" },
];

const DEMO_DOCUMENTS = [
  { id: "d1", name: "Tenancy Agreement - Signed.pdf", type: "Tenancy", date: "15 Sep 2024", size: "1.2 MB", icon: "ri-file-text-line", color: "bg-[#3B82F6]" },
  { id: "d2", name: "Deposit Protection Certificate.pdf", type: "Deposit", date: "15 Sep 2024", size: "0.3 MB", icon: "ri-bank-card-line", color: "bg-[#10B981]" },
  { id: "d3", name: "Inventory Check-in Report.pdf", type: "Inventory", date: "15 Sep 2024", size: "2.4 MB", icon: "ri-file-list-line", color: "bg-[#F59E0B]" },
  { id: "d4", name: "Gas Safety Certificate 2026.pdf", type: "Compliance", date: "12 Mar 2026", size: "0.8 MB", icon: "ri-file-shield-line", color: "bg-[#EF4444]" },
  { id: "d5", name: "EPC Certificate.pdf", type: "Compliance", date: "20 Oct 2023", size: "0.5 MB", icon: "ri-leaf-line", color: "bg-[#14B8A6]" },
  { id: "d6", name: "How to Rent Guide.pdf", type: "Guide", date: "15 Sep 2024", size: "1.5 MB", icon: "ri-book-open-line", color: "bg-[#8B5CF6]" },
  { id: "d7", name: "Rent Payment Schedule.pdf", type: "Financial", date: "15 Sep 2024", size: "0.4 MB", icon: "ri-calendar-line", color: "bg-[#D4A574]" },
];

const DEMO_MAINTENANCE_JOBS = [
  { id: "m1", title: "Leaking kitchen tap", status: "In Progress", priority: "Medium", contractor: "GreenPlumb Ltd", reported: "18 May 2026", cost: 114 },
  { id: "m2", title: "Living room radiator not heating", status: "Awaiting Approval", priority: "High", contractor: "HeatFirst Services", reported: "25 May 2026", cost: 222 },
  { id: "m3", title: "Bedroom light switch broken", status: "Scheduled", priority: "Low", contractor: "BrightSpark Electrical", reported: "29 May 2026", cost: 85 },
  { id: "m4", title: "Bathroom extractor fan noisy", status: "Under Review", priority: "Medium", contractor: "—", reported: "30 May 2026", cost: 0 },
  { id: "m5", title: "Front door lock sticking", status: "Completed", priority: "Medium", contractor: "SecureFix", reported: "10 May 2026", cost: 95 },
];

type DocRow = { id: string; name: string; type: string; date: string; size: string; icon: string; color: string };
type JobRow = { id: string; title: string; status: string; priority: string; contractor: string; reported: string; cost: number };
type PaymentRow = { month: string; amount: number; status: string; date: string };
type TenancyExtras = { epcRating: string; councilTaxBand: string; regime: string | null };

const REGIME_LABELS: Record<string, string> = {
  assured_periodic_rra: "Assured periodic (Renters' Rights Act)",
  ast_legacy: "Assured shorthold (pre-May 2026)",
  occupation_contract_wales: "Occupation contract (Wales)",
  prt_scotland: "Private residential tenancy (Scotland)",
  ni_private_tenancy: "Private tenancy (Northern Ireland)",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function labelFromCode(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function portalStatusFrom(rows: Array<{ user_type: string | null; status: string | null }>, userType: string): string {
  const row = rows.find((r) => r.user_type === userType);
  if (!row) return "not_invited";
  if (row.status === "active") return "active";
  if (row.status === "disabled" || row.status === "revoked") return "disabled";
  return "invited";
}

async function loadLiveTenancy(tenancyId: string) {
  const { data: t, error } = await supabase
    .from("tenancies")
    .select("id, property_id, regime, term_type, status, start_date, end_date, rent_amount, rent_period, deposit_amount, deposit_scheme, is_periodic")
    .eq("id", tenancyId)
    .maybeSingle();
  if (error || !t) return null;

  const [propRes, partiesRes, paymentsRes, docsRes, jobsRes, inspRes, portalRes] = await Promise.all([
    supabase.from("properties").select("id, line1, line2, city, postcode, landlord_id, type, bedrooms, epc_rating, council_tax_band").eq("id", t.property_id).maybeSingle(),
    supabase.from("tenancy_parties").select("tenant_id, is_lead, tenants(id, full_name, email, phone)").eq("tenancy_id", t.id),
    supabase.from("rent_payments").select("id, amount, due_date, paid_date, status").eq("tenancy_id", t.id).order("due_date", { ascending: false }).limit(12),
    supabase.from("documents").select("id, kind, issued_on, created_at, file_size").eq("tenancy_id", t.id).order("created_at", { ascending: false }),
    supabase.from("maintenance_jobs").select("id, title, status, created_at").eq("property_id", t.property_id).order("created_at", { ascending: false }).limit(20),
    supabase.from("inspections").select("scheduled_date, completed_date, status").eq("property_id", t.property_id),
    supabase.from("portal_access").select("user_type, status").eq("property_id", t.property_id),
  ]);

  const prop: any = propRes.data;
  let landlord: any = null;
  if (prop?.landlord_id) {
    const { data } = await supabase.from("landlords").select("id, display_name, email").eq("id", prop.landlord_id).maybeSingle();
    landlord = data;
  }

  const parties = (partiesRes.data || []) as any[];
  const leadParty = parties.find((p) => p.is_lead) || parties[0];
  const tenant = leadParty ? (Array.isArray(leadParty.tenants) ? leadParty.tenants[0] : leadParty.tenants) : null;
  const inspections = (inspRes.data || []) as any[];
  const completed = inspections.filter((i) => i.status === "completed" && i.completed_date).map((i) => i.completed_date).sort().reverse();
  const upcoming = inspections.filter((i) => i.status === "scheduled" && i.scheduled_date).map((i) => i.scheduled_date).sort();
  const portals = (portalRes.data || []) as Array<{ user_type: string | null; status: string | null }>;
  const periodic = t.term_type === "periodic" || Boolean(t.is_periodic);
  const startDay = t.start_date ? new Date(t.start_date).getDate() : 1;

  const record: TenancyRecord = {
    id: t.id,
    ref: `TNCY-${t.id.slice(0, 8).toUpperCase()}`,
    propertyId: t.property_id,
    propertyName: prop?.line1 || "Unknown property",
    propertyAddress: prop ? [prop.line2, prop.city, prop.postcode].filter(Boolean).join(", ") : "",
    tenantId: tenant?.id || "",
    tenantName: tenant?.full_name || "No tenant linked",
    tenantEmail: tenant?.email || "",
    tenantPhone: tenant?.phone || "",
    ownerId: landlord?.id || "",
    ownerName: landlord?.display_name || "No landlord linked",
    ownerEmail: landlord?.email || "",
    startDate: formatDate(t.start_date),
    endDate: periodic ? "No fixed end date" : formatDate(t.end_date),
    periodic,
    rent: Number(t.rent_amount) || 0,
    deposit: Number(t.deposit_amount) || 0,
    depositScheme: t.deposit_scheme || "Not recorded",
    status: (t.status === "in_possession_process" ? "ending" : t.status) as TenancyRecord["status"],
    ownerPortalStatus: portalStatusFrom(portals, "owner"),
    tenantPortalStatus: portalStatusFrom(portals, "tenant"),
    rentDueDay: startDay,
    noticeRequired: t.regime === "assured_periodic_rra" ? "Tenant: 2 months" : "Per tenancy agreement",
    propertyType: labelFromCode(prop?.type),
    bedrooms: prop?.bedrooms ?? 0,
    lastInspection: completed[0] ? formatDate(completed[0]) : "None recorded",
    nextInspection: upcoming[0] ? formatDate(upcoming[0]) : "Not scheduled",
  };

  const documents: DocRow[] = ((docsRes.data || []) as any[]).map((d) => ({
    id: d.id,
    name: labelFromCode(d.kind),
    type: labelFromCode(d.kind),
    date: formatDate(d.issued_on || d.created_at),
    size: formatBytes(d.file_size),
    icon: "ri-file-text-line",
    color: "bg-[#3B82F6]",
  }));

  const jobs: JobRow[] = ((jobsRes.data || []) as any[]).map((j) => ({
    id: j.id,
    title: j.title || "Untitled job",
    status: labelFromCode(j.status),
    priority: "—",
    contractor: "—",
    reported: formatDate(j.created_at),
    cost: 0,
  }));

  const payments: PaymentRow[] = ((paymentsRes.data || []) as any[]).map((p) => ({
    month: p.due_date ? new Date(p.due_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—",
    amount: Number(p.amount) || 0,
    status: labelFromCode(p.status),
    date: formatDate(p.paid_date),
  }));

  const extras: TenancyExtras = {
    epcRating: prop?.epc_rating || "—",
    councilTaxBand: prop?.council_tax_band ? `Band ${prop.council_tax_band}` : "—",
    regime: t.regime || null,
  };

  return { record, documents, jobs, payments, extras };
}

export default function TenancyDetail({ tenancyId }: { tenancyId: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tenancy, setTenancy] = useState<TenancyRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [extras, setExtras] = useState<TenancyExtras>({ epcRating: "—", councilTaxBand: "—", regime: null });
  const [inviteLinks, setInviteLinks] = useState<{ owner?: string; tenant?: string }>({});
  const [toast, setToast] = useState<string | null>(null);
  const [inviteModal, setInviteModal] = useState<{ type: "owner" | "tenant" } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (sendingTimerRef.current) clearTimeout(sendingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const applyPreview = (found: TenancyRecord) => {
      setIsDemo(true);
      setTenancy(found);
      setDocuments(DEMO_DOCUMENTS);
      setJobs(DEMO_MAINTENANCE_JOBS);
      setPayments(
        ["Jun 2026", "May 2026", "Apr 2026"].map((month) => ({ month, amount: found.rent, status: "Paid", date: `01 ${month}` })),
      );
      setExtras({ epcRating: "C", councilTaxBand: "Band C", regime: "assured_periodic_rra" });
    };

    const load = async () => {
      const localRecord = tenancies.find((t) => t.id === tenancyId);
      const looksLikeRecordId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenancyId);

      if (isDemoAccount() || !looksLikeRecordId) {
        if (!localRecord) {
          if (active) setNotFound(true);
          return;
        }
        if (!active) return;
        applyPreview(localRecord);
        return;
      }

      const live = await loadLiveTenancy(tenancyId);
      if (!active) return;
      if (!live) {
        setNotFound(true);
        return;
      }
      setTenancy(live.record);
      setDocuments(live.documents);
      setJobs(live.jobs);
      setPayments(live.payments);
      setExtras(live.extras);
    };

    load();

    return () => {
      active = false;
    };
  }, [tenancyId]);

  const showToast = (msg: string) => {
    if (!mountedRef.current) return;
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setToast(null);
    }, 3000);
  };

  const handleCopyLink = (tokenType: "owner" | "tenant") => {
    const link = inviteLinks[tokenType];
    if (!link) {
      setInviteModal({ type: tokenType });
      setInviteEmail(tokenType === "owner" ? tenancy?.ownerEmail || "" : tenancy?.tenantEmail || "");
      return;
    }
    navigator.clipboard.writeText(link).then(() => {
      if (!mountedRef.current) return;
      setCopiedToken(tokenType);
      showToast("Invite link copied to clipboard");
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setCopiedToken(null);
      }, 2000);
    });
  };

  const handleSendInvite = async () => {
    if (!tenancy || !inviteModal) return;
    const portalType = inviteModal.type;
    if (isDemo) {
      setInviteModal(null);
      showToast("Demo mode — no invitation was sent.");
      return;
    }
    setSending(true);
    const result = await sendPortalInvite(supabase, {
      portalType,
      propertyId: tenancy.propertyId,
      email: inviteEmail.trim(),
      message: "",
      tenantId: portalType === "tenant" ? tenancy.tenantId || undefined : undefined,
    });
    if (!mountedRef.current) return;
    setSending(false);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    setInviteModal(null);
    if (result.link) setInviteLinks((prev) => ({ ...prev, [portalType]: result.link }));
    setTenancy((prev) =>
      prev
        ? {
            ...prev,
            ownerPortalStatus: portalType === "owner" && prev.ownerPortalStatus !== "active" ? "invited" : prev.ownerPortalStatus,
            tenantPortalStatus: portalType === "tenant" && prev.tenantPortalStatus !== "active" ? "invited" : prev.tenantPortalStatus,
          }
        : prev,
    );
    showToast(result.message);
  };

  if (notFound) {
    return (
      <DashboardShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
              <i className="ri-file-search-line text-2xl text-[#94A3B8]"></i>
            </div>
            <h1 className="text-xl font-bold text-[#3A3F3A]">Tenancy not found</h1>
            <p className="mt-2 text-sm leading-6 text-[#687068]">
              This tenancy does not exist or you do not have access to it.
            </p>
            <Link href="/dashboard/tenancies" className="mt-5 inline-flex rounded-lg bg-[#C28A78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B07A69]">
              Back to tenancies
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!tenancy) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading tenancy...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const rentPayments = payments;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tenancies" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#3A3F3A]">{tenancy.ref}</h1>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tenancyStatusBadge[tenancy.status]}`}>
                  {tenancyStatusLabel[tenancy.status]}
                </span>
              </div>
              <p className="text-sm text-[#687068] mt-1">{tenancy.propertyName} · {tenancy.propertyAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
              Edit Tenancy
            </button>
            {tenancy.status === "draft" && (
              <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors whitespace-nowrap">
                Activate
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white border border-[#D5D9D5] rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon}></i>
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#D5D9D5] p-6">
                <h2 className="font-semibold text-[#3A3F3A] mb-4">Tenancy Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Start Date", value: tenancy.startDate, icon: "ri-calendar-line", color: "bg-[#C28A78]/10", text: "text-[#C28A78]" },
                    { label: "End Date", value: tenancy.endDate, icon: "ri-calendar-close-line", color: "bg-[#EF4444]/10", text: "text-[#EF4444]" },
                    { label: "Monthly Rent", value: `£${tenancy.rent.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#10B981]/10", text: "text-[#10B981]" },
                    { label: "Deposit", value: `£${tenancy.deposit.toLocaleString()}`, icon: "ri-bank-card-line", color: "bg-[#3B82F6]/10", text: "text-[#3B82F6]" },
                    { label: "Property Type", value: tenancy.propertyType, icon: "ri-building-4-line", color: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]" },
                    { label: "Bedrooms", value: tenancy.bedrooms, icon: "ri-hotel-bed-line", color: "bg-[#EC4899]/10", text: "text-[#EC4899]" },
                    { label: "Rent Due Day", value: `${tenancy.rentDueDay}${[11, 12, 13].includes(tenancy.rentDueDay % 100) ? "th" : ["st","nd","rd"][(tenancy.rentDueDay % 10) - 1] || "th"} of month`, icon: "ri-calendar-check-line", color: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
                    { label: "Notice Required", value: tenancy.noticeRequired, icon: "ri-alert-line", color: "bg-[#687068]/10", text: "text-[#687068]" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF9F4]">
                      <div className={`w-9 h-9 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <i className={`${item.icon} ${item.text} text-sm`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{item.value}</p>
                        <p className="text-xs text-[#687068]">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
                <h2 className="font-semibold text-[#3A3F3A] mb-4">Linked Records</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF9F4]">
                    <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-building-4-line text-[#C28A78] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{tenancy.propertyName}</p>
                      <p className="text-xs text-[#94A3B8]">{tenancy.propertyAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF9F4]">
                    <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-user-3-line text-[#3B82F6] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{tenancy.tenantName}</p>
                      <p className="text-xs text-[#94A3B8]">{tenancy.tenantEmail || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF9F4]">
                    <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-user-star-line text-[#10B981] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{tenancy.ownerName}</p>
                      <p className="text-xs text-[#94A3B8]">{tenancy.ownerEmail || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-shield-check-line text-[#10B981] text-sm"></i>
                  </div>
                  <h3 className="font-semibold text-[#3A3F3A] text-sm">Deposit Scheme</h3>
                </div>
                <p className="text-lg font-bold text-[#3A3F3A]">{tenancy.depositScheme}</p>
                <p className="text-xs text-[#94A3B8] mt-1">Deposit: £{tenancy.deposit.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-clipboard-line text-[#3B82F6] text-sm"></i>
                  </div>
                  <h3 className="font-semibold text-[#3A3F3A] text-sm">Last Inspection</h3>
                </div>
                <p className="text-lg font-bold text-[#3A3F3A]">{tenancy.lastInspection}</p>
                <p className="text-xs text-[#94A3B8] mt-1">Next: {tenancy.nextInspection}</p>
              </div>
              <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-loop-left-line text-[#F59E0B] text-sm"></i>
                  </div>
                  <h3 className="font-semibold text-[#3A3F3A] text-sm">Tenancy Type</h3>
                </div>
                <p className="text-lg font-bold text-[#3A3F3A]">{tenancy.periodic ? "Periodic" : "Fixed Term"}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{extras.regime ? REGIME_LABELS[extras.regime] || labelFromCode(extras.regime) : tenancy.periodic ? "Rolling" : `${tenancy.startDate} — ${tenancy.endDate}`}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "property" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h2 className="font-semibold text-[#3A3F3A] mb-4">Property Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Property Name", value: tenancy.propertyName },
                { label: "Address", value: tenancy.propertyAddress },
                { label: "Property Type", value: tenancy.propertyType },
                { label: "Bedrooms", value: tenancy.bedrooms },
                { label: "EPC Rating", value: extras.epcRating },
                { label: "Council Tax Band", value: extras.councilTaxBand },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#FBF9F4]">
                  <p className="text-xs text-[#94A3B8] mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/dashboard/portfolio/${tenancy.propertyId}`}
                className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
              >
                View Full Property Details
              </Link>
            </div>
          </div>
        )}

        {activeTab === "tenants" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h2 className="font-semibold text-[#3A3F3A] mb-4">Tenant Details</h2>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-[#3B82F6]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-[#3B82F6]">{tenancy.tenantName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-[#3A3F3A]">{tenancy.tenantName}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {[
                    { label: "Email", value: tenancy.tenantEmail || "—" },
                    { label: "Phone", value: tenancy.tenantPhone || "—" },
                    { label: "Tenancy Status", value: tenancyStatusLabel[tenancy.status] },
                    { label: "Portal Access", value: portalStatusLabel[tenancy.tenantPortalStatus] || "—" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-[#FBF9F4]">
                      <p className="text-xs text-[#94A3B8] mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/tenants" className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">View All Tenants</Link>
              {tenancy.tenantId && (
                <button onClick={() => setActiveTab("portal")} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Tenant Portal Access</button>
              )}
            </div>
          </div>
        )}

        {activeTab === "owner" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h2 className="font-semibold text-[#3A3F3A] mb-4">Owner Details</h2>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-[#C28A78]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-[#C28A78]">{tenancy.ownerName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-[#3A3F3A]">{tenancy.ownerName}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {[
                    { label: "Email", value: tenancy.ownerEmail || "—" },
                    { label: "Portal Access", value: portalStatusLabel[tenancy.ownerPortalStatus] || "—" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-[#FBF9F4]">
                      <p className="text-xs text-[#94A3B8] mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/landlords" className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">View All Owners</Link>
              <button onClick={() => setActiveTab("portal")} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Owner Portal Access</button>
            </div>
          </div>
        )}

        {activeTab === "rent" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Monthly Rent", value: `£${tenancy.rent.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#10B981]" },
                { label: "Deposit Held", value: `£${tenancy.deposit.toLocaleString()}`, icon: "ri-bank-card-line", color: "bg-[#3B82F6]" },
                { label: "Deposit Scheme", value: tenancy.depositScheme, icon: "ri-shield-check-line", color: "bg-[#8B5CF6]" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-5 flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={`${stat.icon} text-white text-lg`}></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                    <p className="text-xs text-[#687068]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Payment History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Month</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Amount</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Date Paid</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {rentPayments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-6 text-center text-sm text-[#94A3B8]">No rent payments recorded yet.</td>
                      </tr>
                    )}
                    {rentPayments.map((p, idx) => (
                      <tr key={`${p.month}-${idx}`} className="hover:bg-[#FBF9F4]">
                        <td className="px-5 py-3 text-sm font-medium text-[#3A3F3A]">{p.month}</td>
                        <td className="px-5 py-3 text-sm text-[#3A3F3A]">£{p.amount.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-[#687068]">{p.date}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === "Paid" ? "bg-[#10B981]/10 text-[#10B981]" : p.status === "Overdue" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Tenancy Documents</h2>
              <button className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-upload-line text-sm"></i>
                </div>
                Upload
              </button>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {documents.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-[#94A3B8]">No documents linked to this tenancy yet.</p>
              )}
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-4 hover:bg-[#FBF9F4] transition-colors">
                  <div className={`w-10 h-10 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${doc.icon} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.name}</p>
                    <p className="text-xs text-[#94A3B8]">{doc.type} · {doc.date} · {doc.size}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                      <i className="ri-download-line text-[#C28A78] text-sm"></i>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                      <i className="ri-share-forward-line text-[#687068] text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Maintenance Jobs</h2>
              <Link href="/dashboard/maintenance" className="text-sm text-[#C28A78] font-medium hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Job</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068] hidden md:table-cell">Contractor</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068] hidden sm:table-cell">Reported</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Priority</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068] hidden sm:table-cell">Cost</th>
                    <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-center text-sm text-[#94A3B8]">No maintenance jobs for this property.</td>
                    </tr>
                  )}
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-3">
                        <Link href="/dashboard/maintenance" className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78]">{job.title}</Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#687068] hidden md:table-cell">{job.contractor}</td>
                      <td className="px-5 py-3 text-xs text-[#687068] hidden sm:table-cell">{job.reported}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          job.priority === "High" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                          job.priority === "Medium" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                          "bg-[#10B981]/10 text-[#10B981]"
                        }`}>{job.priority}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-[#3A3F3A] hidden sm:table-cell">
                        {job.cost > 0 ? `£${job.cost}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          job.status === "Completed" ? "bg-[#10B981]/10 text-[#10B981]" :
                          job.status === "In Progress" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                          job.status === "Awaiting Approval" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" :
                          "bg-[#F59E0B]/10 text-[#F59E0B]"
                        }`}>{job.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "portal" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Portal */}
              <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-macbook-line text-[#C28A78] text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">Owner Portal</h3>
                    <p className="text-xs text-[#687068]">{tenancy.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${portalStatusBadge[tenancy.ownerPortalStatus] || portalStatusBadge["not_invited"]}`}>
                    {portalStatusLabel[tenancy.ownerPortalStatus] || "Not Invited"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {tenancy.ownerPortalStatus === "not_invited" && (
                    <button
                      onClick={() => { setInviteModal({ type: "owner" }); setInviteEmail(tenancy.ownerEmail); }}
                      className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
                    >
                      Invite Owner
                    </button>
                  )}
                  {(tenancy.ownerPortalStatus === "invited" || tenancy.ownerPortalStatus === "active") && (
                    <>
                      <button onClick={() => handleCopyLink("owner")} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">{inviteLinks.owner ? (copiedToken === "owner" ? "Copied" : "Copy Link") : "Resend Invite"}</button>
                    </>
                  )}
                </div>
              </div>

              {/* Tenant Portal */}
              <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-smartphone-line text-[#3B82F6] text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">Tenant Portal</h3>
                    <p className="text-xs text-[#687068]">{tenancy.tenantName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${portalStatusBadge[tenancy.tenantPortalStatus] || portalStatusBadge["not_invited"]}`}>
                    {portalStatusLabel[tenancy.tenantPortalStatus] || "Not Invited"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {tenancy.tenantPortalStatus === "not_invited" && (
                    <button
                      onClick={() => { setInviteModal({ type: "tenant" }); setInviteEmail(tenancy.tenantEmail); }}
                      className="px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors whitespace-nowrap"
                    >
                      Invite Tenant
                    </button>
                  )}
                  {(tenancy.tenantPortalStatus === "invited" || tenancy.tenantPortalStatus === "active") && (
                    <>
                      <button onClick={() => handleCopyLink("tenant")} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">{inviteLinks.tenant ? (copiedToken === "tenant" ? "Copied" : "Copy Link") : "Resend Invite"}</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInviteModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${inviteModal.type === "owner" ? "bg-[#C28A78]" : "bg-[#3B82F6]"} rounded-lg flex items-center justify-center`}>
                  <i className={`${inviteModal.type === "owner" ? "ri-macbook-line" : "ri-smartphone-line"} text-white text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">Invite {inviteModal.type === "owner" ? "Owner" : "Tenant"}</h3>
                  <p className="text-xs text-[#687068]">{tenancy?.propertyName}</p>
                </div>
              </div>
              <button onClick={() => setInviteModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSendInvite}
                  disabled={!inviteEmail || sending}
                  className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sending ? "Sending..." : "Send Invite"}
                </button>
                <button onClick={() => setInviteModal(null)} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#10B981]"></i>
          {toast}
        </div>
      )}
    </DashboardShell>
  );
}