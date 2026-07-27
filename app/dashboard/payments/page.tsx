"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardShell from "@/components/DashboardShell"
import FinancialActionCentre from "@/components/dashboard/FinancialActionCentre"
import { paymentStatusConfig, FinancialActionItem } from "@/lib/financialStatus"
import { useEntitlements } from "@/lib/useEntitlements"
import { isDemoAccount } from "@/lib/demoMode"
import { supabase } from "@/lib/supabaseClient"
import { payments, PaymentRecord } from "./PaymentsData"

const demoFinancialActions: FinancialActionItem[] = [
  { id: "pa1", priority: "high", tenant: "Lisa Chen", property: "Flat 7 Park View", amount: 1200, issue: "Failed Direct Debit — review immediately", ageLabel: "2 days", action: "Review Payment" },
  { id: "pa2", priority: "medium", tenant: "John Miller", property: "12 Rose Avenue", amount: 1850, issue: "Unmatched bank transaction", ageLabel: "3 days", action: "Match" },
  { id: "pa3", priority: "medium", tenant: "Michael Brown", property: "8 The Crescent", amount: 1650, issue: "Partial payment received — allocate", ageLabel: "5 days", action: "Allocate" },
]

const statusBadge = (s: string) => {
  const cfg = paymentStatusConfig[s as keyof typeof paymentStatusConfig]
  if (!cfg) return "bg-[#94A3B8]/10 text-[#94A3B8]"
  return cfg.bg
}

