"use client";

import { useState, useEffect } from "react";
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

const demoTenancy: TenancyData = {
  ref: "TEN-2024-0042",
  startDate: "1 Jun 2024",
  endDate: "31 May 2027",
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

export default function TenantDashboardPage() {
  const [tenancy, setTenancy] = useState<TenancyData>(demoTenancy);
  const [property, setProperty] = useState<PropertyInfo>(demoProperty);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(demoTickets);
  const [payments, setPayments] = useState<any[]>(demoPayments);
  const [updates, setUpdates] = useState<any[]>(demoUpdates);
  const [tenantName, setTenantName] = useState("John Miller");
  const [tenantEmail, setTenantEmail] = useState("john.miller@example.com");
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
  const { branding, primary, primaryHover } = usePortalBranding();

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

      const { data: tenant } = await supabase.from("tenants").select("name, email").eq("id", tenantId).maybeSingle();
      if (tenant) {
        setTenantName((tenant as any).name || "");
        setTenantEmail((tenant as any).email || "");
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

        const { data: prop } = await supabase.from("properties").select("line1, city, postcode").eq("id", tn.property_id).maybeSingle();
        if (prop) {
          setProperty({
            name: (prop as any).line1 || "Property",
            address: `${(prop as any).line1 || ""}, ${(prop as any).city || ""}`,
            postcode: (prop as any).postcode || "",
          });
        }

        const [{ data: maintTickets }, { data: rentPmts }, { data: notifs }] = await Promise.all([
          supabase.from("maintenance_jobs").select("id, title, description, status, created_at").eq("tenancy_id", tn.id).order("created_at", { ascending: false }).limit(10),
          supabase.from("rent_payments").select("id, amount, payment_date, method").eq("tenancy_id", tn.id).order("payment_date", { ascending: false }).limit(12),
          supabase.from("notifications").select("id, title, message, notification_type, status, created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(10),
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

        if (notifs && notifs.length > 0) {
          setUpdates((notifs as any[]).map((n: any) => ({
            id: n.id,
            title: n.title || "Update",
            property_name: prop ? (prop as any).line1 || "Property" : "Property",
            communication_type: n.notification_type || "general",
            status: n.status || "sent",
            message: n.message || "",
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
    setTimeout(() => setReportSuccess(false), 4000);
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
          <span className="text-xs text-[#687068] bg-[#F1F5F9] px-2.5 py-1 rounded-full">{property.name}</span>
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

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-message-3-line text-[#C28A78] text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">Messages & Notices</h2>
                </div>
                <span className="text-xs text-[#94A3B8]">{updates.length} messages</span>
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
    </div>
  );
}