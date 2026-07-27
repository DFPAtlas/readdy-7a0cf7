"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount } from "@/lib/demoMode";
import { useEntitlements } from "@/lib/useEntitlements";
import PropertyHealthScoreCard from "@/components/property/PropertyHealthScoreCard";

const nationLabels: Record<string, string> = {
  england: "England",
  wales: "Wales",
  scotland: "Scotland",
  northern_ireland: "Northern Ireland",
};

const propertyImages = [
  "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20property%20exterior%2C%20clean%20architectural%20lines%2C%20professional%20real%20estate%20photography%2C%20neutral%20tones%2C%20clean%20simple%20background%20with%20muted%20colours&width=400&height=300&seq=props-img-1&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20suburban%20house%20with%20red%20brick%20facade%2C%20bay%20windows%2C%20well%20maintained%20front%20garden%2C%20professional%20property%20photography%2C%20natural%20daylight&width=400&height=300&seq=props-img-2&orientation=landscape",
  "https://readdy.ai/api/search-image?query=UK%20terraced%20house%20Victorian%20style%2C%20white%20window%20frames%2C%20clean%20street%20view%2C%20professional%20real%20estate%20photography%2C%20afternoon%20light&width=400&height=300&seq=props-img-3&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Scottish%20stone%20cottage%20exterior%2C%20slate%20roof%2C%20garden%2C%20gravel%20path%2C%20professional%20property%20photography%2C%20natural%20light&width=400&height=300&seq=props-img-4&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Modern%20waterfront%20apartment%20building%20UK%2C%20glass%20balconies%2C%20riverside%20location%2C%20contemporary%20architecture%2C%20bright%20sky&width=400&height=300&seq=props-img-5&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20semi-detached%20house%20on%20a%20hill%2C%20stone%20facade%2C%20mature%20trees%2C%20classic%20suburban%20architecture%2C%20soft%20morning%20light&width=400&height=300&seq=props-img-6&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Nottingham%20city%20centre%20modern%20flat%20exterior%2C%20red%20brick%2C%20large%20windows%2C%20professional%20real%20estate%20photography%2C%20urban%20setting&width=400&height=300&seq=props-img-7&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Southampton%20harbour%20view%20apartment%20building%20exterior%2C%20white%20render%2C%20balconies%2C%20coastal%20setting%2C%20professional%20property%20photography&width=400&height=300&seq=props-img-8&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Sheffield%20terraced%20house%2C%20red%20brick%2C%20traditional%20design%2C%20neat%20front%20garden%2C%20professional%20real%20estate%20photography%2C%20residential%20street&width=400&height=300&seq=props-img-9&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Newcastle%20city%20centre%20flat%2C%20modern%20exterior%2C%20large%20windows%2C%20urban%20setting%2C%20professional%20property%20photography%2C%20neutral%20tones&width=400&height=300&seq=props-img-10&orientation=landscape",
];

interface PropertyRow {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  bedrooms: number;
  nation: string;
  epcRating: string;
  isHmo: boolean;
  isFurnished: boolean;
  dateAdded: string;
  image: string;
  landlordName: string;
  tenantName: string;
  tenancyStatus: string;
  rentAmount: number;
  complianceStatus: string;
  maintenanceOpen: number;
  ownerPortal: string;
  tenantPortal: string;
}

const enrichedMock = [
  { id: "1", landlordName: "James Richardson", tenantName: "John Miller", tenancyStatus: "Active", rentAmount: 950, complianceStatus: "Valid", maintenanceOpen: 2, ownerPortal: "active", tenantPortal: "active" },
  { id: "2", landlordName: "Sarah Chen", tenantName: "Emily Watson", tenancyStatus: "Active", rentAmount: 1250, complianceStatus: "Expiring Soon", maintenanceOpen: 0, ownerPortal: "active", tenantPortal: "invited" },
  { id: "3", landlordName: "David Olu", tenantName: "Rachel Green", tenancyStatus: "Active", rentAmount: 1600, complianceStatus: "Overdue", maintenanceOpen: 3, ownerPortal: "invited", tenantPortal: "active" },
  { id: "4", landlordName: "Fiona MacLeod", tenantName: null, tenancyStatus: "None", rentAmount: 2200, complianceStatus: "Valid", maintenanceOpen: 1, ownerPortal: "not-invited", tenantPortal: "not-invited" },
];

