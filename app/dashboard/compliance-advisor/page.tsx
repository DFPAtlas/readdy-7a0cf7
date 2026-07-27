"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { LEGAL_DISCLAIMER } from "@/lib/complianceStatus";

interface ComplianceItem {
  id: string;
  property_id: string;
  postcode: string;
  obligation: string;
  status: string;
  next_due: string;
  urgency: string;
  property_line1?: string;
  property_city?: string;
  landlord_name?: string;
  landlord_email?: string;
}

interface InspectionItem {
  id: string;
  property_id: string;
  postcode: string;
  title: string;
  inspection_type: string;
  status: string;
  scheduled_date: string;
  inspector_name: string;
  property_line1?: string;
  property_city?: string;
}

interface PropertyRisk {
  property_id: string;
  line1: string;
  postcode: string;
  city: string;
  landlord_name: string;
  landlord_email: string;
  overdue_count: number;
  due_soon_count: number;
  compliant_count: number;
  epc_rating: string;
  risk_level: string;
  risk_score: number;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ComplianceAdvisorPage() {
  const [loading, setLoading] = useState(true);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [propertyRisks, setPropertyRisks] = useState<PropertyRisk[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [complianceRes, inspectionRes, propertyRes] = await Promise.all([
        supabase.from("v_compliance_dashboard").select("*").order("next_due", { ascending: true }),
        supabase.from("v_inspection_schedule").select("*").order("scheduled_date", { ascending: true }),
        supabase.from("properties").select("id, line1, postcode, city, epc_rating, landlord_id"),
      ]);

      const props = (propertyRes.data || []) as any[];
      const landlordIds = [...new Set(props.map((p: any) => p.landlord_id).filter(Boolean))];
      const landlordMap: Record<string, { display_name: string; email: string }> = {};

      if (landlordIds.length > 0) {
        const { data: landlords } = await supabase
          .from("landlords")
          .select("id, display_name, email")
          .in("id", landlordIds);
        (landlords || []).forEach((l: any) => {
          landlordMap[l.id] = { display_name: l.display_name || "Unknown", email: l.email || "" };
        });
      }

      const propMap: Record<string, any> = {};
      props.forEach((p: any) => {
        const landlord = landlordMap[p.landlord_id];
        propMap[p.id] = {
          line1: p.line1,
          city: p.city,
          epc_rating: p.epc_rating,
          landlord_name: landlord?.display_name || "Unknown",
          landlord_email: landlord?.email || "",
        };
      });

      const comps: ComplianceItem[] = (complianceRes.data || []).map((c: any) => ({
        ...c,
        property_line1: propMap[c.property_id]?.line1,
        property_city: propMap[c.property_id]?.city,
        landlord_name: propMap[c.property_id]?.landlord_name,
        landlord_email: propMap[c.property_id]?.landlord_email,
      }));

      const insps: InspectionItem[] = (inspectionRes.data || []).map((i: any) => ({
        ...i,
        property_line1: propMap[i.property_id]?.line1,
        property_city: propMap[i.property_id]?.city,
      }));

      const riskMap: Record<string, PropertyRisk> = {};
      comps.forEach((c) => {
        if (!riskMap[c.property_id]) {
          riskMap[c.property_id] = {
            property_id: c.property_id,
            line1: c.property_line1 || "Unknown",
            postcode: c.postcode,
            city: c.property_city || "",
            landlord_name: c.landlord_name || "Unknown",
            landlord_email: c.landlord_email || "",
            overdue_count: 0,
            due_soon_count: 0,
            compliant_count: 0,
            epc_rating: propMap[c.property_id]?.epc_rating || "?",
            risk_level: "low",
            risk_score: 0,
          };
        }
        if (c.status === "overdue") riskMap[c.property_id].overdue_count++;
        else if (c.status === "due_soon") riskMap[c.property_id].due_soon_count++;
        else riskMap[c.property_id].compliant_count++;
      });

      Object.values(riskMap).forEach((r) => {
        r.risk_score = r.overdue_count * 40 + r.due_soon_count * 20 + (r.epc_rating === "F" || r.epc_rating === "G" ? 25 : r.epc_rating === "D" || r.epc_rating === "E" ? 10 : 0);
        if (r.risk_score >= 60) r.risk_level = "critical";
        else if (r.risk_score >= 30) r.risk_level = "high";
        else if (r.risk_score >= 10) r.risk_level = "medium";
        else r.risk_level = "low";
      });

      const sortedRisks = Object.values(riskMap).sort((a, b) => b.risk_score - a.risk_score);

      setComplianceItems(comps);
      setInspections(insps);
      setPropertyRisks(sortedRisks);
      setLoading(false);
    };

    fetchData();
  }, []);

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const expiringThisMonth = complianceItems.filter((c) => {
    const due = new Date(c.next_due);
    return due <= thisMonthEnd && due >= now && c.status !== "overdue";
  });

  const overdueItems = complianceItems.filter((c) => c.status === "overdue");
  const dueSoonItems = complianceItems.filter((c) => c.status === "due_soon" && !expiringThisMonth.some((e) => e.id === c.id));

  const overdueInspections = inspections.filter((i) => {
    const sched = new Date(i.scheduled_date);
    return sched < now && i.status !== "completed" && i.status !== "cancelled";
  });

  const upcomingInspections = inspections.filter((i) => {
    const sched = new Date(i.scheduled_date);
    return sched >= now && i.status === "scheduled";
  });

  const landlordsNeedingUpdate = propertyRisks.filter((r) => r.risk_level === "critical" || r.risk_level === "high");

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#687068]">Loading compliance data...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">AI Compliance Advisor</h1>
          <p className="text-sm text-[#687068] mt-1">Turning compliance data into plain English advice you can act on</p>
        </div>

        {/* AI Safety Notice */}
        <div className="bg-[#FEF3C7]/30 border border-[#F59E0B]/20 rounded-xl p-3 flex items-start gap-3">
          <div className="w-6 h-6 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-information-line text-[#F59E0B] text-sm"></i>
          </div>
          <p className="text-xs text-[#92400E]">This advisor uses live portfolio data to highlight compliance risks. It does not constitute legal advice. Always verify critical compliance decisions with qualified professionals. AI suggestions are advisory only — final decisions require human review.</p>
        </div>

        {/* AI Advisor Summary */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#C28A78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-brain-line text-[#C28A78] text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#3A3F3A] mb-2">Advisor Summary</h2>
              <div className="space-y-2 text-sm text-[#3A3F3A] leading-relaxed">
                {overdueItems.length > 0 && (
                  <p>
                    <i className="ri-error-warning-line text-[#EF4444] mr-1.5"></i>
                    <span className="font-semibold text-[#EF4444]">{overdueItems.length} compliance obligation{overdueItems.length > 1 ? "s" : ""} {overdueItems.length > 1 ? "are" : "is"} overdue.</span>{" "}
                    {overdueItems.map((o, i) => (
                      <span key={o.id}>
                        {o.property_line1 || o.postcode} requires {o.obligation} renewal (was due {formatDate(o.next_due)}){i < overdueItems.length - 1 ? ". " : "."}
                      </span>
                    ))}
                  </p>
                )}
                {expiringThisMonth.length > 0 && (
                  <p>
                    <i className="ri-calendar-check-line text-[#F59E0B] mr-1.5"></i>
                    <span className="font-semibold text-[#F59E0B]">{expiringThisMonth.length} certificate{expiringThisMonth.length > 1 ? "s" : ""} expire{expiringThisMonth.length > 1 ? "" : "s"} this month.</span>{" "}
                    {expiringThisMonth.map((e, i) => (
                      <span key={e.id}>
                        {e.property_line1 || e.postcode} &mdash; {e.obligation} by {formatDate(e.next_due)}{i < expiringThisMonth.length - 1 ? ". " : "."}
                      </span>
                    ))}
                  </p>
                )}
                {dueSoonItems.length > 0 && (
                  <p>
                    <i className="ri-time-line text-[#3B82F6] mr-1.5"></i>
                    <span className="font-semibold text-[#3B82F6]">{dueSoonItems.length} item{dueSoonItems.length > 1 ? "s" : ""} {dueSoonItems.length > 1 ? "are" : "is"} coming due within 90 days.</span>{" "}
                    {dueSoonItems.slice(0, 3).map((d, i) => (
                      <span key={d.id}>
                        {d.property_line1 || d.postcode} &mdash; {d.obligation} ({formatDate(d.next_due)}){i < Math.min(dueSoonItems.length, 3) - 1 ? ". " : dueSoonItems.length > 3 ? ", and others." : "."}
                      </span>
                    ))}
                  </p>
                )}
                {landlordsNeedingUpdate.length > 0 && (
                  <p>
                    <i className="ri-user-star-line text-[#8B5CF6] mr-1.5"></i>
                    <span className="font-semibold text-[#8B5CF6]">{landlordsNeedingUpdate.length} landlord{landlordsNeedingUpdate.length > 1 ? "s" : ""} need{landlordsNeedingUpdate.length === 1 ? "s" : ""} an update.</span>{" "}
                    {landlordsNeedingUpdate.map((l, i) => (
                      <span key={l.property_id}>
                        {l.landlord_name} for {l.line1}, {l.city} ({l.overdue_count} overdue, risk level: {l.risk_level}){i < landlordsNeedingUpdate.length - 1 ? ". " : "."}
                      </span>
                    ))}
                  </p>
                )}
                {overdueInspections.length > 0 && (
                  <p>
                    <i className="ri-clipboard-line text-[#EF4444] mr-1.5"></i>
                    <span className="font-semibold text-[#EF4444]">{overdueInspections.length} inspection{overdueInspections.length > 1 ? "s" : ""} {overdueInspections.length > 1 ? "are" : "is"} overdue.</span>{" "}
                    {overdueInspections.map((ins, i) => (
                      <span key={ins.id}>
                        {ins.title} at {ins.property_line1 || ins.postcode} (scheduled {formatDate(ins.scheduled_date)}){i < overdueInspections.length - 1 ? ". " : "."}
                      </span>
                    ))}
                  </p>
                )}
                {overdueItems.length === 0 && expiringThisMonth.length === 0 && overdueInspections.length === 0 && (
                  <p>
                    <i className="ri-check-line text-[#10B981] mr-1.5"></i>
                    All compliance obligations are up to date. No urgent actions required. {dueSoonItems.length > 0 ? `${dueSoonItems.length} items are approaching — plan ahead.` : "Keep monitoring as usual."}
                  </p>
                )}
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-3 italic border-t border-[#E2E8F0] pt-3">{LEGAL_DISCLAIMER}</p>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-error-warning-line text-[#EF4444]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{overdueItems.length}</p>
            <p className="text-xs text-[#687068]">Overdue obligations</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-calendar-check-line text-[#F59E0B]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{expiringThisMonth.length}</p>
            <p className="text-xs text-[#687068]">Expiring this month</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-user-star-line text-[#8B5CF6]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{landlordsNeedingUpdate.length}</p>
            <p className="text-xs text-[#687068]">Landlords need update</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-clipboard-line text-[#3B82F6]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{overdueInspections.length}</p>
            <p className="text-xs text-[#687068]">Overdue inspections</p>
          </div>
        </div>

        {/* Two-column: Risk & Certificate Expiry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Risk Rankings */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="font-semibold text-[#3A3F3A] mb-4">Property Risk Rankings</h2>
            <div className="space-y-3">
              {propertyRisks.map((r) => {
                const riskColor =
                  r.risk_level === "critical" ? "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20"
                  : r.risk_level === "high" ? "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20"
                  : r.risk_level === "medium" ? "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20"
                  : "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20";
                return (
                  <div key={r.property_id} className={`rounded-xl border p-4 ${riskColor.includes("EF") ? "border-[#EF4444]/20" : riskColor.includes("F5") ? "border-[#F59E0B]/20" : riskColor.includes("3B") ? "border-[#3B82F6]/20" : "border-[#10B981]/20"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{r.line1}, {r.city}</p>
                        <p className="text-xs text-[#94A3B8]">{r.postcode} &middot; EPC {r.epc_rating} &middot; {r.landlord_name}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${riskColor}`}>
                        {r.risk_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                        <span className="text-[#687068]">{r.overdue_count} overdue</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                        <span className="text-[#687068]">{r.due_soon_count} due soon</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                        <span className="text-[#687068]">{r.compliant_count} compliant</span>
                      </span>
                      <span className="ml-auto font-medium text-[#3A3F3A]">Score: {r.risk_score}</span>
                    </div>
                  </div>
                );
              })}
              {propertyRisks.length === 0 && (
                <p className="text-sm text-[#94A3B8] text-center py-4">No property risk data available</p>
              )}
            </div>
          </div>

          {/* Certificates Expiring */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="font-semibold text-[#3A3F3A] mb-4">Certificate Timeline</h2>
            <div className="space-y-2">
              {complianceItems
                .filter((c) => c.status === "overdue" || c.status === "due_soon" || daysUntil(c.next_due) <= 60)
                .sort((a, b) => new Date(a.next_due).getTime() - new Date(b.next_due).getTime())
                .map((c) => {
                  const days = daysUntil(c.next_due);
                  const isOverdue = c.status === "overdue";
                  const isUrgent = days <= 30 && days >= 0;
                  return (
                    <div key={c.id} className={`flex items-center gap-3 p-3 rounded-lg ${isOverdue ? "bg-[#EF4444]/5 border border-[#EF4444]/15" : isUrgent ? "bg-[#F59E0B]/5 border border-[#F59E0B]/15" : "bg-[#F8FAFC]"}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue ? "bg-[#EF4444]/10" : isUrgent ? "bg-[#F59E0B]/10" : "bg-[#3B82F6]/10"}`}>
                        <i className={`${isOverdue ? "ri-error-warning-line text-[#EF4444]" : isUrgent ? "ri-time-line text-[#F59E0B]" : "ri-calendar-line text-[#3B82F6]"} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3F3A] truncate">{c.obligation}</p>
                        <p className="text-xs text-[#94A3B8] truncate">{c.property_line1 || c.postcode}, {c.property_city || ""}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-semibold ${isOverdue ? "text-[#EF4444]" : isUrgent ? "text-[#F59E0B]" : "text-[#3A3F3A]"}`}>
                          {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d`}
                        </p>
                        <p className="text-[10px] text-[#94A3B8]">{formatDate(c.next_due)}</p>
                      </div>
                    </div>
                  );
                })}
              {complianceItems.filter((c) => c.status === "overdue" || c.status === "due_soon" || daysUntil(c.next_due) <= 60).length === 0 && (
                <p className="text-sm text-[#94A3B8] text-center py-4">No certificates expiring soon</p>
              )}
            </div>
          </div>
        </div>

        {/* Inspections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="font-semibold text-[#3A3F3A] mb-4">Overdue Inspections</h2>
            {overdueInspections.length > 0 ? (
              <div className="space-y-2">
                {overdueInspections.map((ins) => (
                  <div key={ins.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/15">
                    <div className="w-7 h-7 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-clipboard-line text-[#EF4444] text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{ins.title}</p>
                      <p className="text-xs text-[#94A3B8]">{ins.property_line1 || ins.postcode} &middot; {ins.inspector_name || "Unassigned"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-[#EF4444]">{Math.abs(daysUntil(ins.scheduled_date))}d overdue</p>
                      <p className="text-[10px] text-[#94A3B8]">Scheduled {formatDate(ins.scheduled_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8] text-center py-4">No overdue inspections</p>
            )}
            {upcomingInspections.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <p className="text-xs text-[#94A3B8] mb-2 font-medium">Upcoming</p>
                {upcomingInspections.map((ins) => (
                  <div key={ins.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC]">
                    <div className="w-7 h-7 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-calendar-check-line text-[#10B981] text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{ins.title}</p>
                      <p className="text-xs text-[#94A3B8]">{ins.property_line1 || ins.postcode} &middot; {ins.inspector_name || "Unassigned"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-[#10B981]">{daysUntil(ins.scheduled_date)}d</p>
                      <p className="text-[10px] text-[#94A3B8]">{formatDate(ins.scheduled_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Landlord Update Needs */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="font-semibold text-[#3A3F3A] mb-4">Landlords Needing Updates</h2>
            {landlordsNeedingUpdate.length > 0 ? (
              <div className="space-y-3">
                {landlordsNeedingUpdate.map((l) => (
                  <div key={l.property_id} className="rounded-xl border border-[#E2E8F0] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#3A3F3A]">{l.landlord_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        l.risk_level === "critical" ? "text-[#EF4444] bg-[#EF4444]/10" : "text-[#F59E0B] bg-[#F59E0B]/10"
                      }`}>
                        {l.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-[#687068] mb-3">{l.line1}, {l.city} &middot; {l.postcode} &middot; EPC {l.epc_rating}</p>
                    <div className="bg-[#F8FAFC] rounded-lg p-3">
                      <p className="text-xs text-[#3A3F3A] leading-relaxed">
                        {l.landlord_name} needs to be informed that <span className="font-semibold">{l.line1}, {l.city}</span> has{" "}
                        <span className="text-[#EF4444] font-semibold">{l.overdue_count} overdue obligation{l.overdue_count > 1 ? "s" : ""}</span>
                        {l.due_soon_count > 0 ? <> and <span className="text-[#F59E0B] font-semibold">{l.due_soon_count} coming due soon</span></> : ""}.
                        {" "}Immediate action is required to avoid regulatory penalties.
                      </p>
                    </div>
                    {l.landlord_email && (
                      <p className="text-[10px] text-[#94A3B8] mt-2">Contact: {l.landlord_email}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8] text-center py-4">All landlords are up to date</p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}