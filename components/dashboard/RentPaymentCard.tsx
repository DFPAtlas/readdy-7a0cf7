"use client"

interface RentPaymentCardProps {
  property: string
  tenant: string
  amount: number
  dueDate: string
  paidDate: string | null
  status: "Paid" | "Due Soon" | "Overdue" | "In Arrears" | "Paid Late"
  outstanding: number
  arrearsMonths?: number
  onClick: () => void
}

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Paid: { bg: "bg-[#7A9A7E]/10", text: "text-[#7A9A7E]", border: "border-[#7A9A7E]/20", icon: "ri-check-double-line" },
  "Due Soon": { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20", icon: "ri-time-line" },
  Overdue: { bg: "bg-[#C46868]/10", text: "text-[#C46868]", border: "border-[#C46868]/20", icon: "ri-alarm-warning-line" },
  "In Arrears": { bg: "bg-[#C46868]/10", text: "text-[#C46868]", border: "border-[#C46868]/20", icon: "ri-error-warning-line" },
  "Paid Late": { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20", icon: "ri-check-line" },
}

export default function RentPaymentCard({ property, tenant, amount, dueDate, paidDate, status, outstanding, arrearsMonths, onClick }: RentPaymentCardProps) {
  const s = statusConfig[status] || statusConfig["Due Soon"]

  return (
    <div onClick={onClick} className={`bg-white rounded-xl border ${s.border} p-4 cursor-pointer hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <i className={`${s.icon} ${s.text} text-sm`}></i>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#3A3F3A] truncate">{property}</p>
            <p className="text-xs text-[#687068] truncate">{tenant}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${s.bg} ${s.text}`}>
          {status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#FBF9F4] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#94A3B8]">Rent</p>
          <p className="text-sm font-medium text-[#3A3F3A]">£{amount.toLocaleString()}</p>
        </div>
        <div className="bg-[#FBF9F4] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#94A3B8]">Due</p>
          <p className="text-sm font-medium text-[#3A3F3A]">{dueDate}</p>
        </div>
        <div className="bg-[#FBF9F4] rounded-lg p-2 text-center">
          <p className="text-[10px] text-[#94A3B8]">Outstanding</p>
          <p className={`text-sm font-medium ${outstanding > 0 ? "text-[#C46868]" : "text-[#7A9A7E]"}`}>
            £{outstanding.toLocaleString()}
          </p>
        </div>
      </div>
      {paidDate && (
        <p className="text-xs text-[#7A9A7E] mt-2 text-center">Paid on {paidDate}</p>
      )}
      {arrearsMonths && arrearsMonths > 1 && (
        <p className="text-xs text-[#C46868] mt-1 text-center">{arrearsMonths} months overdue</p>
      )}
    </div>
  )
}