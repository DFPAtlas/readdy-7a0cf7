"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import QRCodeManager from "./QRCodeManager";
import {
  platformUsers,
  platformTransactions,
  auditLog,
  platformProperties,
  monthlyRevenue,
  userGrowth,
  subscriptionPlans,
  roleColors,
  statusStyles,
  transactionStatusStyles,
  transactionTypeStyles,
  type PlatformUser,
  type PlatformTransaction,
  type AuditLogEntry,
} from "./AdminData";

const tabs = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "users", label: "Users", icon: "ri-group-line" },
  { id: "revenue", label: "Revenue", icon: "ri-money-pound-circle-line" },
  { id: "transactions", label: "Transactions", icon: "ri-bank-card-line" },
  { id: "audit", label: "Audit Log", icon: "ri-shield-keyhole-line" },
  { id: "system", label: "System", icon: "ri-settings-3-line" },
  { id: "qr", label: "QR Codes", icon: "ri-qr-code-line" },
];

const roleLabels: Record<string, string> = {
  landlord: "Landlord",
  tenant: "Tenant",
  contractor: "Contractor",
  estate_agent_admin: "Agent Admin",
  estate_agent_staff: "Agent Staff",
  platform_admin: "Platform Admin",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [txnSearch, setTxnSearch] = useState("");
  const [txnTypeFilter, setTxnTypeFilter] = useState("All");
  const [txnStatusFilter, setTxnStatusFilter] = useState("All");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState("All");
  const [auditSearch, setAuditSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<PlatformTransaction | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditLogEntry | null>(null);
  const [userActionModal, setUserActionModal] = useState<{ user: PlatformUser; action: string } | null>(null);
  const [systemFeatures, setSystemFeatures] = useState({
    maintenance: true,
    inspections: true,
    signatures: true,
    compliance: true,
    aiAssistant: true,
    arrears: true,
    payments: true,
    messages: true,
  });
  const [platformName, setPlatformName] = useState("LetHub");
  const [supportEmail, setSupportEmail] = useState("support@lethub.com");
  const [timezone, setTimezone] = useState("Europe/London");
  const [currency, setCurrency] = useState("GBP");
  const [saveToast, setSaveToast] = useState(false);

  const [users, setUsers] = useState(platformUsers);

  const totalUsers = users.length;
  const totalProperties = platformProperties.length;
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.transactions, 0);
  const mrr = subscriptionPlans.reduce((s, p) => s + p.revenue, 0);
  const activeSubs = users.filter((u) => u.subscriptionStatus === "Active").length;
  const pendingUsers = users.filter((u) => u.status === "Pending").length;
  const suspendedUsers = users.filter((u) => u.status === "Suspended").length;

  const roleCounts = {
    landlord: users.filter((u) => u.role === "landlord").length,
    tenant: users.filter((u) => u.role === "tenant").length,
    contractor: users.filter((u) => u.role === "contractor").length,
    agent: users.filter((u) => u.role === "estate_agent_admin" || u.role === "estate_agent_staff").length,
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === "All" || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredTxns = platformTransactions.filter((t) => {
    const matchesSearch =
      t.party.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(txnSearch.toLowerCase());
    const matchesType = txnTypeFilter === "All" || t.type === txnTypeFilter;
    const matchesStatus = txnStatusFilter === "All" || t.status === txnStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredAudit = auditLog.filter((a) => {
    const matchesSearch =
      a.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.target.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesSeverity = auditSeverityFilter === "All" || a.severity === auditSeverityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleUserAction = (user: PlatformUser, action: string) => {
    const newStatus = action === "suspend" ? "Suspended" : action === "activate" ? "Active" : action === "deactivate" ? "Deactivated" : user.status;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus as PlatformUser["status"] } : u)));
    setUserActionModal(null);
    setSelectedUser(null);
  };

  const handleSaveSettings = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const renderRevenueChart = () => {
    const maxTxn = Math.max(...monthlyRevenue.map((m) => m.transactions));
    return (
      <div className="space-y-3">
        {monthlyRevenue.map((m) => (
          <div key={m.month} className="flex items-center gap-3">
            <span className="text-xs text-[#687068] w-8">{m.month}</span>
            <div className="flex-1 h-6 bg-[#F1F5F9] rounded-md overflow-hidden">
              <div className="h-full bg-[#C28A78] rounded-md flex items-center justify-end pr-2" style={{ width: `${(m.transactions / maxTxn) * 100}%` }}>
                <span className="text-xs text-white font-medium">£{(m.transactions / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderUserGrowthChart = () => {
    const maxUsers = Math.max(...userGrowth.map((m) => m.landlords + m.tenants + m.contractors));
    return (
      <div className="space-y-3">
        {userGrowth.map((m) => (
          <div key={m.month} className="flex items-center gap-3">
            <span className="text-xs text-[#687068] w-8">{m.month}</span>
            <div className="flex-1 h-6 bg-[#F1F5F9] rounded-md overflow-hidden flex">
              <div className="h-full bg-emerald-500 rounded-l-md" style={{ width: `${(m.landlords / maxUsers) * 100}%` }} />
              <div className="h-full bg-sky-500" style={{ width: `${(m.tenants / maxUsers) * 100}%` }} />
              <div className="h-full bg-orange-500 rounded-r-md" style={{ width: `${(m.contractors / maxUsers) * 100}%` }} />
            </div>
            <span className="text-xs text-[#3A3F3A] font-medium w-6">{m.landlords + m.tenants + m.contractors}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl px-5 py-3 flex items-start gap-3">
          <i className="ri-information-line text-[#D97706] text-sm mt-0.5"></i>
          <div>
            <p className="text-xs font-semibold text-[#92400E]">Demo Data</p>
            <p className="text-xs text-[#A16207]">This page displays sample administration data for demonstration purposes. Live platform data would reflect actual user registrations and transactions.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Platform Administration</h1>
            <p className="text-sm text-[#687068] mt-1">Full oversight and control of the LetHub platform</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#687068] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">
              <i className="ri-calendar-line mr-1"></i>
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-xs text-white bg-[#C28A78] px-3 py-1.5 rounded-lg font-medium">
              <i className="ri-shield-check-line mr-1"></i>
              Admin
            </span>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === t.id ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className={`${t.icon} text-sm`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: "Total Users", value: totalUsers.toString(), icon: "ri-group-line", color: "bg-[#C28A78]", change: "+3 this week", changeType: "up" },
                { label: "Properties", value: totalProperties.toString(), icon: "ri-building-4-line", color: "bg-[#3B82F6]", change: "+2 new", changeType: "up" },
                { label: "MRR", value: `£${mrr.toLocaleString()}`, icon: "ri-coins-line", color: "bg-[#8B5CF6]", change: "+8% vs last month", changeType: "up" },
                { label: "Monthly Revenue", value: `£${(totalRevenue / 1000).toFixed(1)}k`, icon: "ri-money-pound-circle-line", color: "bg-[#10B981]", change: "+12% vs last month", changeType: "up" },
                { label: "Active Subs", value: activeSubs.toString(), icon: "ri-vip-crown-line", color: "bg-[#14B8A6]", change: `${pendingUsers} pending`, changeType: "down" },
                { label: "System Health", value: "99.8%", icon: "ri-heart-pulse-line", color: "bg-[#EF4444]", change: "All services up", changeType: "up" },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-[#D5D9D5] p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                      <i className={`${card.icon} text-white text-lg`}></i>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.changeType === "up" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                      {card.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#3A3F3A]">{card.value}</p>
                  <p className="text-sm text-[#687068]">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Revenue Trend</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Monthly transaction volume and commissions</p>
                </div>
                <div className="p-5">{renderRevenueChart()}</div>
              </div>
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">User Growth</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Landlords (green), Tenants (blue), Contractors (orange)</p>
                </div>
                <div className="p-5">{renderUserGrowthChart()}</div>
              </div>
            </div>

            {/* Role Distribution + Recent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">User Distribution</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: "Landlords", count: roleCounts.landlord, total: totalUsers, color: "bg-emerald-500" },
                    { label: "Tenants", count: roleCounts.tenant, total: totalUsers, color: "bg-sky-500" },
                    { label: "Contractors", count: roleCounts.contractor, total: totalUsers, color: "bg-orange-500" },
                    { label: "Agents", count: roleCounts.agent, total: totalUsers, color: "bg-amber-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-[#3A3F3A] font-medium">{item.label}</span>
                        <span className="text-[#687068]">{item.count} <span className="text-[#94A3B8]">({Math.round((item.count / item.total) * 100)}%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / item.total) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5] flex items-center justify-between">
                  <h2 className="font-semibold text-[#3A3F3A]">Pending Actions</h2>
                  <span className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-2 py-1 rounded-full font-medium">{pendingUsers + suspendedUsers}</span>
                </div>
                <div className="divide-y divide-[#D5D9D5]">
                  {pendingUsers > 0 && (
                    <div className="px-5 py-3.5 flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-user-add-line text-[#F59E0B] text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#3A3F3A]">{pendingUsers} user registration{pendingUsers > 1 ? "s" : ""} pending</p>
                        <p className="text-xs text-[#687068]">Requires approval before account activation</p>
                      </div>
                      <button onClick={() => setActiveTab("users")} className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap">Review</button>
                    </div>
                  )}
                  {suspendedUsers > 0 && (
                    <div className="px-5 py-3.5 flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-user-forbid-line text-[#EF4444] text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#3A3F3A]">{suspendedUsers} suspended account{suspendedUsers > 1 ? "s" : ""}</p>
                        <p className="text-xs text-[#687068]">Suspended accounts require review</p>
                      </div>
                      <button onClick={() => setActiveTab("users")} className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap">Review</button>
                    </div>
                  )}
                  <div className="px-5 py-3.5 flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-error-warning-line text-[#EF4444] text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#3A3F3A]">Failed login attempts detected</p>
                      <p className="text-xs text-[#687068]">3 attempts from IP 185.220.101.22 on 24 May</p>
                    </div>
                    <button onClick={() => setActiveTab("audit")} className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap">View</button>
                  </div>
                  <div className="px-5 py-3.5 flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-bank-card-line text-[#3B82F6] text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#3A3F3A]">1 failed payment</p>
                      <p className="text-xs text-[#687068]">Emma Wilson rent payment failed on 24 May</p>
                    </div>
                    <button onClick={() => setActiveTab("transactions")} className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap">View</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Top Properties</h2>
                </div>
                <div className="divide-y divide-[#D5D9D5]">
                  {platformProperties.slice(0, 5).map((p) => (
                    <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-building-4-line text-[#C28A78] text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3F3A] truncate">{p.name}</p>
                        <p className="text-xs text-[#687068]">{p.city} · {p.status}</p>
                      </div>
                      <span className="text-sm font-medium text-[#3A3F3A] whitespace-nowrap">£{p.rent.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-[#D5D9D5] bg-[#FBF9F4]">
                  <Link href="/dashboard/portfolio" className="text-sm text-[#C28A78] font-medium hover:underline">
                    View all properties
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: totalUsers, icon: "ri-group-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
                { label: "Active", value: users.filter((u) => u.status === "Active").length, icon: "ri-user-follow-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                { label: "Pending", value: pendingUsers, icon: "ri-user-add-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
                { label: "Suspended", value: suspendedUsers, icon: "ri-user-forbid-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white flex-1">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name, email, or ID..."
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none pr-8"
                >
                  <option value="All">All Roles</option>
                  <option value="landlord">Landlord</option>
                  <option value="tenant">Tenant</option>
                  <option value="contractor">Contractor</option>
                  <option value="estate_agent_admin">Agent Admin</option>
                  <option value="estate_agent_staff">Agent Staff</option>
                  <option value="platform_admin">Platform Admin</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none pr-8"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">User</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Role</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Subscription</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Last Login</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Registered</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${roleColors[u.role] || "bg-[#687068]"}`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#3A3F3A] truncate">{u.name}</p>
                              <p className="text-xs text-[#687068] truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-[#3A3F3A]">{roleLabels[u.role]}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[u.status]}`}>{u.status}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-[#687068]">{u.subscription || "—"}</span>
                          {u.subscriptionStatus && (
                            <span className={`text-xs ml-1 font-medium px-1.5 py-0.5 rounded ${u.subscriptionStatus === "Active" ? "bg-[#10B981]/10 text-[#10B981]" : u.subscriptionStatus === "Past Due" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                              {u.subscriptionStatus}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#687068]">{u.lastLogin}</td>
                        <td className="px-5 py-3.5 text-sm text-[#687068]">{u.registeredDate}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                              title="View details"
                            >
                              <i className="ri-eye-line text-[#687068] text-sm"></i>
                            </button>
                            {u.status === "Active" && (
                              <button
                                onClick={() => setUserActionModal({ user: u, action: "suspend" })}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                                title="Suspend"
                              >
                                <i className="ri-pause-circle-line text-[#EF4444] text-sm"></i>
                              </button>
                            )}
                            {u.status === "Suspended" && (
                              <button
                                onClick={() => setUserActionModal({ user: u, action: "activate" })}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                                title="Activate"
                              >
                                <i className="ri-play-circle-line text-[#10B981] text-sm"></i>
                              </button>
                            )}
                            {u.status === "Pending" && (
                              <button
                                onClick={() => setUserActionModal({ user: u, action: "activate" })}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                                title="Approve"
                              >
                                <i className="ri-check-line text-[#10B981] text-sm"></i>
                              </button>
                            )}
                            <button
                              onClick={() => setUserActionModal({ user: u, action: "deactivate" })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                              title="Deactivate"
                            >
                              <i className="ri-delete-bin-line text-[#94A3B8] text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-search-line text-[#94A3B8] text-2xl"></i>
                  <p className="text-sm text-[#687068] mt-2">No users match your search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "MRR", value: `£${mrr.toLocaleString()}`, icon: "ri-coins-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", change: "+8%" },
                { label: "ARR", value: `£${(mrr * 12).toLocaleString()}`, icon: "ri-calendar-check-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", change: "+8%" },
                { label: "Monthly Revenue", value: `£${(totalRevenue / 1000).toFixed(1)}k`, icon: "ri-money-pound-circle-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10", change: "+12%" },
                { label: "Commission", value: `£${monthlyRevenue.reduce((s, m) => s + m.commissions, 0).toLocaleString()}`, icon: "ri-percent-line", color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", change: "+5%" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${stat.icon} ${stat.color} text-lg`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                      <span className="text-xs text-[#10B981] font-medium">{stat.change}</span>
                    </div>
                    <p className="text-xs text-[#687068]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Revenue Breakdown</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Monthly transaction volume vs commissions</p>
                </div>
                <div className="p-5">{renderRevenueChart()}</div>
              </div>
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Subscription Plans</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Active subscribers by plan tier</p>
                </div>
                <div className="p-5 space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-[#3A3F3A] font-medium flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${plan.color}`}></span>
                          {plan.name}
                          <span className="text-xs text-[#94A3B8] font-normal">£{plan.price}/mo</span>
                        </span>
                        <span className="text-[#687068]">{plan.users} <span className="text-[#94A3B8]">users</span></span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className={`h-full ${plan.color} rounded-full`} style={{ width: `${(plan.users / totalUsers) * 100}%` }}></div>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Revenue: £{plan.revenue}/mo</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#687068]">Total Subscription Revenue</span>
                    <span className="font-bold text-[#3A3F3A]">£{mrr.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total", value: `£${platformTransactions.reduce((s, t) => s + t.amount, 0).toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
                { label: "Completed", value: platformTransactions.filter((t) => t.status === "Completed").length, icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                { label: "Pending", value: platformTransactions.filter((t) => t.status === "Pending").length, icon: "ri-time-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
                { label: "Failed", value: platformTransactions.filter((t) => t.status === "Failed").length, icon: "ri-error-warning-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
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

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white flex-1">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <select value={txnTypeFilter} onChange={(e) => setTxnTypeFilter(e.target.value)} className="px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none pr-8">
                  <option value="All">All Types</option>
                  <option value="Rent Payment">Rent Payment</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Commission">Commission</option>
                  <option value="Refund">Refund</option>
                  <option value="Deposit">Deposit</option>
                </select>
                <select value={txnStatusFilter} onChange={(e) => setTxnStatusFilter(e.target.value)} className="px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none pr-8">
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">ID</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Date</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Type</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Party</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Amount</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Gateway</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredTxns.map((t) => (
                      <tr key={t.id} className="hover:bg-[#FBF9F4] transition-colors cursor-pointer" onClick={() => setSelectedTxn(t)}>
                        <td className="px-5 py-3.5 text-sm font-medium text-[#3A3F3A]">{t.id}</td>
                        <td className="px-5 py-3.5 text-sm text-[#687068]">{t.date}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${transactionTypeStyles[t.type]}`}>{t.type}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#687068]">{t.party}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-[#3A3F3A]">£{t.amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${transactionStatusStyles[t.status]}`}>{t.status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#687068]">{t.gateway}</td>
                        <td className="px-5 py-3.5">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                            <i className="ri-eye-line text-[#687068] text-sm"></i>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTxns.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-search-line text-[#94A3B8] text-2xl"></i>
                  <p className="text-sm text-[#687068] mt-2">No transactions match your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Entries", value: auditLog.length, icon: "ri-file-list-3-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
                { label: "Info", value: auditLog.filter((a) => a.severity === "info").length, icon: "ri-information-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
                { label: "Warnings", value: auditLog.filter((a) => a.severity === "warning").length, icon: "ri-alert-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
                { label: "Critical", value: auditLog.filter((a) => a.severity === "critical").length, icon: "ri-error-warning-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
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

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white flex-1">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit log..."
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
              <select value={auditSeverityFilter} onChange={(e) => setAuditSeverityFilter(e.target.value)} className="px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none pr-8">
                <option value="All">All Severity</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Timestamp</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">User</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Action</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Target</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">IP</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase">Severity</th>
                      <th className="px-5 py-3 text-xs font-medium text-[#687068] uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredAudit.map((a) => (
                      <tr key={a.id} className="hover:bg-[#FBF9F4] transition-colors cursor-pointer" onClick={() => setSelectedAudit(a)}>
                        <td className="px-5 py-3.5 text-sm text-[#687068] whitespace-nowrap">{a.timestamp}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${roleColors[a.role.toLowerCase().replace(/\s/g, "_")] || "bg-[#687068]"}`}>
                              {a.user.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-[#3A3F3A]">{a.user}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-medium text-[#3A3F3A]">{a.action}</td>
                        <td className="px-5 py-3.5 text-sm text-[#687068]">{a.target}</td>
                        <td className="px-5 py-3.5 text-sm text-[#687068] font-mono text-xs">{a.ipAddress}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${a.severity === "info" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : a.severity === "warning" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                            {a.severity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                            <i className="ri-eye-line text-[#687068] text-sm"></i>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAudit.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-search-line text-[#94A3B8] text-2xl"></i>
                  <p className="text-sm text-[#687068] mt-2">No audit entries match your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {/* System Health */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "API Response", value: "42ms", status: "Healthy", icon: "ri-flashlight-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                { label: "Database", value: "99.99%", status: "Healthy", icon: "ri-database-2-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                { label: "File Storage", value: "1.2 TB", status: "Good", icon: "ri-hard-drive-2-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
                { label: "Email Queue", value: "0", status: "Clear", icon: "ri-mail-send-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                      <i className={`${item.icon} ${item.color} text-lg`}></i>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">{item.status}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#3A3F3A]">{item.value}</p>
                  <p className="text-sm text-[#687068]">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Settings */}
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Platform Settings</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Platform Name</label>
                    <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Support Email</label>
                    <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Timezone</label>
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none pr-8">
                        <option>Europe/London</option>
                        <option>Europe/Paris</option>
                        <option>America/New_York</option>
                        <option>America/Los_Angeles</option>
                        <option>Australia/Sydney</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] focus:outline-none pr-8">
                        <option>GBP</option>
                        <option>USD</option>
                        <option>EUR</option>
                        <option>AUD</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button onClick={handleSaveSettings} className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Feature Toggles</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Enable or disable platform modules</p>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { key: "maintenance" as const, label: "Maintenance Management", description: "Maintenance requests, job tracking, and contractor dispatch" },
                    { key: "inspections" as const, label: "Property Inspections", description: "Schedule, complete, and report on property inspections" },
                    { key: "signatures" as const, label: "Digital Signatures", description: "Electronic signing for documents and agreements" },
                    { key: "compliance" as const, label: "Compliance Tracking", description: "Certificate expiry, legal requirements, and alerts" },
                    { key: "aiAssistant" as const, label: "AI Assistant", description: "AI-powered chat for property and tenant support" },
                    { key: "arrears" as const, label: "Arrears Management", description: "Overdue rent tracking, payment plans, and escalation" },
                    { key: "payments" as const, label: "Online Payments", description: "Rent collection, subscriptions, and contractor payments" },
                    { key: "messages" as const, label: "Messaging System", description: "In-platform communications between all parties" },
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{feature.label}</p>
                        <p className="text-xs text-[#687068]">{feature.description}</p>
                      </div>
                      <button
                        onClick={() => setSystemFeatures((prev) => ({ ...prev, [feature.key]: !prev[feature.key] }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${systemFeatures[feature.key] ? "bg-[#C28A78]" : "bg-[#D5D9D5]"}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${systemFeatures[feature.key] ? "left-[22px]" : "left-0.5"}`}></span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4]">
                  <button onClick={handleSaveSettings} className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
                    Save Feature Settings
                  </button>
                </div>
              </div>
            </div>

            {/* API Keys / Integrations */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Integrations</h2>
              </div>
              <div className="divide-y divide-[#D5D9D5]">
                {[
                  { name: "Stripe", status: "Connected", icon: "ri-bank-card-line", desc: "Payment processing for rent, subscriptions, and commissions" },
                  { name: "GoCardless", status: "Connected", icon: "ri-exchange-dollar-line", desc: "Direct debit rent collection and recurring payments" },
                  { name: "DocuSign", status: "Connected", icon: "ri-pen-nib-line", desc: "Digital signature and document workflow" },
                  { name: "Twilio", status: "Connected", icon: "ri-message-3-line", desc: "SMS notifications and tenant communications" },
                  { name: "SendGrid", status: "Connected", icon: "ri-mail-line", desc: "Transactional and marketing email delivery" },
                  { name: "Google Maps", status: "Connected", icon: "ri-map-pin-line", desc: "Property location mapping and directions" },
                ].map((int) => (
                  <div key={int.name} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${int.icon} text-[#C28A78] text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#3A3F3A]">{int.name}</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{int.status}</span>
                      </div>
                      <p className="text-xs text-[#687068] mt-0.5">{int.desc}</p>
                    </div>
                    <button className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap">Configure</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QR CODES TAB */}
        {activeTab === "qr" && <QRCodeManager />}

        {/* USER DETAIL MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">User Details</h2>
                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${roleColors[selectedUser.role] || "bg-[#687068]"}`}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#3A3F3A]">{selectedUser.name}</h3>
                    <p className="text-sm text-[#687068]">{roleLabels[selectedUser.role]} · {selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Status</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full mt-1 inline-block ${statusStyles[selectedUser.status]}`}>{selectedUser.status}</span>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">User ID</p>
                    <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{selectedUser.id}</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Phone</p>
                    <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{selectedUser.phone || "—"}</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Registered</p>
                    <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{selectedUser.registeredDate}</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Last Login</p>
                    <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{selectedUser.lastLogin}</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Subscription</p>
                    <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{selectedUser.subscription || "—"}</p>
                  </div>
                  {(selectedUser.properties || selectedUser.properties === 0) && (
                    <div className="bg-[#FBF9F4] rounded-lg p-3">
                      <p className="text-xs text-[#94A3B8]">Properties</p>
                      <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{selectedUser.properties}</p>
                    </div>
                  )}
                  {(selectedUser.jobs || selectedUser.jobs === 0) && (
                    <div className="bg-[#FBF9F4] rounded-lg p-3">
                      <p className="text-xs text-[#94A3B8]">Jobs</p>
                      <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{selectedUser.jobs}</p>
                    </div>
                  )}
                  {(selectedUser.revenue || selectedUser.revenue === 0) && (
                    <div className="bg-[#FBF9F4] rounded-lg p-3 col-span-2">
                      <p className="text-xs text-[#94A3B8]">Lifetime Revenue</p>
                      <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">£{selectedUser.revenue.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {selectedUser.status === "Active" && (
                    <button onClick={() => { setSelectedUser(null); setUserActionModal({ user: selectedUser, action: "suspend" }); }} className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors">
                      Suspend Account
                    </button>
                  )}
                  {selectedUser.status === "Suspended" && (
                    <button onClick={() => { setSelectedUser(null); setUserActionModal({ user: selectedUser, action: "activate" }); }} className="flex-1 px-4 py-2.5 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors">
                      Activate Account
                    </button>
                  )}
                  {selectedUser.status === "Pending" && (
                    <button onClick={() => { setSelectedUser(null); setUserActionModal({ user: selectedUser, action: "activate" }); }} className="flex-1 px-4 py-2.5 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors">
                      Approve Account
                    </button>
                  )}
                  <button onClick={() => { setSelectedUser(null); setUserActionModal({ user: selectedUser, action: "deactivate" }); }} className="px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USER ACTION CONFIRMATION MODAL */}
        {userActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">
                  {userActionModal.action === "suspend" ? "Suspend Account" : userActionModal.action === "activate" ? "Activate Account" : "Deactivate Account"}
                </h2>
                <button onClick={() => setUserActionModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-[#3A3F3A]">
                  Are you sure you want to {userActionModal.action} <strong>{userActionModal.user.name}</strong>?
                </p>
                {userActionModal.action === "suspend" && (
                  <p className="text-xs text-[#687068] mt-2">The user will lose access to all platform features until reactivated.</p>
                )}
                {userActionModal.action === "deactivate" && (
                  <p className="text-xs text-[#687068] mt-2">The account will be permanently deactivated and data archived.</p>
                )}
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
                <button onClick={() => setUserActionModal(null)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleUserAction(userActionModal.user, userActionModal.action)}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors ${
                    userActionModal.action === "activate" ? "bg-[#10B981] hover:bg-[#059669]" : "bg-[#EF4444] hover:bg-[#DC2626]"
                  }`}
                >
                  Confirm {userActionModal.action}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTION DETAIL MODAL */}
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Transaction Details</h2>
                <button onClick={() => setSelectedTxn(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Transaction ID</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedTxn.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Date</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedTxn.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Type</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${transactionTypeStyles[selectedTxn.type]}`}>{selectedTxn.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Party</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedTxn.party}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Amount</span>
                  <span className="text-sm font-bold text-[#3A3F3A]">£{selectedTxn.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Status</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${transactionStatusStyles[selectedTxn.status]}`}>{selectedTxn.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Gateway</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedTxn.gateway}</span>
                </div>
                {selectedTxn.property && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#687068]">Property</span>
                    <span className="text-sm font-medium text-[#3A3F3A]">{selectedTxn.property}</span>
                  </div>
                )}
                <div className="pt-2">
                  <span className="text-sm text-[#687068]">Description</span>
                  <p className="text-sm text-[#3A3F3A] mt-0.5">{selectedTxn.description}</p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-[#D5D9D5]">
                <button onClick={() => setSelectedTxn(null)} className="w-full px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT DETAIL MODAL */}
        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Audit Entry Details</h2>
                <button onClick={() => setSelectedAudit(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Timestamp</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedAudit.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">User</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedAudit.user}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Role</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedAudit.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Action</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedAudit.action}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Target</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedAudit.target}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">IP Address</span>
                  <span className="text-sm font-medium text-[#3A3F3A] font-mono">{selectedAudit.ipAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687068]">Severity</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${selectedAudit.severity === "info" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : selectedAudit.severity === "warning" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                    {selectedAudit.severity}
                  </span>
                </div>
                {selectedAudit.details && (
                  <div className="pt-2">
                    <span className="text-sm text-[#687068]">Details</span>
                    <p className="text-sm text-[#3A3F3A] mt-0.5">{selectedAudit.details}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-4 border-t border-[#D5D9D5]">
                <button onClick={() => setSelectedAudit(null)} className="w-full px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SAVE TOAST */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#C28A78] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <i className="ri-check-line text-sm"></i>
            <span className="text-sm font-medium">Settings saved successfully</span>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}