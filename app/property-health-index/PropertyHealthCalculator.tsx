"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

interface SliderField {
  key: string
  label: string
  subtitle: string
  icon: string
  min: number
  max: number
  step: number
}

const FIELDS: SliderField[] = [
  { key: "epc", label: "EPC Rating", subtitle: "Energy Performance Certificate", icon: "ri-flashlight-line", min: 0, max: 100, step: 1 },
  { key: "eicr", label: "EICR Status", subtitle: "Electrical Installation Condition", icon: "ri-plug-line", min: 0, max: 100, step: 1 },
  { key: "gas", label: "Gas Safety", subtitle: "Gas Safety Certificate & Appliances", icon: "ri-fire-line", min: 0, max: 100, step: 1 },
  { key: "maintenance", label: "Maintenance", subtitle: "Repairs, response time & contractor quality", icon: "ri-tools-line", min: 0, max: 100, step: 1 },
  { key: "inspection", label: "Inspection", subtitle: "Routine inspections & condition reports", icon: "ri-clipboard-line", min: 0, max: 100, step: 1 },
]

const WEIGHTS = { epc: 15, eicr: 20, gas: 25, maintenance: 25, inspection: 15 }

function getHealthLevel(score: number): { label: string; color: string; bg: string; border: string; text: string; description: string } {
  if (score >= 85) return { label: "Excellent", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10", border: "border-[#7A9A7E]/30", text: "text-[#7A9A7E]", description: "Property is in outstanding condition across all metrics. Minimal risk, fully compliant, and well-maintained." }
  if (score >= 70) return { label: "Good", color: "#3B82F6", bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/30", text: "text-[#3B82F6]", description: "Property is well-managed with solid compliance and maintenance. A few areas could be tightened." }
  if (score >= 50) return { label: "Needs Attention", color: "#F59E0B", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/30", text: "text-[#F59E0B]", description: "Several areas require urgent attention. Compliance gaps or maintenance backlogs may pose regulatory risk." }
  return { label: "High Risk", color: "#EF4444", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/30", text: "text-[#EF4444]", description: "Critical issues detected. Immediate action needed to address compliance failures, safety hazards, or severe maintenance deficits." }
}

export default function PropertyHealthCalculator() {
  const [values, setValues] = useState<Record<string, number>>({ epc: 65, eicr: 70, gas: 75, maintenance: 68, inspection: 72 })
  const [animated, setAnimated] = useState(false)

  const score = useMemo(() => {
    let total = 0
    for (const [key, weight] of Object.entries(WEIGHTS)) {
      total += (values[key] || 0) * (weight / 100)
    }
    return Math.round(total)
  }, [values])

  const health = getHealthLevel(score)

  const handleSlider = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    if (!animated) setAnimated(true)
  }

  const quickSets = [
    { label: "Excellent", icon: "ri-star-fill", values: { epc: 92, eicr: 95, gas: 96, maintenance: 90, inspection: 91 } },
    { label: "Average", icon: "ri-equal-line", values: { epc: 68, eicr: 70, gas: 72, maintenance: 65, inspection: 70 } },
    { label: "Poor", icon: "ri-error-warning-fill", values: { epc: 38, eicr: 40, gas: 35, maintenance: 30, inspection: 42 } },
  ]

  return (
    <section className="w-full max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#C28A78]/5 border border-[#C28A78]/10 rounded-full px-4 py-1.5 mb-4">
          <i className="ri-calculator-line text-[#C28A78] text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs font-medium text-[#C28A78]">Interactive Calculator</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-[#3A3F3A] tracking-tight">
          Calculate Your Property Health Index
        </h2>
        <p className="text-[#687068] text-lg mt-3 max-w-2xl mx-auto">
          Adjust the sliders below to see how each dimension affects your overall Property Health Index score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider">Quick set:</span>
            {quickSets.map((qs) => (
              <button
                key={qs.label}
                onClick={() => { setValues(qs.values); setAnimated(true) }}
                className="text-xs px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#D5D9D5] text-[#475569] font-medium transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <i className={`${qs.icon} text-[10px]`}></i>
                {qs.label}
              </button>
            ))}
          </div>

          {FIELDS.map((field) => (
            <div key={field.key} className="bg-white border border-[#D5D9D5] rounded-xl p-5 hover:border-[#C28A78]/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
                    <i className={`${field.icon} text-[#C28A78] text-lg`}></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">{field.label}</h3>
                    <p className="text-xs text-[#94A3B8]">{field.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#3A3F3A] tabular-nums">{values[field.key]}</span>
                  <span className="text-xs text-[#94A3B8]">/100</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={values[field.key]}
                  onChange={(e) => handleSlider(field.key, Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C28A78 0%, #C28A78 ${values[field.key]}%, #D5D9D5 ${values[field.key]}%, #D5D9D5 100%)`,
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#CBD5E1]">0</span>
                  <span className="text-[10px] text-[#CBD5E1]">50</span>
                  <span className="text-[10px] text-[#CBD5E1]">100</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: values[field.key] >= 70 ? "#7A9A7E" : values[field.key] >= 45 ? "#F59E0B" : "#EF4444" }}></div>
                <span className="text-[10px] font-medium" style={{ color: values[field.key] >= 70 ? "#7A9A7E" : values[field.key] >= 45 ? "#F59E0B" : "#EF4444" }}>
                  {values[field.key] >= 70 ? "Healthy" : values[field.key] >= 45 ? "Watch" : "Critical"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className={`bg-white border-2 ${health.border} rounded-2xl p-8 text-center`}>
              <p className="text-sm text-[#687068] mb-2">Property Health Index</p>
              <div className="relative inline-flex items-center justify-center w-44 h-44 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={health.color}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 440} 440`}
                    className={animated ? "transition-all duration-1000 ease-out" : ""}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold tracking-tight" style={{ color: health.color }}>{score}</span>
                  <span className="text-xs text-[#94A3B8]">out of 100</span>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 ${health.bg} rounded-full px-4 py-1.5 mb-3`}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: health.color }}></div>
                <span className={`text-sm font-semibold ${health.text}`}>{health.label}</span>
              </div>
              <p className="text-sm text-[#687068] leading-relaxed">{health.description}</p>
            </div>

            <div className="bg-white border border-[#D5D9D5] rounded-xl p-5">
              <h4 className="text-sm font-semibold text-[#3A3F3A] mb-4">Score Breakdown</h4>
              <div className="space-y-3">
                {FIELDS.map((field) => {
                  const weight = WEIGHTS[field.key as keyof typeof WEIGHTS]
                  const contribution = Math.round((values[field.key] || 0) * (weight / 100))
                  return (
                    <div key={field.key} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${field.icon} text-[#687068] text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#475569]">{field.label}</span>
                          <span className="text-xs text-[#94A3B8]">{weight}% weight</span>
                        </div>
                        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${values[field.key]}%`, backgroundColor: health.color }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#3A3F3A] w-5 text-right tabular-nums">{contribution}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-[#D5D9D5] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#3A3F3A]">Total</span>
                <span className="text-lg font-bold" style={{ color: health.color }}>{score}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/demo"
                className="w-full text-center text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#143828] transition-colors py-3.5 rounded-xl whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-play-circle-line text-lg w-5 h-5 flex items-center justify-center"></i>
                View Demo
              </Link>
              <Link
                href="/dashboard"
                className="w-full text-center text-sm font-semibold text-[#C28A78] border-2 border-[#C28A78]/20 hover:bg-[#C28A78]/5 transition-colors py-3.5 rounded-xl whitespace-nowrap flex items-center justify-center gap-2"
              >
                <i className="ri-rocket-2-line text-lg w-5 h-5 flex items-center justify-center"></i>
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}