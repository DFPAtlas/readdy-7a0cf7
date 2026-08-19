"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
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

const mockDocuments = [
  { id: "d1", name: "Tenancy Agreement - Signed.pdf", type: "Tenancy", date: "15 Sep 2024", size: "1.2 MB", icon: "ri-file-text-line", color: "bg-[#3B82F6]" },
  { id: "d2", name: "Deposit Protection Certificate.pdf", type: "Deposit", date: "15 Sep 2024", size: "0.3 MB", icon: "ri-bank-card-line", color: "bg-[#10B981]" },
  { id: "d3", name: "Inventory Check-in Report.pdf", type: "Inventory", date: "15 Sep 2024", size: "2.4 MB", icon: "ri-file-list-line", color: "bg-[#F59E0B]" },
  { id: "d4", name: "Gas Safety Certificate 2026.pdf", type: "Compliance", date: "12 Mar 2026", size: "0.8 MB", icon: "ri-file-shield-line", color: "bg-[#EF4444]" },
  { id: "d5", name: "EPC Certificate.pdf", type: "Compliance", date: "20 Oct 2023", size: "0.5 MB", icon: "ri-leaf-line", color: "bg-[#14B8A6]" },
  { id: "d6", name: "How to Rent Guide.pdf", type: "Guide", date: "15 Sep 2024", size: "1.5 MB", icon: "ri-book-open-line", color: "bg-[#8B5CF6]" },
  { id: "d7", name: "Rent Payment Schedule.pdf", type: "Financial", date: "15 Sep 2024", size: "0.4 MB", icon: "ri-calendar-line", color: "bg-[#D4A574]" },
];

const mockMaintenanceJobs = [
  { id: "m1", title: "Leaking kitchen tap", status: "In Progress", priority: "Medium", contractor: "GreenPlumb Ltd", reported: "18 May 2026", cost: 114 },
  { id: "m2", title: "Living room radiator not heating", status: "Awaiting Approval", priority: "High", contractor: "HeatFirst Services", reported: "25 May 2026", cost: 222 },
  { id: "m3", title: "Bedroom light switch broken", status: "Scheduled", priority: "Low", contractor: "BrightSpark Electrical", reported: "29 May 2026", cost: 85 },
  { id: "m4", title: "Bathroom extractor fan noisy", status: "Under Review", priority: "Medium", contractor: "—", reported: "30 May 2026", cost: 0 },
  { id: "m5", title: "Front door lock sticking", status: "Completed", priority: "Medium", contractor: "SecureFix", reported: "10 May 2026", cost: 95 },
];

export default function TenancyDetail({ tenancyId }: { tenancyId: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tenancy, setTenancy] = useState<TenancyRecord | null>(null);
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

    const timer = setTimeout(() => {
      if (active) {
        const found = tenancies.find((t) => t.id === tenancyId) || tenancies[0];
        setTenancy(found);
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
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
    const token = tokenType === "owner" ? "own-detail-token" : "tnt-detail-token";
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/portal/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      if (!mountedRef.current) return;
      setCopiedToken(token);
      showToast("Invite link copied to clipboard");
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setCopiedToken(null);
      }, 2000);
    });
  };

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

  const rentPayments = [
    { month: "Jun 2026", amount: tenancy.rent, status: "Paid", date: "01 Jun 2026" },
    { month: "May 2026", amount: tenancy.rent, status: "Paid", date: "01 May 2026" },
    { month: "Apr 2026", amount: tenancy.rent, status: "Paid", date: "01 Apr 2026" },
    { month: "Mar 2026", amount: tenancy.rent, status: "Paid", date: "01 Mar 2026" },
    { month: "Feb 2026", amount: tenancy.rent, status: "Paid", date: "01 Feb 2026" },
    { month: "Jan 2026", amount: tenancy.rent, status: "Paid", date: "01 Jan 2026" },
  ];

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
                    { label: "Rent Due Day", value: `${tenancy.rentDueDay}${["st","nd","rd"][((tenancy.rentDueDay%100)-1)%10] || "th"} of month`, icon: "ri-calendar-check-line", color: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
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
                <p className="text-xs text-[#94A3B8] mt-1">{tenancy.periodic ? "Rolling monthly" : `${tenancy.startDate} — ${tenancy.endDate}`}</p>
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
                { label: "EPC Rating", value: "C" },
                { label: "Council Tax Band", value: "Band C" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#FBF9F4]">
                  <p className="text-xs text-[#94A3B8] mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/dashboard/property/${tenancy.propertyId}`}
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
                <Link href={`/dashboard/tenant`} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Tenant Portal</Link>
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
              <Link href={`/dashboard/landlord`} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Owner Portal</Link>
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
                    {rentPayments.map((p) => (
                      <tr key={p.month} className="hover:bg-[#FBF9F4]">
                        <td className="px-5 py-3 text-sm font-medium text-[#3A3F3A]">{p.month}</td>
                        <td className="px-5 py-3 text-sm text-[#3A3F3A]">£{p.amount.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-[#687068]">{p.date}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{p.status}</span>
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
              {mockDocuments.map((doc) => (
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
                  {mockMaintenanceJobs.map((job) => (
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
                      <button onClick={() => handleCopyLink("owner")} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Copy Link</button>
                      <button className="px-4 py-2 text-sm font-medium text-[#EF4444] rounded-lg hover:bg-[#FEE2E2] transition-colors whitespace-nowrap">Disable</button>
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
                      <button onClick={() => handleCopyLink("tenant")} className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Copy Link</button>
                      <button className="px-4 py-2 text-sm font-medium text-[#EF4444] rounded-lg hover:bg-[#FEE2E2] transition-colors whitespace-nowrap">Disable</button>
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
                  onClick={() => {
                    setSending(true);
                    if (sendingTimerRef.current) clearTimeout(sendingTimerRef.current);
                    sendingTimerRef.current = setTimeout(() => {
                      if (!mountedRef.current) return;
                      setSending(false);
                      setInviteModal(null);
                      showToast(`Invite sent to ${inviteEmail}`);
                    }, 800);
                  }}
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