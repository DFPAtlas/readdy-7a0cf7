"use client"

import { useState, useEffect } from "react"
import DashboardShell from "@/components/DashboardShell"
import { fetchBenchmarkData, type BenchmarkMetric } from "./BenchmarkingData"
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell,
} from "recharts"

const NATIONAL_AVG_OVERVIEW = 76

export default function BenchmarkingPage() {
  const [metrics, setMetrics] = useState<BenchmarkMetric[]>([])
  const [propertyCount, setPropertyCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBenchmarkData()
        setMetrics(data.metrics)
        setPropertyCount(data.propertyCount)
      } catch {
        setError("Could not load benchmarking data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24 text-[#94A3B8]">
          <div className="text-center">
            <i className="ri-error-warning-line text-4xl block mb-3"></i>
            <p>{error}</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const radarData = metrics.map(m => ({
    metric: m.label,
    your: m.yourValue,
    regional: m.regionalValue,
    national: m.nationalValue,
  }))

  const overviewScore = metrics.length
    ? Math.round(metrics.reduce((s, m) => s + m.yourValue, 0) / metrics.length)
    : 0

  const aboveNational = metrics.filter(m => {
    if (m.invertDirection) return m.yourValue < m.nationalValue
    return m.yourValue > m.nationalValue
  }).length

  const aboveRegional = metrics.filter(m => {
    if (m.invertDirection) return m.yourValue < m.regionalValue
    return m.yourValue > m.regionalValue
  }).length

  const bestMetric = metrics.reduce((best, m) => {
    const yourNorm = m.invertDirection ? (100 - Math.min(m.yourValue, 100)) : m.yourValue
    const natNorm = m.invertDirection ? (100 - m.nationalValue) : m.nationalValue
    const prevBest = best
      ? (best.invertDirection ? (100 - Math.min(best.yourValue, 100)) : best.yourValue)
        / (best.invertDirection ? (100 - best.nationalValue) : best.nationalValue)
      : 0
    const currentRatio = yourNorm / natNorm
    return currentRatio > prevBest ? m : best
  }, null as BenchmarkMetric | null)

  const worstMetric = metrics.reduce((worst, m) => {
    const yourNorm = m.invertDirection ? (100 - Math.min(m.yourValue, 100)) : m.yourValue
    const natNorm = m.invertDirection ? (100 - m.nationalValue) : m.nationalValue
    const prevWorst = worst
      ? (worst.invertDirection ? (100 - Math.min(worst.yourValue, 100)) : worst.yourValue)
        / (worst.invertDirection ? (100 - worst.nationalValue) : worst.nationalValue)
      : 999
    const currentRatio = yourNorm / natNorm
    return currentRatio < prevWorst ? m : worst
  }, null as BenchmarkMetric | null)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">National Property Benchmarking</h1>
            <p className="text-sm text-[#687068] mt-1">
              Compare your portfolio performance against anonymised regional and national averages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-3 py-1.5 rounded-full">
              <i className="ri-shield-check-line text-[#10B981] mr-1"></i>
              Anonymised data — your figures are never shared
            </span>
            <span className="text-xs text-[#687068]">
              {propertyCount} properties in portfolio
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#C28A78]/10 rounded-md flex items-center justify-center">
                <i className="ri-dashboard-line text-[#C28A78] text-xs"></i>
              </div>
              <span className="text-xs text-[#687068]">Portfolio Score</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{overviewScore}<span className="text-sm font-normal text-[#94A3B8]">/100</span></p>
            <p className="text-xs text-[#94A3B8] mt-0.5">National avg: {NATIONAL_AVG_OVERVIEW}/100</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#10B981]/10 rounded-md flex items-center justify-center">
                <i className="ri-arrow-up-line text-[#10B981] text-xs"></i>
              </div>
              <span className="text-xs text-[#687068]">Above National</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{aboveNational}/{metrics.length}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">metrics outperforming</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#3B82F6]/10 rounded-md flex items-center justify-center">
                <i className="ri-map-pin-line text-[#3B82F6] text-xs"></i>
              </div>
              <span className="text-xs text-[#687068]">Above Regional</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{aboveRegional}/{metrics.length}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">vs region peers</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#8B5CF6]/10 rounded-md flex items-center justify-center">
                <i className="ri-focus-2-line text-[#8B5CF6] text-xs"></i>
              </div>
              <span className="text-xs text-[#687068]">Focus Area</span>
            </div>
            <p className="text-lg font-bold text-[#3A3F3A] truncate">{worstMetric?.label || "—"}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">needs attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-[#3A3F3A]">Metric Comparison</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Side-by-side across all benchmarks</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#C28A78]"></div>
                  <span className="text-[#687068]">You</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                  <span className="text-[#687068]">Regional</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#94A3B8]"></div>
                  <span className="text-[#687068]">National</span>
                </div>
              </div>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={radarData} layout="vertical" margin={{ left: 100, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="metric" tick={{ fontSize: 12, fill: "#3A3F3A", fontWeight: 500 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}
                    formatter={(value: any, name: any) => {
                      const m = metrics.find(x => x.label.toLowerCase() === name?.toString().toLowerCase())
                      return [`${value}${m?.unit || "%"}`, name]
                    }}
                  />
                  <Bar dataKey="your" name="Your Portfolio" fill="#C28A78" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="regional" name="Regional Average" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="national" name="National Average" fill="#94A3B8" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="mb-5">
              <h2 className="font-semibold text-[#3A3F3A]">Radar View</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">360° portfolio performance</p>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#E2E8F0" strokeWidth={0.5} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#687068" }} tickSize={4} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickCount={5} />
                  <Radar name="Your Portfolio" dataKey="your" stroke="#C28A78" fill="#C28A78" fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="Regional Avg" dataKey="regional" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={1.5} />
                  <Radar name="National Avg" dataKey="national" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    formatter={(value: any) => <span className="text-[#687068] text-xs">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(m => {
            const isInverted = m.invertDirection
            const yourVal = isInverted ? (100 - Math.min(m.yourValue, 100)) : m.yourValue
            const natVal = isInverted ? (100 - m.nationalValue) : m.nationalValue
            const regVal = isInverted ? (100 - m.regionalValue) : m.regionalValue
            const vsNational = natVal > 0 ? Math.round(((yourVal - natVal) / natVal) * 100) : 0
            const vsRegional = regVal > 0 ? Math.round(((yourVal - regVal) / regVal) * 100) : 0

            return (
              <div key={m.key} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">{m.label}</h3>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    vsNational > 0 ? "bg-[#10B981]/10 text-[#10B981]" :
                    vsNational < 0 ? "bg-[#EF4444]/10 text-[#EF4444]" :
                    "bg-[#E2E8F0] text-[#687068]"
                  }`}>
                    {vsNational > 0 ? "+" : ""}{vsNational}% vs natl
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#C28A78]">{m.yourDisplay}</p>
                    <p className="text-[10px] text-[#687068] mt-0.5">You</p>
                  </div>
                  <div className="text-center border-l border-r border-[#E2E8F0]">
                    <p className="text-xl font-bold text-[#3B82F6]">{m.regionalDisplay}</p>
                    <p className="text-[10px] text-[#687068] mt-0.5">Regional</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#94A3B8]">{m.nationalDisplay}</p>
                    <p className="text-[10px] text-[#687068] mt-0.5">National</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#94A3B8] w-12">Nat'l Avg</span>
                    <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#94A3B8] rounded-full" style={{ width: `${natVal}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#94A3B8] w-12">Regional</span>
                    <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${Math.max(yourVal, regVal)}%` }}>
                        <div className="h-full bg-[#3B82F6] rounded-full opacity-30" style={{ width: `${(regVal / Math.max(yourVal, regVal)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#94A3B8] w-12">You</span>
                    <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C28A78] rounded-full" style={{ width: `${Math.max(yourVal, regVal)}%` }}>
                        <div
                          className="h-full bg-[#C28A78] rounded-full"
                          style={{ width: `${(yourVal / Math.max(yourVal, regVal)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {bestMetric?.key === m.key && (
                  <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                    <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
                      <i className="ri-medal-line text-xs"></i>
                      Your strongest metric
                    </span>
                  </div>
                )}
                {worstMetric?.key === m.key && (
                  <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                    <span className="text-xs text-[#EF4444] font-medium flex items-center gap-1">
                      <i className="ri-focus-2-line text-xs"></i>
                      Priority improvement area
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-gradient-to-r from-[#C28A78] to-[#143728] rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Benchmarking Insights</h3>
              <p className="text-sm text-white/70 mt-1">
                Based on anonymised data from {propertyCount > 0 ? "your portfolio" : "the platform"} and aggregated industry figures.
                All comparisons use anonymised, privacy-safe data. Individual agency data is never exposed.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <i className="ri-lock-line"></i> End-to-end anonymised
              </span>
              <span className="flex items-center gap-1">
                <i className="ri-shield-check-line"></i> GDPR compliant
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#CBD5E1]">
          Benchmark data is refreshed weekly using anonymised aggregates. Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </DashboardShell>
  )
}