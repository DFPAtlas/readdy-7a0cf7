"use client"

import { arrearsRiskConfig, ArrearsRisk } from "@/lib/financialStatus"

interface ArrearsCaseCardProps {
  property: string
  tenant: string
  rentAmount: number
  totalArrears: number
  arrearsMonths: number
  riskRating: ArrearsRisk
  lastContact: string
  onClick: () => void
}

export default function ArrearsCaseCard({ property, tenant, rentAmount, totalArrears, arrearsMonths, riskRating, lastContact, onClick }: ArrearsCaseCardProps) {
  const r = arrearsRiskConfig[riskRating]

  return (
    <div onClick={onClick} className={`bg-white rounded-xl border ${r.border} p-4 cursor-pointer hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 ${r.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <i className={`${r.icon} ${r.text} text-sm`}></i>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#3A3F3A] truncate">{property}</p>
            <p className="text-xs text-[#687068] truncate">{tenant}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${r.badge}`}>
          {riskRating}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#FBF9F4] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#94A3B8]">Arrears</p>
          <p className="text-sm font-medium text-[#C46868]">£{totalArrears.toLocaleString()}</p>
        </div>
        <div className="bg-[#FBF9F4] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#94A3B8]">Months</p>
          <p className="text-sm font-medium text-[#3A3F3A]">{arrearsMonths}</p>
        </div>
        <div className="bg-[#FBF9F4] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#94A3B8]">Rent</p>
          <p className="text-sm font-medium text-[#3A3F3A]">£{rentAmount.toLocaleString()}</p>
        </div>
      </div>
      <p className="text-xs text-[#94A3B8] mt-2 text-center">Last contact: {lastContact}</p>
    </div>
  )
}