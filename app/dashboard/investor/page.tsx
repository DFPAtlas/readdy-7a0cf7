"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount } from "@/lib/demoMode";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from "recharts";
import {
  investorKPIs,
  portfolioSegments,
  propertyBreakdownData,
  monthlyReports,
  quarterlyReports,
  annualReports,
  riskIndicators,
  healthDistribution,
} from "./InvestorData";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];
const HEALTH_COLORS: Record<string, string> = {
  excellent: "#10B981",
  good: "#3B82F6",
  attention_needed: "#F59E0B",
  high_risk: "#EF4444",
};
const HEALTH_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  attention_needed: "Needs Attention",
  high_risk: "High Risk",
};

export default function InvestorDashboardPage() {
  const [demoMode, setDemoMode] = useState(false);
  const [reportTab, setReportTab] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [selectedSegment, setSelectedSegment] = useState<number>(1);

  useEffect(() => {
    if (isDemoAccount()) setDemoMode(true);
  }, []);

  const k = investorKPIs;
  const activeSegment = portfolioSegments[selectedSegment];
  const reports = reportTab === "monthly" ? monthlyReports : reportTab === "quarterly" ? quarterlyReports : annualReports;

  const healthPie = Object.entries(healthDistribution).map(([key, value]) => ({
    name: HEALTH_LABELS[key] || key,
    value,
    color: HEALTH_COLORS[key] || "#94A3B8",
  }));

  const portfolioValueData = propertyBreakdownData.map((p) => ({
    name: p.city,
    value: p.currentValue,
    equity: p.equityValue,
    mortgage: p.mortgageAmount,
  }));

  const yieldData = propertyBreakdownData.map((p) => ({
    name: p.city,
    yield: p.yieldPercent,
    rent: p.monthlyRent,
  }));

  const reportsChartData = reports.map((r) => ({
    period: r.period,
    rentCollected: r.rentCollected,
    rentDue: r.rentDue,
    maintenanceSpend: r.maintenanceSpend,
    collectionRate: r.collectionRate,
  }));

  const healthRadial = [
    { name: "Compliance", value: k.complianceHealth, fill: "#10B981" },
    { name: "Maintenance", value: 72, fill: "#3B82F6" },
    { name: "Rent", value: 75, fill: "#8B5CF6" },
    { name: "Inspection", value: 80, fill: "#F59E0B" },
    { name: "Risk", value: 100 - k.riskExposure, fill: "#EF4444" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Investor Dashboard</h1>
            <p className="text-sm text-[#687068] mt-1">Portfolio performance, yield analytics, and risk exposure for landlords with 10+ properties</p>
          </div>
          {demoMode && (
            <DemoHelperTip id="investor-dashboard" title="Investor Dashboard">
              Built for landlords with growing portfolios. Track portfolio value, rental yield, compliance health, and risk exposure all in one place. Toggle between monthly, quarterly, and annual reports.
            </DemoHelperTip>
          )}
          <Link href="/dashboard/portfolio" className="flex items-center gap-2 text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap">
            <i className="ri-building-4-line"></i>
            View Full Portfolio
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Portfolio Value", value: `£${(k.portfolioValue / 1000).toFixed(0)}k`, sub: `${k.totalProperties} properties`, icon: "ri-building-4-line", color: "bg-[#C28A78]", trend: "+£35k YTD", trendUp: true },
            { label: "Monthly Rent Roll", value: `£${k.monthlyRentIncome.toLocaleString()}`, sub: `${k.occupiedProperties}/${k.totalProperties} occupied`, icon: "ri-coins-line", color: "bg-[#3B82F6]", trend: "+£450 MoM", trendUp: true },
            { label: "Portfolio Yield", value: `${k.annualYield}%`, sub: `Est. £${(k.portfolioValue * k.annualYield / 100).toLocaleString()}/yr`, icon: "ri-line-chart-line", color: "bg-[#10B981]", trend: "+0.3%", trendUp: true },
            { label: "Property Health", value: `${k.propertyHealthScore}/100`, sub: `${healthDistribution.excellent} excellent, ${healthDistribution.high_risk} at risk`, icon: "ri-heart-pulse-line", color: k.propertyHealthScore >= 70 ? "bg-[#10B981]" : "bg-[#F59E0B]", trend: "+2 pts", trendUp: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <i className={`${stat.icon} text-white text-lg`}></i>
                </div>
                <div>
                  <p className="text-xs text-[#687068]">{stat.label}</p>
                  <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">{stat.sub}</span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.trendUp ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  <i className={`${stat.trendUp ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-xs`}></i>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Compliance", value: `${k.complianceHealth}%`, icon: "ri-shield-check-line", color: k.complianceHealth >= 70 ? "bg-[#10B981]" : "bg-[#F59E0B]" },
            { label: "Maintenance", value: `£${k.maintenanceSpend.toLocaleString()}`, sub: "this month", icon: "ri-tools-line", color: "bg-[#3B82F6]" },
            { label: "Risk Exposure", value: `${k.riskExposure}%`, icon: "ri-shield-flash-line", color: k.riskExposure <= 30 ? "bg-[#10B981]" : k.riskExposure <= 50 ? "bg-[#F59E0B]" : "bg-[#EF4444]" },
            { label: "Arrears", value: `£${k.arrearsTotal.toLocaleString()}`, sub: "active", icon: "ri-alarm-warning-line", color: k.arrearsTotal > 0 ? "bg-[#EF4444]" : "bg-[#10B981]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 ${stat.color} rounded-md flex items-center justify-center`}>
                  <i className={`${stat.icon} text-white text-xs`}></i>
                </div>
                <span className="text-xs text-[#687068]">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-[#3A3F3A]">{stat.value}</p>
              {stat.sub && <p className="text-xs text-[#94A3B8]">{stat.sub}</p>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-semibold text-[#3A3F3A]">Portfolio Segments</h2>
            <span className="text-xs text-[#94A3B8]">Currently in: Growing (10-24 properties)</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-5 gap-3 mb-5">
              {portfolioSegments.map((seg, i) => {
                const isActive = i === selectedSegment;
                const isReached = seg.propertyCount > 0;
                return (
                  <button
                    key={seg.label}
                    onClick={() => setSelectedSegment(i)}
                    className={`rounded-xl p-4 text-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#C28A78] text-white shadow-lg scale-105"
                        : isReached
                        ? "bg-white border-2 border-[#10B981] hover:border-[#10B981]"
                        : "bg-[#F1F5F9] border border-[#E2E8F0] opacity-60"
                    }`}
                  >
                    <div className={`text-2xl font-bold mb-1 ${isActive ? "text-white" : isReached ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                      {isReached ? seg.propertyCount : "—"}
                    </div>
                    <p className={`text-xs font-medium ${isActive ? "text-white/80" : "text-[#687068]"}`}>{seg.label}</p>
                    <p className={`text-[10px] mt-0.5 ${isActive ? "text-white/60" : "text-[#94A3B8]"}`}>{seg.range}</p>
                    {!isReached && (
                      <div className="mt-2">
                        <span className="text-[10px] text-[#94A3B8] bg-white/50 px-2 py-0.5 rounded-full">Not yet</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {activeSegment.propertyCount > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#687068] mb-1">Properties</p>
                  <p className="text-2xl font-bold text-[#3A3F3A]">{activeSegment.propertyCount}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#687068] mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-[#3A3F3A]">£{(activeSegment.totalValue / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#687068] mb-1">Avg Yield</p>
                  <p className="text-2xl font-bold text-[#3A3F3A]">{activeSegment.avgYield}%</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#687068] mb-1">Avg Health</p>
                  <p className="text-2xl font-bold text-[#10B981]">{activeSegment.avgHealth}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Portfolio Value Breakdown</h2>
              <span className="text-xs text-[#94A3B8]">Equity vs Mortgage</span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portfolioValueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: "#687068", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                  <YAxis tick={{ fill: "#687068", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
                    formatter={(value: any) => [`£${value.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="equity" stackId="a" fill="#10B981" name="Equity" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="mortgage" stackId="a" fill="#94A3B8" name="Mortgage" radius={[6, 6, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Health Distribution</h2>
              <span className="text-xs text-[#94A3B8]">by property count</span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={healthPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                    {healthPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
                    formatter={(value: any, name: any) => [`${value} properties`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value: any) => <span className="text-[#475569]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Financial Reports</h2>
              <div className="flex rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1">
                {(["monthly", "quarterly", "annual"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setReportTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      reportTab === tab ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={reportsChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="maintGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="period" tick={{ fill: "#687068", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "#687068", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#687068", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[80, 105]} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area yAxisId="left" type="monotone" dataKey="rentCollected" stroke="#3B82F6" fill="url(#rentGradient)" name="Rent Collected" strokeWidth={2} />
                  <Area yAxisId="left" type="monotone" dataKey="maintenanceSpend" stroke="#F59E0B" fill="url(#maintGradient)" name="Maintenance Spend" strokeWidth={2} />
                  <Area yAxisId="right" type="monotone" dataKey="collectionRate" stroke="#10B981" fill="none" name="Collection Rate %" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {reports.slice(-3).reverse().map((r) => (
                  <div key={r.period} className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="text-xs text-[#687068] mb-1">{r.period}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Collected</span>
                        <span className="text-[#3A3F3A] font-medium">£{r.rentCollected.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Rate</span>
                        <span className={`font-medium ${r.collectionRate >= 97 ? "text-[#10B981]" : r.collectionRate >= 94 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>{r.collectionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Health</span>
                        <span className="text-[#3A3F3A] font-medium">{r.healthScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Risk Indicators</h2>
            </div>
            <div className="p-5 space-y-3">
              {riskIndicators.map((risk) => (
                <div key={risk.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${risk.color}15` }}>
                    <i className={`${risk.icon} text-sm`} style={{ color: risk.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#475569]">{risk.label}</span>
                      <span className="text-xs font-bold" style={{ color: risk.color }}>
                        {risk.value}/{risk.total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(risk.value / risk.total) * 100}%`,
                          backgroundColor: risk.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Dimension Scores</h3>
                {healthRadial.map((dim) => (
                  <div key={dim.name} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#687068] w-20">{dim.name}</span>
                    <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${dim.value}%`, backgroundColor: dim.fill }}></div>
                    </div>
                    <span className="text-xs font-bold w-8 text-right" style={{ color: dim.fill }}>{dim.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-semibold text-[#3A3F3A]">Property Performance</h2>
            <span className="text-xs text-[#94A3B8]">{propertyBreakdownData.length} properties</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Value</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Monthly Rent</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Yield</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Equity</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Health</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {propertyBreakdownData.map((p) => {
                  const healthColor =
                    p.healthLevel === "excellent" ? "#10B981" :
                    p.healthLevel === "good" ? "#3B82F6" :
                    p.healthLevel === "attention_needed" ? "#F59E0B" : "#EF4444";
                  const healthLabel =
                    p.healthLevel === "excellent" ? "Excellent" :
                    p.healthLevel === "good" ? "Good" :
                    p.healthLevel === "attention_needed" ? "Needs Attention" : "High Risk";
                  return (
                    <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/property/${p.id}`} className="group">
                          <p className="font-medium text-[#3A3F3A] group-hover:text-[#C28A78] transition-colors">{p.address}</p>
                          <p className="text-xs text-[#94A3B8]">{p.city}, {p.postcode} · {p.bedrooms} bed</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-[#3A3F3A]">£{p.currentValue.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-[#3A3F3A]">£{p.monthlyRent.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`font-medium ${p.yieldPercent >= 6 ? "text-[#10B981]" : p.yieldPercent >= 5 ? "text-[#3A3F3A]" : "text-[#F59E0B]"}`}>
                          {p.yieldPercent}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[#3A3F3A]">
                        <div className="flex items-center justify-end gap-2">
                          <span>£{p.equityValue.toLocaleString()}</span>
                          <span className="text-xs text-[#94A3B8]">({Math.round((p.equityValue / p.currentValue) * 100)}%)</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: healthColor }}>
                            {p.healthScore}
                          </div>
                          <span className="text-xs text-[#687068]">{healthLabel}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === "Occupied" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Risk Centre", href: "/dashboard/risk-centre", icon: "ri-shield-flash-line", color: "bg-[#EF4444]" },
            { label: "Financial Hub", href: "/dashboard/financial-hub", icon: "ri-funds-box-line", color: "bg-[#C28A78]" },
            { label: "Portfolio Consultant", href: "/dashboard/portfolio-consultant", icon: "ri-brain-line", color: "bg-[#8B5CF6]" },
            { label: "AI Forecasting", href: "/dashboard/forecasting", icon: "ri-line-chart-line", color: "bg-[#3B82F6]" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-3"
            >
              <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}>
                <i className={`${link.icon} text-white text-lg`}></i>
              </div>
              <span className="text-sm font-medium text-[#3A3F3A]">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}