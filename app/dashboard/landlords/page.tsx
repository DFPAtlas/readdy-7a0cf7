"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount, showDemoBlockedMessage } from "@/lib/demoMode";
import LandlordCard from "@/components/dashboard/LandlordCard";
import LandlordQuickView from "@/components/dashboard/LandlordQuickView";
import { owners, portalStatusBadge, portalStatusLabel, Owner } from "./LandlordsData";

export default function LandlordsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [ownerList, setOwnerList] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState<Owner | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState<Owner | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [disableConfirm, setDisableConfirm] = useState<Owner | null>(null);
  const [quickViewOwner, setQuickViewOwner] = useState<Owner | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
    notes: "",
  });

  const demoMode = typeof window !== "undefined" && isDemoAccount();

  useEffect(() => {
    loadLandlords();
  }, []);

  const loadLandlords = async () => {
    setLoading(true);
    setError(null);
    try {
      if (demoMode) {
        setOwnerList(owners);
        setLoading(false);
        return;
      }

      const { data: landlords, error: landlordsErr } = await supabase
        .from("landlords")
        .select("id, display_name, email, phone, is_company, company_number, created_at, managing_agency_id, portfolio_type, ombudsman_member, ombudsman_ref");

      if (landlordsErr) throw landlordsErr;

      if (!landlords || landlords.length === 0) {
        setOwnerList([]);
        setLoading(false);
        return;
      }

      const landlordIds = landlords.map((l) => l.id);

      const { data: propertyCounts, error: propErr } = await supabase
        .from("properties")
        .select("landlord_id, id, line1, city, postcode")
        .in("landlord_id", landlordIds);

      if (propErr) throw propErr;

      const { data: portalAccess, error: portalErr } = await supabase
        .from("owner_portal_access")
        .select("landlord_id, is_active, last_login, access_code")
        .in("landlord_id", landlordIds);

      if (portalErr) throw portalErr;

      const propsByLandlord: Record<string, { id: string; name: string; address: string }[]> = {};
      const propCountByLandlord: Record<string, number> = {};

      (propertyCounts || []).forEach((p) => {
        if (!propsByLandlord[p.landlord_id]) {
          propsByLandlord[p.landlord_id] = [];
          propCountByLandlord[p.landlord_id] = 0;
        }
        const name = p.line1;
        const address = [p.city, p.postcode].filter(Boolean).join(", ");
        propsByLandlord[p.landlord_id].push({ id: p.id, name, address });
        propCountByLandlord[p.landlord_id]++;
      });

      const portalByLandlord: Record<string, { is_active: boolean; last_login: string | null; access_code: string | null }> = {};
      (portalAccess || []).forEach((pa) => {
        portalByLandlord[pa.landlord_id] = {
          is_active: pa.is_active,
          last_login: pa.last_login,
          access_code: pa.access_code,
        };
      });

      const mapped: Owner[] = landlords.map((l) => {
        const portal = portalByLandlord[l.id];
        let portalStatus: Owner["portalStatus"] = "not_invited";
        if (portal) {
          portalStatus = portal.is_active ? "active" : "invited";
        }

        return {
          id: l.id,
          fullName: l.display_name,
          email: l.email || "-",
          phone: l.phone || "-",
          address: "-",
          companyName: l.is_company ? (l.company_number || undefined) : undefined,
          notes: l.portfolio_type || undefined,
          portalStatus,
          portalToken: portal?.access_code || undefined,
          lastLogin: portal?.last_login
            ? new Date(portal.last_login).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : undefined,
          inviteDate: portal ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined,
          linkedProperties: propsByLandlord[l.id] || [],
          totalProperties: propCountByLandlord[l.id] || 0,
          dateAdded: l.created_at
            ? new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "-",
        };
      });

      setOwnerList(mapped);
    } catch (err: any) {
      console.error("Failed to load landlords:", err);
      setError(err.message || "Failed to load landlords");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = ownerList.filter((o) => {
    const matchesSearch =
      o.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      (o.companyName && o.companyName.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && o.portalStatus === statusFilter;
  });

  const handleAddOwner = async () => {
    if (!formData.fullName || !formData.email) return;
    if (demoMode) { showDemoBlockedMessage(); return; }

    try {
      const { data, error: insertErr } = await supabase
        .from("landlords")
        .insert({ display_name: formData.fullName, email: formData.email, phone: formData.phone || null, is_company: !!formData.companyName, company_number: formData.companyName || null })
        .select()
        .single();

      if (insertErr) throw insertErr;

      setAddModalOpen(false);
      setFormData({ fullName: "", email: "", phone: "", address: "", companyName: "", notes: "" });
      showToast("Landlord added successfully");
      loadLandlords();
    } catch (err: any) {
      showToast("Failed to add landlord: " + (err.message || "Unknown error"));
    }
  };

  const handleEditOwner = () => {
    if (!editModalOpen || !formData.fullName || !formData.email) return;
    setOwnerList((prev) =>
      prev.map((o) =>
        o.id === editModalOpen.id
          ? { ...o, fullName: formData.fullName, email: formData.email, phone: formData.phone, address: formData.address, companyName: formData.companyName || undefined, notes: formData.notes || undefined }
          : o
      )
    );
    setEditModalOpen(null);
    showToast("Landlord updated successfully");
  };

  const handleInviteOwner = (owner: Owner) => {
    setInviteModalOpen(owner);
    setInviteEmail(owner.email);
    setInviteMessage("");
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteModalOpen) return;
    if (demoMode) { showDemoBlockedMessage(); return; }
    setSending(true);

    try {
      const accessCode = `own-${Math.random().toString(36).slice(2, 10)}`;
      const { error: insertErr } = await supabase
        .from("owner_portal_access")
        .insert({ landlord_id: inviteModalOpen.id, is_active: false, access_code: accessCode });

      if (insertErr) throw insertErr;
    } catch (err: any) {
      setSending(false);
      showToast("Failed to send invite: " + (err.message || "Unknown error"));
      return;
    }

    setSending(false);
    setInviteModalOpen(null);
    showToast(`Invite sent to ${inviteEmail}`);
    loadLandlords();
  };

  const handleResendInvite = (owner: Owner) => {
    showToast(`Invite resent to ${owner.email}`);
  };

  const handleDisablePortal = async (owner: Owner) => {
    if (demoMode) { showDemoBlockedMessage(); setDisableConfirm(null); return; }
    try {
      await supabase
        .from("owner_portal_access")
        .update({ is_active: false })
        .eq("landlord_id", owner.id);
    } catch (err: any) {
      showToast("Failed to disable portal");
      setDisableConfirm(null);
      return;
    }
    setOwnerList((prev) => prev.map((o) => (o.id === owner.id ? { ...o, portalStatus: "disabled" as const } : o)));
    setDisableConfirm(null);
    showToast(`${owner.fullName}'s portal disabled`);
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

  const handleViewLandlord = (owner: Owner) => {
    setQuickViewOwner(owner);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-trigger")) setStatusDropdown(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const stats = {
    total: ownerList.length,
    active: ownerList.filter((o) => o.portalStatus === "active").length,
    attention: ownerList.filter((o) => o.portalStatus === "invited" || o.portalStatus === "disabled").length,
    totalProperties: ownerList.reduce((s, o) => s + o.totalProperties, 0),
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading landlords...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-error-warning-line text-[#EF4444] text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#3A3F3A]">Failed to load landlords</p>
            <p className="text-xs text-[#94A3B8] mt-1">{error}</p>
            <button onClick={loadLandlords} className="mt-3 text-sm font-medium text-[#C28A78] hover:underline cursor-pointer">Retry</button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Landlords</h1>
            <p className="text-sm text-[#687068] mt-1">{stats.total} landlords in your portfolio</p>
          </div>
          <button
            onClick={() => {
              setFormData({ fullName: "", email: "", phone: "", address: "", companyName: "", notes: "" });
              setAddModalOpen(true);
            }}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Add Landlord
          </button>
        </div>

        {/* Summary Cards — exactly 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Landlords", value: stats.total, icon: "ri-user-star-line", color: "bg-[#C28A78]", status: "neutral" },
            { label: "Properties Managed", value: stats.totalProperties, icon: "ri-building-4-line", color: "bg-[#8B5CF6]", status: "neutral" },
            { label: "Portal Active", value: stats.active, icon: "ri-macbook-line", color: "bg-[#7A9A7E]", status: "good" },
            { label: "Requiring Attention", value: stats.attention, icon: "ri-alert-line", color: stats.attention > 0 ? "bg-[#F59E0B]" : "bg-[#7A9A7E]", status: stats.attention > 0 ? "warn" : "good" },
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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or company..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
          </div>
          <div className="relative dropdown-trigger">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap cursor-pointer"
            >
              <span>Portal: {statusFilter === "All" ? "All" : portalStatusLabel[statusFilter]}</span>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </div>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[160px]">
                {["All", "active", "invited", "not_invited", "disabled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setStatusDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap cursor-pointer"
                  >
                    {s === "All" ? "All" : portalStatusLabel[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Card View */}
        <div className="block lg:hidden">
          {ownerList.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-star-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8] mb-1">No landlords in your portfolio yet</p>
              <p className="text-xs text-[#94A3B8]">Add your first landlord to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-user-star-line text-[#94A3B8] text-xl"></i>
                  </div>
                  <p className="text-sm text-[#94A3B8]">No landlords match your filters</p>
                </div>
              )}
              {filtered.map((o) => (
                <LandlordCard
                  key={o.id}
                  owner={o}
                  onInvite={handleInviteOwner}
                  onResend={handleResendInvite}
                  onDisable={setDisableConfirm}
                  onCopyLink={handleCopyLink}
                  copiedToken={copiedToken}
                  onEdit={(owner) => {
                    setEditModalOpen(owner);
                    setFormData({
                      fullName: owner.fullName,
                      email: owner.email,
                      phone: owner.phone,
                      address: owner.address,
                      companyName: owner.companyName || "",
                      notes: owner.notes || "",
                    });
                  }}
                  onView={handleViewLandlord}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: Table View */}
        <div className="hidden lg:block bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          {ownerList.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-star-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8] mb-1">No landlords in your portfolio yet</p>
              <p className="text-xs text-[#94A3B8]">Add your first landlord to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Landlord</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Properties</th>
                    <th className="text-center px-5 py-3 font-medium text-[#687068]">Portal</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Last Contact</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#C28A78]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#C28A78]">{o.fullName.charAt(0)}</span>
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewLandlord(o)}
                              className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors cursor-pointer text-left"
                            >
                              {o.fullName}
                            </button>
                            <div className="flex items-center gap-2 text-xs text-[#687068]">
                              <span>{o.email}</span>
                              {o.companyName && (
                                <>
                                  <span>·</span>
                                  <span>{o.companyName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-[#3A3F3A]">{o.totalProperties}</span>
                          {o.totalProperties > 0 && (
                            <span className="text-xs text-[#94A3B8]">
                              {o.linkedProperties.slice(0, 2).map((p) => p.name).join(", ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${portalStatusBadge[o.portalStatus]}`}>
                          {portalStatusLabel[o.portalStatus]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#687068] text-xs">
                        {o.lastLogin ? `Login ${o.lastLogin}` : o.dateAdded ? `Added ${o.dateAdded}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditModalOpen(o);
                              setFormData({
                                fullName: o.fullName,
                                email: o.email,
                                phone: o.phone,
                                address: o.address,
                                companyName: o.companyName || "",
                                notes: o.notes || "",
                              });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                          >
                            <i className="ri-edit-line text-[#687068] text-xs"></i>
                          </button>
                          {o.portalToken && (
                            <button
                              onClick={() => handleCopyLink(o.portalToken)}
                              className={`w-7 h-7 flex items-center justify-center rounded hover:bg-[#D5D9D5] transition-colors cursor-pointer ${copiedToken === o.portalToken ? "text-[#7A9A7E]" : "text-[#94A3B8]"}`}
                            >
                              <i className={`${copiedToken === o.portalToken ? "ri-check-line" : "ri-file-copy-line"} text-xs`}></i>
                            </button>
                          )}
                          {o.portalStatus === "not_invited" && (
                            <button onClick={() => handleInviteOwner(o)} className="px-2.5 py-1 text-xs font-medium text-[#C28A78] bg-[#C28A78]/5 rounded-lg hover:bg-[#C28A78]/10 transition-colors whitespace-nowrap cursor-pointer">
                              Invite
                            </button>
                          )}
                          {o.portalStatus === "invited" && (
                            <>
                              <button onClick={() => handleResendInvite(o)} className="px-2.5 py-1 text-xs font-medium text-[#3B82F6] bg-[#3B82F6]/5 rounded-lg hover:bg-[#3B82F6]/10 transition-colors whitespace-nowrap cursor-pointer">Resend</button>
                              <button onClick={() => setDisableConfirm(o)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                                <i className="ri-close-circle-line text-[#EF4444] text-xs"></i>
                              </button>
                            </>
                          )}
                          {o.portalStatus === "active" && (
                            <button onClick={() => setDisableConfirm(o)} className="px-2.5 py-1 text-xs font-medium text-[#EF4444] bg-[#EF4444]/5 rounded-lg hover:bg-[#FEE2E2] transition-colors whitespace-nowrap cursor-pointer">Disable</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-user-star-line text-[#94A3B8] text-xl"></i>
                        </div>
                        <p className="text-sm text-[#94A3B8]">No landlords match your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Drawer */}
      {quickViewOwner && (
        <LandlordQuickView
          owner={quickViewOwner}
          onClose={() => setQuickViewOwner(null)}
          onInvite={handleInviteOwner}
          onResend={handleResendInvite}
          onDisable={setDisableConfirm}
          onCopyLink={handleCopyLink}
          copiedToken={copiedToken}
          onViewFull={(owner) => {
            setQuickViewOwner(null);
            if (owner.linkedProperties.length > 0) {
              window.location.href = `/dashboard/property/${owner.linkedProperties[0].id}`;
            }
          }}
        />
      )}

      {/* Add/Edit Modal */}
      {addModalOpen && (
        <OwnerFormModal
          title="Add Landlord"
          formData={formData}
          setFormData={setFormData}
          onSave={handleAddOwner}
          onClose={() => setAddModalOpen(false)}
        />
      )}

      {editModalOpen && (
        <OwnerFormModal
          title="Edit Landlord"
          formData={formData}
          setFormData={setFormData}
          onSave={handleEditOwner}
          onClose={() => setEditModalOpen(null)}
        />
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInviteModalOpen(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C28A78] rounded-lg flex items-center justify-center">
                  <i className="ri-macbook-line text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">Invite to Owner Portal</h3>
                  <p className="text-xs text-[#687068]">{inviteModalOpen.fullName}</p>
                </div>
              </div>
              <button onClick={() => setInviteModalOpen(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Personal Message (optional)</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="You've been invited to access your owner portal..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSendInvite}
                  disabled={!inviteEmail || sending}
                  className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {sending ? "Sending..." : "Send Invite"}
                </button>
                <button onClick={() => setInviteModalOpen(null)} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirm Modal */}
      {disableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDisableConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-alert-line text-[#EF4444] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Disable Owner Portal</h3>
            <p className="text-sm text-[#687068] mb-4">{disableConfirm.fullName} will lose access to their dashboard.</p>
            <div className="flex gap-3">
              <button onClick={() => setDisableConfirm(null)} className="flex-1 text-sm font-medium text-[#687068] py-2.5 rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => handleDisablePortal(disableConfirm)} className="flex-1 bg-[#EF4444] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#DC2626] transition-colors cursor-pointer">Disable</button>
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

function OwnerFormModal({
  title,
  formData,
  setFormData,
  onSave,
  onClose,
}: {
  title: string;
  formData: { fullName: string; email: string; phone: string; address: string; companyName: string; notes: string };
  setFormData: (d: any) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#3A3F3A]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. James Richardson"
                className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="landlord@email.com"
                className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+44 7700 900000"
                className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street, City, Postcode"
              className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions or notes..."
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white resize-none"
            ></textarea>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={onSave} className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap cursor-pointer">
              {title === "Add Landlord" ? "Add Landlord" : "Save Changes"}
            </button>
            <button onClick={onClose} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}