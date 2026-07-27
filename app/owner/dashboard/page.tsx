"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";
import PropertyHealthScoreCard from "@/components/property/PropertyHealthScoreCard";
import { usePortalBranding, PortalBrandingHeader } from "@/components/PortalBranding";

interface PropertyData {
  id: string;
  name: string;
  line1: string;
  city: string;
  postcode: string;
  bedrooms: number;
  epc_rating: string;
  image: string;
  tenant: string;
  rentAmount: string;
  rentStatus: string;
  nextInspection: string;
}

const demoProperties: PropertyData[] = [
  { id: "p1", name: "Rose Court Flat 2A", line1: "12 Rose Court", city: "London", postcode: "SW1A 1AA", bedrooms: 2, epc_rating: "C", image: "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20apartment%20exterior%2C%20clean%20architectural%20lines%2C%20professional%20real%20estate%20photography%2C%20neutral%20tones%2C%20clean%20simple%20background%20with%20muted%20colours%2C%20brick%20facade%20with%20white%20window%20frames&width=400&height=300&seq=owner-prop-1&orientation=landscape", tenant: "John Miller", rentAmount: "£1,850", rentStatus: "Paid", nextInspection: "8 Jul 2026" },
  { id: "p2", name: "Riverside Court", line1: "3 Riverside Court", city: "Manchester", postcode: "M1 4AL", bedrooms: 2, epc_rating: "B", image: "https://readdy.ai/api/search-image?query=Contemporary%20UK%20city%20apartment%20building%20exterior%2C%20modern%20architecture%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20muted%20colours&width=400&height=300&seq=owner-prop-2&orientation=landscape", tenant: "Emma Wilson", rentAmount: "£1,950", rentStatus: "Paid", nextInspection: "15 Aug 2026" },
];

const demoPayments = [
  { property: "Rose Court Flat 2A", tenant: "John Miller", amount: "£1,850", date: "01 Jun 2026", method: "Bank Transfer" },
  { property: "Riverside Court", tenant: "Emma Wilson", amount: "£1,950", date: "01 Jun 2026", method: "Standing Order" },
  { property: "Rose Court Flat 2A", tenant: "John Miller", amount: "£1,850", date: "01 May 2026", method: "Bank Transfer" },
  { property: "Riverside Court", tenant: "Emma Wilson", amount: "£1,950", date: "01 May 2026", method: "Standing Order" },
];

const demoUpdates = [
  { id: "u1", title: "June rent collected — both properties", property_name: "All Properties", update_type: "rent_summary", status: "sent", message: "Rent for June 2026 has been collected in full for both Rose Court Flat 2A (£1,850) and Riverside Court (£1,950). All payments received on time.", sent_at: "2026-06-15T09:00:00Z", created_at: "2026-06-10T12:00:00Z" },
  { id: "u2", title: "Routine inspection completed at Rose Court", property_name: "Rose Court Flat 2A", update_type: "inspection_summary", status: "sent", message: "The routine inspection at Rose Court Flat 2A was completed on 12 June 2026. The property is in good condition. No remedial works required.", sent_at: "2026-06-14T14:30:00Z", created_at: "2026-06-12T09:00:00Z" },
  { id: "u3", title: "EPC renewal reminder for Riverside Court", property_name: "Riverside Court", update_type: "compliance_report", status: "ready", message: "The EPC for Riverside Court is due to expire in August 2026. We recommend scheduling a renewal assessment as soon as possible to avoid any compliance gaps.", sent_at: null, created_at: "2026-06-16T08:00:00Z" },
];

