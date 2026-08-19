"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import FinancialActionCentre from "@/components/dashboard/FinancialActionCentre";
import ArrearsCaseCard from "@/components/dashboard/ArrearsCaseCard";
import { arrearsRiskConfig, ArrearsRisk, arrearsStageConfig, ArrearsStage, FinancialActionItem } from "@/lib/financialStatus";
import { useEntitlements } from "@/lib/useEntitlements";
import { isDemoAccount } from "@/lib/demoMode";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { supabase } from "@/lib/supabaseClient";
import { arrearsData, riskConfig } from "./ArrearsData";

interface ArrearsRecord {
  id: number;
  caseId: string | null;
  property: string;
  tenant: string;
  landlord: string;
  rentAmount: number;
  dueDate: string;
  paidDate: string | null;
  outstanding: number;
  arrearsMonths: number;
  totalArrears: number;
  riskRating: ArrearsRisk;
  stage: ArrearsStage;
  lastContact: string;
  lastReminderSent: string;
  contactMethod: string;
  tenantPhone: string;
  tenantEmail: string;
  previousLate: number;
  paymentHistory: { month: string; amount: number; date: string | null; status: string; daysLate: number }[];
  communications: { date: string; type: string; subject: string; status: string; agent: string }[];
}

function computeRisk(months: number): ArrearsRisk {
  if (months >= 3) return "High";
  if (months >= 2) return "Medium";
  return "Low";
}

function computeStage(record: any): ArrearsStage {
  if (record.riskRating === "High" && record.arrearsMonths >= 3) return "escalated";
  if (record.lastContact === "—") return "new";
  return "contact_required";
}

const demoFinancialActions: FinancialActionItem[] = [
  { id: "aa1", priority: "urgent", tenant: "Lisa Chen", property: "Flat 7 Park View", amount: 3600, issue: "3 months overdue — escalate immediately", ageLabel: "90 days", action: "Escalate Case" },
  { id: "aa2", priority: "high", tenant: "Michael Brown", property: "8 The Crescent", amount: 1650, issue: "No response to 2 reminders", ageLabel: "14 days", action: "Phone Call" },
  { id: "aa3", priority: "medium", tenant: "Robert Green", property: "21 High Street", amount: 800, issue: "First payment overdue", ageLabel: "3 days", action: "Send Reminder" },
];

