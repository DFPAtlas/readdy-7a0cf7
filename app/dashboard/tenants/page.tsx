"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import TenantCard from "@/components/dashboard/TenantCard";
import TenantQuickView from "@/components/dashboard/TenantQuickView";
import { tenants as mockTenants, portalStatusBadge, portalStatusLabel, TenantRecord } from "./TenantsData";

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [portalFilter, setPortalFilter] = useState("All");
  const [tenancyFilter, setTenancyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [portalDropdown, setPortalDropdown] = useState(false);
  const [sortDropdown, setSortDropdown] = useState(false);
  const [tenantList, setTenantList] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState<TenantRecord | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState<TenantRecord | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [disableConfirm, setDisableConfirm] = useState<TenantRecord | null>(null);
  const [quickViewTenant, setQuickViewTenant] = useState<TenantRecord | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentPropertyName: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    notes: "",
  });

  useEffect(() => {
    if (isDemoAccount()) {
      setTenantList(mockTenants);
      setLoading(false);
      return;
    }
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    const { data: supabaseTenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, full_name, email, phone, created_at");

    if (tenantsError || !supabaseTenants || supabaseTenants.length === 0) {
      setTenantList(mockTenants);
      setLoading(false);
      return;
    }

    const tenantIds = supabaseTenants.map((t) => t.id);

    const { data: parties } = await supabase
      .from("tenancy_parties")
      .select("tenant_id, tenancy_id")
      .in("tenant_id", tenantIds);

    const tenancyIds = parties ? [...new Set(parties.map((p) => p.tenancy_id))] : [];

    const { data: tenancies } = tenancyIds.length > 0
      ? await supabase.from("tenancies").select("id, property_id, status").in("id", tenancyIds)
      : { data: [] };

    const propertyIds = tenancies ? [...new Set(tenancies.map((t) => t.property_id))] : [];

    const { data: properties } = propertyIds.length > 0
      ? await supabase.from("properties").select("id, line1, city, postcode").in("id", propertyIds)
      : { data: [] };

    const { data: portalAccess } = await supabase
      .from("tenant_portal_access")
      .select("tenant_id, is_active")
      .in("tenant_id", tenantIds);

    const mapped: TenantRecord[] = supabaseTenants.map((t) => {
      const party = parties?.find((p) => p.tenant_id === t.id);
      const tenancy = party ? tenancies?.find((tn) => tn.id === party.tenancy_id) : null;
      const property = tenancy ? properties?.find((pr) => pr.id === tenancy.property_id) : null;
      const portal = portalAccess?.find((pa) => pa.tenant_id === t.id);

      let portalStatus: TenantRecord["portalStatus"] = "not_invited";
      if (portal) {
        portalStatus = portal.is_active ? "active" : "disabled";
      }

      return {
        id: t.id,
        fullName: t.full_name || "Unknown",
        email: t.email || "",
        phone: t.phone || "",
        currentPropertyId: property?.id,
        currentPropertyName: property ? [property.line1, property.city, property.postcode].filter(Boolean).join(", ") : undefined,
        currentPropertyAddress: property ? [property.line1, property.city, property.postcode].filter(Boolean).join(", ") : undefined,
        tenancyId: tenancy?.id,
        tenancyRef: tenancy?.id ? `TNCY-${tenancy.id.slice(0, 8)}` : undefined,
        tenancyStatus: tenancy?.status || undefined,
        portalStatus,
        dateAdded: t.created_at ? new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
      };
    });

    setTenantList(mapped);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeTenants = tenantList.filter((t) => t.tenancyStatus === "active").length;
  const portalActive = tenantList.filter((t) => t.portalStatus === "active").length;
  const pendingInvites = tenantList.filter((t) => t.portalStatus === "invited").length;
  const withoutTenancy = tenantList.filter((t) => !t.tenancyId).length;

  const filtered = tenantList
    .filter((t) => {
      const matchesSearch =
        t.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
        (t.phone && t.phone.includes(search)) ||
        (t.currentPropertyName && t.currentPropertyName.toLowerCase().includes(search.toLowerCase()));
      if (portalFilter !== "All" && t.portalStatus !== portalFilter) return false;
      if (tenancyFilter === "active" && t.tenancyStatus !== "active") return false;
      if (tenancyFilter === "former" && t.tenancyStatus === "active") return false;
      if (tenancyFilter === "unlinked" && t.tenancyId) return false;
      if (tenancyFilter === "no_portal" && t.portalStatus === "active") return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "property") return (a.currentPropertyName || "").localeCompare(b.currentPropertyName || "");
      if (sortBy === "last_active") return (b.lastLogin || "").localeCompare(a.lastLogin || "");
      return 0;
    });

  const handleAddTenant = async () => {
    if (!formData.fullName || !formData.email) return;
    if (isDemoAccount()) {
      const newTenant: TenantRecord = {
        id: `tnt-${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || "-",
        currentPropertyName: formData.currentPropertyName || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        notes: formData.notes || undefined,
        portalStatus: "not_invited",
        dateAdded: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      };
      setTenantList((prev) => [newTenant, ...prev]);
    } else {
      const { error } = await supabase.from("tenants").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
      });
      if (error) {
        showToast("Failed to add tenant: " + error.message);
      } else {
        showToast("Tenant added successfully");
        fetchTenants();
      }
    }
    setAddModalOpen(false);
    setFormData({ fullName: "", email: "", phone: "", currentPropertyName: "", emergencyContactName: "", emergencyContactPhone: "", notes: "" });
  };

  const handleEditTenant = async () => {
    if (!editModalOpen || !formData.fullName || !formData.email) return;
    if (isDemoAccount()) {
      setTenantList((prev) =>
        prev.map((t) =>
          t.id === editModalOpen.id
            ? { ...t, fullName: formData.fullName, email: formData.email, phone: formData.phone, currentPropertyName: formData.currentPropertyName || undefined, emergencyContactName: formData.emergencyContactName || undefined, emergencyContactPhone: formData.emergencyContactPhone || undefined, notes: formData.notes || undefined }
            : t
        )
      );
    } else {
      const { error } = await supabase.from("tenants").update({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
      }).eq("id", editModalOpen.id);
      if (error) {
        showToast("Failed to update tenant: " + error.message);
      } else {
        showToast("Tenant updated successfully");
        fetchTenants();
      }
    }
    setEditModalOpen(null);
  };

  const handleInviteTenant = (tenant: TenantRecord) => {
    setInviteModalOpen(tenant);
    setInviteEmail(tenant.email);
    setInviteMessage("");
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteModalOpen) return;
    setSending(true);

    if (isDemoAccount()) {
      const token = `tnt-${Math.random().toString(36).slice(2, 8)}`;
      setTenantList((prev) =>
        prev.map((t) =>
          t.id === inviteModalOpen.id
            ? { ...t, portalStatus: "invited", portalToken: token, inviteDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }
            : t
        )
      );
    } else {
      const { error } = await supabase
        .from("tenant_portal_access")
        .insert({ tenant_id: inviteModalOpen.id, is_active: false })
        .select("id")
        .single();

      if (error) {
        showToast("Failed to create portal access: " + error.message);
      } else {
        showToast(`Invite sent to ${inviteEmail}`);
        fetchTenants();
      }
    }

    setInviteModalOpen(null);
    setSending(false);
  };

  const handleDisablePortal = async (tenant: TenantRecord) => {
    if (isDemoAccount()) {
      setTenantList((prev) => prev.map((t) => (t.id === tenant.id ? { ...t, portalStatus: "disabled" as const } : t)));
    } else {
      await supabase.from("tenant_portal_access").update({ is_active: false }).eq("tenant_id", tenant.id);
      fetchTenants();
    }
    setDisableConfirm(null);
    showToast(`${tenant.fullName}'s portal disabled`);
  };

  const handleCopyLink = (token: string | undefined) => {
    if (!token) return;
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/portal/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(token);
      showToast("Invite link copied to clipboard");
      setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-trigger")) {
        setPortalDropdown(false);
        setSortDropdown(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Tenants</h1>
            <p className="text-sm text-[#687068] mt-1">{activeTenants} active tenants · {tenantList.length} total</p>
          </div>
          <button
            onClick={() => {
              setFormData({ fullName: "", email: "", phone: "", currentPropertyName: "", emergencyContactName: "", emergencyContactPhone: "", notes: "" });
              setAddModalOpen(true);
            }}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Add Tenant
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Tenants", value: activeTenants, icon: "ri-user-3-line", color: "bg-[#C28A78]" },
            { label: "Portal Active", value: portalActive, icon: "ri-smartphone-line", color: "bg-[#7A9A7E]" },
            { label: "Pending Invites", value: pendingInvites, icon: "ri-mail-send-line", color: "bg-[#F59E0B]" },
            { label: "Needs Attention", value: withoutTenancy, icon: "ri-alert-line", color: "bg-[#EF4444]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
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

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or property..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 bg-white border border-[#D5D9D5] rounded-lg p-1">
              {[
                { key: "All", label: "All" },
                { key: "active", label: "Active" },
                { key: "former", label: "Former" },
                { key: "unlinked", label: "Unlinked" },
                { key: "no_portal", label: "No Portal" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTenancyFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    tenancyFilter === f.key ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative dropdown-trigger">
              <button
                onClick={() => setPortalDropdown(!portalDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
              >
                <span>Portal: {portalFilter === "All" ? "All" : portalStatusLabel[portalFilter]}</span>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </div>
              </button>
              {portalDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[160px]">
                  {["All", "active", "invited", "not_invited", "disabled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setPortalFilter(s); setPortalDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap"
                    >
                      {s === "All" ? "All Statuses" : portalStatusLabel[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative dropdown-trigger">
              <button
                onClick={() => setSortDropdown(!sortDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-sort-desc text-[#94A3B8] text-xs"></i>
                </div>
                <span>{sortBy === "name" ? "Name" : sortBy === "property" ? "Property" : "Recent"}</span>
              </button>
              {sortDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[140px]">
                  {[
                    { key: "name", label: "Name" },
                    { key: "property", label: "Property" },
                    { key: "last_active", label: "Last Active" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => { setSortBy(s.key); setSortDropdown(false); }}
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

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {filtered.map((t) => (
            <TenantCard key={t.id} tenant={t} onView={setQuickViewTenant} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-3-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No tenants match your filters</p>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenant</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenancy</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Portal</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-5 py-4">
                      <button onClick={() => setQuickViewTenant(t)} className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 bg-[#3B82F6]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#3B82F6]">{t.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors">{t.fullName}</p>
                          <p className="text-xs text-[#94A3B8]">{t.email || "—"}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      {t.currentPropertyName ? (
                        <p className="text-sm text-[#3A3F3A]">{t.currentPropertyName}</p>
                      ) : (
                        <span className="text-sm text-[#94A3B8]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {t.tenancyRef ? (
                        <Link href={`/dashboard/tenancies/${t.tenancyId}`} className="text-sm text-[#3A3F3A] hover:text-[#C28A78] transition-colors">
                          {t.tenancyRef}
                        </Link>
                      ) : (
                        <span className="text-sm text-[#94A3B8]">—</span>
                      )}
                      {t.tenancyStatus && (
                        <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${t.tenancyStatus === "active" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                          {t.tenancyStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${portalStatusBadge[t.portalStatus]}`}>
                          {portalStatusLabel[t.portalStatus]}
                        </span>
                        {t.portalToken && (
                          <button
                            onClick={() => handleCopyLink(t.portalToken)}
                            className={`w-5 h-5 flex items-center justify-center rounded hover:bg-[#D5D9D5] transition-colors ${copiedToken === t.portalToken ? "text-[#7A9A7E]" : "text-[#94A3B8]"}`}
                          >
                            <i className={`${copiedToken === t.portalToken ? "ri-check-line" : "ri-file-copy-line"} text-xs`}></i>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditModalOpen(t);
                            setFormData({
                              fullName: t.fullName,
                              email: t.email,
                              phone: t.phone,
                              currentPropertyName: t.currentPropertyName || "",
                              emergencyContactName: t.emergencyContactName || "",
                              emergencyContactPhone: t.emergencyContactPhone || "",
                              notes: t.notes || "",
                            });
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F1F5F9] transition-colors"
                          title="Edit"
                        >
                          <i className="ri-edit-line text-[#687068] text-xs"></i>
                        </button>
                        {t.currentPropertyId && (
                          <Link
                            href={`/dashboard/property/${t.currentPropertyId}`}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F1F5F9] transition-colors"
                            title="View Property"
                          >
                            <i className="ri-building-4-line text-[#687068] text-xs"></i>
                          </Link>
                        )}
                        {t.portalStatus === "not_invited" && t.email && (
                          <button
                            onClick={() => handleInviteTenant(t)}
                            className="px-2.5 py-1 text-xs font-medium text-[#3B82F6] bg-[#3B82F6]/5 rounded-lg hover:bg-[#3B82F6]/10 transition-colors whitespace-nowrap"
                          >
                            Invite
                          </button>
                        )}
                        {t.portalStatus === "invited" && (
                          <button onClick={() => handleInviteTenant(t)} className="px-2.5 py-1 text-xs font-medium text-[#3B82F6] bg-[#3B82F6]/5 rounded-lg hover:bg-[#3B82F6]/10 transition-colors whitespace-nowrap">Resend</button>
                        )}
                        {t.portalStatus === "active" && (
                          <button onClick={() => setDisableConfirm(t)} className="px-2.5 py-1 text-xs font-medium text-[#EF4444] bg-[#EF4444]/5 rounded-lg hover:bg-[#FEE2E2] transition-colors whitespace-nowrap">Disable</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-user-3-line text-[#94A3B8] text-xl"></i>
                      </div>
                      <p className="text-sm text-[#94A3B8]">No tenants match your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-[#94A3B8] text-center">{filtered.length} tenant{filtered.length !== 1 ? "s" : ""} found</p>
        )}
      </div>

      {quickViewTenant && (
        <TenantQuickView tenant={quickViewTenant} onClose={() => setQuickViewTenant(null)} />
      )}

      {/* Add/Edit Modal */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setAddModalOpen(false); setEditModalOpen(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">{addModalOpen ? "Add Tenant" : "Edit Tenant"}</h3>
              <button onClick={() => { setAddModalOpen(false); setEditModalOpen(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Full Name *</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g. John Miller" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="tenant@email.com" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+44 7700 900000" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Property</label>
                  <input type="text" value={formData.currentPropertyName} onChange={(e) => setFormData({ ...formData, currentPropertyName: e.target.value })} placeholder="e.g. Rose Court Flat 2A" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Emergency Contact Name</label>
                  <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} placeholder="e.g. Jane Miller" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Emergency Contact Phone</label>
                  <input type="text" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} placeholder="+44 7700 900000" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any special instructions..." rows={2} maxLength={500} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white resize-none"></textarea>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={addModalOpen ? handleAddTenant : handleEditTenant} className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
                  {addModalOpen ? "Add Tenant" : "Save Changes"}
                </button>
                <button onClick={() => { setAddModalOpen(false); setEditModalOpen(null); }} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInviteModalOpen(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                  <i className="ri-smartphone-line text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">Invite Tenant to Portal</h3>
                  <p className="text-xs text-[#687068]">{inviteModalOpen.fullName}</p>
                </div>
              </div>
              <button onClick={() => setInviteModalOpen(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#94A3B8]"></i></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Personal Message (optional)</label>
                <textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} placeholder="You've been invited to access your tenant portal..." rows={3} maxLength={500} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white resize-none"></textarea>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSendInvite} disabled={!inviteEmail || sending} className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap">{sending ? "Sending..." : "Send Invite"}</button>
                <button onClick={() => setInviteModalOpen(null)} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirm */}
      {disableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDisableConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-alert-line text-[#EF4444] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Disable Tenant Portal</h3>
            <p className="text-sm text-[#687068] mb-4">{disableConfirm.fullName} will lose access to their dashboard.</p>
            <div className="flex gap-3">
              <button onClick={() => setDisableConfirm(null)} className="flex-1 text-sm font-medium text-[#687068] py-2.5 rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
              <button onClick={() => handleDisablePortal(disableConfirm)} className="flex-1 bg-[#EF4444] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#DC2626] transition-colors">Disable</button>
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