export default function OwnerDashboardPage() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [maintenanceSummary, setMaintenanceSummary] = useState({ open: 0, inProgress: 0, completed: 0 });
  const [complianceSummary, setComplianceSummary] = useState({ valid: 0, expiring: 0, expired: 0 });
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const { branding, primary, primaryHover } = usePortalBranding();

  useEffect(() => {
    if (isDemoAccount()) {
      setDemoMode(true);
      setSessionReady(true);
      setProperties(demoProperties);
      setPayments(demoPayments);
      setUpdates(demoUpdates);
      setMaintenanceSummary({ open: 1, inProgress: 1, completed: 8 });
      setComplianceSummary({ valid: 6, expiring: 1, expired: 0 });
      setOwnerName("James Richardson");
      setOwnerEmail("james.richardson@example.com");
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/owner/login";
        return;
      }

      const { data: access } = await supabase
        .from("owner_portal_access")
        .select("id, landlord_id, is_active")
        .eq("profile_id", session.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!access) {
        await supabase.auth.signOut();
        window.location.href = "/owner/login";
        return;
      }

      const landlordId = (access as any).landlord_id;

      const { data: landlord } = await supabase.from("landlords").select("name, email").eq("id", landlordId).maybeSingle();
      if (landlord) {
        setOwnerName((landlord as any).name || "");
        setOwnerEmail((landlord as any).email || "");
      }

      const { data: props } = await supabase.from("properties").select("id, line1, city, postcode, bedrooms, epc_rating").eq("landlord_id", landlordId);
      const propList = (props || []) as any[];
      const propIds = propList.map((p: any) => p.id);

      const [{ data: tenancies }, { data: maintJobs }, { data: compItems }, { data: rentPmts }, { data: inspects }, { data: notifs }] = await Promise.all([
        supabase.from("tenancies").select("id, property_id, rent_amount, status, start_date, end_date").in("property_id", propIds),
        supabase.from("maintenance_jobs").select("id, property_id, title, status").in("property_id", propIds),
        supabase.from("property_compliance_items").select("id, obligation_code, status, next_due").in("property_id", propIds),
        supabase.from("rent_payments").select("id, tenancy_id, amount, payment_date, method").in("tenancy_id", propIds.length > 0 ? await supabase.from("tenancies").select("id").in("property_id", propIds).then(r => (r.data || []).map((t: any) => t.id)) : []).order("payment_date", { ascending: false }).limit(8),
        supabase.from("inspections").select("id, property_id, title, inspection_type, status, scheduled_date").in("property_id", propIds).order("scheduled_date", { ascending: false }).limit(6),
        supabase.from("notifications").select("id, title, message, notification_type, status, created_at").eq("landlord_id", landlordId).order("created_at", { ascending: false }).limit(10),
      ]);

      const tenList = (tenancies || []) as any[];
      const maintList = (maintJobs || []) as any[];
      const compList = (compItems || []) as any[];
      const pmtList = (rentPmts || []) as any[];

      const propData: PropertyData[] = propList.map((p: any) => {
        const ten = tenList.find((t: any) => t.property_id === p.id);
        const insp = (inspects || []).find((i: any) => i.property_id === p.id && i.scheduled_date);
        return {
          id: p.id,
          name: p.line1 || "Property",
          line1: p.line1 || "",
          city: p.city || "",
          postcode: p.postcode || "",
          bedrooms: p.bedrooms || 0,
          epc_rating: p.epc_rating || "N/A",
          image: "https://readdy.ai/api/search-image?query=Modern%20residential%20property%20exterior%2C%20professional%20real%20estate%20photography%2C%20clean%20background&width=400&height=300&seq=owner-dash-01&orientation=landscape",
          tenant: ten ? "Tenant" : "Vacant",
          rentAmount: ten ? `£${Number(ten.rent_amount || 0).toLocaleString()}` : "—",
          rentStatus: ten ? "Active" : "Vacant",
          nextInspection: insp ? new Date((insp as any).scheduled_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
        };
      });

      setProperties(propData);

      const openCount = maintList.filter((m: any) => m.status === "open").length;
      const inProgressCount = maintList.filter((m: any) => m.status === "in_progress").length;
      const completedCount = maintList.filter((m: any) => m.status === "completed").length;
      setMaintenanceSummary({ open: openCount, inProgress: inProgressCount, completed: completedCount });

      const validCount = compList.filter((c: any) => c.status === "valid" || c.status === "compliant").length;
      const expiringCount = compList.filter((c: any) => c.status === "expiring" || c.status === "due_soon").length;
      const expiredCount = compList.filter((c: any) => c.status === "expired" || c.status === "overdue").length;
      setComplianceSummary({ valid: validCount, expiring: expiringCount, expired: expiredCount });

      const paymentItems = (pmtList || []).slice(0, 8).map((p: any) => {
        const t = tenList.find((t2: any) => t2.id === p.tenancy_id);
        const prop = propList.find((p2: any) => p2.id === (t as any)?.property_id);
        return {
          property: prop?.line1 || "Property",
          tenant: "Tenant",
          amount: `£${Number(p.amount || 0).toLocaleString()}`,
          date: p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
          method: p.method || "Bank Transfer",
        };
      });
      setPayments(paymentItems);

      const updateItems = (notifs || []).slice(0, 8).map((n: any) => ({
        id: n.id,
        title: n.title || "Update",
        property_name: "Property",
        update_type: n.notification_type || "general",
        status: n.status || "sent",
        message: n.message || "",
        sent_at: n.created_at,
        created_at: n.created_at,
      }));
      setUpdates(updateItems);

      setLoading(false);
    };

    init();
  }, []);

  useRealtimeSubscription({
    table: "notifications",
    event: "*",
    onChange: () => {},
    channelName: "rt-owner-notifications",
  });

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/owner/login";
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusBadge: Record<string, string> = {
    draft: "bg-[#F1F5F9] text-[#687068]",
    ready: "bg-[#F59E0B]/10 text-[#F59E0B]",
    sent: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
    archived: "bg-[#94A3B8]/10 text-[#687068]",
  };

  const updateTypeIcon: Record<string, { icon: string; color: string }> = {
    inspection_summary: { icon: "ri-clipboard-line", color: "bg-[#14B8A6]" },
    compliance_report: { icon: "ri-shield-check-line", color: "bg-[#EF4444]" },
    maintenance_update: { icon: "ri-tools-line", color: "bg-[#F59E0B]" },
    rent_summary: { icon: "ri-money-pound-circle-line", color: "bg-[#7A9A7E]" },
    general: { icon: "ri-message-3-line", color: "bg-[#3B82F6]" },
  };

  const displayName = ownerName || "Property Owner";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4]">
      <PortalBrandingHeader
        portalLabel="Owner Portal"
        onLogout={handleLogout}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        extra={
          <div className="flex items-center gap-2 bg-[#FBF9F4] rounded-lg px-3 py-1.5">
            <i className="ri-building-4-line text-[#94A3B8] text-sm"></i>
            <span className="text-sm text-[#3A3F3A] font-medium">{properties.length} Properties</span>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Welcome back, {displayName.split(" ")[0]}</h1>
            <p className="text-sm text-[#687068] mt-1">Here is your property overview</p>
          </div>
        </div>

        {/* Summary Cards — exactly 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <div className="w-9 h-9 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center mb-3">
              <i className="ri-money-pound-circle-line text-[#7A9A7E] text-sm"></i>
            </div>
            <p className="text-xl font-bold text-[#3A3F3A]">£{(properties.reduce((sum, p) => { const amt = parseFloat(p.rentAmount.replace(/[£,]/g, "")); return sum + (isNaN(amt) ? 0 : amt); }, 0)).toLocaleString()}</p>
            <p className="text-xs text-[#687068]">Monthly Rent</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">Total collected (Jun)</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <div className="w-9 h-9 bg-[#C28A78]/10 rounded-lg flex items-center justify-center mb-3">
              <i className="ri-building-4-line text-[#C28A78] text-sm"></i>
            </div>
            <p className="text-xl font-bold text-[#3A3F3A]">{properties.length}</p>
            <p className="text-xs text-[#687068]">Properties</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">{properties.filter((p) => p.rentStatus === "Active" || p.rentStatus === "Paid").length} occupied</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <div className={`w-9 h-9 ${(maintenanceSummary.open + maintenanceSummary.inProgress + complianceSummary.expiring + complianceSummary.expired) > 0 ? "bg-[#F59E0B]/10" : "bg-[#7A9A7E]/10"} rounded-lg flex items-center justify-center mb-3`}>
              <i className={`${(maintenanceSummary.open + maintenanceSummary.inProgress + complianceSummary.expiring + complianceSummary.expired) > 0 ? "ri-alert-line text-[#F59E0B]" : "ri-check-line text-[#7A9A7E]"} text-sm`}></i>
            </div>
            <p className="text-xl font-bold text-[#3A3F3A]">{maintenanceSummary.open + maintenanceSummary.inProgress + complianceSummary.expiring + complianceSummary.expired}</p>
            <p className="text-xs text-[#687068]">Items to Review</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">Maintenance & compliance</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <div className={`w-9 h-9 ${complianceSummary.expired > 0 ? "bg-[#EF4444]/10" : "bg-[#7A9A7E]/10"} rounded-lg flex items-center justify-center mb-3`}>
              <i className={`${complianceSummary.expired > 0 ? "ri-error-warning-line text-[#EF4444]" : "ri-shield-check-line text-[#7A9A7E]"} text-sm`}></i>
            </div>
            <p className={`text-xl font-bold ${complianceSummary.expired > 0 ? "text-[#EF4444]" : "text-[#3A3F3A]"}`}>{complianceSummary.expired > 0 ? `${complianceSummary.expired} overdue` : "OK"}</p>
            <p className="text-xs text-[#687068]">Compliance</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">{complianceSummary.expiring} expiring soon</p>
          </div>
        </div>

        {/* Property Health */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                <i className="ri-heart-pulse-line text-[#C28A78] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Property Health Score</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.slice(0, 4).map((prop) => (
                <PropertyHealthScoreCard
                  key={prop.id}
                  propertyId={prop.id}
                  propertyName={prop.name}
                  compact
                  showReasons={true}
                />
              ))}
              {properties.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-sm text-[#94A3B8]">No property health data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agency Updates */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                <i className="ri-message-3-line text-[#C28A78] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Agency Updates</h2>
            </div>
            <span className="text-xs text-[#94A3B8]">{updates.length} updates</span>
          </div>
          <div className="divide-y divide-[#D5D9D5]">
            {updates.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-line text-[#94A3B8] text-xl"></i>
                </div>
                <p className="text-sm text-[#94A3B8]">No updates from your agency yet</p>
              </div>
            ) : (
              updates.map((update) => {
                const typeStyle = updateTypeIcon[update.update_type] || updateTypeIcon.general;
                return (
                  <button
                    key={update.id}
                    onClick={() => setDetailOpen(update)}
                    className="w-full flex items-start gap-3 px-5 py-4 hover:bg-[#FBF9F4] transition-colors text-left cursor-pointer"
                  >
                    <div className={`w-9 h-9 ${typeStyle.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${typeStyle.icon} text-white text-sm`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#3A3F3A] truncate">{update.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadge[update.status]}`}>
                          {update.status === "ready" ? "New" : update.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#687068] mt-0.5 truncate">{update.property_name}</p>
                      <p className="text-xs text-[#94A3B8] mt-1">{formatDate(update.sent_at || update.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img src={prop.image} alt={prop.name} className="w-full h-full object-cover object-top" />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prop.rentStatus === "Active" || prop.rentStatus === "Paid" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                    {prop.rentStatus === "Vacant" ? "Available" : "Occupied"}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs font-bold bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[#3A3F3A]">EPC {prop.epc_rating}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-[#3A3F3A]">{prop.name}</h3>
                <p className="text-xs text-[#687068] mt-0.5">{prop.line1}, {prop.city}, {prop.postcode}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Rent</p>
                    <p className="text-sm font-semibold text-[#3A3F3A]">{prop.rentAmount}</p>
                    <p className="text-[10px] text-[#7A9A7E]">{prop.rentStatus}</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Tenant</p>
                    <p className="text-sm font-semibold text-[#3A3F3A]">{prop.tenant}</p>
                    <p className="text-[10px] text-[#687068]">{prop.bedrooms} bed</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">Next Inspection</p>
                    <p className="text-sm font-semibold text-[#3A3F3A]">{prop.nextInspection}</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-lg p-3">
                    <p className="text-xs text-[#94A3B8]">EPC</p>
                    <p className="text-sm font-semibold text-[#3A3F3A]">{prop.epc_rating}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Maintenance + Compliance side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-tools-line text-[#F59E0B] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Maintenance</h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#687068]">Open Jobs</span>
                <span className="text-sm font-semibold text-[#F59E0B]">{maintenanceSummary.open}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#687068]">In Progress</span>
                <span className="text-sm font-semibold text-[#3B82F6]">{maintenanceSummary.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#687068]">Completed</span>
                <span className="text-sm font-semibold text-[#7A9A7E]">{maintenanceSummary.completed}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-shield-check-line text-[#EF4444] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Compliance</h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#687068]">Valid Certificates</span>
                <span className="text-sm font-semibold text-[#7A9A7E]">{complianceSummary.valid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#687068]">Expiring Soon</span>
                <span className="text-sm font-semibold text-[#F59E0B]">{complianceSummary.expiring}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#687068]">Expired</span>
                <span className="text-sm font-semibold text-[#EF4444]">{complianceSummary.expired}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Agency */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-mail-line text-white text-lg"></i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#3A3F3A]">Need to get in touch?</h3>
              <p className="text-sm text-[#687068]">Contact your letting agent for any questions about your properties.</p>
            </div>
            <Link
              href="/dashboard/messages"
              className="text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
              style={{ backgroundColor: primary }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primary)}
            >
              Send Message
            </Link>
          </div>
        </div>
      </main>

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailOpen(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(updateTypeIcon[detailOpen.update_type] || updateTypeIcon.general).color}`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${(updateTypeIcon[detailOpen.update_type] || updateTypeIcon.general).icon} text-white`}></i>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{detailOpen.title}</h3>
                  <p className="text-xs text-[#687068]">{detailOpen.property_name}</p>
                </div>
              </div>
              <button onClick={() => setDetailOpen(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-0.5">Status</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[detailOpen.status]}`}>
                    {detailOpen.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-0.5">Type</p>
                  <p className="text-sm text-[#3A3F3A] capitalize">{detailOpen.update_type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-0.5">Date</p>
                  <p className="text-sm text-[#3A3F3A]">{formatDate(detailOpen.sent_at || detailOpen.created_at)}</p>
                </div>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-5">
                <p className="text-xs text-[#94A3B8] mb-2">Message</p>
                <div className="text-sm text-[#3A3F3A] whitespace-pre-wrap leading-relaxed">
                  {detailOpen.message}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4] text-right">
              <button
                onClick={() => setDetailOpen(null)}
                className="text-sm font-medium text-[#687068] px-4 py-2 rounded-lg hover:bg-[#D5D9D5] transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-[#D5D9D5] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-[#94A3B8]">
          {branding.agencyName} Owner Portal · {displayName} · {ownerEmail}
        </div>
      </footer>
    </div>
  );
}