"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount, showDemoBlockedMessage } from "@/lib/demoMode";
import { tenancies, tenancyStatusBadge, tenancyStatusLabel, TenancyRecord } from "./TenanciesData";

export default function TenanciesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [tenancyList, setTenancyList] = useState<TenancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    propertyName: "",
    tenantName: "",
    ownerName: "",
    startDate: "",
    endDate: "",
    rent: "",
    deposit: "",
    periodic: false,
  });

  const demoMode = typeof window !== "undefined" && isDemoAccount();

  useEffect(() => {
    loadTenancies();
  }, []);

  const loadTenancies = async () => {
    setLoading(true);
    setError(null);
    try {
      if (demoMode) {
        setTenancyList(tenancies);
        setLoading(false);
        return;
      }

      const { data: tnc, error: tncErr } = await supabase
        .from("tenancies")
        .select("id, property_id, status, start_date, end_date, rent_amount, deposit_amount, deposit_scheme, is_periodic, created_at");

      if (tncErr) throw tncErr;
      if (!tnc || tnc.length === 0) {
        setTenancyList([]);
        setLoading(false);
        return;
      }

      const tenancyIds = tnc.map((t) => t.id);
      const propertyIds = [...new Set(tnc.map((t) => t.property_id))];

      const { data: properties, error: propErr } = await supabase
        .from("properties")
        .select("id, line1, city, postcode, landlord_id")
        .in("id", propertyIds);

      if (propErr) throw propErr;

      const { data: parties, error: partErr } = await supabase
        .from("tenancy_parties")
        .select("tenancy_id, tenant_id, is_lead")
        .in("tenancy_id", tenancyIds);

      if (partErr) throw partErr;

      const tenantIds = [...new Set((parties || []).map((p) => p.tenant_id))];

      const { data: tenantsData, error: tenErr } = await supabase
        .from("tenants")
        .select("id, full_name, email, phone")
        .in("id", tenantIds);

      if (tenErr) throw tenErr;

      const landlordIds = [...new Set((properties || []).map((p) => p.landlord_id))];

      const { data: landlordsData, error: landErr } = await supabase
        .from("landlords")
        .select("id, display_name, email")
        .in("id", landlordIds);

      if (landErr) throw landErr;

      const { data: payments, error: payErr } = await supabase
        .from("rent_payments")
        .select("tenancy_id, amount, status")
        .in("tenancy_id", tenancyIds);

      if (payErr) throw payErr;

      const { data: arrears, error: arrErr } = await supabase
        .from("arrears_cases")
        .select("tenancy_id, total_owed, status")
        .in("tenancy_id", tenancyIds);

      if (arrErr) throw arrErr;

      const propMap: Record<string, any> = {};
      (properties || []).forEach((p) => { propMap[p.id] = p; });
      const tenMap: Record<string, any> = {};
      (tenantsData || []).forEach((t) => { tenMap[t.id] = t; });
      const landMap: Record<string, any> = {};
      (landlordsData || []).forEach((l) => { landMap[l.id] = l; });

      const partyByTenancy: Record<string, string[]> = {};
      (parties || []).forEach((p) => {
        if (!partyByTenancy[p.tenancy_id]) partyByTenancy[p.tenancy_id] = [];
        partyByTenancy[p.tenancy_id].push(p.tenant_id);
      });

      const payByTenancy: Record<string, { paid: number; total: number; hasArrears: boolean }> = {};
      (payments || []).forEach((p) => {
        if (!payByTenancy[p.tenancy_id]) payByTenancy[p.tenancy_id] = { paid: 0, total: 0, hasArrears: false };
        if (p.status === "paid") payByTenancy[p.tenancy_id].paid++;
        payByTenancy[p.tenancy_id].total++;
      });
      (arrears || []).forEach((a) => {
        if (!payByTenancy[a.tenancy_id]) payByTenancy[a.tenancy_id] = { paid: 0, total: 0, hasArrears: true };
        if (a.status === "active") payByTenancy[a.tenancy_id].hasArrears = true;
      });

      const mapped: TenancyRecord[] = tnc.map((t, idx) => {
        const prop = propMap[t.property_id];
        const tenantIdsForTnc = partyByTenancy[t.id] || [];
        const mainTenantId = tenantIdsForTnc[0];
        const tenant = mainTenantId ? tenMap[mainTenantId] : null;
        const landlord = prop ? landMap[prop.landlord_id] : null;
        const paySummary = payByTenancy[t.id];

        const status = t.status as TenancyRecord["status"];

        return {
          id: t.id,
          ref: `TNCY-${t.start_date ? new Date(t.start_date).getFullYear() : new Date().getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
          propertyId: t.property_id,
          propertyName: prop ? `${prop.line1}` : "Unknown Property",
          propertyAddress: prop ? [prop.city, prop.postcode].filter(Boolean).join(", ") : "",
          tenantId: tenant?.id || "",
          tenantName: tenant?.full_name || "Unassigned",
          tenantEmail: tenant?.email || "",
          tenantPhone: tenant?.phone || "",
          ownerId: landlord?.id || "",
          ownerName: landlord?.display_name || "Unknown",
          ownerEmail: landlord?.email || "",
          startDate: t.start_date
            ? new Date(t.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "-",
          endDate: t.end_date
            ? new Date(t.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "TBC",
          periodic: t.is_periodic || false,
          rent: Number(t.rent_amount) || 0,
          deposit: Number(t.deposit_amount) || 0,
          depositScheme: t.deposit_scheme || "TBC",
          status,
          ownerPortalStatus: "not_invited",
          tenantPortalStatus: "not_invited",
          rentDueDay: 1,
          noticeRequired: "1 month",
          propertyType: "—",
          bedrooms: 0,
          lastInspection: "—",
          nextInspection: "TBC",
        };
      });

      setTenancyList(mapped);
    } catch (err: any) {
      console.error("Failed to load tenancies:", err);
      setError(err.message || "Failed to load tenancies");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddTenancy = async () => {
    if (!formData.propertyName || !formData.startDate) return;
    if (demoMode) { showDemoBlockedMessage(); return; }
    try {
      await supabase.from("tenancies").insert({
        property_id: "d0000000-0000-0000-0000-000000000001",
        regime: "ast_legacy",
        term_type: "fixed_term",
        status: "active",
        start_date: new Date().toISOString().split("T")[0],
        rent_amount: parseInt(formData.rent) || 0,
        rent_period: "pcm",
        deposit_amount: parseInt(formData.deposit) || 0,
        deposit_scheme: "TDS",
        is_periodic: formData.periodic,
      });
    } catch (err: any) {
      showToast("Failed to create tenancy: " + (err.message || "Unknown error"));
      return;
    }
    setAddModalOpen(false);
    setFormData({ propertyName: "", tenantName: "", ownerName: "", startDate: "", endDate: "", rent: "", deposit: "", periodic: false });
    showToast("Tenancy created as draft");
    loadTenancies();
  };

  const filtered = tenancyList.filter((t) => {
    const matchesSearch =
      t.ref.toLowerCase().includes(search.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-trigger")) setStatusDropdown(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const stats = {
    total: tenancyList.length,
    active: tenancyList.filter((t) => t.status === "active").length,
    draft: tenancyList.filter((t) => t.status === "draft").length,
    ending: tenancyList.filter((t) => t.status === "ending").length,
    ended: tenancyList.filter((t) => t.status === "ended" || t.status === "archived").length,
    totalRent: tenancyList.filter((t) => t.status === "active").reduce((s, t) => s + t.rent, 0),
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading tenancies...</p>
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
            <p className="text-sm font-medium text-[#3A3F3A]">Failed to load tenancies</p>
            <p className="text-xs text-[#94A3B8] mt-1">{error}</p>
            <button onClick={loadTenancies} className="mt-3 text-sm font-medium text-[#C28A78] hover:underline">Retry</button>
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
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Tenancies</h1>
            <p className="text-sm text-[#687068] mt-1">{stats.total} tenancies · {stats.active} active</p>
          </div>
          <button
            onClick={() => {
              setFormData({ propertyName: "", tenantName: "", ownerName: "", startDate: "", endDate: "", rent: "", deposit: "", periodic: false });
              setAddModalOpen(true);
            }}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Create Tenancy
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Tenancies", value: stats.total, icon: "ri-file-text-line", color: "bg-[#C28A78]" },
            { label: "Active", value: stats.active, icon: "ri-check-line", color: "bg-[#7A9A7E]" },
            { label: "Draft", value: stats.draft, icon: "ri-draft-line", color: "bg-[#94A3B8]" },
            { label: "Ending Soon", value: stats.ending, icon: "ri-timer-line", color: "bg-[#F59E0B]" },
            { label: "Ended", value: stats.ended, icon: "ri-archive-line", color: "bg-[#8B5CF6]" },
            { label: "Monthly Rent", value: `£${stats.totalRent.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#3B82F6]" },
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
              placeholder="Search by ref, property, tenant or owner..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
          </div>
          <div className="relative dropdown-trigger">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap cursor-pointer"
            >
              <span>Status: {statusFilter === "All" ? "All" : tenancyStatusLabel[statusFilter]}</span>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </div>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[160px]">
                {["All", "draft", "active", "ending", "ended", "archived"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setStatusDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap cursor-pointer"
                  >
                    {s === "All" ? "All Statuses" : tenancyStatusLabel[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          {tenancyList.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-file-text-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8] mb-1">No tenancies in your portfolio yet</p>
              <p className="text-xs text-[#94A3B8]">Create your first tenancy to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Ref / Property</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068] hidden md:table-cell">Tenant</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068] hidden lg:table-cell">Owner</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068] hidden xl:table-cell">Dates</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Rent</th>
                    <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <Link href={`/dashboard/tenancies/${t.id}`} className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors">{t.ref}</Link>
                          <p className="text-xs text-[#94A3B8] truncate max-w-[200px]">{t.propertyName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm text-[#3A3F3A]">{t.tenantName}</p>
                        {t.tenantEmail && <p className="text-xs text-[#94A3B8]">{t.tenantEmail}</p>}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-sm text-[#3A3F3A]">{t.ownerName}</p>
                        {t.ownerEmail && <p className="text-xs text-[#94A3B8]">{t.ownerEmail}</p>}
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell">
                        <p className="text-sm text-[#3A3F3A]">{t.startDate} — {t.endDate}</p>
                        {t.periodic && <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded-full">Periodic</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-medium text-[#3A3F3A]">£{t.rent.toLocaleString()}</p>
                        <p className="text-xs text-[#94A3B8]">Dep £{t.deposit.toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tenancyStatusBadge[t.status]}`}>
                          {tenancyStatusLabel[t.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/tenancies/${t.id}`}
                          className="text-xs font-medium text-[#C28A78] hover:bg-[#F1F5F9] px-3 py-1.5 rounded-lg transition-colors inline-block"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-file-text-line text-[#94A3B8] text-xl"></i>
                        </div>
                        <p className="text-sm text-[#94A3B8]">No tenancies match your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">Create Tenancy</h3>
              <button onClick={() => setAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Property *</label>
                <input type="text" value={formData.propertyName} onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })} placeholder="e.g. Rose Court Flat 2A" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Tenant</label>
                  <input type="text" value={formData.tenantName} onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })} placeholder="e.g. John Miller" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Owner</label>
                  <input type="text" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} placeholder="e.g. James Richardson" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Start Date *</label>
                  <input type="text" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} placeholder="DD Mon YYYY" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">End Date</label>
                  <input type="text" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} placeholder="DD Mon YYYY or TBC" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Monthly Rent (£)</label>
                  <input type="text" value={formData.rent} onChange={(e) => setFormData({ ...formData, rent: e.target.value })} placeholder="e.g. 1850" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Deposit (£)</label>
                  <input type="text" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} placeholder="e.g. 1850" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, periodic: !formData.periodic })}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.periodic ? "bg-[#C28A78] border-[#C28A78]" : "border-[#D5D9D5]"}`}
                >
                  {formData.periodic && <i className="ri-check-line text-white text-xs"></i>}
                </button>
                <span className="text-sm text-[#3A3F3A]">Periodic tenancy (rolling)</span>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleAddTenancy} className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap cursor-pointer">Create as Draft</button>
                <button onClick={() => setAddModalOpen(false)} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap cursor-pointer">Cancel</button>
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