const statusStyles: Record<string, string> = {
  Occupied: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  Active: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  Available: "bg-[#3B82F6]/10 text-[#3B82F6]",
  Maintenance: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Vacant: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  None: "bg-[#94A3B8]/10 text-[#94A3B8]",
  Pending: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

const complianceStyles: Record<string, string> = {
  Valid: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  "Expiring Soon": "bg-[#F59E0B]/10 text-[#F59E0B]",
  Overdue: "bg-[#EF4444]/10 text-[#EF4444]",
  Missing: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

const portalLabels: Record<string, string> = {
  active: "Active",
  invited: "Invited",
  "not-invited": "Not Set Up",
};

const portalStyles: Record<string, string> = {
  active: "text-[#7A9A7E]",
  invited: "text-[#3B82F6]",
  "not-invited": "text-[#94A3B8]",
};

const filters = [
  { id: "all", label: "All" },
  { id: "occupied", label: "Occupied" },
  { id: "vacant", label: "Vacant" },
  { id: "missing-compliance", label: "Missing Compliance" },
  { id: "open-maintenance", label: "Open Maintenance" },
  { id: "portal-not-set-up", label: "Portal Not Set Up" },
  { id: "no-owner", label: "No Owner Assigned" },
  { id: "no-tenant", label: "No Tenant Assigned" },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [demoMode, setDemoMode] = useState(false);
  const { isReadOnly } = useEntitlements();

  const fetchProperties = useCallback(async () => {
    if (isDemoAccount()) {
      setDemoMode(true);
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: PropertyRow[] = data.map((p: any, idx: number) => {
          const enriched = enrichedMock.find((m) => m.id === p.id) || {};
          return {
            id: p.id,
            name: p.line1 || "—",
            address: [p.line1, p.city, p.postcode].filter(Boolean).join(", "),
            city: p.city || "—",
            postcode: p.postcode || "—",
            bedrooms: p.bedrooms ?? 0,
            nation: nationLabels[p.nation] || p.nation || "—",
            epcRating: p.epc_rating || "—",
            isHmo: p.is_hmo || false,
            isFurnished: p.is_furnished || false,
            dateAdded: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "—",
            image: propertyImages[idx % propertyImages.length],
            landlordName: (enriched as any).landlordName || null,
            tenantName: (enriched as any).tenantName || null,
            tenancyStatus: (enriched as any).tenancyStatus || "None",
            rentAmount: (enriched as any).rentAmount || 0,
            complianceStatus: (enriched as any).complianceStatus || "Missing",
            maintenanceOpen: (enriched as any).maintenanceOpen || 0,
            ownerPortal: (enriched as any).ownerPortal || "not-invited",
            tenantPortal: (enriched as any).tenantPortal || "not-invited",
          };
        });
        setProperties(mapped);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filtered = properties.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.address.toLowerCase().includes(q) &&
        !p.city.toLowerCase().includes(q) &&
        !(p.landlordName && p.landlordName.toLowerCase().includes(q)) &&
        !(p.tenantName && p.tenantName.toLowerCase().includes(q))
      ) {
        return false;
      }
    }

    switch (activeFilter) {
      case "occupied":
        return p.tenancyStatus === "Active";
      case "vacant":
        return p.tenancyStatus === "None";
      case "missing-compliance":
        return p.complianceStatus === "Overdue" || p.complianceStatus === "Missing";
      case "open-maintenance":
        return p.maintenanceOpen > 0;
      case "portal-not-set-up":
        return p.ownerPortal === "not-invited" || p.tenantPortal === "not-invited";
      case "no-owner":
        return !p.landlordName;
      case "no-tenant":
        return !p.tenantName;
      default:
        return true;
    }
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Properties</h1>
            <p className="text-sm text-[#687068] mt-1">{properties.length} properties in your portfolio</p>
          </div>
          <Link
            href="/dashboard/portfolio"
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Manage Portfolio
          </Link>
        </div>

        {demoMode && (
          <DemoHelperTip id="properties-overview" title="Property Records">
            Each property links to an owner, tenant, tenancy, documents, compliance and maintenance. The coloured badges show tenancy status, compliance health and portal readiness at a glance.
          </DemoHelperTip>
        )}

        {/* Search + Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white max-w-md">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address, owner, or tenant..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === f.id
                    ? "bg-[#C28A78] text-white"
                    : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property Cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[p.tenancyStatus] || "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                      {p.tenancyStatus}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#94A3B8]/10 text-[#94A3B8]">
                      {p.nation}
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
                  <p className="text-xs text-[#687068] mt-0.5 truncate">{p.address}</p>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Owner</span>
                      <span className="text-[#3A3F3A] font-medium truncate max-w-[140px]">
                        {p.landlordName || <span className="text-[#EF4444]">Missing</span>}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Tenant</span>
                      <span className="text-[#3A3F3A] font-medium truncate max-w-[140px]">
                        {p.tenantName || <span className="text-[#EF4444]">Missing</span>}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Compliance</span>
                      <span className={`font-medium px-1.5 py-0.5 rounded-full text-[10px] ${complianceStyles[p.complianceStatus] || ""}`}>
                        {p.complianceStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">Maintenance</span>
                      <span className={`font-medium ${p.maintenanceOpen > 0 ? "text-[#EF4444]" : "text-[#7A9A7E]"}`}>
                        {p.maintenanceOpen > 0 ? `${p.maintenanceOpen} open` : "Clear"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94A3B8]">EPC</span>
                      <span className="text-[#3A3F3A] font-medium">{p.epcRating}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#D5D9D5]">
                    <PropertyHealthScoreCard propertyId={p.id} compact showLink={false} showReasons={false} />
                  </div>

                  {/* Portal Status */}
                  <div className="mt-3 pt-3 border-t border-[#D5D9D5] flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1">
                      <i className={`ri-user-star-line ${portalStyles[p.ownerPortal]}`}></i>
                      <span className={portalStyles[p.ownerPortal]}>Owner: {portalLabels[p.ownerPortal]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className={`ri-user-3-line ${portalStyles[p.tenantPortal]}`}></i>
                      <span className={portalStyles[p.tenantPortal]}>Tenant: {portalLabels[p.tenantPortal]}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#D5D9D5]">
                    <Link
                      href={`/dashboard/property/${p.id}`}
                      className="block text-center text-xs font-medium text-[#C28A78] hover:text-[#143828] py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                    >
                      View Details
                    </Link>
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
            <p className="text-lg font-medium text-[#3A3F3A]">No properties match your filters</p>
            <p className="text-sm text-[#687068] mt-1">Try adjusting your search or filter selection</p>
            <button onClick={() => { setSearch(""); setActiveFilter("all"); }} className="inline-block mt-4 text-sm font-medium text-[#C28A78] hover:underline">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}