const statusLabel = (s: string) => {
  const cfg = paymentStatusConfig[s as keyof typeof paymentStatusConfig]
  return cfg ? cfg.label : s
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [paymentList, setPaymentList] = useState<PaymentRecord[]>([])
  const [billingList, setBillingList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"rent" | "billing">("rent")
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState<PaymentRecord | null>(null)
  const [markPaidConfirm, setMarkPaidConfirm] = useState<PaymentRecord | null>(null)
  const [markWaivedConfirm, setMarkWaivedConfirm] = useState<PaymentRecord | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [methodDropdown, setMethodDropdown] = useState(false)
  const [financialActions] = useState<FinancialActionItem[]>(demoFinancialActions)
  const { isReadOnly } = useEntitlements()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dropdown-trigger")) setMethodDropdown(false)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  useEffect(() => {
    if (isDemoAccount()) {
      setPaymentList(payments)
      setLoading(false)
      return
    }
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const { data: rp, error: rpErr } = await supabase
        .from("rent_payments")
        .select("*")
        .order("due_date", { ascending: false })

      if (rpErr) throw rpErr

      const { data: props } = await supabase.from("properties").select("id, line1, city")
      const propMap = new Map((props || []).map((p: any) => [p.id, p]))

      const mapped: PaymentRecord[] = (rp || []).map((r: any) => {
        const prop = propMap.get(r.property_id)
        return {
          id: r.id,
          propertyName: prop ? `${prop.line1}, ${prop.city}` : "Unknown Property",
          propertyId: r.property_id,
          tenantName: "Tenant",
          tenantId: r.tenant_id,
          tenancyRef: r.reference || `RENT-${r.id?.slice(0, 8)}`,
          tenancyId: r.tenancy_id,
          ownerName: "Owner",
          amountDue: Number(r.amount),
          amountPaid: r.status === "paid" ? Number(r.amount) : 0,
          outstanding: r.status === "paid" ? 0 : Number(r.amount),
          paymentDate: r.paid_date ? new Date(r.paid_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null,
          paymentMethod: r.method || "",
          reference: r.reference || "",
          status: (r.status === "paid" ? "paid" : r.status === "overdue" ? "overdue" : "due") as any,
          month: r.due_date ? new Date(r.due_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—",
          notes: r.notes || "",
          hasReceipt: r.status === "paid",
        }
      })

      setPaymentList(mapped)

      const { data: be } = await supabase.from("billing_events").select("*").order("created_at", { ascending: false }).limit(20)
      if (be) setBillingList(be)
    } catch (e: any) {
      setError(e.message || "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = (payment: PaymentRecord) => {
    setPaymentList((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? { ...p, status: "paid" as const, amountPaid: p.amountDue, outstanding: 0, paymentDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }
          : p
      )
    )
    setMarkPaidConfirm(null)
    showToast("Payment marked as received")
  }

  const handleMarkWaived = (payment: PaymentRecord) => {
    setPaymentList((prev) =>
      prev.map((p) =>
        p.id === payment.id ? { ...p, status: "waived" as const, outstanding: 0 } : p
      )
    )
    setMarkWaivedConfirm(null)
    showToast("Payment written off")
  }

  const filteredPayments = paymentList.filter((p) => {
    const matchesSearch =
      p.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      p.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      p.tenancyRef.toLowerCase().includes(search.toLowerCase())
    if (statusFilter === "All") return matchesSearch
    return matchesSearch && p.status === statusFilter
  })

  const stats = {
    totalDue: paymentList.reduce((s, p) => s + p.amountDue, 0),
    totalPaid: paymentList.filter((p) => p.status === "paid").reduce((s, p) => s + p.amountPaid, 0),
    totalOutstanding: paymentList.filter((p) => p.status !== "paid" && p.status !== "waived").reduce((s, p) => s + p.outstanding, 0),
    overdueCount: paymentList.filter((p) => p.status === "overdue").length,
    dueCount: paymentList.filter((p) => p.status === "due").length,
    paidCount: paymentList.filter((p) => p.status === "paid").length,
    failedCount: paymentList.filter((p) => p.status === "failed").length,
    total: paymentList.length,
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#687068] mt-3">Loading payment records...</p>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-[#C46868]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-[#C46868] text-xl"></i>
            </div>
            <p className="text-sm font-medium text-[#3A3F3A] mb-1">Failed to load payments</p>
            <p className="text-xs text-[#687068] mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 text-sm font-medium text-white bg-[#C28A78] rounded-lg hover:bg-[#143828] whitespace-nowrap">Retry</button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Payment Tracking</h1>
            <p className="text-sm text-[#687068] mt-1">{stats.total} rent payments · {stats.paidCount} received · {stats.overdueCount} overdue</p>
          </div>
          <button
            onClick={() => {
              if (isReadOnly) { alert("Your 14-day trial has ended. Upgrade your plan to continue using this feature."); return; }
              setRecordModalOpen(true)
            }}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <i className="ri-add-line text-sm"></i>
            Record Payment
          </button>
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: "rent", label: "Rent Payments", icon: "ri-money-pound-circle-line", sub: `${stats.total}` },
            { key: "billing", label: "Subscription Billing", icon: "ri-bank-card-line", sub: `${billingList.length}` },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setActiveView(v.key as "rent" | "billing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeView === v.key ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"}`}
            >
              <i className={`${v.icon} text-sm`}></i>
              {v.label}
              <span className="text-[10px] opacity-60">({v.sub})</span>
            </button>
          ))}
          <Link href="/dashboard/rent-collection" className="ml-auto text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap">
            Rent Collection →
          </Link>
        </div>

        {activeView === "rent" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Expected", value: `£${stats.totalDue.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#C28A78]", sub: `${stats.total} payments` },
                { label: "Received", value: `£${stats.totalPaid.toLocaleString()}`, icon: "ri-check-double-line", color: "bg-[#7A9A7E]", sub: `${stats.paidCount} cleared` },
                { label: "Outstanding", value: `£${stats.totalOutstanding.toLocaleString()}`, icon: "ri-error-warning-line", color: "bg-[#C46868]", sub: `${stats.overdueCount + stats.dueCount} pending` },
                { label: "Overdue", value: stats.overdueCount.toString(), icon: "ri-alarm-warning-line", color: "bg-[#F59E0B]", sub: "Needs action" },
                { label: "Failed", value: stats.failedCount.toString(), icon: "ri-close-circle-line", color: "bg-[#EF4444]", sub: "Payment issues" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${stat.icon} text-white text-base`}></i>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                    <p className="text-xs text-[#687068]">{stat.label}</p>
                    <p className="text-[10px] text-[#94A3B8]">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <FinancialActionCentre actions={financialActions} />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by property, tenant, reference..."
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-1 bg-white border border-[#D5D9D5] rounded-lg p-1 overflow-x-auto">
                {["All", "paid", "due", "overdue", "partial", "failed", "waived"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === s ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F1F5F9]"}`}
                  >
                    {s === "All" ? "All" : statusLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068] hidden md:table-cell">Tenant</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068] hidden lg:table-cell">Month</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredPayments.map((p) => {
                      const ps = paymentStatusConfig[p.status as keyof typeof paymentStatusConfig]
                      return (
                        <tr key={p.id} className="hover:bg-[#FBF9F4] transition-colors">
                          <td className="px-5 py-4">
                            <Link href={`/dashboard/property/${p.propertyId}`} className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors">
                              {p.propertyName}
                            </Link>
                            <p className="text-xs text-[#94A3B8]">{p.tenancyRef}</p>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell text-[#687068]">{p.tenantName}</td>
                          <td className="px-5 py-4 text-right">
                            <p className="text-sm font-medium text-[#3A3F3A]">£{p.amountPaid.toLocaleString()}</p>
                            {p.status !== "paid" && p.status !== "waived" && (
                              <p className="text-xs text-[#C46868]">of £{p.amountDue.toLocaleString()}</p>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell text-[#687068]">{p.month}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${ps.bg}`}>
                              <i className={`${ps.icon} text-xs`}></i>
                              {ps.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setDetailOpen(p)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F1F5F9] transition-colors" title="View">
                                <i className="ri-eye-line text-[#687068] text-xs"></i>
                              </button>
                              {(p.status === "due" || p.status === "overdue") && (
                                <button onClick={() => setMarkPaidConfirm(p)} className="px-2.5 py-1 text-xs font-medium text-[#7A9A7E] bg-[#7A9A7E]/5 rounded-lg hover:bg-[#7A9A7E]/10 transition-colors whitespace-nowrap">Mark Received</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="ri-bank-card-line text-[#94A3B8] text-xl"></i>
                          </div>
                          <p className="text-sm text-[#94A3B8]">No rent payments found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeView === "billing" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Event</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Type</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {billingList.length > 0 ? billingList.map((b: any) => (
                    <tr key={b.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-4 font-medium text-[#3A3F3A]">{b.stripe_event_id || b.event_type}</td>
                      <td className="px-5 py-4"><span className="text-sm text-[#687068] capitalize">{b.event_type?.replace(/_/g, " ")}</span></td>
                      <td className="px-5 py-4 text-right font-medium text-[#3A3F3A]">{b.amount ? `£${Number(b.amount).toLocaleString()}` : "—"}</td>
                      <td className="px-5 py-4 text-[#687068]">{new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-bank-card-line text-[#94A3B8] text-xl"></i>
                        </div>
                        <p className="text-sm text-[#94A3B8]">No subscription billing events</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Billing events from Stripe will appear here when configured</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {detailOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${detailOpen.status === "paid" ? "bg-[#7A9A7E]/10" : detailOpen.status === "overdue" ? "bg-[#C46868]/10" : "bg-[#F1F5F9]"}`}>
                  <i className={`ri-check-double-line ${detailOpen.status === "paid" ? "text-[#7A9A7E]" : detailOpen.status === "overdue" ? "text-[#C46868]" : "text-[#94A3B8]"} text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{detailOpen.propertyName}</h3>
                  <p className="text-xs text-[#687068]">{detailOpen.tenancyRef} · {detailOpen.month}</p>
                </div>
              </div>
              <button onClick={() => setDetailOpen(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Due</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">£{detailOpen.amountDue}</p>
                </div>
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Received</p>
                  <p className="text-lg font-bold text-[#7A9A7E]">£{detailOpen.amountPaid}</p>
                </div>
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Outstanding</p>
                  <p className={`text-lg font-bold ${detailOpen.outstanding > 0 ? "text-[#C46868]" : "text-[#7A9A7E]"}`}>£{detailOpen.outstanding}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Tenant", value: detailOpen.tenantName },
                  { label: "Payment Date", value: detailOpen.paymentDate || "—" },
                  { label: "Payment Method", value: detailOpen.paymentMethod || "—" },
                  { label: "Reference", value: detailOpen.reference || "—" },
                  { label: "Status", value: statusLabel(detailOpen.status) },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-xl">
                    <span className="text-xs text-[#94A3B8]">{row.label}</span>
                    <span className="text-sm font-medium text-[#3A3F3A]">{row.value}</span>
                  </div>
                ))}
              </div>
              {detailOpen.status !== "paid" && detailOpen.status !== "waived" && (
                <div className="flex gap-3">
                  <button onClick={() => { setDetailOpen(null); setMarkPaidConfirm(detailOpen) }} className="flex-1 py-3 text-sm font-medium text-white bg-[#7A9A7E] rounded-xl hover:bg-[#059669] transition-colors whitespace-nowrap">
                    <i className="ri-check-line mr-1"></i>Mark as Received
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {markPaidConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMarkPaidConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-double-line text-[#7A9A7E] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Mark as Received?</h3>
            <p className="text-sm text-[#687068] mb-4">{markPaidConfirm.tenantName} — {markPaidConfirm.propertyName}<br /><span className="text-xs">£{markPaidConfirm.amountDue} · {markPaidConfirm.month}</span></p>
            <div className="flex gap-3">
              <button onClick={() => setMarkPaidConfirm(null)} className="flex-1 text-sm font-medium text-[#687068] py-2.5 rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9]">Cancel</button>
              <button onClick={() => handleMarkPaid(markPaidConfirm)} className="flex-1 bg-[#7A9A7E] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#059669]">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRecordModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">Record Payment</h3>
              <button onClick={() => setRecordModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Property</label>
                <input type="text" placeholder="e.g. Rose Court Flat 2A" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Amount (£)</label>
                  <input type="text" placeholder="e.g. 1850" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Payment Date</label>
                  <input type="date" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => { setRecordModalOpen(false); showToast("Payment recorded"); }} className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors">Record Payment</button>
                <button onClick={() => setRecordModalOpen(false)} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#7A9A7E]"></i>
          {toast}
        </div>
      )}
    </DashboardShell>
  )
}