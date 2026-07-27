"use client";

import { useState } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { marketplaceContractors, type MarketplaceContractor } from "../ContractorMarketplaceData";
import { CONTRACTOR_STATUS, getStatusConfig } from "@/lib/contractorSystem";

const TABS = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "jobs", label: "Jobs", icon: "ri-tools-line" },
  { id: "quotes", label: "Quotes", icon: "ri-file-list-3-line" },
  { id: "compliance", label: "Documents & Compliance", icon: "ri-shield-check-line" },
  { id: "performance", label: "Performance", icon: "ri-bar-chart-2-line" },
  { id: "reviews", label: "Reviews", icon: "ri-star-line" },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <i key={s} className={`ri-star-fill text-sm ${s <= Math.round(rating) ? "text-amber-400" : "text-[#D5D9D5]"}`} />
      ))}
    </div>
  );
}

export default function ContractorDetail({ contractorId }: { contractorId: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const contractor = marketplaceContractors.find((c) => c.id === contractorId);

  if (!contractor) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-14 h-14 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="ri-user-unfollow-line text-[#94A3B8] text-2xl"></i>
          </div>
          <p className="text-sm text-[#94A3B8]">Contractor not found</p>
          <Link href="/dashboard/contractors" className="mt-3 inline-block text-sm text-[#C28A78] font-medium hover:underline">Back to Contractors</Link>
        </div>
      </div>
    );
  }

  const statusKey = (contractor.status || "").toLowerCase() === "active" ? "active" : (contractor.status || "").toLowerCase() === "inactive" ? "suspended" : "active";
  const statusCfg = CONTRACTOR_STATUS[statusKey] || CONTRACTOR_STATUS.active;

  const expiringDocs = contractor.insurance.filter((i) => i.status === "Expiring Soon" || i.status === "Expired").length;
  const hasAttention = expiringDocs > 0;
  const recentJobs = contractor.recentQuotes.filter((quote) => quote.status === "Completed" || quote.status === "Approved");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-[#687068]">
        <Link href="/dashboard/contractors" className="hover:text-[#C28A78] transition-colors">Contractors</Link>
        <i className="ri-arrow-right-s-line text-xs"></i>
        <span className="text-[#3A3F3A] font-medium">{contractor.name}</span>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#C28A78] to-[#D4A85C] relative" />
        <div className="px-6 pb-5 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <img src={contractor.avatar} alt={contractor.name} className="w-20 h-20 rounded-xl border-4 border-white object-cover shadow-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[#3A3F3A]">{contractor.name}</h2>
              <p className="text-sm text-[#687068]">{contractor.trade} · Member since {contractor.memberSince}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                  <i className={`${statusCfg.icon} mr-1 text-[10px]`}></i>
                  {statusCfg.label}
                </span>
                {contractor.categories.slice(0, 3).map((cat) => (
                  <span key={cat} className="text-xs text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <i className="ri-star-fill text-amber-400 text-sm"></i>
                  <span className="text-lg font-bold text-[#3A3F3A]">{contractor.rating}</span>
                </div>
                <p className="text-xs text-[#687068]">Rating</p>
              </div>
              <div className="w-px h-8 bg-[#D5D9D5]"></div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#3A3F3A]">{contractor.completedJobs}</p>
                <p className="text-xs text-[#687068]">Completed</p>
              </div>
              <div className="w-px h-8 bg-[#D5D9D5]"></div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#3A3F3A]">{contractor.totalJobs}</p>
                <p className="text-xs text-[#687068]">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attention Items */}
      {hasAttention && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-alert-line text-[#EF4444] text-sm"></i>
            <span className="text-sm font-semibold text-[#991B1B]">Attention Required</span>
          </div>
          {expiringDocs > 0 && (
            <p className="text-sm text-[#B91C1C]">{expiringDocs} insurance document{expiringDocs > 1 ? "s" : ""} expiring or expired. <button onClick={() => setActiveTab("compliance")} className="underline font-medium">Review documents</button></p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-2 border-b border-[#D5D9D5] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${activeTab === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F1F5F9]"}`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-mail-line text-[#94A3B8] text-xs"></i>
                      <span className="text-[#3A3F3A]">{contractor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-phone-line text-[#94A3B8] text-xs"></i>
                      <span className="text-[#3A3F3A]">{contractor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ri-money-pound-circle-line text-[#94A3B8] text-xs"></i>
                      <span className="text-[#3A3F3A]">VAT: {contractor.vatNumber}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Service Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {contractor.serviceAreas.map((area) => (
                        <span key={area} className="text-xs text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{area}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Bio</p>
                    <p className="text-sm text-[#3A3F3A] leading-relaxed">{contractor.bio}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Workload</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#D5D9D5]">
                      <p className="text-xs text-[#94A3B8]">Active Jobs</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">{Math.max(0, contractor.totalJobs - contractor.completedJobs)}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#D5D9D5]">
                      <p className="text-xs text-[#94A3B8]">Response Time</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">{contractor.responseTimeHours}h</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#D5D9D5]">
                      <p className="text-xs text-[#94A3B8]">On-Time Rate</p>
                      <p className="text-lg font-bold text-[#10B981]">{contractor.onTimeRate}%</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#D5D9D5]">
                      <p className="text-xs text-[#94A3B8]">Emergency</p>
                      <p className="text-sm font-medium text-[#3A3F3A]">{contractor.emergencyCallout ? contractor.emergencyFee : "Not available"}</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mt-4">Payment</h3>
                  <p className="text-sm text-[#687068]">Terms: {contractor.paymentTerms}</p>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Recent Jobs</h3>
              </div>
              {recentJobs.length === 0 ? (
                <p className="text-sm text-[#94A3B8] py-4 text-center">No recent jobs</p>
              ) : (
                recentJobs.map((job, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5]">
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{job.jobTitle}</p>
                      <p className="text-xs text-[#687068]">{job.property} · {job.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#C28A78]">£{job.total.toLocaleString()}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068]">{job.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quotes Tab */}
          {activeTab === "quotes" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Recent Quotes</h3>
              {contractor.recentQuotes.length === 0 ? (
                <p className="text-sm text-[#94A3B8] py-4 text-center">No recent quotes</p>
              ) : (
                contractor.recentQuotes.map((quote, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5]">
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{quote.jobTitle}</p>
                      <p className="text-xs text-[#687068]">{quote.property} · {quote.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#C28A78]">£{quote.total.toLocaleString()}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068]">{quote.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === "compliance" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Certifications</h3>
                <div className="space-y-2">
                  {contractor.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5]">
                      <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-file-shield-line text-[#3B82F6] text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#3A3F3A]">{cert.name}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cert.status === "Valid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{cert.status}</span>
                        </div>
                        <p className="text-xs text-[#687068] mt-0.5">{cert.issuer}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Expires {cert.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Insurance</h3>
                <div className="space-y-2">
                  {contractor.insurance.map((ins, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5]">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ins.status === "Valid" ? "bg-[#10B981]/10" : "bg-[#F59E0B]/10"}`}>
                        <i className={`ri-shield-check-line text-sm ${ins.status === "Valid" ? "text-[#10B981]" : "text-[#F59E0B]"}`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#3A3F3A]">{ins.type}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ins.status === "Valid" ? "bg-[#10B981]/10 text-[#10B981]" : ins.status === "Expiring Soon" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>{ins.status}</span>
                        </div>
                        <p className="text-xs text-[#687068] mt-0.5">{ins.provider} · Cover: {ins.coverAmount}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Expires {ins.expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Response Time", value: `${contractor.responseTimeHours}h`, icon: "ri-time-line", color: "#3B82F6" },
                  { label: "On-Time Rate", value: `${contractor.onTimeRate}%`, icon: "ri-timer-line", color: "#10B981" },
                  { label: "Completion Rate", value: `${contractor.totalJobs > 0 ? Math.round((contractor.completedJobs / contractor.totalJobs) * 100) : 0}%`, icon: "ri-check-double-line", color: "#8B5CF6" },
                  { label: "Avg Quote", value: `£${contractor.avgQuoteAmount}`, icon: "ri-money-pound-circle-line", color: "#F59E0B" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F8FAFC] rounded-lg p-3 border border-[#D5D9D5] text-center">
                    <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: `${s.color}15` }}>
                      <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                    </div>
                    <p className="text-lg font-bold text-[#3A3F3A]">{s.value}</p>
                    <p className="text-xs text-[#94A3B8]">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#D5D9D5]">
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Revenue This Year</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={contractor.monthlyRevenue}>
                      <defs>
                        <linearGradient id={`revGrad`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C28A78" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#C28A78" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#687068" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#687068" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                      <Tooltip formatter={(value: any) => [`£${value}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid #D5D9D5", fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#C28A78" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Reviews ({contractor.reviews.length})</h3>
              {contractor.reviews.map((review, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5]">
                  <div className="w-10 h-10 rounded-full bg-[#C28A78] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{review.name}</p>
                        <p className="text-xs text-[#94A3B8]">{review.property} · {review.jobType}</p>
                      </div>
                      <div className="text-right">
                        <RatingStars rating={review.rating} />
                        <p className="text-xs text-[#94A3B8] mt-0.5">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#3A3F3A] leading-relaxed mt-2">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}