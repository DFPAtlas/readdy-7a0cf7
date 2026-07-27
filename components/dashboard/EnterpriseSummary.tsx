"use client"

import Link from "next/link"
import { EnterpriseKPI } from "@/lib/enterpriseSystem"

export default function EnterpriseSummary({ kpis }: { kpis: EnterpriseKPI[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi) => {
        const card = (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <i className={`${kpi.icon} text-xs`} style={{ color: kpi.color }}></i>
              </div>
              <span className="text-xs text-[#687068] truncate">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-[#3A3F3A]">{kpi.value}</p>
            <p className="text-xs text-[#94A3B8] mt-1">{kpi.secondary}</p>
          </div>
        )
        if (kpi.href) return <Link key={kpi.label} href={kpi.href} className="cursor-pointer">{card}</Link>
        return <div key={kpi.label}>{card}</div>
      })}
    </div>
  )
}