"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount } from "@/lib/demoMode";
import { useEntitlements } from "@/lib/useEntitlements";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";
import {
  inspections as mockInspections,
  propertiesForInspection as mockPropsForInspection,
  inspectors as mockInspectors,
  inspectionTypeLabels,
  statusConfig,
  ratingConfig,
  severityConfig,
  Inspection,
  FollowUpAction,
  Observation,
  RoomCheck,
} from "./InspectionData";

interface LiveInspection {
  id: string;
  property: string;
  propertyId: string;
  address: string;
  type: "Move In" | "Routine Inspection" | "Mid-Term Inspection" | "Move Out";
  date: string;
  scheduledTime: string;
  inspector: string;
  inspectorId: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  tenant: string;
  tenantPhone: string;
  landlord: string;
  overallRating: "Excellent" | "Good" | "Fair" | "Poor" | "—";
  notes: string;
  rooms: RoomCheck[];
  observations: Observation[];
  followUpActions: FollowUpAction[];
  reportGenerated: boolean;
  reportDate?: string;
  photos: string[];
}

function mapInspectionType(dbType: string): "Move In" | "Routine Inspection" | "Mid-Term Inspection" | "Move Out" {
  const t = (dbType || "").toLowerCase();
  if (t === "check_in" || t === "move_in") return "Move In";
  if (t === "check_out" || t === "move_out") return "Move Out";
  if (t === "mid_term" || t === "interim") return "Mid-Term Inspection";
  return "Routine Inspection";
}

