"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount, showDemoBlockedMessage } from "@/lib/demoMode";
import { showRlsError } from "@/lib/rlsErrorHandler";
import PropertyHealthScoreCard from "@/components/property/PropertyHealthScoreCard";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  depositAmount: number;
  status: string;
  landlord: string;
  tenant: string;
  image: string;
  archived: boolean;
  attentionReason: string;
  dateAdded: string;
  nation: string;
  epcRating: string;
  isHmo: boolean;
  isFurnished: boolean;
  epcExpiry: string;
  complianceStatus: string;
  maintenanceOpen: number;
  ownerPortal: string;
  tenantPortal: string;
}

const nationLabels: Record<string, string> = {
  england: "England",
  wales: "Wales",
  scotland: "Scotland",
  northern_ireland: "Northern Ireland",
};

const nationOptions = [
  { value: "england", label: "England" },
  { value: "wales", label: "Wales" },
  { value: "scotland", label: "Scotland" },
  { value: "northern_ireland", label: "Northern Ireland" },
];

const statusStyles: Record<string, string> = {
  Occupied: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  Available: "bg-[#3B82F6]/10 text-[#3B82F6]",
  Maintenance: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Vacant: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  Pending: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

const propertyImages = [
  "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20property%20exterior%2C%20clean%20architectural%20lines%2C%20professional%20real%20estate%20photography%2C%20neutral%20tones%2C%20clean%20simple%20background%20with%20muted%20colours&width=400&height=300&seq=portfolio-img-1&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20suburban%20house%20with%20red%20brick%20facade%2C%20bay%20windows%2C%20well%20maintained%20front%20garden%2C%20professional%20property%20photography%2C%20natural%20daylight%2C%20warm%20tones&width=400&height=300&seq=portfolio-img-2&orientation=landscape",
  "https://readdy.ai/api/search-image?query=UK%20terraced%20house%20with%20traditional%20Victorian%20style%2C%20white%20window%20frames%2C%20clean%20street%20view%2C%20professional%20real%20estate%20photography%2C%20afternoon%20light&width=400&height=300&seq=portfolio-img-3&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Scottish%20stone%20cottage%20exterior%20with%20slate%20roof%2C%20garden%2C%20gravel%20path%2C%20professional%20property%20photography%2C%20natural%20light%2C%20green%20surroundings&width=400&height=300&seq=portfolio-img-4&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Modern%20waterfront%20apartment%20building%20UK%2C%20glass%20balconies%2C%20riverside%20location%2C%20contemporary%20architecture%2C%20professional%20property%20photography&width=400&height=300&seq=portfolio-img-5&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20semi-detached%20house%20on%20a%20hill%2C%20stone%20facade%2C%20mature%20trees%2C%20classic%20suburban%20architecture%2C%20professional%20real%20estate%20photography&width=400&height=300&seq=portfolio-img-6&orientation=landscape",
];

const enrichedMock: Partial<Property>[] = [
  { id: "1", complianceStatus: "Valid", maintenanceOpen: 2, ownerPortal: "active", tenantPortal: "active", status: "Occupied", landlord: "James Richardson", tenant: "John Miller", rentAmount: 950, depositAmount: 1096 },
  { id: "2", complianceStatus: "Expiring Soon", maintenanceOpen: 0, ownerPortal: "active", tenantPortal: "invited", status: "Occupied", landlord: "Sarah Chen", tenant: "Emily Watson", rentAmount: 1250 },
  { id: "3", complianceStatus: "Overdue", maintenanceOpen: 3, ownerPortal: "invited", tenantPortal: "active", status: "Occupied", landlord: "David Olu", tenant: "Rachel Green", rentAmount: 1600 },
  { id: "4", complianceStatus: "Valid", maintenanceOpen: 1, ownerPortal: "not-invited", tenantPortal: "not-invited", status: "Vacant", landlord: "Fiona MacLeod", tenant: undefined, rentAmount: 2200 },
];

export default function PortfolioPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nationFilter, setNationFilter] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [nationDropdown, setNationDropdown] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const [form, setForm] = useState({
    line1: "",
    city: "",
    postcode: "",
    nation: "england",
    bedrooms: 1,
    is_hmo: false,
  });

  const [formNationDropdown, setFormNationDropdown] = useState(false);
  const [editFormNationDropdown, setEditFormNationDropdown] = useState(false);

  const detectAccountType = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) {
          setAccountType((profile as any).account_type || null);
        }
      }
    } catch {}
  }, []);

  const fetchProperties = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: Property[] = data.map((p: any, idx: number) => {
          const enriched = enrichedMock.find((m) => m.id === p.id) || {};
          return {
            id: p.id,
            name: p.line1 || "—",
            address: [p.line1, p.line2].filter(Boolean).join(", "),
            city: p.city || "—",
            postcode: p.postcode || "—",
            type: "—",
            bedrooms: p.bedrooms ?? 0,
            bathrooms: 0,
            rentAmount: (enriched as any).rentAmount || 0,
            depositAmount: (enriched as any).depositAmount || 0,
            status: (enriched as any).status || "—",
            landlord: (enriched as any).landlord || "—",
            tenant: (enriched as any).tenant || "—",
            image: propertyImages[idx % propertyImages.length],
            archived: false,
            attentionReason: "",
            dateAdded: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "—",
            nation: p.nation || "—",
            epcRating: p.epc_rating || "—",
            isHmo: p.is_hmo || false,
            isFurnished: p.is_furnished || false,
            epcExpiry: p.epc_expiry || "—",
            complianceStatus: (enriched as any).complianceStatus || "—",
            maintenanceOpen: (enriched as any).maintenanceOpen || 0,
            ownerPortal: (enriched as any).ownerPortal || "not-invited",
            tenantPortal: (enriched as any).tenantPortal || "not-invited",
          };
        });
        setProperties(mapped);
      }
    } catch {
      // Supabase not connected
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoAccount()) {
      setDemoMode(true);
      setAccountType("agency");
      setLoading(false);
      return;
    }
    detectAccountType();
    fetchProperties();
  }, [detectAccountType, fetchProperties]);

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.postcode.toLowerCase().includes(search.toLowerCase());
    const matchesNation = nationFilter === "All" || p.nation === nationFilter;
    const matchesArchive = showArchived || !p.archived;
    return matchesSearch && matchesNation && matchesArchive;
  });

  const total = properties.length;
  const occupied = properties.filter((p) => p.status === "Occupied").length;
  const vacant = properties.filter((p) => p.status === "Vacant" || p.status === "Available").length;
  const missingOwner = properties.filter((p) => p.landlord === "—").length;
  const missingTenant = properties.filter((p) => !p.tenant || p.tenant === "—").length;
  const missingCompliance = properties.filter((p) => p.complianceStatus === "Overdue" || p.complianceStatus === "Missing").length;
  const openMaintenance = properties.filter((p) => p.maintenanceOpen > 0).length;
  const portalsIncomplete = properties.filter((p) => p.ownerPortal === "not-invited" || p.tenantPortal === "not-invited").length;
  const byNation = (nation: string) => properties.filter((p) => p.nation === nation).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("Session expired. Please log in again.");
        setSaving(false);
        return;
      }
      const { data: landlord } = await supabase
        .from("landlords")
        .select("id")
        .eq("owner_profile_id", session.user.id)
        .maybeSingle();
      if (!landlord) {
        showToast("No landlord record found. Please contact support.");
        setSaving(false);
        return;
      }
      const { error } = await supabase.from("properties").insert({
        line1: form.line1,
        city: form.city,
        postcode: form.postcode,
        nation: form.nation,
        bedrooms: form.bedrooms,
        is_hmo: form.is_hmo,
        is_furnished: false,
        landlord_id: landlord.id,
      });
      if (error) {
        if (!showRlsError(error, "properties")) {
          showToast("Failed to add property: " + error.message);
        }
        setSaving(false);
        return;
      }
      setAddModalOpen(false);
      setForm({ line1: "", city: "", postcode: "", nation: "england", bedrooms: 1, is_hmo: false });
      showToast("Property added successfully");
      setSaving(false);
      fetchProperties();
    } catch {
      setSaving(false);
      showToast("Database not connected — property saved locally");
      setAddModalOpen(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("Session expired.");
        setSaving(false);
        return;
      }
      const { data: landlord } = await supabase
        .from("landlords")
        .select("id")
        .eq("owner_profile_id", session.user.id)
        .maybeSingle();
      const { error } = await supabase
        .from("properties")
        .update({
          line1: form.line1,
          city: form.city,
          postcode: form.postcode,
          nation: form.nation,
          bedrooms: form.bedrooms,
          is_hmo: form.is_hmo,
          ...(landlord ? { landlord_id: landlord.id } : {}),
        })
        .eq("id", editingProperty.id);
      if (error) {
        showToast("Failed to update: " + error.message);
        setSaving(false);
        return;
      }
      setEditModalOpen(false);
      setEditingProperty(null);
      showToast("Property updated successfully");
      setSaving(false);
      fetchProperties();
    } catch {
      setSaving(false);
      showToast("Database not connected — changes saved locally");
      setEditModalOpen(false);
    }
  };

  const openEdit = (property: Property) => {
    setEditingProperty(property);
    setForm({
      line1: property.name !== "—" ? property.name : "",
      city: property.city !== "—" ? property.city : "",
      postcode: property.postcode !== "—" ? property.postcode : "",
      nation: property.nation !== "—" ? property.nation : "england",
      bedrooms: property.bedrooms,
      is_hmo: property.isHmo,
    });
    setEditModalOpen(true);
  };

  const permanentlyDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) {
        if (!showRlsError(error, "properties")) {
          showToast("Failed to delete: " + error.message);
        }
        return;
      }
    } catch {}
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    showToast("Property deleted permanently");
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-trigger")) {
        setNationDropdown(false);
        setFormNationDropdown(false);
        setEditFormNationDropdown(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const isOwner = accountType === "owner";
  const label = isOwner ? "My Properties" : "Property Portfolio";

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading properties...</p>
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
            <h1 className="text-2xl font-bold text-[#3A3F3A]">{label}</h1>
            <p className="text-sm text-[#687068] mt-1">
              {isOwner ? "Manage your rental properties" : "Manage your property portfolio across the UK"}
            </p>
          </div>
          <button
            onClick={() => {
              if (demoMode) { showDemoBlockedMessage(); return; }
              setAddModalOpen(true);
            }}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Add Property
          </button>
        </div>
        {demoMode && (
          <DemoHelperTip id="portfolio-overview" title="Portfolio Management Hub">
            Estate agents can manage all landlord properties from one portfolio view. Each card shows occupancy, compliance status, and portal readiness at a glance. Use the filters to find properties needing attention.
          </DemoHelperTip>
        )}

        {/* Operational KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Total", value: total, icon: "ri-building-4-line", color: "bg-[#C28A78]" },
            { label: "Occupied", value: occupied, icon: "ri-user-3-line", color: "bg-[#7A9A7E]" },
            { label: "Vacant", value: vacant, icon: "ri-home-4-line", color: "bg-[#8B5CF6]" },
            { label: "Compliance Issues", value: missingCompliance, icon: "ri-shield-check-line", color: missingCompliance > 0 ? "bg-[#EF4444]" : "bg-[#7A9A7E]" },
            { label: "Open Maintenance", value: openMaintenance, icon: "ri-tools-line", color: openMaintenance > 0 ? "bg-[#F59E0B]" : "bg-[#7A9A7E]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${stat.icon} text-white text-sm`}></i>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-[#3A3F3A] mr-2 whitespace-nowrap">Quick Actions</span>
            <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#C28A78]/10 text-[#C28A78] hover:bg-[#C28A78]/20 transition-colors whitespace-nowrap">
              <i className="ri-add-line text-sm"></i> Add Property
            </button>
            <Link href="/dashboard/import" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors whitespace-nowrap">
              <i className="ri-file-upload-line text-sm"></i> Import Portfolio
            </Link>
            <Link href="/dashboard/documents" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 transition-colors whitespace-nowrap">
              <i className="ri-folder-line text-sm"></i> Upload Documents
            </Link>
            <Link href="/dashboard/portal-setup" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-colors whitespace-nowrap">
              <i className="ri-macbook-line text-sm"></i> Set Up Portals
            </Link>
            <Link href="/dashboard/compliance" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors whitespace-nowrap">
              <i className="ri-shield-check-line text-sm"></i> Run Compliance Check
            </Link>
          </div>
        </div>

        {/* Additional Issue Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Missing Owner", value: missingOwner, alert: missingOwner > 0 },
            { label: "Missing Tenant", value: missingTenant, alert: missingTenant > 0 },
            { label: "Portals Incomplete", value: portalsIncomplete, alert: portalsIncomplete > 0 },
            { label: "Active Tenants", value: properties.filter((p) => p.tenant && p.tenant !== "—").length, alert: false },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border p-3.5 flex items-center gap-3 ${
              item.alert ? "bg-[#FEF2F2] border-[#FECACA]" : "bg-white border-[#D5D9D5]"
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.alert ? "bg-[#EF4444]/10" : "bg-[#F1F5F9]"}`}>
                <i className={`${item.alert ? "ri-alert-line text-[#EF4444]" : "ri-information-line text-[#94A3B8]"} text-sm`}></i>
              </div>
              <div>
                <p className={`text-lg font-bold ${item.alert ? "text-[#EF4444]" : "text-[#3A3F3A]"}`}>{item.value}</p>
                <p className="text-xs text-[#687068]">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address, city or postcode..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
          </div>
          <div className="relative dropdown-trigger">
            <button
              onClick={() => setNationDropdown(!nationDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] w-full sm:w-auto"
            >
              <span>Nation: {nationFilter === "All" ? "All" : nationLabels[nationFilter] || nationFilter}</span>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </div>
            </button>
            {nationDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[180px]">
                {["All", ...nationOptions.map((n) => n.value)].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setNationFilter(n); setNationDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]"
                  >
                    {n === "All" ? "All" : nationLabels[n] || n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Property Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[p.status] || "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                      {p.status}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#94A3B8]/10 text-[#94A3B8]">
                      {nationLabels[p.nation] || p.nation || "—"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                      <i className="ri-hotel-bed-line text-white text-xs"></i>
                      <span className="text-xs text-white font-medium">{p.bedrooms || "—"}</span>
                    </div>
                    {p.rentAmount > 0 && (
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs text-white font-medium">£{p.rentAmount.toLocaleString()}/mo</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/dashboard/property/${p.id}`} className="block group">
                    <h3 className="font-semibold text-[#3A3F3A] text-sm truncate group-hover:text-[#C28A78] transition-colors">{p.name}</h3>
                  </Link>
                  <p className="text-xs text-[#687068] mt-0.5 truncate">{p.city}, {p.postcode}</p>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Owner</span>
                      <span className="text-[#3A3F3A] font-medium truncate max-w-[140px]">{p.landlord !== "—" ? p.landlord : <span className="text-[#EF4444]">Missing</span>}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Tenant</span>
                      <span className="text-[#3A3F3A] font-medium truncate max-w-[140px]">{p.tenant && p.tenant !== "—" ? p.tenant : <span className="text-[#EF4444]">Missing</span>}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Compliance</span>
                      <span className={`font-medium px-1.5 py-0.5 rounded-full text-[10px] ${
                        p.complianceStatus === "Valid" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" :
                        p.complianceStatus === "Expiring Soon" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                        p.complianceStatus === "Overdue" || p.complianceStatus === "Missing" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                        "bg-[#94A3B8]/10 text-[#94A3B8]"
                      }`}>{p.complianceStatus || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Maintenance</span>
                      <span className={`font-medium ${p.maintenanceOpen > 0 ? "text-[#EF4444]" : "text-[#7A9A7E]"}`}>
                        {p.maintenanceOpen > 0 ? `${p.maintenanceOpen} open` : "Clear"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#D5D9D5]">
                    <PropertyHealthScoreCard propertyId={p.id} compact showLink={false} showReasons={false} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#D5D9D5] flex items-center gap-2">
                    <Link
                      href={`/dashboard/property/${p.id}`}
                      className="flex-1 text-center text-xs font-medium text-[#C28A78] hover:text-[#143828] py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => openEdit(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                      title="Edit"
                    >
                      <i className="ri-edit-line text-[#687068] text-sm"></i>
                    </button>
                    <button
                      onClick={() => {
                        if (demoMode) { showDemoBlockedMessage(); return; }
                        setDeleteConfirm(p.id);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                      title="Delete"
                    >
                      <i className="ri-delete-bin-line text-[#EF4444] text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-building-4-line text-[#94A3B8] text-2xl"></i>
            </div>
            <p className="text-lg font-medium text-[#3A3F3A]">No properties yet — add your first</p>
            <p className="text-sm text-[#687068] mt-1">Click &quot;Add Property&quot; above to get started</p>
          </div>
        )}

        {/* Add Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setAddModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Add New Property</h2>
                <button onClick={() => setAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Address Line 1</label>
                  <input type="text" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} placeholder="e.g. 12 Rose Avenue" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">City</label>
                    <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="e.g. London" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Postcode</label>
                    <input type="text" value={form.postcode} onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))} placeholder="e.g. E1 6AN" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                  </div>
                </div>
                <div className="relative dropdown-trigger">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Nation</label>
                  <button type="button" onClick={() => setFormNationDropdown(!formNationDropdown)} className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A]">
                    <span>{nationLabels[form.nation] || form.nation}</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                  </button>
                  {formNationDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-30">
                      {nationOptions.map((n) => (
                        <button key={n.value} type="button" onClick={() => { setForm((f) => ({ ...f, nation: n.value })); setFormNationDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]">{n.label}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Bedrooms</label>
                  <input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.is_hmo ? "bg-[#C28A78] border-[#C28A78]" : "border-[#D5D9D5]"}`}>
                    {form.is_hmo && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                  <span className="text-sm text-[#475569]">HMO (House in Multiple Occupation)</span>
                </label>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#D5D9D5]">
                  <button type="button" onClick={() => setAddModalOpen(false)} className="text-sm font-medium text-[#687068] px-5 py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors" disabled={saving}>Cancel</button>
                  <button type="submit" className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap" disabled={saving}>
                    {saving ? "Adding..." : "Add Property"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && editingProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEditModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Edit Property</h2>
                <button onClick={() => setEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <form onSubmit={handleEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Address Line 1</label>
                  <input type="text" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">City</label>
                    <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Postcode</label>
                    <input type="text" value={form.postcode} onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                  </div>
                </div>
                <div className="relative dropdown-trigger">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Nation</label>
                  <button type="button" onClick={() => setEditFormNationDropdown(!editFormNationDropdown)} className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A]">
                    <span>{nationLabels[form.nation] || form.nation}</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                  </button>
                  {editFormNationDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-30">
                      {nationOptions.map((n) => (
                        <button key={n.value} type="button" onClick={() => { setForm((f) => ({ ...f, nation: n.value })); setEditFormNationDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]">{n.label}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Bedrooms</label>
                  <input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]" required />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.is_hmo ? "bg-[#C28A78] border-[#C28A78]" : "border-[#D5D9D5]"}`}>
                    {form.is_hmo && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                  <span className="text-sm text-[#475569]">HMO (House in Multiple Occupation)</span>
                </label>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#D5D9D5]">
                  <button type="button" onClick={() => setEditModalOpen(false)} className="text-sm font-medium text-[#687068] px-5 py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors" disabled={saving}>Cancel</button>
                  <button type="submit" className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-[#EF4444] text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Delete Property</h3>
              <p className="text-sm text-[#687068] mb-6">This action cannot be undone. The property will be permanently removed from your portfolio.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 text-sm font-medium text-[#687068] px-4 py-2.5 rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
                <button onClick={() => permanentlyDelete(deleteConfirm)} className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">Delete</button>
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
      </div>
    </DashboardShell>
  );
}