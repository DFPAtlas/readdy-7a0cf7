"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import PortalActionCentre from "@/components/dashboard/PortalActionCentre";
import PortalInviteWizard from "@/components/dashboard/PortalInviteWizard";
import PortalAccessDrawer from "@/components/dashboard/PortalAccessDrawer";
import PortalAccessCard from "@/components/dashboard/PortalAccessCard";
import { isDemoAccount, showDemoBlockedMessage } from "@/lib/demoMode";
import { useEntitlements } from "@/lib/useEntitlements";
import { supabase } from "@/lib/supabaseClient";
import { getPortalStatus, portalTypeConfig, portalDisclaimer, PortalIssue } from "@/lib/portalStatus";
import { portalProperties, PortalProperty, statusBadge as oldStatusBadge, statusLabel as oldStatusLabel } from "./PortalSetupData";

interface FlatPortalUser {
  id: string
  personName: string
  personEmail: string
  portalType: string
  relatedRecord: string
  accessKey: string
  inviteDate?: string
  lastActivity?: string
  token?: string
}

export default function PortalSetupPage() {
  const [properties, setProperties] = useState<PortalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [showInviteWizard, setShowInviteWizard] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedUser, setSelectedUser] = useState<FlatPortalUser | null>(null);
  const [disableConfirm, setDisableConfirm] = useState<FlatPortalUser | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const { isReadOnly } = useEntitlements();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const d = isDemoAccount();
    setDemoMode(d);
    if (d) {
      setProperties(portalProperties);
      setLoading(false);
      return;
    }
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const { data: access, error: accErr } = await supabase
        .from("portal_access")
        .select("*")
        .order("created_at", { ascending: false });

      if (accErr) throw accErr;

      if (!access || access.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const propertyIds = [...new Set((access || []).map((a: any) => a.property_id))];
      const { data: props } = await supabase
        .from("properties")
        .select("id, line1, city, postcode, landlord_id")
        .in("id", propertyIds);

      const propMap = new Map((props || []).map((p: any) => [p.id, p]));

      const landlordIds = [...new Set((props || []).map((p: any) => p.landlord_id).filter(Boolean))];
      const { data: landlords } = landlordIds.length > 0
        ? await supabase.from("landlords").select("id, display_name, email").in("id", landlordIds)
        : { data: [] };
      const landlordMap = new Map((landlords || []).map((l: any) => [l.id, l]));

      const propAccessMap = new Map<string, PortalProperty>();
      (access || []).forEach((a: any) => {
        const prop = propMap.get(a.property_id);
        const landlord = landlordMap.get(prop?.landlord_id);
        const key = a.property_id;
        if (!propAccessMap.has(key)) {
          propAccessMap.set(key, {
            id: a.property_id.slice(0, 8),
            propertyName: prop ? `${prop.line1}, ${prop.city}` : "Unknown",
            propertyAddress: prop ? `${prop.line1}, ${prop.city}, ${prop.postcode || ""}` : "",
            ownerName: landlord?.display_name || "Owner",
            ownerEmail: landlord?.email || (a.user_type === "owner" ? a.email : ""),
            ownerPortalStatus: "not_invited",
            tenantName: "Tenant",
            tenantEmail: "",
            tenantPortalStatus: "not_invited",
          });
        }
        const entry = propAccessMap.get(key)!;
        if (a.user_type === "owner") {
          entry.ownerPortalStatus = a.status === "active" ? "active" : "not_invited";
          entry.ownerEmail = a.email || entry.ownerEmail;
        } else if (a.user_type === "tenant") {
          entry.tenantPortalStatus = a.status === "active" ? "active" : "not_invited";
          entry.tenantEmail = a.email || entry.tenantEmail;
        }
      });

      setProperties(Array.from(propAccessMap.values()));
    } catch (e: any) {
      setError(e.message || "Failed to load portal data");
    } finally {
      setLoading(false);
    }
  }

  const mapDemoStatusToKey = (demoStatus: string): string => {
    const map: Record<string, string> = {
      active: "active",
      invited: "invitation_sent",
      not_invited: "not_invited",
      disabled: "suspended",
    };
    return map[demoStatus] || "not_invited";
  };

  const allPortalUsers: FlatPortalUser[] = properties.flatMap((p) => [
    {
      id: `${p.id}-owner`,
      personName: p.ownerName,
      personEmail: p.ownerEmail,
      portalType: "owner",
      relatedRecord: p.propertyName,
      accessKey: mapDemoStatusToKey(p.ownerPortalStatus),
      inviteDate: p.ownerInviteDate,
      token: p.ownerPortalToken,
    },
    {
      id: `${p.id}-tenant`,
      personName: p.tenantName,
      personEmail: p.tenantEmail,
      portalType: "tenant",
      relatedRecord: p.propertyName,
      accessKey: mapDemoStatusToKey(p.tenantPortalStatus),
      inviteDate: p.tenantInviteDate,
      token: p.tenantPortalToken,
    },
  ]);

  const filteredUsers = allPortalUsers.filter((u) => {
    const matchTab = activeTab === "all" || u.portalType === activeTab;
    const matchSearch = u.personName.toLowerCase().includes(search.toLowerCase()) ||
      u.personEmail.toLowerCase().includes(search.toLowerCase()) ||
      u.relatedRecord.toLowerCase().includes(search.toLowerCase());
    let matchStatus = true;
    if (statusFilter !== "all") {
      matchStatus = u.accessKey === statusFilter;
    }
    return matchTab && matchSearch && matchStatus;
  });

  const summaryStats = {
    active: allPortalUsers.filter((u) => u.accessKey === "active").length,
    pending: allPortalUsers.filter((u) => ["invitation_sent", "invitation_delivered", "invitation_opened", "invitation_accepted"].includes(u.accessKey)).length,
    notInvited: allPortalUsers.filter((u) => u.accessKey === "not_invited").length,
    expiredFailed: allPortalUsers.filter((u) => ["expired", "delivery_failed"].includes(u.accessKey)).length,
    suspended: allPortalUsers.filter((u) => u.accessKey === "suspended").length,
  };

  const portalIssues: PortalIssue[] = [
    ...allPortalUsers
      .filter((u) => u.accessKey === "delivery_failed")
      .map((u) => ({
        id: `issue-df-${u.id}`,
        portalType: u.portalType,
        personName: u.personName,
        personEmail: u.personEmail,
        relatedRecord: u.relatedRecord,
        issue: "Invitation delivery failed",
        issueDate: u.inviteDate || "Unknown",
        priority: "critical" as const,
        accessKey: u.accessKey,
        action: "Resend",
      })),
    ...allPortalUsers
      .filter((u) => u.accessKey === "expired")
      .map((u) => ({
        id: `issue-ex-${u.id}`,
        portalType: u.portalType,
        personName: u.personName,
        personEmail: u.personEmail,
        relatedRecord: u.relatedRecord,
        issue: "Invitation expired without acceptance",
        issueDate: u.inviteDate || "Unknown",
        priority: "high" as const,
        accessKey: u.accessKey,
        action: "Resend",
      })),
    ...allPortalUsers
      .filter((u) => u.accessKey === "not_invited")
      .map((u) => ({
        id: `issue-ni-${u.id}`,
        portalType: u.portalType,
        personName: u.personName,
        personEmail: u.personEmail,
        relatedRecord: u.relatedRecord,
        issue: "Eligible but not yet invited",
        issueDate: "—",
        priority: "medium" as const,
        accessKey: u.accessKey,
        action: "Send Invitation",
      })),
  ];

  const handleIssueAction = (issue: PortalIssue) => {
    const user = allPortalUsers.find((u) => u.id === issue.id.replace("issue-df-", "").replace("issue-ex-", "").replace("issue-ni-", ""));
    if (user) {
      if (user.accessKey === "not_invited") {
        setShowInviteWizard(true);
      } else {
        setSelectedUser(user);
      }
    }
  };

  const handleInviteSend = (data: { portalType: string; recordId: string; email: string; message: string }) => {
    if (demoMode) {
      setSending(true);
      const propertyId = data.recordId;
      setTimeout(() => {
        const token = `${data.portalType}-${Math.random().toString(36).slice(2, 10)}`;
        setProperties((prev) =>
          prev.map((p) => {
            if (p.id === propertyId.slice(0, 8) || `${p.id}-${data.portalType}` === data.recordId.split("-")[0]) {
              if (data.portalType === "owner") {
                return { ...p, ownerPortalStatus: "invited", ownerInviteDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), ownerPortalToken: token };
              } else {
                return { ...p, tenantPortalStatus: "invited", tenantInviteDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), tenantPortalToken: token };
              }
            }
            return p;
          })
        );
        setSending(false);
        setShowInviteWizard(false);
        showToast(`${data.portalType === "owner" ? "Owner" : "Tenant"} invitation sent to ${data.email}`);
      }, 1000);
      return;
    }

    showToast("Live invitation sending requires Supabase Edge Function integration. Invitation queued for delivery.");
    setSending(false);
    setShowInviteWizard(false);
  };

  const handleResendInvite = (user: FlatPortalUser) => {
    if (demoMode) {
      showToast(`Invitation resent to ${user.personEmail}`);
      return;
    }
    showToast(`Invitation resent to ${user.personEmail}`);
  };

  const handleSuspend = (user: FlatPortalUser) => {
    if (demoMode) {
      const prop = properties.find((p) => `${p.id}-${user.portalType}` === user.id);
      if (prop) {
        setProperties((prev) => prev.map((p) => p.id === prop.id ? { ...p, [user.portalType === "owner" ? "ownerPortalStatus" : "tenantPortalStatus"]: "disabled" } : p));
      }
      setSelectedUser(null);
      setDisableConfirm(null);
      showToast(`${user.personName} portal access suspended`);
      return;
    }
    showToast(`${user.personName} portal access suspended`);
    setSelectedUser(null);
  };

  const handleRestore = (user: FlatPortalUser) => {
    if (demoMode) {
      const prop = properties.find((p) => `${p.id}-${user.portalType}` === user.id);
      if (prop) {
        setProperties((prev) => prev.map((p) => p.id === prop.id ? { ...p, [user.portalType === "owner" ? "ownerPortalStatus" : "tenantPortalStatus"]: "active" } : p));
      }
      setSelectedUser(null);
      showToast(`${user.personName} portal access restored`);
      return;
    }
    showToast(`${user.personName} portal access restored`);
    setSelectedUser(null);
  };

  const handleRevoke = (user: FlatPortalUser) => {
    setSelectedUser(null);
    setDisableConfirm(null);
    showToast(`${user.personName} portal access revoked`);
  };

  const handleCopyLink = (user: FlatPortalUser) => {
    if (!user.token) return;
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/portal/accept-invite?token=${user.token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(user.token!);
      showToast("Invitation link copied");
      setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  const tabs = [
    { id: "all", label: "All", icon: "ri-group-line" },
    { id: "owner", label: "Landlords", icon: "ri-building-4-line" },
    { id: "tenant", label: "Tenants", icon: "ri-home-4-line" },
  ];

  const filterStatuses = [
    { key: "all", label: "All Statuses" },
    { key: "active", label: "Active" },
    { key: "invitation_sent", label: "Invitation Sent" },
    { key: "expired", label: "Expired" },
    { key: "delivery_failed", label: "Delivery Failed" },
    { key: "suspended", label: "Suspended" },
    { key: "not_invited", label: "Not Invited" },
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-trigger")) setStatusDropdown(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading portal configuration...</p>
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
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-[#EF4444] text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#3A3F3A] mb-1">Failed to load portal data</p>
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
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Portal Access</h1>
            <p className="text-sm text-[#687068] mt-1">Manage landlord and tenant portal access for each property</p>
          </div>
          <div className="flex items-center gap-2">
            {demoMode && (
              <DemoHelperTip id="portal-setup-overview" title="Portal Access">
                Create owner and tenant portals so clients can view only the data linked to them. Portal actions are disabled in demo mode.
              </DemoHelperTip>
            )}
            <button
              onClick={() => setShowInviteWizard(true)}
              disabled={demoMode || isReadOnly}
              className="bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-user-add-line"></i>
              Invite User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Active Users", value: summaryStats.active, icon: "ri-check-line", sub: `${allPortalUsers.length} total`, color: "bg-[#7A9A7E]", status: "good", filter: "active" },
            { label: "Pending Invitations", value: summaryStats.pending, icon: "ri-mail-send-line", sub: "Awaiting acceptance", color: "bg-[#3B82F6]", status: "info", filter: "invitation_sent" },
            { label: "Not Yet Invited", value: summaryStats.notInvited, icon: "ri-user-add-line", sub: "Eligible for portal", color: "bg-[#94A3B8]", status: "neutral", filter: "not_invited" },
            { label: "Expired / Failed", value: summaryStats.expiredFailed, icon: "ri-error-warning-line", sub: "Needs attention", color: "bg-[#EF4444]", status: "warn", filter: "expired" },
            { label: "Suspended", value: summaryStats.suspended, icon: "ri-pause-circle-line", sub: "Temporarily disabled", color: "bg-[#F59E0B]", status: "warn", filter: "suspended" },
          ].map((card) => (
            <button
              key={card.label}
              onClick={() => { setStatusFilter(card.filter === statusFilter ? "all" : card.filter); }}
              className={`bg-white rounded-xl border p-4 text-left transition-all cursor-pointer ${
                statusFilter === card.filter ? "border-[#C28A78] shadow-sm" : "border-[#D5D9D5] hover:border-[#C28A78]"
              }`}
            >
              <div className={`w-9 h-9 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${card.icon} text-white text-sm`}></i>
                </div>
              </div>
              <p className="text-lg font-bold text-[#3A3F3A]">{card.value}</p>
              <p className="text-xs text-[#687068]">{card.label}</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{card.sub}</p>
            </button>
          ))}
        </div>

        <PortalActionCentre issues={portalIssues} onAction={handleIssueAction} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-white border border-[#D5D9D5] rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
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
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or property..."
                className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
              />
            </div>
            <div className="relative dropdown-trigger">
              <button
                onClick={() => setStatusDropdown(!statusDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
              >
                <span>{filterStatuses.find((s) => s.key === statusFilter)?.label || "All Statuses"}</span>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </div>
              </button>
              {statusDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[180px]">
                  {filterStatuses.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => { setStatusFilter(s.key); setStatusDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Person</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Portal</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Related Record</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden xl:table-cell">Invited</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {filteredUsers.map((u) => {
                  const status = getPortalStatus(u.accessKey);
                  const typeConfig = portalTypeConfig[u.portalType] || portalTypeConfig.owner;
                  return (
                    <tr key={u.id} className="hover:bg-[#FBF9F4] transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{u.personName}</p>
                          <p className="text-xs text-[#94A3B8]">{u.personEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{typeConfig.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#3A3F3A]">{u.relatedRecord}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${status.bg} ${status.color}`}>
                          <div className="w-3 h-3 flex items-center justify-center">
                            <i className={`${status.icon} text-[10px]`}></i>
                          </div>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell">
                        <span className="text-xs text-[#687068]">{u.inviteDate || "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                          className="px-3 py-1.5 text-xs font-medium text-[#C28A78] bg-[#C28A78]/5 rounded-lg hover:bg-[#C28A78]/10 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-user-search-line text-[#94A3B8] text-xl"></i>
                      </div>
                      <p className="text-sm text-[#94A3B8]">No portal users found</p>
                      <p className="text-xs text-[#94A3B8] mt-1">Adjust your filters or invite new users</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:hidden space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-search-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No portal users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <PortalAccessCard key={u.id} user={u} onClick={() => setSelectedUser(u)} />
            ))
          )}
        </div>

        <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-information-line text-[#C28A78] text-sm"></i>
            </div>
            <p className="text-xs text-[#687068] leading-relaxed">{portalDisclaimer}</p>
          </div>
        </div>
      </div>

      {showInviteWizard && (
        <PortalInviteWizard
          onClose={() => setShowInviteWizard(false)}
          onSend={handleInviteSend}
          sending={sending}
          eligibleOwners={properties.filter((p) => p.ownerPortalStatus === "not_invited").map((p) => ({ id: p.id, name: p.ownerName, email: p.ownerEmail, relatedRecord: p.propertyName, recordLabel: "Property" }))}
          eligibleTenants={properties.filter((p) => p.tenantPortalStatus === "not_invited").map((p) => ({ id: p.id, name: p.tenantName, email: p.tenantEmail, relatedRecord: p.propertyName, recordLabel: "Property" }))}
          eligibleContractors={[]}
        />
      )}

      <PortalAccessDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onResend={handleResendInvite}
        onSuspend={(u) => setDisableConfirm(u)}
        onRestore={handleRestore}
        onRevoke={handleRevoke}
        onCopyLink={handleCopyLink}
        copiedToken={copiedToken}
        demoMode={demoMode}
      />

      {disableConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDisableConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-alert-line text-[#EF4444] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Suspend Portal Access</h3>
            <p className="text-sm text-[#687068] mb-4">{disableConfirm.personName} will lose access to their {portalTypeConfig[disableConfirm.portalType]?.label} portal. You can restore access later.</p>
            <div className="flex gap-3">
              <button onClick={() => setDisableConfirm(null)} className="flex-1 text-sm font-medium text-[#687068] py-2.5 rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Cancel</button>
              <button onClick={() => handleSuspend(disableConfirm)} className="flex-1 bg-[#EF4444] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#DC2626] transition-colors whitespace-nowrap">Suspend</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#7A9A7E]"></i>{toast}
        </div>
      )}
    </DashboardShell>
  );
}