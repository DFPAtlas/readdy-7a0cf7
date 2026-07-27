"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount } from "@/lib/demoMode";
import {
  timelineEvents,
  timelineCategories,
  timelinePropertyFilter,
  statusStyles,
  categoryColors,
  TimelineEvent,
} from "./ComplianceTimelineData";

const monthLabels = ["Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027", "Apr 2027", "May 2027", "Jun 2027"];

function getMonthIndex(dateStr: string): number {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = dateStr.split(" ");
  const monthIdx = months.indexOf(parts[1]);
  const year = parseInt(parts[2]);
  const baseMonth = 6;
  const baseYear = 2026;
  return (year - baseYear) * 12 + monthIdx - baseMonth;
}

export default function ComplianceTimelinePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  if (!demoMode && isDemoAccount()) setDemoMode(true);

  const filteredEvents = useMemo(() => {
    return timelineEvents.filter((e) => {
      const catMatch = activeCategory === "all" || e.category === activeCategory;
      const propMatch = propertyFilter === "All Properties" || e.propertyName === propertyFilter;
      return catMatch && propMatch;
    });
  }, [activeCategory, propertyFilter]);

  const monthsWithEvents = useMemo(() => {
    return monthLabels.map((label, idx) => {
      const eventsInMonth = filteredEvents.filter((e) => {
        const mi = getMonthIndex(e.date);
        return mi === idx;
      });
      return { label, events: eventsInMonth };
    });
  }, [filteredEvents]);

  const expiredCount = timelineEvents.filter((e) => e.status === "expired").length;
  const expiringCount = timelineEvents.filter((e) => e.status === "expiring").length;
  const validCount = timelineEvents.filter((e) => e.status === "valid").length;
  const completedCount = timelineEvents.filter((e) => e.status === "completed").length;

  const monthsWithData = monthsWithEvents.filter((m) => m.events.length > 0);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Compliance Timeline</h1>
            <p className="text-sm text-[#687068] mt-1">12-month forward view of all compliance events and inspections</p>
          </div>
          {demoMode && (
            <DemoHelperTip id="compliance-timeline" title="Compliance Timeline">
              Visualise every compliance deadline across your portfolio. Each dot represents a certificate expiry or inspection. Red = expired, amber = expiring soon, green = valid. Click any event for details.
            </DemoHelperTip>
          )}
          <Link href="/dashboard/compliance" className="text-sm text-[#C28A78] font-medium hover:underline flex items-center gap-1 whitespace-nowrap">
            <i className="ri-shield-check-line text-sm"></i>
            Compliance Management
            <i className="ri-arrow-right-line text-xs"></i>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Expired", value: expiredCount, color: "text-[#EF4444]", bg: "bg-[#EF4444]", icon: "ri-close-circle-line" },
            { label: "Expiring Soon", value: expiringCount, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]", icon: "ri-time-line" },
            { label: "Valid", value: validCount, color: "text-[#10B981]", bg: "bg-[#10B981]", icon: "ri-check-line" },
            { label: "Completed", value: completedCount, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]", icon: "ri-check-double-line" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 flex items-center justify-center ${s.bg} rounded-md`}>
                  <i className={`${s.icon} text-white text-xs`}></i>
                </div>
                <span className="text-xs text-[#687068]">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 p-1 bg-[#F8FAFC] rounded-lg overflow-x-auto">
            {timelineCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.key ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {cat.key !== "all" && categoryColors[cat.key] && (
                    <span className={`w-2 h-2 rounded-full ${categoryColors[cat.key].dot}`}></span>
                  )}
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] pr-8 appearance-none cursor-pointer"
            >
              {timelinePropertyFilter.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1280px]">
              <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-40 flex-shrink-0 px-4 py-3 border-r border-[#E2E8F0]">
                  <span className="text-xs font-medium text-[#687068]">Property</span>
                </div>
                {monthLabels.map((ml, i) => {
                  const isCurrent = i === 0;
                  return (
                    <div
                      key={ml}
                      className={`flex-1 px-2 py-3 text-center border-r border-[#E2E8F0] ${isCurrent ? "bg-[#C28A78]/5" : ""}`}
                    >
                      <p className={`text-xs font-medium ${isCurrent ? "text-[#C28A78]" : "text-[#687068]"}`}>{ml}</p>
                      {isCurrent && (
                        <span className="text-[10px] text-[#C28A78] bg-[#C28A78]/10 px-1.5 py-0.5 rounded-full font-medium">Now</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {["Rose Court Flat 2A", "Riverside Court", "Maple Gardens House"].filter(
                (p) => propertyFilter === "All Properties" || p === propertyFilter
              ).map((propName) => {
                const propEvents = filteredEvents.filter((e) => e.propertyName === propName);
                if (propEvents.length === 0 && propertyFilter !== "All Properties" && propertyFilter !== propName) return null;
                return (
                  <div key={propName} className="flex border-b border-[#E2E8F0]">
                    <div className="w-40 flex-shrink-0 px-4 py-3 border-r border-[#E2E8F0] flex items-center">
                      <p className="text-xs font-medium text-[#3A3F3A] truncate">{propName}</p>
                    </div>
                    {monthLabels.map((ml, mi) => {
                      const eventsInCell = propEvents.filter((e) => getMonthIndex(e.date) === mi);
                      return (
                        <div key={ml} className="flex-1 px-1 py-2 border-r border-[#E2E8F0] min-h-[48px] flex items-center justify-center flex-wrap gap-1">
                          {eventsInCell.map((ev) => {
                            const catColor = categoryColors[ev.category] || categoryColors.inspections;
                            return (
                              <button
                                key={ev.id}
                                onClick={() => setSelectedEvent(ev)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative group ${
                                  ev.status === "expired" ? "bg-[#EF4444]" :
                                  ev.status === "expiring" ? "bg-[#F59E0B]" :
                                  ev.status === "completed" ? "bg-[#3B82F6]" :
                                  catColor.dot
                                }`}
                                title={`${ev.type} - ${ev.date}`}
                              >
                                <i className={`${ev.icon} text-white text-[10px]`}></i>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {filteredEvents.filter((e) => !["Rose Court Flat 2A", "Riverside Court", "Maple Gardens House"].includes(e.propertyName)).length === 0 &&
               propertyFilter !== "All Properties" &&
               !["Rose Court Flat 2A", "Riverside Court", "Maple Gardens House"].includes(propertyFilter) && (
                <div className="text-center py-8 text-sm text-[#94A3B8]">
                  No events found for this property
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {(["gas", "epc", "eicr", "smoke", "co", "inspections"] as const).map((cat) => {
            const catEvents = filteredEvents.filter((e) => e.category === cat && (e.status === "expired" || e.status === "expiring"));
            const catColor = categoryColors[cat];
            return (
              <div key={cat} className={`${catColor.bg} rounded-xl border border-[#E2E8F0] p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${catColor.dot}`}></span>
                  <span className={`text-xs font-medium ${catColor.text}`}>
                    {cat === "gas" ? "Gas Safety" : cat === "epc" ? "EPC" : cat === "eicr" ? "EICR" : cat === "smoke" ? "Smoke Alarms" : cat === "co" ? "CO Alarms" : "Inspections"}
                  </span>
                </div>
                <p className={`text-lg font-bold ${catColor.text}`}>
                  {catEvents.length} {catEvents.length === 1 ? "alert" : "alerts"}
                </p>
              </div>
            );
          })}
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className={`p-5 rounded-t-2xl ${selectedEvent.status === "expired" ? "bg-[#FEF2F2]" : selectedEvent.status === "expiring" ? "bg-[#FFFBEB]" : "bg-[#F0FDF4]"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedEvent.color}`}>
                    <i className={`${selectedEvent.icon} text-white text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">{selectedEvent.type}</h3>
                    <p className="text-xs text-[#687068]">{selectedEvent.propertyName}</p>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5">
                    <i className="ri-close-line text-[#687068]"></i>
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Date</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedEvent.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Status</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[selectedEvent.status]}`}>
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Days Until</span>
                  <span className={`text-sm font-medium ${
                    selectedEvent.daysFromNow < 0 ? "text-[#EF4444]" :
                    selectedEvent.daysFromNow <= 30 ? "text-[#F59E0B]" :
                    "text-[#10B981]"
                  }`}>
                    {selectedEvent.daysFromNow < 0 ? `${Math.abs(selectedEvent.daysFromNow)} days overdue` :
                     selectedEvent.daysFromNow === 0 ? "Today" :
                     `${selectedEvent.daysFromNow} days`}
                  </span>
                </div>
                <Link
                  href="/dashboard/compliance"
                  className="block w-full text-center text-xs font-medium text-[#C28A78] border border-[#C28A78] rounded-lg py-2.5 hover:bg-[#C28A78]/5 transition-colors mt-2"
                >
                  View in Compliance Manager
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}