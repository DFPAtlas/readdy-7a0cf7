"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  type PropertyHealthSnapshot,
  type LandlordContactNeed,
  type TenantRiskProfile,
  type BranchPerformance,
  calculateRiskLevel,
  calculateRiskColor,
} from "./PortfolioConsultantData";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function daysAgo(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PortfolioConsultantPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertyHealthSnapshot[]>([]);
  const [landlordNeeds, setLandlordNeeds] = useState<LandlordContactNeed[]>([]);
  const [tenantRisks, setTenantRisks] = useState<TenantRiskProfile[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [summaryText, setSummaryText] = useState("");
  const [activeTab, setActiveTab] = useState<"attention" | "profitable" | "landlords" | "tenants" | "branches">("attention");

  useEffect(() => {
    const fetchAll = async () => {
      const [propsRes, compRes, maintRes, arrearsRes, tenanciesRes, tenantsRes, kpiRes, inspRes] = await Promise.all([
        supabase.from("properties").select("id, line1, city, postcode, bedrooms, epc_rating, is_hmo, landlord_id"),
        supabase.from("v_compliance_dashboard").select("*"),
        supabase.from("maintenance_jobs").select("id, property_id, status"),
        supabase.from("arrears_cases").select("*"),
        supabase.from("tenancies").select("id, property_id, status, rent_amount, rent_period"),
        supabase.from("tenants").select("id, full_name, email"),
        supabase.from("v_dashboard_kpi").select("*").single(),
        supabase.from("inspections").select("id, property_id, title, status, scheduled_date"),
      ]);

      const propertiesData = (propsRes.data || []) as any[];
      const landlordIds = [...new Set(propertiesData.map((p: any) => p.landlord_id).filter(Boolean))];
      const landlordInfoMap = new Map<string, { display_name: string; email: string }>();

      if (landlordIds.length > 0) {
        const { data: landlords } = await supabase
          .from("landlords")
          .select("id, display_name, email")
          .in("id", landlordIds);
        (landlords || []).forEach((l: any) => {
          landlordInfoMap.set(l.id, { display_name: l.display_name || "Unknown", email: l.email || "" });
        });
      }

      const compData = (compRes.data || []) as any[];
      const maintData = (maintRes.data || []) as any[];
      const arrearsData = (arrearsRes.data || []) as any[];
      const tenanciesData = (tenanciesRes.data || []) as any[];
      const tenantsData = (tenantsRes.data || []) as any[];
      const kpiData = kpiRes.data;
      const inspData = (inspRes.data || []) as any[];

      const tenantMap: Record<string, any> = {};
      tenantsData.forEach((t: any) => { tenantMap[t.id] = t; });

      const tenancyByProperty: Record<string, any[]> = {};
      tenanciesData.forEach((t: any) => {
        if (!tenancyByProperty[t.property_id]) tenancyByProperty[t.property_id] = [];
        tenancyByProperty[t.property_id].push(t);
      });

      const maintenanceByProperty: Record<string, { open: number; inProgress: number }> = {};
      maintData.forEach((m: any) => {
        if (!maintenanceByProperty[m.property_id]) maintenanceByProperty[m.property_id] = { open: 0, inProgress: 0 };
        if (m.status === "in_progress") maintenanceByProperty[m.property_id].inProgress++;
        else maintenanceByProperty[m.property_id].open++;
      });

      const arrearsByProperty: Record<string, { owed: number; status: string }> = {};
      arrearsData.forEach((a: any) => {
        if (a.status === "active") {
          arrearsByProperty[a.property_id] = { owed: parseFloat(a.total_owed || "0"), status: a.status };
        }
      });

      const complianceByProperty: Record<string, { overdue: number; dueSoon: number; compliant: number }> = {};
      compData.forEach((c: any) => {
        if (!complianceByProperty[c.property_id]) complianceByProperty[c.property_id] = { overdue: 0, dueSoon: 0, compliant: 0 };
        if (c.status === "overdue") complianceByProperty[c.property_id].overdue++;
        else if (c.status === "due_soon") complianceByProperty[c.property_id].dueSoon++;
        else complianceByProperty[c.property_id].compliant++;
      });

      const inspByProperty: Record<string, boolean> = {};
      inspData.forEach((i: any) => {
        const sched = new Date(i.scheduled_date);
        const now = new Date();
        if (sched < now && i.status !== "completed" && i.status !== "cancelled") {
          inspByProperty[i.property_id] = true;
        }
      });

      const now = new Date();
      const snapshots: PropertyHealthSnapshot[] = propertiesData.map((p: any) => {
        const comp = complianceByProperty[p.id] || { overdue: 0, dueSoon: 0, compliant: 0 };
        const mtn = maintenanceByProperty[p.id] || { open: 0, inProgress: 0 };
        const arr = arrearsByProperty[p.id] || { owed: 0, status: "none" };
        const tenancies = tenancyByProperty[p.id] || [];

        const activeTenancy = tenancies.find((t: any) => t.status === "active") || tenancies[0];
        let tenantName = "Vacant";
        let tenantEmail = "";
        if (activeTenancy) {
          const tpEntry = tenantsData.find((tn: any) => {
            const tnsForProp = tenancyByProperty[p.id] || [];
            return tnsForProp.some((tt: any) => tt.id === activeTenancy?.id);
          });
          tenantName = tpEntry?.full_name || "Unknown";
          tenantEmail = tpEntry?.email || "";
        }

        const rentAmount = activeTenancy ? parseFloat(activeTenancy.rent_amount || "0") : 0;
        const annualRent = rentAmount * 12;
        const totalPaid = rentAmount * 6;
        const rentCollectionRate = arr.owed > 0 ? Math.round((totalPaid / (totalPaid + arr.owed)) * 100) : 100;

        const riskScore =
          comp.overdue * 40 +
          comp.dueSoon * 20 +
          (mtn.open + mtn.inProgress) * 8 +
          (arr.owed > 0 ? 30 : 0) +
          (inspByProperty[p.id] ? 15 : 0) +
          (p.epc_rating === "F" || p.epc_rating === "G" ? 25 : p.epc_rating === "D" || p.epc_rating === "E" ? 10 : 0);

        return {
          propertyId: p.id,
          line1: p.line1 || "",
          city: p.city || "",
          postcode: p.postcode || "",
          bedrooms: p.bedrooms || 0,
          epcRating: p.epc_rating || "?",
          isHmo: p.is_hmo,
          landlordName: landlordInfoMap.get(p.landlord_id)?.display_name || "Unknown",
          landlordEmail: landlordInfoMap.get(p.landlord_id)?.email || "",
          tenantName,
          tenantEmail,
          rentAmount,
          rentPeriod: activeTenancy?.rent_period || "monthly",
          tenancyStatus: activeTenancy?.status || "vacant",
          complianceOverdue: comp.overdue,
          complianceDueSoon: comp.dueSoon,
          complianceCompliant: comp.compliant,
          openMaintenance: mtn.open,
          inProgressMaintenance: mtn.inProgress,
          arrearsOwed: arr.owed,
          arrearsStatus: arr.status,
          overdueInspection: inspByProperty[p.id] || false,
          riskScore,
          riskLevel: calculateRiskLevel(riskScore),
          annualRent,
          rentCollectionRate,
        };
      });

      const landlordMap: Record<string, LandlordContactNeed> = {};
      snapshots.forEach((s) => {
        if (!landlordMap[s.landlordName]) {
          landlordMap[s.landlordName] = {
            landlordName: s.landlordName,
            landlordEmail: s.landlordEmail,
            propertyCount: 0,
            properties: [],
            urgentReason: "",
          };
        }
        landlordMap[s.landlordName].propertyCount++;
        if (s.riskLevel === "critical" || s.riskLevel === "high") {
          const reasons: string[] = [];
          if (s.complianceOverdue > 0) reasons.push(`${s.complianceOverdue} overdue compliance obligation${s.complianceOverdue > 1 ? "s" : ""}`);
          if (s.arrearsOwed > 0) reasons.push(`£${s.arrearsOwed.toLocaleString()} in arrears`);
          if (s.openMaintenance + s.inProgressMaintenance > 0) reasons.push(`${s.openMaintenance + s.inProgressMaintenance} open maintenance job${s.openMaintenance + s.inProgressMaintenance > 1 ? "s" : ""}`);
          if (s.overdueInspection) reasons.push("overdue inspection");
          landlordMap[s.landlordName].properties.push({
            line1: s.line1,
            city: s.city,
            postcode: s.postcode,
            reason: reasons.join(", "),
          });
          if (!landlordMap[s.landlordName].urgentReason) {
            landlordMap[s.landlordName].urgentReason = reasons[0] || "";
          }
        }
      });

      const landlordList = Object.values(landlordMap).filter((l) => l.properties.length > 0);

      const tenantRiskList: TenantRiskProfile[] = snapshots
        .filter((s) => s.tenantName !== "Vacant")
        .map((s) => {
          let riskLevel = "low";
          let reasons: string[] = [];
          if (s.arrearsOwed > 500) { riskLevel = "high"; reasons.push(`£${s.arrearsOwed.toLocaleString()} in arrears`); }
          else if (s.arrearsOwed > 0) { riskLevel = "medium"; reasons.push(`£${s.arrearsOwed} in arrears`); }
          if (s.openMaintenance + s.inProgressMaintenance >= 2) { riskLevel = "high"; reasons.push(`${s.openMaintenance + s.inProgressMaintenance} open repairs`); }
          else if (s.openMaintenance + s.inProgressMaintenance === 1) reasons.push("1 open repair");
          if (s.complianceOverdue > 0) { riskLevel = "high"; reasons.push("compliance overdue"); }
          return {
            tenantName: s.tenantName,
            tenantEmail: s.tenantEmail,
            propertyLine1: s.line1,
            propertyPostcode: s.postcode,
            arrearsOwed: s.arrearsOwed,
            arrearsStatus: s.arrearsStatus,
            openMaintenance: s.openMaintenance + s.inProgressMaintenance,
            complianceIssues: s.complianceOverdue,
            riskLevel,
            riskReason: reasons.length > 0 ? reasons.join(" + ") : "No issues detected",
          };
        })
        .sort((a, b) => {
          const order = { high: 3, medium: 2, low: 1 };
          return (order[b.riskLevel as keyof typeof order] || 0) - (order[a.riskLevel as keyof typeof order] || 0);
        });

      const totalRent = snapshots.reduce((sum, s) => sum + s.annualRent, 0);
      const totalArrears = snapshots.reduce((sum, s) => sum + s.arrearsOwed, 0);
      const totalOpenMaint = snapshots.reduce((sum, s) => sum + s.openMaintenance + s.inProgressMaintenance, 0);
      const compliantProps = snapshots.filter((s) => s.complianceOverdue === 0).length;
      const inspectionsDone = inspData.filter((i: any) => i.status === "completed").length;
      const totalInspections = inspData.length;

      const branches: BranchPerformance[] = [{
        name: "LetHub Demo Agency",
        propertyCount: snapshots.length,
        tenancyCount: snapshots.filter((s) => s.tenancyStatus === "active").length,
        occupancyRate: snapshots.length > 0 ? Math.round((snapshots.filter((s) => s.tenancyStatus === "active").length / snapshots.length) * 100) + "%" : "0%",
        totalRentRoll: totalRent,
        arrearsTotal: totalArrears,
        maintenanceOpen: totalOpenMaint,
        complianceScore: snapshots.length > 0 ? Math.round((compliantProps / snapshots.length) * 100) + "%" : "100%",
        inspectionCompletion: totalInspections > 0 ? Math.round((inspectionsDone / totalInspections) * 100) + "%" : "100%",
        performanceLevel: totalArrears / totalRent > 0.05 ? "needs_attention" : "good",
      }];

      const criticalCount = snapshots.filter((s) => s.riskLevel === "critical").length;
      const highCount = snapshots.filter((s) => s.riskLevel === "high").length;
      const totalOverdue = snapshots.reduce((sum, s) => sum + s.complianceOverdue, 0);

      let summary = "";
      if (criticalCount > 0) {
        summary += `${criticalCount} propert${criticalCount === 1 ? "y requires" : "ies require"} immediate attention. `;
      }
      if (highCount > 0) {
        summary += `${highCount} propert${highCount === 1 ? "y is" : "ies are"} at elevated risk. `;
      }
      if (totalOverdue > 0) {
        summary += `${totalOverdue} compliance obligation${totalOverdue > 1 ? "s are" : " is"} overdue across the portfolio. `;
      }
      if (totalArrears > 0) {
        summary += `Total arrears stand at £${totalArrears.toLocaleString()}. `;
      }
      if (totalOpenMaint > 0) {
        summary += `${totalOpenMaint} maintenance job${totalOpenMaint > 1 ? "s" : ""} ${totalOpenMaint > 1 ? "are" : "is"} open. `;
      }
      if (snapshots.some((s) => s.overdueInspection)) {
        summary += "Overdue inspections need scheduling. ";
      }
      if (!summary) {
        summary = "Portfolio is in good health. No urgent actions are required. Continue monitoring as usual.";
      }

      setProperties(snapshots.sort((a, b) => b.riskScore - a.riskScore));
      setLandlordNeeds(landlordList);
      setTenantRisks(tenantRiskList);
      setBranchPerformance(branches);
      setSummaryText(summary);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#687068]">Analysing portfolio...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const criticalCount = properties.filter((p) => p.riskLevel === "critical").length;
  const highCount = properties.filter((p) => p.riskLevel === "high").length;
  const totalArrears = properties.reduce((sum, p) => sum + p.arrearsOwed, 0);
  const totalOpenMaint = properties.reduce((sum, p) => sum + p.openMaintenance + p.inProgressMaintenance, 0);
  const totalOverdue = properties.reduce((sum, p) => sum + p.complianceOverdue, 0);
  const totalAnnualRent = properties.reduce((sum, p) => sum + p.annualRent, 0);
  const profitable = [...properties].sort((a, b) => b.annualRent - a.annualRent);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">AI Portfolio Consultant</h1>
          <p className="text-sm text-[#687068] mt-1">Analysing your entire portfolio across compliance, maintenance, rent, arrears, and inspections</p>
        </div>

        {/* AI Safety Notice */}
        <div className="bg-[#FEF3C7]/30 border border-[#F59E0B]/20 rounded-xl p-3 flex items-start gap-3">
          <div className="w-6 h-6 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-information-line text-[#F59E0B] text-sm"></i>
          </div>
          <p className="text-xs text-[#92400E]">This consultant analyses your live portfolio data to identify risks and opportunities. Recommendations are advisory only. Financial projections, savings estimates, and risk scores should be verified before making decisions. AI suggestions do not replace professional financial or legal advice.</p>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#C28A78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-building-4-line text-[#C28A78] text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#3A3F3A] mb-2">Executive Summary</h2>
              <p className="text-sm text-[#3A3F3A] leading-relaxed">{summaryText}</p>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-home-4-line text-[#C28A78]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{properties.length}</p>
            <p className="text-xs text-[#687068]">Properties</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-error-warning-line text-[#EF4444]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{criticalCount + highCount}</p>
            <p className="text-xs text-[#687068]">Need attention</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-money-pound-circle-line text-[#3B82F6]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">£{(totalAnnualRent / 1000).toFixed(0)}k</p>
            <p className="text-xs text-[#687068]">Annual rent roll</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-tools-line text-[#F59E0B]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{totalOpenMaint}</p>
            <p className="text-xs text-[#687068]">Open maintenance</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="w-8 h-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center mb-2">
              <i className="ri-alarm-warning-line text-[#8B5CF6]"></i>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">£{totalArrears.toLocaleString()}</p>
            <p className="text-xs text-[#687068]">Total arrears</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-xl p-1 w-fit">
          {[
            { key: "attention" as const, label: "Needs Attention", icon: "ri-error-warning-line" },
            { key: "profitable" as const, label: "Most Profitable", icon: "ri-money-pound-circle-line" },
            { key: "landlords" as const, label: "Landlord Contact", icon: "ri-user-star-line" },
            { key: "tenants" as const, label: "Tenant Risk", icon: "ri-user-3-line" },
            { key: "branches" as const, label: "Branch Performance", icon: "ri-building-2-line" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? "bg-white text-[#C28A78] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Needs Attention */}
        {activeTab === "attention" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3A3F3A]">Which properties need attention today?</h2>
            {properties.filter((p) => p.riskLevel === "critical" || p.riskLevel === "high").length === 0 ? (
              <div className="bg-white rounded-xl border border-[#10B981]/20 p-8 text-center">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-line text-[#10B981] text-xl"></i>
                </div>
                <p className="text-[#3A3F3A] font-medium">All properties are in good standing</p>
                <p className="text-sm text-[#687068] mt-1">No critical or high-risk properties detected</p>
              </div>
            ) : (
              properties.filter((p) => p.riskLevel === "critical" || p.riskLevel === "high").map((p) => (
                <div key={p.propertyId} className={`bg-white rounded-xl border p-5 ${p.riskLevel === "critical" ? "border-[#EF4444]/30" : "border-[#F59E0B]/30"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-[#3A3F3A]">{p.line1}, {p.city}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${calculateRiskColor(p.riskLevel)}`}>
                          {p.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8]">{p.postcode} &middot; {p.bedrooms} bed &middot; EPC {p.epcRating} &middot; {p.landlordName}</p>
                    </div>
                    <Link href={`/dashboard/portfolio/${p.propertyId}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                      <i className="ri-arrow-right-line text-[#94A3B8]"></i>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {p.complianceOverdue > 0 && (
                      <div className="bg-[#EF4444]/5 rounded-lg p-3">
                        <p className="text-xl font-bold text-[#EF4444]">{p.complianceOverdue}</p>
                        <p className="text-xs text-[#687068]">Overdue compliance</p>
                      </div>
                    )}
                    {p.arrearsOwed > 0 && (
                      <div className="bg-[#F59E0B]/5 rounded-lg p-3">
                        <p className="text-xl font-bold text-[#F59E0B]">£{p.arrearsOwed.toLocaleString()}</p>
                        <p className="text-xs text-[#687068]">In arrears</p>
                      </div>
                    )}
                    {p.openMaintenance + p.inProgressMaintenance > 0 && (
                      <div className="bg-[#3B82F6]/5 rounded-lg p-3">
                        <p className="text-xl font-bold text-[#3B82F6]">{p.openMaintenance + p.inProgressMaintenance}</p>
                        <p className="text-xs text-[#687068]">Open maintenance</p>
                      </div>
                    )}
                    {p.overdueInspection && (
                      <div className="bg-[#8B5CF6]/5 rounded-lg p-3">
                        <i className="ri-clipboard-line text-[#8B5CF6] text-xl"></i>
                        <p className="text-xs text-[#687068]">Inspection overdue</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-xs text-[#3A3F3A] leading-relaxed">
                      <span className="font-semibold">{p.line1}</span> requires attention because{" "}
                      {[
                        p.complianceOverdue > 0 ? `${p.complianceOverdue} compliance obligation${p.complianceOverdue > 1 ? "s are" : " is"} overdue` : "",
                        p.arrearsOwed > 0 ? `the tenant (${p.tenantName}) owes £${p.arrearsOwed.toLocaleString()} in arrears` : "",
                        p.openMaintenance + p.inProgressMaintenance > 0 ? `${p.openMaintenance + p.inProgressMaintenance} maintenance job${p.openMaintenance + p.inProgressMaintenance > 1 ? "s are" : " is"} open` : "",
                        p.overdueInspection ? "an inspection is overdue" : "",
                      ].filter(Boolean).join(", ")}.
                      {p.riskLevel === "critical" ? " Immediate action is recommended." : " Address these items to reduce portfolio risk."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Most Profitable */}
        {activeTab === "profitable" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3A3F3A]">Which properties are most profitable?</h2>
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#F8FAFC] text-xs font-semibold text-[#687068] border-b border-[#E2E8F0]">
                <span className="col-span-4">Property</span>
                <span className="col-span-2">Annual Rent</span>
                <span className="col-span-2">Collection Rate</span>
                <span className="col-span-2">Arrears</span>
                <span className="col-span-2">Status</span>
              </div>
              {profitable.map((p, idx) => (
                <div key={p.propertyId} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center text-sm ${idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"} border-b border-[#E2E8F0] last:border-b-0`}>
                  <div className="col-span-4">
                    <p className="font-medium text-[#3A3F3A]">{p.line1}</p>
                    <p className="text-xs text-[#94A3B8]">{p.city}, {p.postcode} &middot; {p.bedrooms} bed</p>
                  </div>
                  <div className="col-span-2 font-semibold text-[#3A3F3A]">£{p.annualRent.toLocaleString()}</div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.rentCollectionRate >= 95 ? "bg-[#10B981]" : p.rentCollectionRate >= 80 ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`} style={{ width: `${p.rentCollectionRate}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-[#687068]">{p.rentCollectionRate}%</span>
                    </div>
                  </div>
                  <div className={`col-span-2 font-medium ${p.arrearsOwed > 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                    {p.arrearsOwed > 0 ? `£${p.arrearsOwed.toLocaleString()}` : "None"}
                  </div>
                  <div className="col-span-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.tenancyStatus === "active" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}>
                      {p.tenancyStatus === "active" ? "Occupied" : p.tenancyStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Landlord Contact */}
        {activeTab === "landlords" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3A3F3A]">Which landlords require contact?</h2>
            {landlordNeeds.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#10B981]/20 p-8 text-center">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-line text-[#10B981] text-xl"></i>
                </div>
                <p className="text-[#3A3F3A] font-medium">All landlords are up to date</p>
                <p className="text-sm text-[#687068] mt-1">No urgent landlord contact is required at this time</p>
              </div>
            ) : (
              landlordNeeds.map((l) => (
                <div key={l.landlordName} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-base font-semibold text-[#3A3F3A]">{l.landlordName}</p>
                      <p className="text-xs text-[#94A3B8]">{l.propertyCount} propert{l.propertyCount > 1 ? "ies" : "y"} &middot; {l.landlordEmail}</p>
                    </div>
                    <Link href="/dashboard/landlords" className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap">
                      View all <i className="ri-arrow-right-line text-xs"></i>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {l.properties.map((prop) => (
                      <div key={prop.postcode} className="bg-[#F8FAFC] rounded-lg p-3 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{prop.line1}, {prop.city}</p>
                          <p className="text-xs text-[#687068]">{prop.postcode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#3A3F3A]">{prop.reason}</p>
                          <button className="mt-1 text-xs text-[#C28A78] font-medium hover:underline">
                            <i className="ri-mail-send-line text-xs mr-0.5"></i>Send update
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Tenant Risk */}
        {activeTab === "tenants" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3A3F3A]">Which tenants present highest risk?</h2>
            {tenantRisks.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#10B981]/20 p-8 text-center">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-line text-[#10B981] text-xl"></i>
                </div>
                <p className="text-[#3A3F3A] font-medium">All tenants are in good standing</p>
                <p className="text-sm text-[#687068] mt-1">No risk factors detected across tenancies</p>
              </div>
            ) : (
              tenantRisks.map((t, idx) => (
                <div key={idx} className={`bg-white rounded-xl border p-5 ${t.riskLevel === "high" ? "border-[#EF4444]/30" : t.riskLevel === "medium" ? "border-[#F59E0B]/30" : "border-[#10B981]/30"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        t.riskLevel === "high" ? "bg-[#EF4444]" : t.riskLevel === "medium" ? "bg-[#F59E0B]" : "bg-[#10B981]"
                      }`}>
                        {t.tenantName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{t.tenantName}</p>
                        <p className="text-xs text-[#94A3B8]}">{t.propertyLine1}, {t.propertyPostcode}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      t.riskLevel === "high" ? "bg-[#EF4444]/10 text-[#EF4444]" : t.riskLevel === "medium" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#10B981]/10 text-[#10B981]"
                    }`}>
                      {t.riskLevel} risk
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs mb-3">
                    {t.arrearsOwed > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="ri-alarm-warning-line text-[#EF4444]"></i>
                        <span className="text-[#EF4444] font-medium">£{t.arrearsOwed.toLocaleString()} arrears</span>
                      </span>
                    )}
                    {t.openMaintenance > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="ri-tools-line text-[#3B82F6]"></i>
                        <span className="text-[#3B82F6] font-medium">{t.openMaintenance} open repair{t.openMaintenance > 1 ? "s" : ""}</span>
                      </span>
                    )}
                    {t.complianceIssues > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="ri-shield-check-line text-[#8B5CF6]"></i>
                        <span className="text-[#8B5CF6] font-medium">Compliance overdue</span>
                      </span>
                    )}
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-xs text-[#3A3F3A]">{t.riskReason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Branch Performance */}
        {activeTab === "branches" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3A3F3A]">Which branches perform best?</h2>
            {branchPerformance.map((b) => (
              <div key={b.name} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center">
                      <i className="ri-building-2-line text-[#C28A78] text-lg"></i>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#3A3F3A]">{b.name}</p>
                      <p className="text-xs text-[#94A3B8]">{b.propertyCount} properties &middot; {b.tenancyCount} active tenancies &middot; {b.occupancyRate} occupied</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    b.performanceLevel === "good" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}>
                    {b.performanceLevel === "good" ? "Performing well" : "Needs attention"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-[#C28A78]">£{(b.totalRentRoll / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-[#687068]">Annual rent roll</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                    <p className={`text-xl font-bold ${b.arrearsTotal > 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                      £{b.arrearsTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#687068]">Total arrears</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                    <p className={`text-xl font-bold ${b.maintenanceOpen > 0 ? "text-[#3B82F6]" : "text-[#10B981]"}`}>{b.maintenanceOpen}</p>
                    <p className="text-xs text-[#687068]">Open maintenance</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-[#10B981]">{b.complianceScore}</p>
                    <p className="text-xs text-[#687068]">Compliance score</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-[#3B82F6]">{b.inspectionCompletion}</p>
                    <p className="text-xs text-[#687068]">Inspections done</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Recommendations */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="font-semibold text-[#3A3F3A] mb-4">Recommended Actions</h2>
          <div className="space-y-2">
            {properties
              .filter((p) => p.complianceOverdue > 0)
              .map((p) => (
                <Link key={`comp-${p.propertyId}`} href="/dashboard/compliance" className="flex items-center gap-3 p-3 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/15 hover:bg-[#EF4444]/10 transition-colors">
                  <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-shield-check-line text-[#EF4444] text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3F3A]">Resolve {p.complianceOverdue} compliance issue{p.complianceOverdue > 1 ? "s" : ""} at {p.line1}</p>
                    <p className="text-xs text-[#687068]">Overdue certificates need renewing — {p.postcode}</p>
                  </div>
                  <i className="ri-arrow-right-line text-[#94A3B8] text-sm"></i>
                </Link>
              ))}
            {properties
              .filter((p) => p.openMaintenance + p.inProgressMaintenance > 0)
              .map((p) => (
                <Link key={`maint-${p.propertyId}`} href="/dashboard/maintenance" className="flex items-center gap-3 p-3 rounded-lg bg-[#3B82F6]/5 border border-[#3B82F6]/15 hover:bg-[#3B82F6]/10 transition-colors">
                  <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-tools-line text-[#3B82F6] text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3F3A]">Address {p.openMaintenance + p.inProgressMaintenance} open repair{p.openMaintenance + p.inProgressMaintenance > 1 ? "s" : ""} at {p.line1}</p>
                    <p className="text-xs text-[#687068]">Maintenance requires action — {p.postcode}</p>
                  </div>
                  <i className="ri-arrow-right-line text-[#94A3B8] text-sm"></i>
                </Link>
              ))}
            {properties
              .filter((p) => p.arrearsOwed > 0)
              .map((p) => (
                <Link key={`arr-${p.propertyId}`} href="/dashboard/arrears" className="flex items-center gap-3 p-3 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/15 hover:bg-[#F59E0B]/10 transition-colors">
                  <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-alarm-warning-line text-[#F59E0B] text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3F3A]">Chase £{p.arrearsOwed.toLocaleString()} arrears from {p.tenantName}</p>
                    <p className="text-xs text-[#687068]}">{p.line1}, {p.postcode}</p>
                  </div>
                  <i className="ri-arrow-right-line text-[#94A3B8] text-sm"></i>
                </Link>
              ))}
            {properties.filter((p) => p.complianceOverdue === 0 && p.openMaintenance + p.inProgressMaintenance === 0 && p.arrearsOwed === 0).length === properties.length && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#10B981]/5 border border-[#10B981]/15">
                <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-[#10B981] text-sm"></i>
                </div>
                <p className="text-sm text-[#3A3F3A]">No actions required — portfolio is in great shape.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}