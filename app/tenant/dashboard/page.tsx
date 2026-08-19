"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";
import { usePortalBranding, PortalBrandingHeader } from "@/components/PortalBranding";

interface TenancyData {
  ref: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  depositAmount: string;
  depositScheme: string;
  nextPaymentDue: string;
  rentStatus: string;
}

interface PropertyInfo {
  name: string;
  address: string;
  postcode: string;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  date: string;
}

interface TenancyDocument {
  id: string;
  kind: string;
  label: string;
  issuedOn: string;
  expiresOn: string | null;
  storagePath: string | null;
  status: "available" | "expired" | "unavailable";
}

const demoTenancy: TenancyData = {
  ref: "TEN-2024-0042",
  startDate: "1 Jun 2024",
  endDate: "27 Oct 2026",
  rentAmount: "£1,850",
  depositAmount: "£2,134",
  depositScheme: "TDS Insured",
  nextPaymentDue: "1 Aug 2026",
  rentStatus: "Paid",
};

const demoProperty: PropertyInfo = {
  name: "Rose Court Flat 2A",
  address: "12 Rose Court, Rose Avenue",
  postcode: "SW1A 1AA",
};

const demoTickets: MaintenanceTicket[] = [
  { id: "t1", title: "Leaking kitchen tap", description: "Cold water tap in kitchen sink drips continuously. Started about a week ago.", status: "Under Review", priority: "Medium", date: "28 Jun 2026" },
  { id: "t2", title: "Bathroom extractor fan not working", description: "Extractor fan in main bathroom stopped working. Makes no noise when switched on.", status: "Open", priority: "Low", date: "15 May 2026" },
  { id: "t3", title: "Radiator cold in bedroom", description: "Bedroom radiator stays cold even when heating is on. Other radiators working fine.", status: "Completed", priority: "Medium", date: "2 Mar 2026" },
];

const demoPayments = [
  { month: "Jul 2026", amount: "£1,850", date: "01 Jul 2026", method: "Bank Transfer", status: "Paid" },
  { month: "Jun 2026", amount: "£1,850", date: "01 Jun 2026", method: "Bank Transfer", status: "Paid" },
  { month: "May 2026", amount: "£1,850", date: "01 May 2026", method: "Bank Transfer", status: "Paid" },
  { month: "Apr 2026", amount: "£1,850", date: "01 Apr 2026", method: "Bank Transfer", status: "Paid" },
  { month: "Mar 2026", amount: "£1,850", date: "01 Mar 2026", method: "Bank Transfer", status: "Paid" },
  { month: "Feb 2026", amount: "£1,850", date: "01 Feb 2026", method: "Bank Transfer", status: "Paid" },
];

const demoUpdates = [
  { id: "u1", title: "Routine inspection scheduled", property_name: "Rose Court Flat 2A", communication_type: "inspection_notice", status: "sent", message: "A routine property inspection has been scheduled for 12 August 2026 between 10:00 and 12:00. Your presence is not required but you are welcome to attend.", sent_at: "2026-06-25T09:00:00Z", created_at: "2026-06-25T09:00:00Z" },
  { id: "u2", title: "Annual gas safety check", property_name: "Rose Court Flat 2A", communication_type: "safety_notice", status: "sent", message: "The annual gas safety check will be carried out on 3 July 2026. A Gas Safe registered engineer will visit between 09:00 and 13:00. Please ensure access to the boiler and all gas appliances.", sent_at: "2026-06-20T11:00:00Z", created_at: "2026-06-20T11:00:00Z" },
  { id: "u3", title: "Thank you for prompt rent payment", property_name: "Rose Court Flat 2A", communication_type: "general", status: "sent", message: "Thank you for your continued prompt rent payments. We appreciate you being a great tenant.", sent_at: "2026-06-05T14:00:00Z", created_at: "2026-06-05T14:00:00Z" },
];

const demoDocuments: TenancyDocument[] = [
  { id: "d1", kind: "tenancy_agreement", label: "Tenancy Agreement", issuedOn: "1 Jun 2024", expiresOn: "31 May 2027", storagePath: null, status: "available" },
  { id: "d2", kind: "gas_safety", label: "Gas Safety Certificate", issuedOn: "15 Mar 2026", expiresOn: "14 Mar 2027", storagePath: null, status: "available" },
  { id: "d3", kind: "epc", label: "Energy Performance Certificate", issuedOn: "10 Jan 2023", expiresOn: "9 Jan 2033", storagePath: null, status: "available" },
  { id: "d4", kind: "deposit_prescribed_info", label: "Deposit Certificate", issuedOn: "1 Jun 2024", expiresOn: null, storagePath: null, status: "available" },
  { id: "d5", kind: "eicr", label: "Electrical Safety Report", issuedOn: "20 Aug 2023", expiresOn: "19 Aug 2028", storagePath: null, status: "available" },
  { id: "d6", kind: "inventory", label: "Inventory Report", issuedOn: "1 Jun 2024", expiresOn: null, storagePath: null, status: "available" },
  { id: "d7", kind: "how_to_rent_guide", label: "How to Rent Guide", issuedOn: "1 Jun 2024", expiresOn: null, storagePath: null, status: "available" },
];