export default function ArrearsPage() {
  const [records, setRecords] = useState<ArrearsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<ArrearsRecord | null>(null);
  const [activeTab, setActiveTab] = useState("arrears");
  const [riskFilter, setRiskFilter] = useState("All");
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  const [selectedActionTenant, setSelectedActionTenant] = useState<ArrearsRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [financialActions, setFinancialActions] = useState<FinancialActionItem[]>([]);
  const [reminderMessage, setReminderMessage] = useState("");
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const { isReadOnly } = useEntitlements();

  useEffect(() => {
    if (isDemoAccount()) {
      const mapped = arrearsData.map((a) => ({
        ...a,
        caseId: null,
        lastReminderSent: "—",
        riskRating: a.riskRating as ArrearsRisk,
        stage: computeStage(a),
        outstanding: a.totalArrears,
      }));
      setRecords(mapped);
      setFinancialActions(demoFinancialActions);
      setLoading(false);
      return;
    }
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const { data: cases, error: caseErr } = await supabase
        .from("arrears_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (caseErr) throw caseErr;

      const { data: overduePayments, error: payErr } = await supabase
        .from("rent_payments")
        .select("*")
        .eq("status", "overdue")
        .order("due_date", { ascending: false });

      if (payErr) throw payErr;

      const propertyIds = new Set<string>();
      const tenantIds = new Set<string>();
      const tenancyIds = new Set<string>();

      (cases || []).forEach((c: any) => { propertyIds.add(c.property_id); tenantIds.add(c.tenant_id); tenancyIds.add(c.tenancy_id); });
      (overduePayments || []).forEach((p: any) => { propertyIds.add(p.property_id); tenantIds.add(p.tenant_id); tenancyIds.add(p.tenancy_id); });

      const { data: properties } = await supabase.from("properties").select("id, line1, city").in("id", Array.from(propertyIds));
      const { data: tenants } = await supabase.from("tenants").select("id, full_name, email, phone").in("id", Array.from(tenantIds));
      const { data: tenancies } = await supabase.from("tenancies").select("id, rent_amount, start_date").in("id", Array.from(tenancyIds));

      const propMap = new Map((properties || []).map((p: any) => [p.id, p]));
      const tenantMap = new Map((tenants || []).map((t: any) => [t.id, t]));

      const mapped: ArrearsRecord[] = [];
      (cases || []).forEach((c: any, idx: number) => {
        const prop = propMap.get(c.property_id);
        const tenant = tenantMap.get(c.tenant_id);
        const months = Math.max(1, Math.ceil(Number(c.total_owed) / 1000));
        const risk = computeRisk(months);
        const lastReminder = c.last_reminder_sent ? new Date(c.last_reminder_sent).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
        mapped.push({
          id: idx + 1,
          caseId: c.id,
          property: prop ? `${prop.line1}, ${prop.city}` : "Unknown",
          tenant: tenant?.full_name || "Tenant",
          landlord: "Owner",
          rentAmount: Math.round(Number(c.total_owed) / months),
          dueDate: "—",
          paidDate: null,
          outstanding: Number(c.total_owed),
          arrearsMonths: months,
          totalArrears: Number(c.total_owed),
          riskRating: risk,
          stage: risk === "High" ? "escalated" : "contact_required",
          lastContact: c.last_contact ? new Date(c.last_contact).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
          lastReminderSent: lastReminder,
          contactMethod: "—",
          tenantPhone: tenant?.phone || "—",
          tenantEmail: tenant?.email || "—",
          previousLate: 0,
          paymentHistory: [],
          communications: [],
        });
      });

      setRecords(mapped);
      setFinancialActions([]);
    } catch (e: any) {
      setError(e.message || "Failed to load arrears data");
    } finally {
      setLoading(false);
    }
  }

  const data = records;

  const totalOutstanding = data.reduce((sum, a) => sum + a.totalArrears, 0);
  const tenantsInArrears = data.length;
  const highRiskCount = data.filter((a) => a.riskRating === "High").length;
  const mediumRiskCount = data.filter((a) => a.riskRating === "Medium").length;
  const lowRiskCount = data.filter((a) => a.riskRating === "Low").length;
  const paymentPlanCount = data.filter((a) => a.stage === "payment_plan").length;
  const urgentCount = data.filter((a) => a.riskRating === "High").length;

  const filtered = data.filter((a) => {
    const matchesRisk = riskFilter === "All" || a.riskRating === riskFilter;
    const matchesSearch = a.property.toLowerCase().includes(searchQuery.toLowerCase()) || a.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(null), 3000);
    toastTimerRef.current = timer;
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading arrears data...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-[#C46868]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-[#C46868] text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#3A3F3A] mb-1">Failed to load arrears data</p>
            <p className="text-xs text-[#687068] mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 text-sm font-medium text-white bg-[#C28A78] rounded-lg hover:bg-[#143828] whitespace-nowrap">Retry</button>
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
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Rent Arrears</h1>
            <p className="text-sm text-[#687068] mt-1">{tenantsInArrears} cases · £{totalOutstanding.toLocaleString()} outstanding · {urgentCount} urgent</p>
          </div>
          <DemoHelperTip id="arrears-overview" title="Rent Arrears Management">Monitor outstanding rent, assess risk levels, send automated reminders and manage escalation workflows. Track payment plans and formal warnings.</DemoHelperTip>
          <div className="flex items-center gap-2">
            <button onClick={() => { setSelectedActionTenant(null); setReminderMessage("This is a friendly reminder that your rent payment is currently overdue. Please arrange payment at your earliest convenience. If you are experiencing difficulties, contact us to discuss options."); setReminderSent(false); setReminderError(null); setShowReminderModal(true); }} className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2">
              <i className="ri-notification-3-line text-sm"></i>Send Reminders
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Arrears", value: `£${totalOutstanding.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#C46868]", sub: `${tenantsInArrears} cases` },
            { label: "Active Cases", value: tenantsInArrears.toString(), icon: "ri-alarm-warning-line", color: "bg-[#F59E0B]", sub: `${highRiskCount} urgent` },
            { label: "New This Period", value: data.filter((a) => a.arrearsMonths === 1).length.toString(), icon: "ri-add-circle-line", color: "bg-[#3B82F6]", sub: "First month overdue" },
            { label: "Payment Plans", value: paymentPlanCount.toString(), icon: "ri-calendar-schedule-line", color: "bg-[#8B5CF6]", sub: "Active arrangements" },
            { label: "Urgent Actions", value: urgentCount.toString(), icon: "ri-arrow-up-circle-line", color: "bg-[#C46868]", sub: "Needs escalation" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              onClick={() => {
                if (i === 4) setRiskFilter("High");
                else if (i === 0) setRiskFilter("All");
                else setRiskFilter("All");
              }}
              className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} text-white text-base`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
                <p className="text-[10px] text-[#94A3B8]">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-16 text-center">
            <div className="w-16 h-16 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-double-line text-[#7A9A7E] text-2xl"></i>
            </div>
            <p className="text-lg font-medium text-[#3A3F3A] mb-1">No active arrears cases</p>
            <p className="text-sm text-[#687068]">All tenants are up to date with rent payments.</p>
            <Link href="/dashboard/rent-collection" className="text-sm text-[#C28A78] font-medium hover:underline mt-3 inline-block">View rent collection</Link>
          </div>
        ) : (
          <>
            <FinancialActionCentre
              actions={financialActions}
              onAction={(item) => {
                if (item.id === "aa1") { setShowWarningModal(true); }
                if (item.id === "aa2") { setShowReminderModal(true); }
              }}
            />

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center gap-1 p-1 border-b border-[#D5D9D5] bg-[#FBF9F4]">
                {[
                  { key: "arrears", label: "Cases", icon: "ri-list-check" },
                  { key: "overview", label: "Overview", icon: "ri-dashboard-line" },
                  { key: "escalation", label: "Escalation", icon: "ri-arrow-up-circle-line" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.key ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                    }`}
                  >
                    <i className={`${tab.icon} text-sm`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                      { label: "Low Risk", count: lowRiskCount, amount: data.filter((a) => a.riskRating === "Low").reduce((s, a) => s + a.totalArrears, 0), color: "bg-[#7A9A7E]", icon: "ri-shield-check-line", risk: "Low" as ArrearsRisk },
                      { label: "Medium Risk", count: mediumRiskCount, amount: data.filter((a) => a.riskRating === "Medium").reduce((s, a) => s + a.totalArrears, 0), color: "bg-[#F59E0B]", icon: "ri-alert-line", risk: "Medium" as ArrearsRisk },
                      { label: "High Risk", count: highRiskCount, amount: data.filter((a) => a.riskRating === "High").reduce((s, a) => s + a.totalArrears, 0), color: "bg-[#C46868]", icon: "ri-alarm-warning-line", risk: "High" as ArrearsRisk },
                    ].map((r) => {
                      const cfg = arrearsRiskConfig[r.risk];
                      return (
                        <div key={r.label} className="bg-[#FBF9F4] rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center`}>
                              <i className={`${r.icon} text-white text-lg`}></i>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#3A3F3A]">{r.label}</p>
                              <p className="text-xs text-[#687068]">{r.count} tenants</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#94A3B8]">Total Arrears</span>
                              <span className="text-sm font-bold text-[#3A3F3A]">£{r.amount.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 bg-[#D5D9D5] rounded-full overflow-hidden">
                              <div className={`h-full ${r.color} rounded-full`} style={{ width: `${totalOutstanding > 0 ? (r.amount / totalOutstanding) * 100 : 0}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#3A3F3A] mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: "Send Reminders", desc: "Email & SMS", icon: "ri-notification-3-line", color: "bg-[#C28A78]", action: () => { setSelectedActionTenant(null); setReminderMessage("This is a friendly reminder that your rent payment is currently overdue. Please arrange payment at your earliest convenience. If you are experiencing difficulties, contact us to discuss options."); setReminderSent(false); setReminderError(null); setShowReminderModal(true); } },
                        { label: "Issue Warning", desc: "Formal letter", icon: "ri-error-warning-line", color: "bg-[#C46868]", action: () => setShowWarningModal(true) },
                        { label: "Create Plan", desc: "Payment plan", icon: "ri-calendar-schedule-line", color: "bg-[#3B82F6]", action: () => setShowPaymentPlanModal(true) },
                        { label: "View Collection", desc: "Rent tracking", icon: "ri-money-pound-circle-line", color: "bg-[#8B5CF6]", action: () => window.location.href = "/dashboard/rent-collection" },
                      ].map((a) => (
                        <button key={a.label} onClick={a.action} className="bg-white border border-[#D5D9D5] rounded-xl p-4 text-left hover:border-[#C28A78]/30 transition-colors">
                          <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center mb-3`}>
                            <i className={`${a.icon} text-white text-lg`}></i>
                          </div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{a.label}</p>
                          <p className="text-xs text-[#687068] mt-0.5">{a.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "arrears" && (
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {["All", "Low", "Medium", "High"].map((r) => (
                        <button key={r} onClick={() => setRiskFilter(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${riskFilter === r ? "bg-[#C28A78] text-white" : "bg-[#FBF9F4] text-[#687068] hover:bg-[#D5D9D5]"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white w-full sm:w-auto">
                      <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tenant, property..." className="text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent w-full sm:w-48" />
                    </div>
                  </div>

                  <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                          <th className="text-left px-4 py-3 font-medium text-[#687068]">Property</th>
                          <th className="text-left px-4 py-3 font-medium text-[#687068]">Tenant</th>
                          <th className="text-right px-4 py-3 font-medium text-[#687068]">Arrears</th>
                          <th className="text-center px-4 py-3 font-medium text-[#687068]">Months</th>
                          <th className="text-center px-4 py-3 font-medium text-[#687068]">Risk</th>
                          <th className="text-left px-4 py-3 font-medium text-[#687068]">Last Contact</th>
                          <th className="text-left px-4 py-3 font-medium text-[#687068]">Last Reminder</th>
                          <th className="text-right px-4 py-3 font-medium text-[#687068]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D5D9D5]">
                        {filtered.map((item) => {
                          const cfg = arrearsRiskConfig[item.riskRating];
                          return (
                            <tr key={item.id} className="hover:bg-[#FBF9F4] transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }}></div>
                                  <span className="font-medium text-[#3A3F3A]">{item.property}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-[#687068]">{item.tenant}</td>
                              <td className="px-4 py-3.5 text-right font-medium text-[#C46868]">£{item.totalArrears.toLocaleString()}</td>
                              <td className="px-4 py-3.5 text-center text-[#687068]">{item.arrearsMonths}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>{item.riskRating}</span>
                              </td>
                              <td className="px-4 py-3.5 text-[#687068]">{item.lastContact}</td>
                              <td className="px-4 py-3.5 text-[#687068]">{item.lastReminderSent}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => { setSelectedActionTenant(item); setReminderMessage("This is a friendly reminder that your rent payment is currently overdue. Please arrange payment at your earliest convenience. If you are experiencing difficulties, contact us to discuss options."); setReminderSent(false); setReminderError(null); setShowReminderModal(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#C28A78]" title="Send Reminder"><i className="ri-notification-3-line text-sm"></i></button>
                                  <button onClick={() => { setSelectedActionTenant(item); setShowWarningModal(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#C46868]" title="Issue Warning"><i className="ri-error-warning-line text-sm"></i></button>
                                  <button onClick={() => setSelectedTenant(item)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#687068]" title="View Details"><i className="ri-eye-line text-sm"></i></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filtered.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-search-line text-[#94A3B8] text-xl"></i>
                        </div>
                        <p className="text-sm text-[#94A3B8]">No results found</p>
                      </div>
                    )}
                  </div>

                  <div className="lg:hidden space-y-3">
                    {filtered.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-search-line text-[#94A3B8] text-xl"></i>
                        </div>
                        <p className="text-sm text-[#94A3B8]">No results found</p>
                      </div>
                    ) : (
                      filtered.map((item) => (
                        <ArrearsCaseCard
                          key={item.id}
                          property={item.property}
                          tenant={item.tenant}
                          rentAmount={item.rentAmount}
                          totalArrears={item.totalArrears}
                          arrearsMonths={item.arrearsMonths}
                          riskRating={item.riskRating}
                          lastContact={item.lastContact}
                          lastReminderSent={item.lastReminderSent}
                          onClick={() => setSelectedTenant(item)}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "escalation" && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                      { stage: "Stage 1", label: "Friendly Reminder", desc: "Automated email before due date", active: true, icon: "ri-notification-3-line", color: "bg-[#C28A78]" },
                      { stage: "Stage 2", label: "First Reminder", desc: "Email & SMS 3 days after due", active: true, icon: "ri-mail-send-line", color: "bg-[#F59E0B]" },
                      { stage: "Stage 3", label: "Second Reminder", desc: "Phone call + follow-up on day 7", active: true, icon: "ri-phone-line", color: "bg-[#F59E0B]" },
                      { stage: "Stage 4", label: "Formal Warning", desc: "Written notice on day 14", active: true, icon: "ri-error-warning-line", color: "bg-[#C46868]" },
                      { stage: "Stage 5", label: "Payment Plan", desc: "Arrange instalments on day 21", active: false, icon: "ri-calendar-schedule-line", color: "bg-[#3B82F6]" },
                      { stage: "Stage 6", label: "Legal Review", desc: "Section 8 notice preparation", active: false, icon: "ri-scales-3-line", color: "bg-[#7C3AED]" },
                    ].map((stage) => (
                      <div key={stage.stage} className={`bg-white rounded-xl border ${stage.active ? "border-[#D5D9D5]" : "border-[#D5D9D5] opacity-60"} p-5`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 ${stage.color} rounded-xl flex items-center justify-center`}>
                            <i className={`${stage.icon} text-white text-lg`}></i>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#94A3B8]">{stage.stage}</p>
                            <p className="text-sm font-medium text-[#3A3F3A]">{stage.label}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#687068]">{stage.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
                    <p className="text-xs text-[#C46868] font-medium">
                      <i className="ri-information-line mr-1"></i>
                      Escalation to legal proceedings, serving notices, or writing off debt requires authorised human review. LetHub helps organise information but does not provide legal advice.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedTenant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${arrearsRiskConfig[selectedTenant.riskRating].bg} rounded-xl flex items-center justify-center`}>
                  <i className={`${arrearsRiskConfig[selectedTenant.riskRating].icon} ${arrearsRiskConfig[selectedTenant.riskRating].text} text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{selectedTenant.tenant}</h3>
                  <p className="text-xs text-[#687068]">{selectedTenant.property} · {selectedTenant.landlord}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${arrearsRiskConfig[selectedTenant.riskRating].badge}`}>{selectedTenant.riskRating} Risk</span>
                <button onClick={() => setSelectedTenant(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Monthly Rent</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">£{selectedTenant.rentAmount}</p>
                </div>
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Total Arrears</p>
                  <p className="text-lg font-bold text-[#C46868]">£{selectedTenant.totalArrears.toLocaleString()}</p>
                </div>
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Months Overdue</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">{selectedTenant.arrearsMonths}</p>
                </div>
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Previous Late</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">{selectedTenant.previousLate}x</p>
                </div>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-4">
                <p className="text-xs font-medium text-[#687068] mb-3">Contact Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2"><i className="ri-phone-line text-[#94A3B8]"></i><span className="text-sm text-[#3A3F3A]">{selectedTenant.tenantPhone}</span></div>
                  <div className="flex items-center gap-2"><i className="ri-mail-line text-[#94A3B8]"></i><span className="text-sm text-[#3A3F3A]">{selectedTenant.tenantEmail}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#D5D9D5]">
                  <div className="flex items-center gap-2"><i className="ri-chat-1-line text-[#94A3B8]"></i><span className="text-xs text-[#687068]">Last contact: <span className="text-[#3A3F3A] font-medium">{selectedTenant.lastContact}</span></span></div>
                  <div className="flex items-center gap-2"><i className="ri-notification-3-line text-[#94A3B8]"></i><span className="text-xs text-[#687068]">Last reminder: <span className="text-[#3A3F3A] font-medium">{selectedTenant.lastReminderSent}</span></span></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => { setSelectedActionTenant(selectedTenant); setReminderMessage("This is a friendly reminder that your rent payment is currently overdue. Please arrange payment at your earliest convenience. If you are experiencing difficulties, contact us to discuss options."); setReminderSent(false); setReminderError(null); setShowReminderModal(true); }} className="py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap"><i className="ri-notification-3-line mr-1"></i>Send Reminder</button>
                <button onClick={() => { setSelectedTenant(null); setShowWarningModal(true); }} className="py-3 text-sm font-medium text-[#C46868] border border-[#C46868] rounded-xl hover:bg-[#C46868]/5 transition-colors whitespace-nowrap"><i className="ri-error-warning-line mr-1"></i>Issue Warning</button>
                <button onClick={() => { setSelectedTenant(null); setShowPaymentPlanModal(true); }} className="py-3 text-sm font-medium text-[#3B82F6] border border-[#3B82F6] rounded-xl hover:bg-[#3B82F6]/5 transition-colors whitespace-nowrap"><i className="ri-calendar-schedule-line mr-1"></i>Payment Plan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-[#3A3F3A]">Send Reminder Email</h3><button onClick={() => { setShowReminderModal(false); setReminderSent(false); setReminderError(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button></div>
            {reminderSent ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-[#7A9A7E] text-2xl"></i>
                </div>
                <p className="text-sm font-medium text-[#3A3F3A] mb-1">Reminder sent successfully</p>
                <p className="text-xs text-[#687068]">An email has been sent to {selectedActionTenant?.tenant || "the selected tenants"}.</p>
                <button onClick={() => { setShowReminderModal(false); setReminderSent(false); }} className="mt-5 px-6 py-2.5 text-sm font-medium text-white bg-[#C28A78] rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">Done</button>
              </div>
            ) : (
              <>
                <div className="mb-4"><label className="text-xs font-medium text-[#687068] mb-1.5 block">Recipient</label><div className="px-3 py-3 border border-[#D5D9D5] rounded-xl bg-[#FBF9F4]"><p className="text-sm text-[#3A3F3A]">{selectedActionTenant?.tenant || "All tenants in arrears"}</p><p className="text-xs text-[#94A3B8]">{selectedActionTenant?.tenantEmail || "Multiple recipients"}</p></div></div>
                <div className="mb-2"><label className="text-xs font-medium text-[#687068] mb-1.5 block">Message</label><textarea rows={4} maxLength={500} value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} className="w-full px-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4] focus:outline-none focus:border-[#C28A78] resize-none"></textarea><p className="text-xs text-[#94A3B8] mt-1">{reminderMessage.length}/500 characters</p></div>
                {reminderError && <div className="mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3"><p className="text-xs text-[#C46868]"><i className="ri-error-warning-line mr-1"></i>{reminderError}</p></div>}
                {!selectedActionTenant && (
                  <div className="mb-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-3">
                    <p className="text-xs text-[#92400E]"><i className="ri-information-line mr-1"></i>This will send individual reminders to all {data.length} tenants currently in arrears.</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setReminderError(null);
                      if (!reminderMessage.trim()) { setReminderError("Please enter a message."); return; }
                      const recipients: { email: string; name: string; property: string; arrearsAmount: number; arrearsMonths: number; caseId: string | null }[] = [];
                      if (selectedActionTenant) {
                        recipients.push({ email: selectedActionTenant.tenantEmail, name: selectedActionTenant.tenant, property: selectedActionTenant.property, arrearsAmount: selectedActionTenant.totalArrears, arrearsMonths: selectedActionTenant.arrearsMonths, caseId: selectedActionTenant.caseId });
                      } else {
                        data.forEach((r) => { if (r.tenantEmail && r.tenantEmail !== "—") { recipients.push({ email: r.tenantEmail, name: r.tenant, property: r.property, arrearsAmount: r.totalArrears, arrearsMonths: r.arrearsMonths, caseId: r.caseId }); }});
                      }
                      if (recipients.length === 0) { setReminderError("No valid tenant emails found."); return; }
                      setSendingReminder(true);
                      let failedCount = 0;
                      const now = new Date().toISOString();
                      for (const r of recipients) {
                        try {
                          const res = await fetch("https://gejxrnreuafnyzwrchvy.supabase.co/functions/v1/send-rent-reminder", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ tenant_email: r.email, tenant_name: r.name, property_name: r.property, arrears_amount: r.arrearsAmount, arrears_months: r.arrearsMonths, message: reminderMessage }),
                          });
                          const result = await res.json();
                          if (!res.ok || !result.success) { failedCount++; continue; }
                          if (r.caseId && !isDemoAccount()) {
                            await supabase.from("arrears_cases").update({ last_reminder_sent: now, last_contact: now }).eq("id", r.caseId);
                          }
                        } catch { failedCount++; }
                      }
                      setSendingReminder(false);
                      if (failedCount === 0) {
                        setReminderSent(true);
                        showToast(`Reminder sent to ${recipients.length} tenant${recipients.length > 1 ? "s" : ""}`);
                      } else if (failedCount < recipients.length) {
                        setReminderSent(true);
                        showToast(`Reminder sent to ${recipients.length - failedCount} of ${recipients.length} tenants`);
                      } else {
                        setReminderError("Failed to send reminders. Please try again.");
                      }
                      if (!isDemoAccount()) await fetchData();
                    }}
                    disabled={sendingReminder}
                    className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingReminder ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Sending...</> : "Send Reminder"}
                  </button>
                  <button onClick={() => { setShowReminderModal(false); setReminderSent(false); setReminderError(null); }} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#D5D9D5] rounded-xl hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-[#3A3F3A]">Issue Formal Warning Letter</h3><button onClick={() => setShowWarningModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button></div>
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#C46868]">
                <i className="ri-information-line mr-1"></i>
                Formal warnings are template drafts. They require review by authorised staff before sending and must not be presented as legal documents.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowWarningModal(false); showToast("Warning letter saved as draft for review"); }} className="flex-1 py-3 text-sm font-medium text-white bg-[#C46868] rounded-xl hover:bg-[#DC2626] transition-colors whitespace-nowrap">Save as Draft</button>
              <button onClick={() => setShowWarningModal(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#D5D9D5] rounded-xl hover:bg-[#FBF9F4] transition-colors whitespace-nowrap"><i className="ri-download-line mr-1"></i>Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentPlanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold text-[#3A3F3A]">Create Payment Plan</h3><button onClick={() => setShowPaymentPlanModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button></div>
            <div className="space-y-4">
              <div className="bg-[#FBF9F4] rounded-xl p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Total Arrears</p>
                <p className="text-2xl font-bold text-[#C46868]">£{selectedActionTenant ? selectedActionTenant.totalArrears.toLocaleString() : "1,850"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Monthly Instalment (£)</label>
                <input type="number" defaultValue={selectedActionTenant ? Math.round(selectedActionTenant.totalArrears / 6) : 308} className="w-full px-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4] focus:outline-none focus:border-[#3B82F6]" />
                <p className="text-xs text-[#94A3B8] mt-1">Clears arrears in approximately 6 months</p>
              </div>
              <div className="bg-[#FBF9F4] border border-[#D5D9D5] rounded-xl p-3">
                <p className="text-xs text-[#94A3B8]">
                  <i className="ri-information-line mr-1"></i>
                  Payment plans are not active until confirmed by the agency and accepted by the tenant.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowPaymentPlanModal(false); showToast("Payment plan saved as draft"); }} className="flex-1 py-3 text-sm font-medium text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors whitespace-nowrap">Save Draft Plan</button>
                <button onClick={() => setShowPaymentPlanModal(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#D5D9D5] rounded-xl hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#7A9A7E]"></i>
          {toast}
        </div>
      )}
    </DashboardShell>
  );
}