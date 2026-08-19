"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import DashboardShell from "@/components/DashboardShell"
import { useEntitlements } from "@/lib/useEntitlements"
import { isDemoAccount } from "@/lib/demoMode"
import { supabase } from "@/lib/supabaseClient"
import { rentSchedules, RentSchedule, scheduleStatusBadge, scheduleStatusLabel, frequencyLabel } from "./RentData"

export default function RentSchedulePage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [statusDropdown, setStatusDropdown] = useState(false)
  const [scheduleList, setScheduleList] = useState<RentSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState<RentSchedule | null>(null)
  const [pauseConfirm, setPauseConfirm] = useState<RentSchedule | null>(null)
  const [endConfirm, setEndConfirm] = useState<RentSchedule | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [detailOpen, setDetailOpen] = useState<RentSchedule | null>(null)
  const { isReadOnly } = useEntitlements()

  const [formData, setFormData] = useState({
    propertyName: "",
    tenantName: "",
    ownerName: "",
    rentAmount: "",
    frequency: "monthly" as "monthly" | "weekly" | "fortnightly",
    dueDay: "1",
    tenancyRef: "",
    paymentMethod: "Bank Transfer",
    depositAmount: "",
    depositScheme: "MyDeposits",
  })

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".dropdown-trigger")) setStatusDropdown(false)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isDemoAccount()) {
      setScheduleList(rentSchedules)
      setLoading(false)
      return
    }
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const { data: payments, error: payErr } = await supabase
        .from("rent_payments")
        .select("*, tenancies(rent_amount, rent_period, status, start_date, end_date)")
        .order("due_date", { ascending: false })

      if (payErr) throw payErr

      const { data: properties, error: propErr } = await supabase
        .from("properties")
        .select("id, line1, city, postcode")

      if (propErr) throw propErr

      const propMap = new Map((properties || []).map((p: any) => [p.id, p]))

      const mapped: RentSchedule[] = (payments || []).map((p: any) => {
        const prop = propMap.get(p.property_id)
        const tenancy = p.tenancies
        return {
          id: p.id,
          propertyName: prop ? `${prop.line1}, ${prop.city}` : "Unknown Property",
          propertyId: p.property_id,
          tenantName: "Tenant",
          tenantId: p.tenant_id,
          ownerName: "Owner",
          ownerId: "",
          tenancyRef: p.reference || `RENT-${p.id?.slice(0, 8) || ""}`,
          tenancyId: p.tenancy_id,
          rentAmount: tenancy ? Number(tenancy.rent_amount) : Number(p.amount),
          frequency: "monthly",
          dueDay: p.due_date ? new Date(p.due_date).getDate() : 1,
          nextDueDate: p.due_date ? new Date(p.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
          tenancyStatus: tenancy?.status || "—",
          scheduleStatus: p.status === "paid" ? "active" : p.status === "overdue" ? "paused" : "active",
          depositAmount: 0,
          depositScheme: "—",
          paymentMethod: p.method || "—",
          lastPaidDate: p.paid_date ? new Date(p.paid_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null,
          lastPaidAmount: p.status === "paid" ? Number(p.amount) : null,
        }
      })

      setScheduleList(mapped)
    } catch (e: any) {
      setError(e.message || "Failed to load rent data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    if (!formData.propertyName || !formData.rentAmount) return
    const newSchedule: RentSchedule = {
      id: `rs-${Date.now()}`,
      propertyName: formData.propertyName,
      propertyId: `prop-${Date.now()}`,
      tenantName: formData.tenantName || "Unassigned",
      tenantId: "",
      ownerName: formData.ownerName || "Unassigned",
      ownerId: "",
      tenancyRef: formData.tenancyRef || "TBC",
      tenancyId: "",
      rentAmount: parseInt(formData.rentAmount) || 0,
      frequency: formData.frequency,
      dueDay: parseInt(formData.dueDay) || 1,
      nextDueDate: "01 Jul 2026",
      tenancyStatus: "Active",
      scheduleStatus: "active",
      depositAmount: parseInt(formData.depositAmount) || 0,
      depositScheme: formData.depositScheme,
      paymentMethod: formData.paymentMethod,
      lastPaidDate: null,
      lastPaidAmount: null,
    }
    setScheduleList((prev) => [newSchedule, ...prev])
    setCreateModalOpen(false)
    setFormData({ propertyName: "", tenantName: "", ownerName: "", rentAmount: "", frequency: "monthly", dueDay: "1", tenancyRef: "", paymentMethod: "Bank Transfer", depositAmount: "", depositScheme: "MyDeposits" })
    showToast("Rent schedule created")
  }

  const handleEdit = () => {
    if (!editModalOpen) return
    setScheduleList((prev) =>
      prev.map((s) =>
        s.id === editModalOpen.id
          ? {
              ...s,
              propertyName: formData.propertyName,
              tenantName: formData.tenantName,
              ownerName: formData.ownerName,
              rentAmount: parseInt(formData.rentAmount) || s.rentAmount,
              frequency: formData.frequency,
              dueDay: parseInt(formData.dueDay) || s.dueDay,
              tenancyRef: formData.tenancyRef || s.tenancyRef,
              paymentMethod: formData.paymentMethod,
              depositScheme: formData.depositScheme,
            }
          : s
      )
    )
    setEditModalOpen(null)
    showToast("Schedule updated")
  }

  const handlePause = (schedule: RentSchedule) => {
    const newStatus = schedule.scheduleStatus === "active" ? "paused" : "active"
    setScheduleList((prev) =>
      prev.map((s) => (s.id === schedule.id ? { ...s, scheduleStatus: newStatus as "active" | "paused" } : s))
    )
    setPauseConfirm(null)
    showToast(newStatus === "paused" ? "Schedule paused" : "Schedule resumed")
  }

  const handleEnd = (schedule: RentSchedule) => {
    setScheduleList((prev) =>
      prev.map((s) => (s.id === schedule.id ? { ...s, scheduleStatus: "ended" as const } : s))
    )
    setEndConfirm(null)
    showToast("Schedule marked as ended")
  }

  const filtered = scheduleList.filter((s) => {
    const matchesSearch =
      s.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      s.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      s.tenancyRef.toLowerCase().includes(search.toLowerCase())
    if (statusFilter === "All") return matchesSearch
    return matchesSearch && s.scheduleStatus === statusFilter
  })

  const stats = {
    total: scheduleList.length,
    active: scheduleList.filter((s) => s.scheduleStatus === "active").length,
    paused: scheduleList.filter((s) => s.scheduleStatus === "paused").length,
    ended: scheduleList.filter((s) => s.scheduleStatus === "ended").length,
    totalRent: scheduleList.filter((s) => s.scheduleStatus === "active").reduce((sum, s) => sum + s.rentAmount, 0),
    totalMonthlyRent: scheduleList.filter((s) => s.scheduleStatus === "active" && s.frequency === "monthly").reduce((sum, s) => sum + s.rentAmount, 0),
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#687068]">Loading rent schedules...</p>
          </div>
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
            <p className="text-sm font-medium text-[#3A3F3A] mb-1">Failed to load rent data</p>
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
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Rent Schedule</h1>
            <p className="text-sm text-[#687068] mt-1">{stats.total} schedules · {stats.active} active</p>
          </div>
          <button
            onClick={() => {
              if (isReadOnly) { alert("Your 14-day trial has ended. Upgrade your plan to continue using this feature."); return; }
              setFormData({ propertyName: "", tenantName: "", ownerName: "", rentAmount: "", frequency: "monthly", dueDay: "1", tenancyRef: "", paymentMethod: "Bank Transfer", depositAmount: "", depositScheme: "MyDeposits" })
              setCreateModalOpen(true)
            }}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Create Schedule
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Schedules", value: stats.total, icon: "ri-calendar-schedule-line", color: "bg-[#C28A78]" },
            { label: "Active", value: stats.active, icon: "ri-check-line", color: "bg-[#7A9A7E]" },
            { label: "Paused", value: stats.paused, icon: "ri-pause-circle-line", color: "bg-[#D4A85C]" },
            { label: "Ended", value: stats.ended, icon: "ri-stop-circle-line", color: "bg-[#94A3B8]" },
            { label: "Monthly Rent Total", value: `£${stats.totalMonthlyRent.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#3B82F6]" },
            { label: "All Active Rent", value: `£${stats.totalRent.toLocaleString()}`, icon: "ri-funds-line", color: "bg-[#8B5CF6]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${stat.icon} text-white text-lg`}></i>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property, tenant, owner or tenancy ref..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
          </div>
          <div className="relative dropdown-trigger">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
            >
              <span>Status: {statusFilter === "All" ? "All" : scheduleStatusLabel[statusFilter]}</span>
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </div>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[140px]">
                {["All", "active", "paused", "ended"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setStatusDropdown(false) }}
                    className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap"
                  >
                    {s === "All" ? "All Statuses" : scheduleStatusLabel[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden md:table-cell">Tenant</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden lg:table-cell">Owner</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Rent</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden xl:table-cell">Frequency</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Due Day</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden lg:table-cell">Next Due</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/property/${s.propertyId}`} className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors">
                        {s.propertyName}
                      </Link>
                      <p className="text-xs text-[#94A3B8]">{s.tenancyRef}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-[#3A3F3A]">{s.tenantName}</p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-sm text-[#3A3F3A]">{s.ownerName}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-medium text-[#3A3F3A]">£{s.rentAmount.toLocaleString()}</p>
                      <p className="text-xs text-[#94A3B8]">{frequencyLabel[s.frequency]}</p>
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <span className="text-sm text-[#687068]">{frequencyLabel[s.frequency]}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#3A3F3A] font-medium">{s.dueDay}{s.dueDay === 1 ? "st" : s.dueDay === 2 ? "nd" : s.dueDay === 3 ? "rd" : "th"}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`text-sm ${s.scheduleStatus === "active" ? "text-[#3A3F3A] font-medium" : "text-[#94A3B8]"}`}>{s.nextDueDate}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scheduleStatusBadge[s.scheduleStatus]}`}>
                        {scheduleStatusLabel[s.scheduleStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailOpen(s)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F1F5F9] transition-colors"
                          title="View"
                        >
                          <i className="ri-eye-line text-[#687068] text-xs"></i>
                        </button>
                        <button
                          onClick={() => {
                            setEditModalOpen(s)
                            setFormData({
                              propertyName: s.propertyName,
                              tenantName: s.tenantName,
                              ownerName: s.ownerName,
                              rentAmount: s.rentAmount.toString(),
                              frequency: s.frequency,
                              dueDay: s.dueDay.toString(),
                              tenancyRef: s.tenancyRef,
                              paymentMethod: s.paymentMethod,
                              depositAmount: s.depositAmount.toString(),
                              depositScheme: s.depositScheme,
                            })
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F1F5F9] transition-colors"
                          title="Edit"
                        >
                          <i className="ri-edit-line text-[#687068] text-xs"></i>
                        </button>
                        {s.scheduleStatus !== "ended" && (
                          <>
                            <button
                              onClick={() => setPauseConfirm(s)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FEF3C7] transition-colors"
                              title={s.scheduleStatus === "active" ? "Pause" : "Resume"}
                            >
                              <i className={`${s.scheduleStatus === "active" ? "ri-pause-circle-line" : "ri-play-circle-line"} text-[#D4A85C] text-xs`}></i>
                            </button>
                            <button
                              onClick={() => setEndConfirm(s)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FEE2E2] transition-colors"
                              title="End Schedule"
                            >
                              <i className="ri-stop-circle-line text-[#C46868] text-xs"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-calendar-schedule-line text-[#94A3B8] text-xl"></i>
                      </div>
                      <p className="text-sm text-[#94A3B8]">No rent schedules found</p>
                      <p className="text-xs text-[#94A3B8] mt-1">Create a schedule or adjust your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(createModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setCreateModalOpen(false); setEditModalOpen(null) }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">{createModalOpen ? "Create Rent Schedule" : "Edit Rent Schedule"}</h3>
              <button onClick={() => { setCreateModalOpen(false); setEditModalOpen(null) }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Property *</label>
                <input type="text" value={formData.propertyName} onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })} placeholder="e.g. Rose Court Flat 2A" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Tenant</label>
                  <input type="text" value={formData.tenantName} onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })} placeholder="e.g. John Miller" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Owner</label>
                  <input type="text" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} placeholder="e.g. James Richardson" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Monthly Rent (£) *</label>
                  <input type="text" value={formData.rentAmount} onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })} placeholder="e.g. 1850" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Frequency</label>
                  <div className="flex items-center gap-1 bg-white border border-[#D5D9D5] rounded-lg p-1">
                    {(["monthly", "weekly", "fortnightly"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormData({ ...formData, frequency: f })}
                        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${formData.frequency === f ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F1F5F9]"}`}
                      >
                        {frequencyLabel[f]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Due Day</label>
                  <input type="text" value={formData.dueDay} onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })} placeholder="1" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Deposit (£)</label>
                  <input type="text" value={formData.depositAmount} onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })} placeholder="e.g. 1850" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Tenancy Ref</label>
                  <input type="text" value={formData.tenancyRef} onChange={(e) => setFormData({ ...formData, tenancyRef: e.target.value })} placeholder="e.g. TNCY-2024-001" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Payment Method</label>
                  <input type="text" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} placeholder="Bank Transfer" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={createModalOpen ? handleCreate : handleEdit} className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
                  {createModalOpen ? "Create Schedule" : "Save Changes"}
                </button>
                <button onClick={() => { setCreateModalOpen(false); setEditModalOpen(null) }} className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pauseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPauseConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-[#D4A85C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className={`${pauseConfirm.scheduleStatus === "active" ? "ri-pause-circle-line" : "ri-play-circle-line"} text-[#D4A85C] text-xl`}></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">
              {pauseConfirm.scheduleStatus === "active" ? "Pause Rent Schedule?" : "Resume Rent Schedule?"}
            </h3>
            <p className="text-sm text-[#687068] mb-4">
              {pauseConfirm.propertyName} — {pauseConfirm.tenantName}
              <br />
              <span className="text-xs">£{pauseConfirm.rentAmount}/month · Due {pauseConfirm.dueDay}{pauseConfirm.dueDay === 1 ? "st" : "th"}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPauseConfirm(null)} className="flex-1 text-sm font-medium text-[#687068] py-2.5 rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
              <button onClick={() => handlePause(pauseConfirm)} className={`flex-1 text-sm font-medium text-white py-2.5 rounded-lg transition-colors ${pauseConfirm.scheduleStatus === "active" ? "bg-[#D4A85C] hover:bg-[#D97706]" : "bg-[#7A9A7E] hover:bg-[#059669]"}`}>
                {pauseConfirm.scheduleStatus === "active" ? "Pause" : "Resume"}
              </button>
            </div>
          </div>
        </div>
      )}

      {endConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEndConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-[#C46868]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-stop-circle-line text-[#C46868] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">End Rent Schedule?</h3>
            <p className="text-sm text-[#687068] mb-4">
              {endConfirm.propertyName} — {endConfirm.tenantName}
              <br />
              <span className="text-xs">This will mark the schedule as ended. It cannot be automatically resumed.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setEndConfirm(null)} className="flex-1 text-sm font-medium text-[#687068] py-2.5 rounded-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
              <button onClick={() => handleEnd(endConfirm)} className="flex-1 bg-[#C46868] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#DC2626] transition-colors">End Schedule</button>
            </div>
          </div>
        </div>
      )}

      {detailOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${detailOpen.scheduleStatus === "active" ? "bg-[#7A9A7E]/10" : "bg-[#F1F5F9]"}`}>
                  <i className={`ri-calendar-schedule-line ${detailOpen.scheduleStatus === "active" ? "text-[#7A9A7E]" : "text-[#94A3B8]"} text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{detailOpen.propertyName}</h3>
                  <p className="text-xs text-[#687068]">{detailOpen.tenancyRef} · {scheduleStatusLabel[detailOpen.scheduleStatus]}</p>
                </div>
              </div>
              <button onClick={() => setDetailOpen(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Rent</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">£{detailOpen.rentAmount}</p>
                  <p className="text-[10px] text-[#687068]">{frequencyLabel[detailOpen.frequency]}</p>
                </div>
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Deposit</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">£{detailOpen.depositAmount}</p>
                  <p className="text-[10px] text-[#687068]">{detailOpen.depositScheme}</p>
                </div>
                <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#94A3B8]">Due Day</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">{detailOpen.dueDay}{detailOpen.dueDay === 1 ? "st" : "th"}</p>
                  <p className="text-[10px] text-[#687068]">{detailOpen.nextDueDate}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Tenant", value: detailOpen.tenantName },
                  { label: "Owner", value: detailOpen.ownerName },
                  { label: "Payment Method", value: detailOpen.paymentMethod },
                  { label: "Last Paid", value: detailOpen.lastPaidDate ? `${detailOpen.lastPaidDate} — £${detailOpen.lastPaidAmount}` : "No payments yet" },
                  { label: "Tenancy Status", value: detailOpen.tenancyStatus },
                  { label: "Schedule Status", value: scheduleStatusLabel[detailOpen.scheduleStatus] },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-xl">
                    <span className="text-xs text-[#94A3B8]">{row.label}</span>
                    <span className="text-sm font-medium text-[#3A3F3A]">{row.value}</span>
                  </div>
                ))}
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