export default function TenantDashboardPage() {
  const [tenancy, setTenancy] = useState<TenancyData>(demoTenancy);
  const [property, setProperty] = useState<PropertyInfo>(demoProperty);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(demoTickets);
  const [payments, setPayments] = useState<any[]>(demoPayments);
  const [updates, setUpdates] = useState<any[]>(demoUpdates);
  const [tenantName, setTenantName] = useState("John Miller");
  const [tenantEmail, setTenantEmail] = useState("john.miller@example.com");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ phone: "", emergencyName: "", emergencyPhone: "", emergencyRelation: "" });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", category: "General", description: "", priority: "Medium", email: "" });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [priorityDropdown, setPriorityDropdown] = useState(false);
  const [tenantMsgDetail, setTenantMsgDetail] = useState<any>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [tenancyEndRaw, setTenancyEndRaw] = useState<Date | null>(new Date("2026-10-27"));
  const [tenancyId, setTenancyId] = useState<string | null>(null);
  const [petRequests, setPetRequests] = useState<any[]>([]);
  const [showPetForm, setShowPetForm] = useState(false);
  const [petForm, setPetForm] = useState({ type: "Cat", breed: "", name: "", age: "", reason: "", extraInfo: "" });
  const [petSubmitting, setPetSubmitting] = useState(false);
  const [petError, setPetError] = useState("");
  const [petSuccess, setPetSuccess] = useState(false);
  const [petTypeOpen, setPetTypeOpen] = useState(false);
  const [modRequests, setModRequests] = useState<any[]>([]);
  const [showModForm, setShowModForm] = useState(false);
  const [modForm, setModForm] = useState({ type: "Decoration", description: "", reason: "", reversible: "Yes" });
  const [modSubmitting, setModSubmitting] = useState(false);
  const [modError, setModError] = useState("");
  const [modSuccess, setModSuccess] = useState(false);
  const [modTypeOpen, setModTypeOpen] = useState(false);
  const [modRevOpen, setModRevOpen] = useState(false);
  const [documents, setDocuments] = useState<TenancyDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [docToast, setDocToast] = useState<string | null>(null);
  const { branding, primary, primaryHover } = usePortalBranding();
  const reportToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const docToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (reportToastTimerRef.current) clearTimeout(reportToastTimerRef.current);
      if (docToastTimerRef.current) clearTimeout(docToastTimerRef.current);
      if (profileToastTimerRef.current) clearTimeout(profileToastTimerRef.current);
      if (modToastTimerRef.current) clearTimeout(modToastTimerRef.current);
      if (petToastTimerRef.current) clearTimeout(petToastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isDemoAccount()) {
      setDemoMode(true);
      setSessionReady(true);
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/tenant/login";
        return;
      }

      const { data: access } = await supabase
        .from("tenant_portal_access")
        .select("id, tenant_id, is_active")
        .eq("profile_id", session.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!access) {
        await supabase.auth.signOut();
        window.location.href = "/tenant/login";
        return;
      }

      const tenantId = (access as any).tenant_id;

      const { data: tenant } = await supabase.from("tenants").select("id, name, email, phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relation").eq("id", tenantId).maybeSingle();
      if (tenant) {
        const t = tenant as any;
        setTenantName(t.name || "");
        setTenantEmail(t.email || "");
        setTenantId(t.id);
        setProfileForm({
          phone: t.phone || "",
          emergencyName: t.emergency_contact_name || "",
          emergencyPhone: t.emergency_contact_phone || "",
          emergencyRelation: t.emergency_contact_relation || "",
        });
      }

      const { data: ten } = await supabase.from("tenancies").select("id, property_id, rent_amount, rent_period, deposit_amount, deposit_scheme, start_date, end_date, status, ref").eq("tenant_id", tenantId).maybeSingle();

      if (ten) {
        const tn = ten as any;
        setTenancy({
          ref: tn.ref || "—",
          startDate: tn.start_date ? new Date(tn.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
          endDate: tn.end_date ? new Date(tn.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
          rentAmount: tn.rent_amount ? `£${Number(tn.rent_amount).toLocaleString()}` : "—",
          depositAmount: tn.deposit_amount ? `£${Number(tn.deposit_amount).toLocaleString()}` : "—",
          depositScheme: tn.deposit_scheme || "—",
          nextPaymentDue: "1st of month",
          rentStatus: tn.status === "active" ? "Paid" : tn.status || "—",
        });
        if (tn.end_date) setTenancyEndRaw(new Date(tn.end_date));
        setTenancyId(tn.id);
        const { data: petReqs } = await supabase.from("pet_requests").select("id, description, status, decided_on, refusal_reason, created_at").eq("tenancy_id", tn.id).order("created_at", { ascending: false });
        if (petReqs) setPetRequests(petReqs);
        const { data: modReqs } = await supabase.from("modification_requests").select("id, modification_type, description, status, decided_on, refusal_reason, created_at").eq("tenancy_id", tn.id).order("created_at", { ascending: false });
        if (modReqs) setModRequests(modReqs);

        const { data: prop } = await supabase.from("properties").select("line1, city, postcode").eq("id", tn.property_id).maybeSingle();
        if (prop) {
          setProperty({
            name: (prop as any).line1 || "Property",
            address: `${(prop as any).line1 || ""}, ${(prop as any).city || ""}`,
            postcode: (prop as any).postcode || "",
          });
        }

        const [{ data: maintTickets }, { data: rentPmts }, { data: notifs }, { data: tenancyDocs }] = await Promise.all([
          supabase.from("maintenance_jobs").select("id, title, description, status, created_at").eq("tenancy_id", tn.id).order("created_at", { ascending: false }).limit(10),
          supabase.from("rent_payments").select("id, amount, payment_date, method").eq("tenancy_id", tn.id).order("payment_date", { ascending: false }).limit(12),
          supabase.from("notifications").select("id, title, body, type, is_read, created_at, related_id, related_table").eq("profile_id", session.user.id).order("created_at", { ascending: false }).limit(10),
          supabase.from("documents").select("id, kind, storage_path, issued_on, expires_on").or(`tenancy_id.eq.${tn.id},property_id.eq.${tn.property_id}`).order("issued_on", { ascending: false }),
        ]);

        if (maintTickets && maintTickets.length > 0) {
          setTickets((maintTickets as any[]).map((m: any) => ({
            id: m.id,
            title: m.title || "Maintenance Request",
            description: m.description || "",
            status: m.status || "Open",
            priority: "Medium",
            date: m.created_at ? new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
          })));
        }

        if (rentPmts && rentPmts.length > 0) {
          setPayments((rentPmts as any[]).map((p: any) => ({
            month: p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "",
            amount: `£${Number(p.amount || 0).toLocaleString()}`,
            date: p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
            method: p.method || "Bank Transfer",
            status: "Paid",
          })));
        }

        const kindLabels: Record<string, string> = {
          tenancy_agreement: "Tenancy Agreement",
          gas_safety: "Gas Safety Certificate",
          epc: "Energy Performance Certificate",
          deposit_prescribed_info: "Deposit Certificate",
          eicr: "Electrical Safety Report",
          inventory: "Inventory Report",
          how_to_rent_guide: "How to Rent Guide",
          insurance: "Insurance Certificate",
          pat: "PAT Certificate",
          hmo_licence: "HMO Licence",
          other: "Document",
        };
        if (tenancyDocs && tenancyDocs.length > 0) {
          setDocuments((tenancyDocs as any[]).map((d: any) => ({
            id: d.id,
            kind: d.kind || "other",
            label: kindLabels[d.kind] || "Document",
            issuedOn: d.issued_on ? new Date(d.issued_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
            expiresOn: d.expires_on ? new Date(d.expires_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null,
            storagePath: d.storage_path || null,
            status: "available" as const,
          })));
        }

        if (notifs && notifs.length > 0) {
          setUpdates((notifs as any[]).map((n: any) => ({
            id: n.id,
            title: n.title || "Update",
            property_name: prop ? (prop as any).line1 || "Property" : "Property",
            communication_type: n.type || "general",
            status: n.is_read ? "sent" : "ready",
            message: n.body || "",
            sent_at: n.created_at,
            created_at: n.created_at,
          })));
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  useRealtimeSubscription({
    table: "notifications",
    event: "*",
    onChange: () => {},
    channelName: "rt-tenant-notifications",
  });

  useRealtimeSubscription({
    table: "messages",
    event: "*",
    onChange: () => {},
    channelName: "rt-tenant-messages",
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-trigger")) {
        setCategoryDropdown(false);
        setPriorityDropdown(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/tenant/login";
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError("");
    setReportLoading(true);

    if (!reportForm.title || !reportForm.description) {
      setReportError("Please fill in all required fields.");
      setReportLoading(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("title", reportForm.title);
      formData.append("category", reportForm.category);
      formData.append("description", reportForm.description);
      formData.append("priority", reportForm.priority);
      formData.append("email", reportForm.email || tenantEmail);
      formData.append("property", property.name);
      formData.append("tenancy_ref", tenancy.ref);
      await fetch("https://readdy.ai/api/form/d8vemh04jh3v1cgksf2g", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
    } catch {}

    setReportLoading(false);
    setShowReportForm(false);
    setReportSuccess(true);
    setReportForm({ title: "", category: "General", description: "", priority: "Medium", email: "" });
    if (reportToastTimerRef.current) clearTimeout(reportToastTimerRef.current);
    reportToastTimerRef.current = setTimeout(() => setReportSuccess(false), 4000);
  };

  const formatCommDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      " at " +
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const commTypeIcon: Record<string, { icon: string; color: string }> = {
    rent_reminder: { icon: "ri-money-pound-circle-line", color: "bg-[#7A9A7E]" },
    maintenance_notice: { icon: "ri-tools-line", color: "bg-[#F59E0B]" },
    inspection_notice: { icon: "ri-clipboard-line", color: "bg-[#14B8A6]" },
    safety_notice: { icon: "ri-shield-check-line", color: "bg-[#EF4444]" },
    pet_request_approved: { icon: "ri-bear-smile-line", color: "bg-[#10B981]" },
    pet_request_refused: { icon: "ri-forbid-line", color: "bg-[#EF4444]" },
    mod_request_approved: { icon: "ri-home-gear-line", color: "bg-[#10B981]" },
    mod_request_refused: { icon: "ri-forbid-line", color: "bg-[#EF4444]" },
    general: { icon: "ri-message-3-line", color: "bg-[#3B82F6]" },
  };

  const commStatusBadge: Record<string, string> = {
    draft: "bg-[#F1F5F9] text-[#687068]",
    ready: "bg-[#F59E0B]/10 text-[#F59E0B]",
    sent: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
    archived: "bg-[#94A3B8]/10 text-[#687068]",
  };

  const statusBadge: Record<string, string> = {
    "Under Review": "bg-[#8B5CF6]/10 text-[#8B5CF6]",
    Completed: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
    Open: "bg-[#F59E0B]/10 text-[#F59E0B]",
    Scheduled: "bg-[#14B8A6]/10 text-[#14B8A6]",
    "in_progress": "bg-[#3B82F6]/10 text-[#3B82F6]",
    completed: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  };

  const priorityBadge: Record<string, string> = {
    Low: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
    Medium: "bg-[#F59E0B]/10 text-[#F59E0B]",
    High: "bg-[#EF4444]/10 text-[#EF4444]",
    Emergency: "bg-[#EF4444] text-white",
  };

  const docKindConfig: Record<string, { icon: string; color: string; bg: string }> = {
    tenancy_agreement: { icon: "ri-file-text-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
    gas_safety: { icon: "ri-fire-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
    epc: { icon: "ri-leaf-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
    deposit_prescribed_info: { icon: "ri-safe-2-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
    eicr: { icon: "ri-flashlight-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
    inventory: { icon: "ri-list-check-2", color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10" },
    how_to_rent_guide: { icon: "ri-book-open-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
    insurance: { icon: "ri-shield-check-line", color: "text-[#6366F1]", bg: "bg-[#6366F1]/10" },
    other: { icon: "ri-file-line", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" },
  };

  const handleDocDownload = async (doc: TenancyDocument) => {
    if (demoMode) {
      setDocToast(`"${doc.label}" would download here in live mode`);
      if (docToastTimerRef.current) clearTimeout(docToastTimerRef.current);
      docToastTimerRef.current = setTimeout(() => setDocToast(null), 3500);
      return;
    }
    if (!doc.storagePath) {
      setDocToast("This document is not yet available for download");
      if (docToastTimerRef.current) clearTimeout(docToastTimerRef.current);
      docToastTimerRef.current = setTimeout(() => setDocToast(null), 3500);
      return;
    }
    setDownloadingId(doc.id);
    try {
      const bucket = doc.storagePath.startsWith("private/") ? "private" : "documents";
      const path = doc.storagePath.replace(/^(private|documents)\//, "");
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw new Error("Could not generate download link");
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = doc.label;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setDocToast("Download failed — please contact your property manager");
      if (docToastTimerRef.current) clearTimeout(docToastTimerRef.current);
      docToastTimerRef.current = setTimeout(() => setDocToast(null), 3500);
    }
    setDownloadingId(null);
  };

  const handleProfileSave = async () => {
    if (demoMode) {
      setProfileEditing(false);
      setProfileToast({ type: "success", msg: "Profile updated (demo mode)" });
      if (profileToastTimerRef.current) clearTimeout(profileToastTimerRef.current);
      profileToastTimerRef.current = setTimeout(() => setProfileToast(null), 3000);
      return;
    }
    if (!tenantId) return;
    setProfileSaving(true);
    const { error } = await supabase.from("tenants").update({
      phone: profileForm.phone || null,
      emergency_contact_name: profileForm.emergencyName || null,
      emergency_contact_phone: profileForm.emergencyPhone || null,
      emergency_contact_relation: profileForm.emergencyRelation || null,
    }).eq("id", tenantId);
    setProfileSaving(false);
    if (error) {
      setProfileToast({ type: "error", msg: "Could not save — please try again" });
    } else {
      setProfileEditing(false);
      setProfileToast({ type: "success", msg: "Profile updated successfully" });
    }
    if (profileToastTimerRef.current) clearTimeout(profileToastTimerRef.current);
    profileToastTimerRef.current = setTimeout(() => setProfileToast(null), 3000);
  };

  const handleModSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModError("");
    if (!modForm.description || !modForm.reason) { setModError("Please fill in all required fields."); return; }
    setModSubmitting(true);
    const description = `Type: ${modForm.type}\nProposed Change: ${modForm.description}\nReason: ${modForm.reason}\nReversible: ${modForm.reversible}`;
    if (demoMode) {
      setModRequests((prev) => [{ id: "demo-mod-" + Date.now(), modification_type: modForm.type, description, status: "requested", decided_on: null, refusal_reason: null, created_at: new Date().toISOString() }, ...prev]);
      setModSubmitting(false); setModSuccess(true);
      setModForm({ type: "Decoration", description: "", reason: "", reversible: "Yes" });
      if (modToastTimerRef.current) clearTimeout(modToastTimerRef.current);
      modToastTimerRef.current = setTimeout(() => { setModSuccess(false); setShowModForm(false); }, 2500);
      return;
    }
    if (!tenancyId) { setModError("Tenancy not found."); setModSubmitting(false); return; }
    const { data, error } = await supabase.from("modification_requests").insert({ tenancy_id: tenancyId, modification_type: modForm.type, description, status: "requested" }).select().maybeSingle();
    setModSubmitting(false);
    if (error) { setModError("Could not submit \u2014 please try again."); return; }
    if (data) setModRequests((prev) => [data, ...prev]);
    setModSuccess(true);
    setModForm({ type: "Decoration", description: "", reason: "", reversible: "Yes" });
    if (modToastTimerRef.current) clearTimeout(modToastTimerRef.current);
    modToastTimerRef.current = setTimeout(() => { setModSuccess(false); setShowModForm(false); }, 2500);
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPetError("");
    if (!petForm.breed || !petForm.name || !petForm.reason) {
      setPetError("Please fill in all required fields.");
      return;
    }
    setPetSubmitting(true);
    const description = `Pet Type: ${petForm.type}\nBreed/Species: ${petForm.breed}\nName: ${petForm.name}\nAge: ${petForm.age || "Not specified"}\nReason: ${petForm.reason}${petForm.extraInfo ? `\nAdditional Info: ${petForm.extraInfo}` : ""}`;
    if (demoMode) {
      setPetRequests((prev) => [{ id: "demo-" + Date.now(), description, status: "requested", decided_on: null, refusal_reason: null, created_at: new Date().toISOString() }, ...prev]);
      setPetSubmitting(false);
      setPetSuccess(true);
      setPetForm({ type: "Cat", breed: "", name: "", age: "", reason: "", extraInfo: "" });
      if (petToastTimerRef.current) clearTimeout(petToastTimerRef.current);
      petToastTimerRef.current = setTimeout(() => { setPetSuccess(false); setShowPetForm(false); }, 2500);
      return;
    }
    if (!tenancyId) { setPetError("Tenancy not found."); setPetSubmitting(false); return; }
    const { data, error } = await supabase.from("pet_requests").insert({ tenancy_id: tenancyId, description, status: "requested" }).select().maybeSingle();
    setPetSubmitting(false);
    if (error) { setPetError("Could not submit — please try again."); return; }
    if (data) setPetRequests((prev) => [data, ...prev]);
    setPetSuccess(true);
    setPetForm({ type: "Cat", breed: "", name: "", age: "", reason: "", extraInfo: "" });
    if (petToastTimerRef.current) clearTimeout(petToastTimerRef.current);
    petToastTimerRef.current = setTimeout(() => { setPetSuccess(false); setShowPetForm(false); }, 2500);
  };

  const isExpiringSoon = (expiresOn: string | null) => {
    if (!expiresOn) return false;
    const months3 = new Date();
    months3.setMonth(months3.getMonth() + 3);
    return new Date(expiresOn) < months3;
  };

  const unreadCount = updates.filter(u => u.status === "ready").length;

  const scrollToMessages = () => {
    document.getElementById("messages-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMarkAllRead = async () => {
    const unreadIds = updates.filter(u => u.status === "ready").map(u => u.id);
    if (unreadIds.length === 0) return;
    setUpdates(prev => prev.map(u => u.status === "ready" ? { ...u, status: "sent" as const } : u));
    if (!demoMode) {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4]">
      <style>{`.honeypot-field{position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none}`}</style>
      <PortalBrandingHeader
        portalLabel="Tenant Portal"
        onLogout={handleLogout}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        extra={
          <>
            <span className="text-xs text-[#687068] bg-[#F1F5F9] px-2.5 py-1 rounded-full">{property.name}</span>
            <button
              onClick={scrollToMessages}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              title="Notifications"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-notification-3-line text-[#3A3F3A] text-lg"></i>
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#EF4444] text-white text-[10px] font-bold rounded-full px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Welcome, {tenantName.split(" ")[0]}</h1>
            <p className="text-sm text-[#687068] mt-1">{property.name} · {property.address}, {property.postcode}</p>
          </div>
          <button
            onClick={() => setShowReportForm(true)}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <i className="ri-add-circle-line"></i>
            Report Repair
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <p className="text-xs text-[#687068] mb-1">Monthly Rent</p>
            <p className="text-2xl font-bold text-[#3A3F3A]">{tenancy.rentAmount}</p>
            <p className="text-[10px] text-[#7A9A7E]">{tenancy.rentStatus}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <p className="text-xs text-[#687068] mb-1">Next Payment Due</p>
            <p className="text-2xl font-bold text-[#3A3F3A]">{tenancy.nextPaymentDue}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <p className="text-xs text-[#687068] mb-1">Tenancy Ends</p>
            <p className="text-2xl font-bold text-[#3A3F3A]">{tenancy.endDate}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <p className="text-xs text-[#687068] mb-1">Deposit</p>
            <p className="text-2xl font-bold text-[#3A3F3A]">{tenancy.depositAmount}</p>
            <p className="text-[10px] text-[#687068]">{tenancy.depositScheme}</p>
          </div>
        </div>

        {/* Renewal Banner */}
        {(() => {
          if (!tenancyEndRaw) return null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const end = new Date(tenancyEndRaw);
          end.setHours(0, 0, 0, 0);
          const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft > 90 || daysLeft <= 0) return null;
          const urgent = daysLeft <= 30;
          const soon = daysLeft <= 60;
          const pct = Math.max(0, Math.min(100, Math.round(((90 - daysLeft) / 90) * 100)));
          const bg = urgent ? "bg-[#FEF2F2] border-[#FECACA]" : soon ? "bg-[#FFF7ED] border-[#FED7AA]" : "bg-[#FFFBEB] border-[#FDE68A]";
          const iconBg = urgent ? "bg-[#EF4444]" : soon ? "bg-[#F97316]" : "bg-[#F59E0B]";
          const icon = urgent ? "ri-alarm-warning-line" : "ri-loop-left-line";
          const barColor = urgent ? "bg-[#EF4444]" : soon ? "bg-[#F97316]" : "bg-[#F59E0B]";
          const title = urgent ? "Your tenancy ends very soon" : soon ? "Your tenancy is ending soon" : "Your tenancy renewal window is open";
          const subtitle = urgent
            ? `Only ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining — please contact your property manager urgently to confirm your plans.`
            : soon
            ? `${daysLeft} days until your tenancy ends on ${tenancy.endDate}. Let your property manager know if you wish to renew or vacate.`
            : `Your tenancy ends in ${daysLeft} days on ${tenancy.endDate}. This is a good time to discuss renewal options with your agent.`;
          return (
            <div className={`rounded-xl border p-4 ${bg}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <i className={`${icon} text-white text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#3A3F3A]">{title}</p>
                      <p className="text-xs text-[#687068] mt-0.5 leading-relaxed">{subtitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-2xl font-bold ${urgent ? "text-[#EF4444]" : soon ? "text-[#F97316]" : "text-[#F59E0B]"}`}>{daysLeft}</p>
                      <p className="text-[10px] text-[#94A3B8] -mt-0.5">days left</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span>Renewal window</span>
                      <span>{pct}% elapsed</span>
                    </div>
                    <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href="mailto:sarah.williams@agency.com"
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                        urgent ? "bg-[#EF4444] text-white hover:bg-[#DC2626]" : soon ? "bg-[#F97316] text-white hover:bg-[#EA580C]" : "bg-[#F59E0B] text-white hover:bg-[#D97706]"
                      }`}
                    >
                      Contact My Agent
                    </a>
                    <span className="text-[10px] text-[#94A3B8]">Tenancy ends {tenancy.endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Arrears Status Banner */}
        <div className="bg-[#ECFDF5] rounded-xl border border-[#A7F3D0] p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-check-double-line text-white text-lg"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#3A3F3A]">Your rent account is up to date</p>
            <p className="text-xs text-[#687068]">No arrears. Next payment due {tenancy.nextPaymentDue}.</p>
          </div>
        </div>

        {/* Payment History + Payment Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-bank-card-line text-[#7A9A7E] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Payment History</h2>
              </div>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {payments.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-[#94A3B8]">No payment history</p>
                </div>
              ) : (
                payments.map((pmt, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{pmt.month}</p>
                        <p className="text-xs text-[#94A3B8]">{pmt.method} · {pmt.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#7A9A7E]">{pmt.amount}</p>
                      <p className="text-xs text-[#7A9A7E]">{pmt.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-information-line text-[#3B82F6] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">How to Pay</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#FBF9F4] rounded-xl p-4">
                <p className="text-xs font-medium text-[#687068] mb-2">Bank Transfer</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Sort Code</span>
                    <span className="font-medium text-[#3A3F3A]">20-10-53</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Account</span>
                    <span className="font-medium text-[#3A3F3A]">33841605</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Reference</span>
                    <span className="font-medium text-[#3A3F3A]">{tenancy.ref}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-4">
                <p className="text-xs font-medium text-[#687068] mb-2">Payment Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Amount</span>
                    <span className="font-medium text-[#3A3F3A]">{tenancy.rentAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Due Day</span>
                    <span className="font-medium text-[#3A3F3A]">1st of each month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Next Due</span>
                    <span className="font-medium text-[#3A3F3A]">{tenancy.nextPaymentDue}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-[#687068] leading-relaxed">
                Payments should be made by the 1st of each month. If you experience any difficulty, please contact your property manager.
              </div>
            </div>
          </div>
        </div>

        {/* Document Centre */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                <i className="ri-folder-open-line text-[#C28A78] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Document Centre</h2>
              <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{(demoMode ? demoDocuments : documents).length} documents</span>
            </div>
            {demoMode && <span className="text-xs text-[#94A3B8]">Demo — live docs load from your tenancy</span>}
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(demoMode ? demoDocuments : documents).length === 0 ? (
                <div className="col-span-full py-10 text-center">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-folder-open-line text-[#94A3B8] text-xl"></i>
                  </div>
                  <p className="text-sm text-[#94A3B8]">No documents available yet</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Your property manager will upload them here</p>
                </div>
              ) : (
                (demoMode ? demoDocuments : documents).map((doc) => {
                  const cfg = docKindConfig[doc.kind] || docKindConfig.other;
                  const expiring = isExpiringSoon(doc.expiresOn);
                  const isDownloading = downloadingId === doc.id;
                  return (
                    <div key={doc.id} className="bg-[#FBF9F4] rounded-xl p-4 flex flex-col gap-3 border border-[#EBE5DA] hover:border-[#C28A78]/30 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <i className={`${cfg.icon} ${cfg.color} text-lg`}></i>
                        </div>
                        {expiring && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] whitespace-nowrap">Expiring soon</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#3A3F3A] leading-tight">{doc.label}</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Issued {doc.issuedOn}</p>
                        {doc.expiresOn && (
                          <p className={`text-xs mt-0.5 ${expiring ? "text-[#F59E0B] font-medium" : "text-[#94A3B8]"}`}>
                            Expires {doc.expiresOn}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDocDownload(doc)}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white border border-[#D5D9D5] text-sm font-medium text-[#3A3F3A] hover:bg-[#C28A78] hover:text-white hover:border-[#C28A78] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Preparing...
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-download-line text-sm"></i>
                            </div>
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-tools-line text-[#F59E0B] text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">My Maintenance Requests</h2>
                </div>
                <button onClick={() => setShowReportForm(true)} className="text-sm text-[#C28A78] font-medium hover:underline">New Report</button>
              </div>
              <div className="divide-y divide-[#D5D9D5]">
                {tickets.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-check-line text-[#94A3B8] text-xl"></i>
                    </div>
                    <p className="text-sm text-[#94A3B8]">No maintenance requests</p>
                  </div>
                ) : (
                  tickets.map((ticket) => {
                    const s = ticket.status.toLowerCase();
                    const sIcon = s === "completed" ? "ri-check-line" : s.includes("under") ? "ri-search-line" : "ri-time-line";
                    const sColor = statusBadge[ticket.status]?.split(" ")[1] || "text-[#94A3B8]";
                    return (
                      <div key={ticket.id} className="flex items-start gap-3 px-5 py-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusBadge[ticket.status] || "bg-[#F1F5F9]"} bg-opacity-20`}>
                          <i className={`${sIcon} ${sColor} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#3A3F3A]">{ticket.title}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityBadge[ticket.priority]}`}>{ticket.priority}</span>
                          </div>
                          <p className="text-xs text-[#687068] mt-0.5">{ticket.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[ticket.status]}`}>{ticket.status}</span>
                            <span className="text-xs text-[#94A3B8]">{ticket.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div id="messages-section" className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-message-3-line text-[#C28A78] text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">Messages &amp; Notices</h2>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-[#C28A78] hover:text-[#B07562] transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <i className="ri-check-double-line text-xs"></i>
                      </div>
                      Mark all as read
                    </button>
                  )}
                  <span className="text-xs text-[#94A3B8]">{updates.length} messages</span>
                </div>
              </div>
              <div className="divide-y divide-[#D5D9D5]">
                {updates.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-[#94A3B8]">No messages from your agency</p>
                  </div>
                ) : (
                  updates.map((msg) => {
                    const typeStyle = commTypeIcon[msg.communication_type] || commTypeIcon.general;
                    return (
                      <button
                        key={msg.id}
                        onClick={() => setTenantMsgDetail(msg)}
                        className="w-full flex items-start gap-3 px-5 py-4 hover:bg-[#FBF9F4] transition-colors text-left"
                      >
                        <div className={`w-9 h-9 ${typeStyle.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className={`${typeStyle.icon} text-white text-sm`}></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#3A3F3A] truncate">{msg.title}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${commStatusBadge[msg.status]}`}>
                              {msg.status === "ready" ? "New" : msg.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#687068] mt-0.5 truncate">{msg.message.split("\n")[0]}</p>
                          <p className="text-xs text-[#94A3B8] mt-1">{formatCommDate(msg.sent_at || msg.created_at)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Property Manager</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#C28A78]/20 flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-3-line text-[#C28A78] text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">Sarah Williams</p>
                    <p className="text-xs text-[#687068]">Property Manager</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <a href="mailto:sarah.williams@agency.com" className="flex items-center gap-2 text-sm text-[#687068] hover:text-[#C28A78] transition-colors">
                    <i className="ri-mail-line text-sm"></i>
                    sarah.williams@agency.com
                  </a>
                  <a href="tel:+442071234567" className="flex items-center gap-2 text-sm text-[#687068] hover:text-[#C28A78] transition-colors">
                    <i className="ri-phone-line text-sm"></i>
                    020 7123 4567
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-clipboard-line text-[#14B8A6] text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">Inspection Notices</h2>
                </div>
              </div>
              <div className="divide-y divide-[#D5D9D5]">
                {[
                  { id: "i1", type: "Routine Inspection", date: "12 Aug 2026", status: "Scheduled" },
                  { id: "i2", type: "Gas Safety Check", date: "3 Jul 2026", status: "Scheduled" },
                  { id: "i3", type: "Routine Inspection", date: "15 Mar 2026", status: "Completed" },
                ].map((notice) => (
                  <div key={notice.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notice.status === "Scheduled" ? "bg-[#3B82F6]/10" : "bg-[#7A9A7E]/10"}`}>
                      <i className={`${notice.status === "Scheduled" ? "ri-calendar-line text-[#3B82F6]" : "ri-check-line text-[#7A9A7E]"} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{notice.type}</p>
                      <p className="text-xs text-[#687068]">{notice.date} · {notice.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Tenancy Details</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Ref</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{tenancy.ref}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Start Date</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{tenancy.startDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">End Date</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{tenancy.endDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Deposit</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{tenancy.depositAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Scheme</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{tenancy.depositScheme}</span>
                </div>
              </div>
            </div>

            {/* My Profile */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#6366F1]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-user-settings-line text-[#6366F1] text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">My Profile</h2>
                </div>
                {!profileEditing && (
                  <button
                    onClick={() => setProfileEditing(true)}
                    className="text-xs font-medium text-[#6366F1] hover:underline flex items-center gap-1"
                  >
                    <i className="ri-edit-line text-xs"></i> Edit
                  </button>
                )}
              </div>
              <div className="p-5 space-y-4">
                {/* Name & Email — read only */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      <i className="ri-user-3-line text-[#94A3B8] text-sm"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94A3B8]">Full Name</p>
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{tenantName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      <i className="ri-mail-line text-[#94A3B8] text-sm"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94A3B8]">Email</p>
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{tenantEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#EBE5DA] pt-3 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Contact Details</p>
                  {profileEditing ? (
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+44 7700 000000"
                      className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] bg-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                        <i className="ri-phone-line text-[#94A3B8] text-sm"></i>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#94A3B8]">Phone</p>
                        <p className="text-sm font-medium text-[#3A3F3A]">{profileForm.phone || <span className="text-[#94A3B8] italic">Not set</span>}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#EBE5DA] pt-3 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Emergency Contact</p>
                  {profileEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={profileForm.emergencyName}
                        onChange={(e) => setProfileForm((f) => ({ ...f, emergencyName: e.target.value }))}
                        placeholder="Full name"
                        className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] bg-white"
                      />
                      <input
                        type="tel"
                        value={profileForm.emergencyPhone}
                        onChange={(e) => setProfileForm((f) => ({ ...f, emergencyPhone: e.target.value }))}
                        placeholder="Phone number"
                        className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] bg-white"
                      />
                      <input
                        type="text"
                        value={profileForm.emergencyRelation}
                        onChange={(e) => setProfileForm((f) => ({ ...f, emergencyRelation: e.target.value }))}
                        placeholder="Relationship (e.g. Parent, Partner)"
                        className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] bg-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profileForm.emergencyName ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                              <i className="ri-heart-pulse-line text-[#EF4444] text-sm"></i>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">{profileForm.emergencyRelation || "Contact"}</p>
                              <p className="text-sm font-medium text-[#3A3F3A]">{profileForm.emergencyName}</p>
                            </div>
                          </div>
                          {profileForm.emergencyPhone && (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                                <i className="ri-phone-line text-[#94A3B8] text-sm"></i>
                              </div>
                              <p className="text-sm font-medium text-[#3A3F3A]">{profileForm.emergencyPhone}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-[#94A3B8] italic">No emergency contact set</p>
                      )}
                    </div>
                  )}
                </div>

                {profileEditing && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      className="flex-1 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {profileSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setProfileEditing(false)}
                      className="flex-1 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pet Permission */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-bear-smile-line text-[#7C3AED] text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">Pet Permission</h2>
                </div>
                <button
                  onClick={() => setShowPetForm(true)}
                  className="text-xs font-medium text-[#7C3AED] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                >
                  + New Request
                </button>
              </div>
              <div className="p-4">
                {(demoMode ? [] : petRequests).length === 0 && !demoMode ? (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="ri-bear-smile-line text-[#7C3AED] text-lg"></i>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">No pet requests yet. Submit a formal request and your agent will review it.</p>
                  </div>
                ) : petRequests.length === 0 && demoMode ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#94A3B8]">No requests yet — click &quot;+ New Request&quot; to try it</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {petRequests.map((req) => {
                      const firstLine = req.description?.split("\n")[0] || "Pet request";
                      const statusCfg: Record<string, { label: string; color: string; bg: string; icon: string }> = {
                        requested: { label: "Pending", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-time-line" },
                        approved: { label: "Approved", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-line" },
                        refused: { label: "Refused", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", icon: "ri-close-line" },
                        withdrawn: { label: "Withdrawn", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-arrow-go-back-line" },
                      };
                      const cfg = statusCfg[req.status] || statusCfg.requested;
                      return (
                        <div key={req.id} className="bg-[#FBF9F4] rounded-lg p-3 border border-[#EBE5DA]">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-[#3A3F3A] leading-snug flex-1">{firstLine}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                              <i className={`${cfg.icon} text-[10px]`}></i>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-1">
                            {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {req.status === "refused" && req.refusal_reason && (
                            <p className="text-[10px] text-[#EF4444] mt-1 leading-snug">Reason: {req.refusal_reason}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {/* Property Modifications */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0F766E]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-home-gear-line text-[#0F766E] text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">Modifications</h2>
                </div>
                <button
                  onClick={() => setShowModForm(true)}
                  className="text-xs font-medium text-[#0F766E] bg-[#0F766E]/10 hover:bg-[#0F766E]/20 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                >
                  + New Request
                </button>
              </div>
              <div className="p-4">
                {modRequests.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 bg-[#0F766E]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="ri-home-gear-line text-[#0F766E] text-lg"></i>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">No modification requests yet. Ask permission before making any changes to the property.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {modRequests.map((req) => {
                      const statusCfg: Record<string, { label: string; color: string; bg: string; icon: string }> = {
                        requested: { label: "Pending", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-time-line" },
                        approved: { label: "Approved", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-line" },
                        refused: { label: "Refused", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", icon: "ri-close-line" },
                        withdrawn: { label: "Withdrawn", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-arrow-go-back-line" },
                      };
                      const cfg = statusCfg[req.status] || statusCfg.requested;
                      return (
                        <div key={req.id} className="bg-[#F0FDFA] rounded-lg p-3 border border-[#CCFBF1]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="text-xs font-semibold text-[#0F766E] bg-[#0F766E]/10 px-1.5 py-0.5 rounded whitespace-nowrap">{req.modification_type}</span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                              <i className={`${cfg.icon} text-[10px]`}></i>{cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#687068] mt-1.5 leading-snug line-clamp-2">{req.description?.split("\n")[1]?.replace("Proposed Change: ", "") || req.description?.split("\n")[0]}</p>
                          <p className="text-[10px] text-[#94A3B8] mt-1">{new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                          {req.status === "refused" && req.refusal_reason && (
                            <p className="text-[10px] text-[#EF4444] mt-1 leading-snug">Reason: {req.refusal_reason}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showReportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReportForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-tools-line text-[#EF4444] text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#3A3F3A]">Report a Repair</h2>
                  <p className="text-xs text-[#687068]">{property.name}</p>
                </div>
              </div>
              <button onClick={() => setShowReportForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-4" data-readdy-form>
              {reportError && (
                <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-error-warning-line text-sm"></i>
                  </div>
                  {reportError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Issue Title <span className="text-[#EF4444]">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Leaking tap in kitchen"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative dropdown-trigger">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Category</label>
                  <button type="button" onClick={() => setCategoryDropdown(!categoryDropdown)} className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white">
                    <span>{reportForm.category}</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                  </button>
                  {categoryDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-30">
                      {["General", "Plumbing", "Electrical", "Heating", "Appliances", "Damp & Mould", "Structural", "Pest Control", "Other"].map((c) => (
                        <button key={c} type="button" onClick={() => { setReportForm((f) => ({ ...f, category: c })); setCategoryDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]">{c}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative dropdown-trigger">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Priority</label>
                  <button type="button" onClick={() => setPriorityDropdown(!priorityDropdown)} className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white">
                    <span>{reportForm.priority}</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                  </button>
                  {priorityDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-30">
                      {["Low", "Medium", "High", "Emergency"].map((p) => (
                        <button key={p} type="button" onClick={() => { setReportForm((f) => ({ ...f, priority: p })); setPriorityDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]">{p}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Description <span className="text-[#EF4444]">*</span></label>
                <textarea
                  name="description"
                  value={reportForm.description}
                  onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white resize-none"
                  required
                />
                <p className="text-xs text-[#94A3B8] mt-1">{reportForm.description.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={reportForm.email}
                  onChange={(e) => setReportForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder={tenantEmail}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                />
              </div>

              <input type="text" name="website_alt" tabIndex={-1} autoComplete="off" aria-hidden="true" className="honeypot-field" />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="flex-1 bg-[#EF4444] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#DC2626] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reportSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#7A9A7E] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line"></i>
          Repair reported! Your letting agent will be in touch.
        </div>
      )}

      {tenantMsgDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setTenantMsgDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(commTypeIcon[tenantMsgDetail.communication_type] || commTypeIcon.general).color}`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${(commTypeIcon[tenantMsgDetail.communication_type] || commTypeIcon.general).icon} text-white`}></i>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{tenantMsgDetail.title}</h3>
                  <p className="text-xs text-[#687068]">{tenantMsgDetail.property_name}</p>
                </div>
              </div>
              <button onClick={() => setTenantMsgDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-0.5">Status</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${commStatusBadge[tenantMsgDetail.status]}`}>
                    {tenantMsgDetail.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-0.5">Type</p>
                  <p className="text-sm text-[#3A3F3A] capitalize">{tenantMsgDetail.communication_type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-0.5">Date</p>
                  <p className="text-sm text-[#3A3F3A]">{formatCommDate(tenantMsgDetail.sent_at || tenantMsgDetail.created_at)}</p>
                </div>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-5">
                <p className="text-xs text-[#94A3B8] mb-2">Message</p>
                <div className="text-sm text-[#3A3F3A] whitespace-pre-wrap leading-relaxed">
                  {tenantMsgDetail.message}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4] text-right">
              <button
                onClick={() => setTenantMsgDetail(null)}
                className="text-sm font-medium text-[#687068] px-4 py-2 rounded-lg hover:bg-[#D5D9D5] transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modification Request Modal */}
      {showModForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowModForm(false); setModError(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-home-gear-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Property Modification Request</h3>
                    <p className="text-xs text-white/70">Request permission to make changes to the property</p>
                  </div>
                </div>
                <button onClick={() => { setShowModForm(false); setModError(""); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <i className="ri-close-line text-white text-base"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleModSubmit} className="p-5 space-y-4">
              {modSuccess ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 bg-[#14B8A6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-double-line text-[#14B8A6] text-3xl"></i>
                  </div>
                  <p className="text-base font-bold text-[#3A3F3A] mb-1">Request submitted!</p>
                  <p className="text-sm text-[#687068]">Your property manager will review it and get back to you.</p>
                </div>
              ) : (
                <>
                  {modError && (
                    <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
                      <i className="ri-error-warning-line text-sm"></i>
                      {modError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Modification Type</label>
                    <div className="relative">
                      <button type="button" onClick={() => setModTypeOpen(!modTypeOpen)} className="w-full flex items-center justify-between px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] focus:border-[#0F766E] transition-colors">
                        <span className="flex items-center gap-2"><i className="ri-home-gear-line text-[#0F766E]"></i>{modForm.type}</span>
                        <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${modTypeOpen ? "rotate-180" : ""}`}></i>
                      </button>
                      {modTypeOpen && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-30 overflow-hidden">
                          {["Decoration", "Fixtures & Fittings", "Garden / Outdoor", "Flooring", "Structural", "Storage", "Other"].map((t) => (
                            <button key={t} type="button" onClick={() => { setModForm((f) => ({ ...f, type: t })); setModTypeOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F0FDFA] transition-colors">{t}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Describe the proposed change <span className="text-[#EF4444]">*</span></label>
                    <textarea
                      value={modForm.description}
                      onChange={(e) => setModForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="e.g. I would like to paint the living room walls in a neutral grey colour (Farrow & Ball Pebble No.5)"
                      rows={3}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#0F766E] bg-[#FAFAF8] resize-none transition-colors"
                      required
                    />
                    <p className="text-xs text-[#94A3B8] mt-1 text-right">{modForm.description.length}/500</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Why do you want to make this change? <span className="text-[#EF4444]">*</span></label>
                    <textarea
                      value={modForm.reason}
                      onChange={(e) => setModForm((f) => ({ ...f, reason: e.target.value }))}
                      placeholder="Briefly explain your reason and how this improves your home..."
                      rows={2}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#0F766E] bg-[#FAFAF8] resize-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Is this change reversible?</label>
                    <div className="relative">
                      <button type="button" onClick={() => setModRevOpen(!modRevOpen)} className="w-full flex items-center justify-between px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] transition-colors">
                        <span>{modForm.reversible}</span>
                        <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${modRevOpen ? "rotate-180" : ""}`}></i>
                      </button>
                      {modRevOpen && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-30 overflow-hidden">
                          {["Yes — will restore on vacating", "Partially reversible", "No — permanent change"].map((r) => (
                            <button key={r} type="button" onClick={() => { setModForm((f) => ({ ...f, reversible: r })); setModRevOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F0FDFA] transition-colors">{r}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#F0FDFA] rounded-xl p-3.5 flex items-start gap-2.5">
                    <i className="ri-information-line text-[#0F766E] text-sm mt-0.5"></i>
                    <p className="text-xs text-[#687068] leading-relaxed">Your request will be reviewed by your property manager and forwarded to the landlord if required. Making modifications without written consent may result in a deposit deduction.</p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={modSubmitting} className="flex-1 bg-[#0F766E] hover:bg-[#0D9488] text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2">
                      {modSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>) : (<><i className="ri-send-plane-line"></i> Submit Request</>)}
                    </button>
                    <button type="button" onClick={() => { setShowModForm(false); setModError(""); }} className="flex-1 border-2 border-[#D5D9D5] text-sm font-semibold py-3 rounded-xl hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A] whitespace-nowrap">Cancel</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Pet Permission Modal */}
      {showPetForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowPetForm(false); setPetError(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-bear-smile-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pet Permission Request</h3>
                    <p className="text-xs text-white/70">Submit a formal request to keep a pet</p>
                  </div>
                </div>
                <button onClick={() => { setShowPetForm(false); setPetError(""); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <i className="ri-close-line text-white text-base"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handlePetSubmit} className="p-5 space-y-4">
              {petSuccess ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 bg-[#7C3AED]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-double-line text-[#7C3AED] text-3xl"></i>
                  </div>
                  <p className="text-base font-bold text-[#3A3F3A] mb-1">Request submitted!</p>
                  <p className="text-sm text-[#687068]">Your property manager will review and respond shortly.</p>
                </div>
              ) : (
                <>
                  {petError && (
                    <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
                      <i className="ri-error-warning-line text-sm"></i>
                      {petError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Pet Type</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setPetTypeOpen(!petTypeOpen)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] focus:border-[#7C3AED] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <i className="ri-bear-smile-line text-[#7C3AED]"></i>
                          {petForm.type}
                        </span>
                        <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${petTypeOpen ? "rotate-180" : ""}`}></i>
                      </button>
                      {petTypeOpen && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-30 overflow-hidden">
                          {["Cat", "Dog", "Small Animal", "Bird", "Reptile", "Fish", "Other"].map((t) => (
                            <button key={t} type="button" onClick={() => { setPetForm((f) => ({ ...f, type: t })); setPetTypeOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F5F3FF] transition-colors">{t}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Breed / Species <span className="text-[#EF4444]">*</span></label>
                      <input
                        type="text"
                        value={petForm.breed}
                        onChange={(e) => setPetForm((f) => ({ ...f, breed: e.target.value }))}
                        placeholder="e.g. Labrador, Persian"
                        className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#7C3AED] bg-[#FAFAF8] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Pet Name <span className="text-[#EF4444]">*</span></label>
                      <input
                        type="text"
                        value={petForm.name}
                        onChange={(e) => setPetForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Buddy"
                        className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#7C3AED] bg-[#FAFAF8] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Age</label>
                    <input
                      type="text"
                      value={petForm.age}
                      onChange={(e) => setPetForm((f) => ({ ...f, age: e.target.value }))}
                      placeholder="e.g. 2 years"
                      className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#7C3AED] bg-[#FAFAF8] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Why do you want to keep this pet? <span className="text-[#EF4444]">*</span></label>
                    <textarea
                      value={petForm.reason}
                      onChange={(e) => setPetForm((f) => ({ ...f, reason: e.target.value }))}
                      placeholder="Briefly explain why you&apos;d like to keep a pet and how you will care for it responsibly..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#7C3AED] bg-[#FAFAF8] resize-none transition-colors"
                      required
                    />
                    <p className="text-xs text-[#94A3B8] mt-1 text-right">{petForm.reason.length}/500</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Additional info <span className="text-[#94A3B8] font-normal normal-case">(optional)</span></label>
                    <input
                      type="text"
                      value={petForm.extraInfo}
                      onChange={(e) => setPetForm((f) => ({ ...f, extraInfo: e.target.value }))}
                      placeholder="e.g. neutered, vaccinated, house-trained"
                      className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#7C3AED] bg-[#FAFAF8] transition-colors"
                    />
                  </div>

                  <div className="bg-[#F5F3FF] rounded-xl p-3.5 flex items-start gap-2.5">
                    <i className="ri-information-line text-[#7C3AED] text-sm mt-0.5"></i>
                    <p className="text-xs text-[#687068] leading-relaxed">Your request will be reviewed by your property manager and forwarded to the landlord for approval. You will be notified of the decision via this portal.</p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={petSubmitting}
                      className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      {petSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                      ) : (
                        <><i className="ri-send-plane-line"></i> Submit Request</>
                      )}
                    </button>
                    <button type="button" onClick={() => { setShowPetForm(false); setPetError(""); }} className="flex-1 border-2 border-[#D5D9D5] text-sm font-semibold py-3 rounded-xl hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A] whitespace-nowrap">Cancel</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {docToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 whitespace-nowrap">
          <i className="ri-information-line text-sm"></i>
          {docToast}
        </div>
      )}

      {profileToast && (
        <div className={`fixed bottom-6 right-6 z-50 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 whitespace-nowrap ${
          profileToast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"
        }`}>
          <i className={profileToast.type === "success" ? "ri-check-line" : "ri-error-warning-line"}></i>
          {profileToast.msg}
        </div>
      )}
    </div>
  );
}