function mapStatus(dbStatus: string): "Scheduled" | "In Progress" | "Completed" | "Cancelled" {
  const s = (dbStatus || "").toLowerCase();
  if (s === "in_progress") return "In Progress";
  if (s === "completed") return "Completed";
  if (s === "cancelled") return "Cancelled";
  return "Scheduled";
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const filterTabs = ["All", "Scheduled", "In Progress", "Completed"];
const inspectionTypes = ["Move In", "Routine Inspection", "Mid-Term Inspection", "Move Out"];

export default function InspectionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspections, setInspections] = useState<LiveInspection[]>([]);
  const [propertiesForInspection, setPropertiesForInspection] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const { isReadOnly } = useEntitlements();

  useEffect(() => {
    const demo = isDemoAccount();
    setDemoMode(demo);
    if (demo) {
      setInspections(mockInspections as LiveInspection[]);
      setPropertiesForInspection(mockPropsForInspection);
      setInspectors(mockInspectors);
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const { data: inspData, error: inspErr } = await supabase
          .from("inspections")
          .select("id, property_id, tenancy_id, title, inspection_type, status, scheduled_date, completed_date, inspector_name, inspector_notes, report_url, created_by, created_at, updated_at");

        if (inspErr) throw inspErr;

        if (!inspData || inspData.length === 0) {
          setInspections([]);
          setPropertiesForInspection([]);
          setInspectors([]);
          setLoading(false);
          return;
        }

        const propertyIds = [...new Set(inspData.map((i: any) => i.property_id))];

        const { data: properties } = await supabase
          .from("properties")
          .select("id, line1, city, postcode")
          .in("id", propertyIds);

        const propMap = new Map<string, any>();
        (properties || []).forEach((p: any) => propMap.set(p.id, p));

        const builtProps: any[] = [];
        propMap.forEach((p) => {
          builtProps.push({
            id: p.id,
            name: p.line1 || "Property",
            address: `${p.line1}, ${p.city} ${p.postcode}`,
            tenant: "—",
            tenantPhone: "—",
            landlord: "—",
          });
        });

        const inspectorSet = new Map<string, string>();
        (inspData || []).forEach((i: any) => {
          if (i.inspector_name && !inspectorSet.has(i.inspector_name)) {
            inspectorSet.set(i.inspector_name, i.inspector_name);
          }
        });

        const builtInspectors: any[] = [];
        inspectorSet.forEach((name) => {
          builtInspectors.push({
            id: `insp-${name.toLowerCase().replace(/\s+/g, "-")}`,
            name,
            phone: "—",
            email: "—",
            role: "Inspector",
          });
        });

        const builtInspections: LiveInspection[] = (inspData || []).map((i: any) => {
          const prop = propMap.get(i.property_id);
          const propName = prop ? prop.line1 : i.property_id?.slice(0, 8) || "Unknown";
          const propAddr = prop ? `${prop.line1}, ${prop.city} ${prop.postcode}` : "";

          return {
            id: i.id,
            property: propName,
            propertyId: i.property_id,
            address: propAddr,
            type: mapInspectionType(i.inspection_type),
            date: formatDate(i.scheduled_date),
            scheduledTime: "—",
            inspector: i.inspector_name || "Unassigned",
            inspectorId: `insp-${(i.inspector_name || "unassigned").toLowerCase().replace(/\s+/g, "-")}`,
            status: mapStatus(i.status),
            tenant: "—",
            tenantPhone: "—",
            landlord: "—",
            overallRating: "—",
            notes: i.inspector_notes || "",
            rooms: [],
            observations: [],
            followUpActions: [],
            reportGenerated: !!(i.report_url),
            reportDate: i.report_url ? formatDate(i.completed_date || i.scheduled_date) : undefined,
            photos: [],
          };
        });

        setInspections(builtInspections);
        setPropertiesForInspection(builtProps);
        setInspectors(builtInspectors);
      } catch (err: any) {
        setError(err.message || "Failed to load inspections");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useRealtimeSubscription({
    table: "inspections",
    event: "*",
    onChange: () => {
      if (demoMode) return;
      async function refetch() {
        try {
          const { data: inspData } = await supabase
            .from("inspections")
            .select("id, property_id, tenancy_id, title, inspection_type, status, scheduled_date, completed_date, inspector_name, inspector_notes, report_url, created_by, created_at, updated_at");
          if (!inspData || inspData.length === 0) { setInspections([]); return; }
          const propertyIds = [...new Set(inspData.map((i: any) => i.property_id))];
          const { data: properties } = await supabase.from("properties").select("id, line1, city, postcode").in("id", propertyIds);
          const propMap = new Map<string, any>();
          (properties || []).forEach((p: any) => propMap.set(p.id, p));
          const built: LiveInspection[] = (inspData || []).map((i: any) => {
            const prop = propMap.get(i.property_id);
            return {
              id: i.id, property: prop ? prop.line1 : i.property_id?.slice(0, 8) || "Unknown",
              propertyId: i.property_id, address: prop ? `${prop.line1}, ${prop.city} ${prop.postcode}` : "",
              type: mapInspectionType(i.inspection_type), date: formatDate(i.scheduled_date),
              scheduledTime: "—", inspector: i.inspector_name || "Unassigned",
              inspectorId: `insp-${(i.inspector_name || "unassigned").toLowerCase().replace(/\s+/g, "-")}`,
              status: mapStatus(i.status), tenant: "—", tenantPhone: "—", landlord: "—",
              overallRating: "—", notes: i.inspector_notes || "", rooms: [], observations: [],
              followUpActions: [], reportGenerated: !!(i.report_url),
              reportDate: i.report_url ? formatDate(i.completed_date || i.scheduled_date) : undefined, photos: [],
            };
          });
          setInspections(built);
        } catch {}
      }
      refetch();
    },
    channelName: "rt-inspections",
  });

  const filtered = inspections.filter((i) => {
    const matchesFilter = activeFilter === "All" || i.status === activeFilter;
    const matchesSearch =
      i.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.inspector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = inspections.filter((i) => i.status === "Completed").length;
  const scheduledCount = inspections.filter((i) => i.status === "Scheduled").length;
  const inProgressCount = inspections.filter((i) => i.status === "In Progress").length;
  const openObservations = inspections.reduce((sum, i) => sum + i.observations.filter((o) => o.status === "Open").length, 0);
  const openActions = inspections.reduce((sum, i) => sum + i.followUpActions.filter((a) => a.status !== "Completed").length, 0);

  const inspection = inspections.find((i) => i.id === selectedInspection);

  const handleStartInspection = () => {
    setToastMessage("Inspection started. Mobile form ready.");
    setShowSuccessToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleGenerateReport = () => {
    setShowReportModal(false);
    setToastMessage("Inspection report generated successfully.");
    setShowSuccessToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSchedule = () => {
    setShowScheduleModal(false);
    setToastMessage("Inspection scheduled successfully.");
    setShowSuccessToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowSuccessToast(false), 3000);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-[#687068]">Loading inspections...</span>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#FEF2F2] rounded-full flex items-center justify-center">
            <i className="ri-error-warning-line text-[#C46868] text-2xl"></i>
          </div>
          <p className="text-sm font-medium text-[#C46868]">Failed to load inspections</p>
          <p className="text-xs text-[#687068] mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#C28A78] font-medium hover:underline">
            Try again
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Property Inspections</h1>
            <p className="text-sm text-[#687068] mt-1">Schedule, complete, and generate inspection reports</p>
          </div>
          {demoMode && (
            <DemoHelperTip id="inspections-overview" title="Property Inspections">
              Mobile property checks create inspection records, photos, voice notes and reports. Each inspection covers room-by-room checklists with pass/fail ratings. Follow-up actions are automatically created for flagged issues.
            </DemoHelperTip>
          )}
          <div className="flex items-center gap-2">
            {isReadOnly ? (
              <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-2.5 text-sm text-[#DC2626]">
                <i className="ri-lock-line text-sm"></i>
                <span>Trial ended — upgrade to schedule inspections</span>
              </div>
            ) : (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <i className="ri-add-circle-line text-sm"></i>
                Schedule Inspection
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Scheduled", value: scheduledCount, icon: "ri-calendar-line", color: "bg-[#8A9FB0]", sub: "Upcoming" },
            { label: "In Progress", value: inProgressCount, icon: "ri-time-line", color: "bg-[#D4A85C]", sub: "Active now" },
            { label: "Completed", value: completedCount, icon: "ri-check-double-line", color: "bg-[#7A9A7E]", sub: "This period" },
            { label: "Open Actions", value: openActions + openObservations, icon: "ri-alert-line", color: "bg-[#C46868]", sub: "Follow-ups" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-1 p-1 bg-[#FBF9F4] rounded-lg">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === "upcoming" ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === "completed" ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab("followups")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === "followups" ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                Follow-ups
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white flex-1 sm:flex-initial">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search property, inspector..."
                  className="text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent w-full sm:w-48"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#D5D9D5] overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tab ? "bg-[#C28A78] text-white" : "bg-[#FBF9F4] text-[#687068] hover:bg-[#D5D9D5]"
                }`}
              >
                {tab}
                {tab !== "All" && (
                  <span className="ml-1">({inspections.filter((i) => i.status === tab).length})</span>
                )}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Inspector</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Rating</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Obs</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-clipboard-line text-[#94A3B8] text-xl"></i>
                      </div>
                      <p className="text-sm text-[#94A3B8]">No inspections found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const typeStyle = inspectionTypeLabels[item.type];
                    const statusStyle = statusConfig[item.status];
                    const ratingStyle = ratingConfig[item.overallRating];
                    return (
                      <tr key={item.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></div>
                            <div>
                              <p className="font-medium text-[#3A3F3A]">{item.property}</p>
                              <p className="text-xs text-[#94A3B8]">{item.tenant}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 inline-flex ${typeStyle.bg} ${typeStyle.color}`}>
                            <i className={`${typeStyle.icon} text-xs`}></i>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-[#3A3F3A]">{item.date}</p>
                          <p className="text-xs text-[#94A3B8]">{item.scheduledTime}</p>
                        </td>
                        <td className="px-5 py-3.5 text-[#687068]">{item.inspector}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 inline-flex ${statusStyle.badge}`}>
                            <i className={`${statusStyle.icon} text-xs`}></i>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${ratingStyle.bg} ${ratingStyle.color}`}>
                            {item.overallRating}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-[#687068]">
                            {item.observations.filter((o) => o.status === "Open").length}/{item.observations.length}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "Scheduled" && (
                              <Link
                                href={`/mobile/property-check?inspection_id=${item.id}`}
                                className="text-xs font-medium text-[#C28A78] hover:underline"
                              >
                                Start
                              </Link>
                            )}
                            {item.status === "In Progress" && (
                              <Link
                                href={`/mobile/property-check?inspection_id=${item.id}`}
                                className="text-xs font-medium text-[#D4A85C] hover:underline"
                              >
                                Continue
                              </Link>
                            )}
                            {item.status === "Completed" && !item.reportGenerated && (
                              <button
                                onClick={() => setShowReportModal(true)}
                                className="text-xs font-medium text-[#8A9FB0] hover:underline"
                              >
                                Report
                              </button>
                            )}
                            {item.status === "Completed" && item.reportGenerated && (
                              <button
                                onClick={() => setSelectedInspection(item.id)}
                                className="text-xs font-medium text-[#C28A78] hover:underline"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedInspection(item.id)}
                              className="text-xs font-medium text-[#687068] hover:underline"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {activeTab === "followups" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C46868]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-alert-line text-[#C46868] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Open Follow-up Actions</h2>
                <span className="text-xs font-medium text-[#C46868] bg-[#C46868]/10 px-2 py-0.5 rounded-full">
                  {openActions} pending
                </span>
              </div>
            </div>
            <div className="p-5">
              {openActions === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-checkbox-circle-line text-[#7A9A7E] text-xl"></i>
                  </div>
                  <p className="text-sm font-medium text-[#7A9A7E]">All follow-up actions completed!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inspections
                    .flatMap((i) =>
                      i.followUpActions
                        .filter((a) => a.status !== "Completed")
                        .map((a) => ({ ...a, inspection: i }))
                    )
                    .map((action) => (
                      <div key={action.id} className="flex items-center justify-between bg-[#FBF9F4] rounded-xl p-4 border border-[#D5D9D5]">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${severityConfig[action.priority]?.bg || "bg-[#94A3B8]/10"}`}>
                            <i className="ri-file-list-line text-lg"></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{action.description}</p>
                            <p className="text-xs text-[#687068]">
                              {action.inspection.property} · {action.assignee} · Due {action.dueDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityConfig[action.priority]?.bg || "bg-[#94A3B8]/10"} ${severityConfig[action.priority]?.color || "text-[#94A3B8]"}`}>
                            {action.priority}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[action.status]?.badge || "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                            {action.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {inspection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className={`relative p-5 rounded-t-2xl ${inspectionTypeLabels[inspection.type]?.bg || "bg-[#8A9FB0]"}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`${inspectionTypeLabels[inspection.type]?.icon} text-white text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white">{inspection.property}</h3>
                  <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1">
                    <i className="ri-map-pin-line"></i> {inspection.address}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30">{inspection.type}</span>
                  {inspection.reportGenerated && (
                    <button className="text-xs font-semibold text-white border border-white/30 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                      <i className="ri-download-line mr-1"></i>PDF
                    </button>
                  )}
                  <button onClick={() => setSelectedInspection(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                    <i className="ri-close-line text-white text-base"></i>
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {[
                  { label: "Date", value: inspection.date },
                  { label: "Status", value: inspection.status },
                  { label: "Rating", value: inspection.overallRating },
                  { label: "Inspector", value: inspection.inspector },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-xs text-white/70">{s.label}</p>
                    <p className="text-sm font-bold text-white truncate">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {inspection.notes && (
                <div className="bg-[#F8F6F2] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#94A3B8] mb-1 uppercase tracking-wide">Inspector Notes</p>
                  <p className="text-sm text-[#475569]">{inspection.notes}</p>
                </div>
              )}

              {inspection.rooms.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A] mb-3">Room Checklist</p>
                  <div className="space-y-3">
                    {inspection.rooms.map((room) => (
                      <div key={room.id} className="bg-[#F8F6F2] rounded-xl p-4 border border-[#D5D9D5]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <i className="ri-door-open-line text-[#94A3B8]"></i>
                            <p className="text-sm font-semibold text-[#3A3F3A]">{room.name}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ratingConfig[room.condition]?.bg} ${ratingConfig[room.condition]?.color}`}>{room.condition}</span>
                        </div>
                        {room.notes && room.notes !== "To be inspected" && (
                          <p className="text-xs text-[#687068]">{room.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#F8F6F2] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#94A3B8]">No room data recorded</p>
                </div>
              )}

              {inspection.observations.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A] mb-3">Observations</p>
                  <div className="space-y-3">
                    {inspection.observations.map((obs) => (
                      <div key={obs.id} className="bg-[#F8F6F2] rounded-xl p-4 border border-[#D5D9D5]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityConfig[obs.severity]?.bg} ${severityConfig[obs.severity]?.color}`}>{obs.severity}</span>
                            <span className="text-xs text-[#94A3B8]">{obs.room} · {obs.category}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${obs.status === "Open" ? "bg-[#C46868]/10 text-[#C46868]" : "bg-[#7A9A7E]/10 text-[#7A9A7E]"}`}>{obs.status}</span>
                        </div>
                        <p className="text-sm text-[#3A3F3A] mb-2">{obs.description}</p>
                        <p className="text-xs text-[#687068]">Action: {obs.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspection.followUpActions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A] mb-3">Follow-up Actions</p>
                  <div className="space-y-2">
                    {inspection.followUpActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between bg-[#F8F6F2] rounded-xl p-3 border border-[#D5D9D5]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.status === "Completed" ? "bg-[#7A9A7E]/10" : "bg-[#D4A85C]/10"}`}>
                            <i className={`${action.status === "Completed" ? "ri-check-line text-[#7A9A7E]" : "ri-time-line text-[#D4A85C]"} text-sm`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#3A3F3A]">{action.description}</p>
                            <p className="text-xs text-[#687068]">{action.assignee} · Due {action.dueDate}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[action.status]?.badge}`}>{action.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspection.photos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A] mb-3">Property Photos</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {inspection.photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt={`Property photo ${idx + 1}`} className="w-full h-24 rounded-xl object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#7A9A7E] to-[#5A7A5E] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-calendar-check-line text-white text-lg"></i></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Schedule Inspection</h3>
                    <p className="text-xs text-white/70">Set date, property and inspector</p>
                  </div>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <i className="ri-close-line text-white text-base"></i>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Property</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {propertiesForInspection.map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-3 bg-[#F8F6F2] rounded-xl cursor-pointer border-2 border-transparent hover:border-[#7A9A7E]/40 transition-colors">
                      <div className="w-5 h-5 rounded border-2 border-[#D5D9D5] flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-sm bg-[#7A9A7E]"></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{p.name}</p>
                        <p className="text-xs text-[#687068]">{p.address} · {p.tenant}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Inspection Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {inspectionTypes.map((type) => (
                    <button key={type} className="py-2.5 text-xs font-semibold border-2 border-[#D5D9D5] rounded-xl text-[#687068] hover:border-[#7A9A7E] hover:text-[#7A9A7E] transition-colors bg-[#FAFAF8]">
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Date</label>
                  <input type="date" defaultValue="2026-07-01" className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] focus:outline-none focus:border-[#7A9A7E] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Time</label>
                  <input type="time" defaultValue="14:00" className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] focus:outline-none focus:border-[#7A9A7E] transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Inspector</label>
                <div className="space-y-2">
                  {inspectors.map((i) => (
                    <label key={i.id} className="flex items-center gap-3 p-3 bg-[#F8F6F2] rounded-xl cursor-pointer border-2 border-transparent hover:border-[#7A9A7E]/40 transition-colors">
                      <div className="w-5 h-5 rounded border-2 border-[#D5D9D5] flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-sm bg-[#7A9A7E]"></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{i.name}</p>
                        <p className="text-xs text-[#687068]">{i.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Notes</label>
                <textarea placeholder="Any special instructions for the inspector..." rows={3} className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] focus:outline-none focus:border-[#7A9A7E] resize-none transition-colors placeholder:text-[#94A3B8]"></textarea>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={handleSchedule} className="flex-1 py-3 text-sm font-semibold text-white bg-[#7A9A7E] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-check-line text-sm"></i></div>
                  Schedule Inspection
                </button>
                <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 text-sm font-semibold text-[#687068] border-2 border-[#D5D9D5] rounded-xl hover:bg-[#F8F6F2] hover:border-[#7A9A7E] transition-colors whitespace-nowrap">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-gradient-to-r from-[#8A9FB0] to-[#7A8FA0] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-file-chart-line text-white text-lg"></i></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Generate Report</h3>
                    <p className="text-xs text-white/70">Compile inspection findings into a PDF</p>
                  </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <i className="ri-close-line text-white text-base"></i>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Report Title</label>
                <input type="text" defaultValue={`${inspection?.type} Report - ${inspection?.property}`} className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] focus:outline-none focus:border-[#8A9FB0] transition-colors" />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#687068] mb-2 block uppercase tracking-wide">Include Sections</label>
                <div className="space-y-2">
                  {[
                    { label: "Property details & address", checked: true },
                    { label: "Room checklist & condition", checked: true },
                    { label: "Observations & findings", checked: true },
                    { label: "Photographs (all rooms)", checked: true },
                    { label: "Follow-up actions", checked: true },
                    { label: "Tenant & landlord signatures", checked: false },
                  ].map((section) => (
                    <label key={section.label} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-[#F8F6F2] transition-colors">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${section.checked ? "bg-[#8A9FB0] border-[#8A9FB0]" : "border-[#D5D9D5]"}`}>
                        {section.checked && <i className="ri-check-line text-white text-xs"></i>}
                      </div>
                      <span className="text-sm text-[#475569]">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Additional Notes</label>
                <textarea placeholder="Notes to include in the report..." rows={3} className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FAFAF8] focus:outline-none focus:border-[#8A9FB0] resize-none transition-colors placeholder:text-[#94A3B8]"></textarea>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={handleGenerateReport} className="flex-1 py-3 text-sm font-semibold text-white bg-[#8A9FB0] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-chart-line text-sm"></i></div>
                  Generate Report
                </button>
                <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 text-sm font-semibold text-[#687068] border-2 border-[#D5D9D5] rounded-xl hover:bg-[#F8F6F2] hover:border-[#8A9FB0] transition-colors whitespace-nowrap">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#C28A78] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <i className="ri-checkbox-circle-line text-lg"></i>
          <div>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}