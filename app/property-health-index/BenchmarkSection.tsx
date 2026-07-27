"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface BenchmarkData {
  health_level: string
  cnt: number
  avg_score: number
  avg_compliance: number
  avg_maintenance: number
  avg_tenancy: number
  avg_inspection: number
}

const LEVEL_COLORS: Record<string, string> = {
  excellent: "#10B981",
  good: "#3B82F6",
  attention_needed: "#F59E0B",
  high_risk: "#EF4444",
}

const LEVEL_LABELS: Record<string, string> = {
  excellent: "Excellent (85–100)",
  good: "Good (70–84)",
  attention_needed: "Needs Attention (50–69)",
  high_risk: "High Risk (0–49)",
}

const LEVEL_ICONS: Record<string, string> = {
  excellent: "ri-star-fill",
  good: "ri-thumb-up-fill",
  attention_needed: "ri-error-warning-fill",
  high_risk: "ri-alert-fill",
}

export default function BenchmarkSection() {
  const [data, setData] = useState<BenchmarkData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("property_health_scores")
      .select("health_level, overall_score, compliance_score, maintenance_score, tenancy_score, inspection_score")
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          const grouped: Record<string, { cnt: number; overall: number; compliance: number; maintenance: number; tenancy: number; inspection: number }> = {}
          rows.forEach((r: any) => {
            const lvl = r.health_level || "attention_needed"
            if (!grouped[lvl]) grouped[lvl] = { cnt: 0, overall: 0, compliance: 0, maintenance: 0, tenancy: 0, inspection: 0 }
            grouped[lvl].cnt++
            grouped[lvl].overall += r.overall_score || 0
            grouped[lvl].compliance += r.compliance_score || 0
            grouped[lvl].maintenance += r.maintenance_score || 0
            grouped[lvl].tenancy += r.tenancy_score || 0
            grouped[lvl].inspection += r.inspection_score || 0
          })
          const result: BenchmarkData[] = Object.entries(grouped)
            .map(([level, d]) => ({
              health_level: level,
              cnt: d.cnt,
              avg_score: Math.round(d.overall / d.cnt),
              avg_compliance: Math.round(d.compliance / d.cnt),
              avg_maintenance: Math.round(d.maintenance / d.cnt),
              avg_tenancy: Math.round(d.tenancy / d.cnt),
              avg_inspection: Math.round(d.inspection / d.cnt),
            }))
            .sort((a, b) => b.avg_score - a.avg_score)
          setData(result)
        }
        setLoading(false)
      })
  }, [])

  const allScores = data.flatMap((d) => [d.avg_score])
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 92
  const totalProperties = data.reduce((s, d) => s + d.cnt, 0)

  return (
    <section className="w-full bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-4 py-1.5 mb-4">
            <i className="ri-bar-chart-grouped-line text-[#687068] text-sm w-4 h-4 flex items-center justify-center"></i>
            <span className="text-xs font-medium text-[#687068]">Live Benchmarking</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#3A3F3A] tracking-tight">
            How Does Your Portfolio Compare?
          </h2>
          <p className="text-[#687068] text-lg mt-3 max-w-2xl mx-auto">
            Real benchmarking data from {totalProperties} properties on the LetHub platform. See how each health tier performs across all five dimensions.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((row) => {
              const color = LEVEL_COLORS[row.health_level] || "#94A3B8"
              return (
                <div key={row.health_level} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="p-5" style={{ borderTop: `3px solid ${color}` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
                          <i className={`${LEVEL_ICONS[row.health_level] || "ri-information-line"} text-sm`} style={{ color }}></i>
                        </div>
                        <span className="text-xs font-semibold" style={{ color }}>{LEVEL_LABELS[row.health_level] || row.health_level}</span>
                      </div>
                      <span className="text-xs text-[#94A3B8]">{row.cnt} {row.cnt === 1 ? "property" : "properties"}</span>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold text-[#3A3F3A]">{row.avg_score}</p>
                      <p className="text-xs text-[#94A3B8]">Average PHI Score</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Compliance", score: row.avg_compliance, dimColor: "#10B981" },
                        { label: "Maintenance", score: row.avg_maintenance, dimColor: "#3B82F6" },
                        { label: "Tenancy", score: row.avg_tenancy, dimColor: "#8B5CF6" },
                        { label: "Inspection", score: row.avg_inspection, dimColor: "#F59E0B" },
                      ].map((dim) => (
                        <div key={dim.label} className="flex items-center gap-2">
                          <span className="text-[10px] text-[#94A3B8] w-20 text-right">{dim.label}</span>
                          <div className="flex-1 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${dim.score}%`, backgroundColor: dim.dimColor }}></div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#3A3F3A] w-6">{dim.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-[#C28A78] to-[#143728] rounded-2xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#10B981]/5 blur-3xl"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-white">{totalProperties}</p>
              <p className="text-sm text-white/50 mt-1">Properties Benchmarked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#10B981]">{bestScore}</p>
              <p className="text-sm text-white/50 mt-1">Highest PHI Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-sm text-white/50 mt-1">Scoring Dimensions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}