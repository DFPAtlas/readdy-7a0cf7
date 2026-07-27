"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { contractorProfile, monthlyRevenue } from "../ContractorData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ContractorProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    companyName: contractorProfile.companyName,
    email: contractorProfile.email,
    phone: contractorProfile.phone,
    address: contractorProfile.address,
    city: contractorProfile.city,
    postcode: contractorProfile.postcode,
    vatNumber: contractorProfile.vatNumber,
    companyNumber: contractorProfile.companyNumber,
    bio: contractorProfile.bio,
  });

  const handleSave = () => {
    setEditMode(false);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">My Profile</h1>
            <p className="text-sm text-[#687068] mt-1">Manage your company profile, certifications, and settings</p>
          </div>
          <button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${editMode ? "ri-save-line" : "ri-pencil-line"} text-sm`}></i>
            </div>
            {editMode ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="h-32 bg-[#C28A78] relative">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#C28A78]"></div>
          </div>
          <div className="px-5 pb-5 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <img
                src={contractorProfile.avatar}
                alt={contractorProfile.companyName}
                className="w-24 h-24 rounded-xl border-4 border-white object-cover shadow-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                      className="w-full text-xl font-bold text-[#3A3F3A] border border-[#E2E8F0] rounded-lg px-3 py-1.5"
                    />
                    <div className="flex flex-wrap gap-2">
                      {contractorProfile.tradeTags.map((tag) => (
                        <span key={tag} className="text-xs text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-[#3A3F3A]">{contractorProfile.companyName}</h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {contractorProfile.tradeTags.map((tag) => (
                        <span key={tag} className="text-xs text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-0.5">
                    <i className="ri-star-fill text-amber-400 text-sm"></i>
                    <span className="text-lg font-bold text-[#3A3F3A]">{contractorProfile.rating}</span>
                  </div>
                  <p className="text-xs text-[#687068]">Rating</p>
                </div>
                <div className="w-px h-8 bg-[#E2E8F0]"></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#3A3F3A]">{contractorProfile.completedJobs}</p>
                  <p className="text-xs text-[#687068]">Completed</p>
                </div>
                <div className="w-px h-8 bg-[#E2E8F0]"></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#3A3F3A]">{contractorProfile.totalJobs}</p>
                  <p className="text-xs text-[#687068]">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#E2E8F0]">
          {[
            { id: "overview", label: "Overview", icon: "ri-user-3-line" },
            { id: "certifications", label: "Certifications", icon: "ri-file-shield-line" },
            { id: "insurance", label: "Insurance", icon: "ri-shield-check-line" },
            { id: "reviews", label: "Reviews", icon: "ri-star-line" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h3 className="font-semibold text-[#3A3F3A]">Company Information</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {editMode ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Email</label>
                      <input value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Phone</label>
                      <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Address</label>
                      <input value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">City</label>
                      <input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Postcode</label>
                      <input value={profileForm.postcode} onChange={(e) => setProfileForm({ ...profileForm, postcode: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">VAT Number</label>
                      <input value={profileForm.vatNumber} onChange={(e) => setProfileForm({ ...profileForm, vatNumber: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Company Number</label>
                      <input value={profileForm.companyNumber} onChange={(e) => setProfileForm({ ...profileForm, companyNumber: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Bio</label>
                      <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm resize-none" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-mail-line text-[#94A3B8] text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">Email</p>
                        <p className="text-sm text-[#3A3F3A]">{contractorProfile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-phone-line text-[#94A3B8] text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">Phone</p>
                        <p className="text-sm text-[#3A3F3A]">{contractorProfile.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-map-pin-line text-[#94A3B8] text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">Address</p>
                        <p className="text-sm text-[#3A3F3A]">{contractorProfile.address}, {contractorProfile.city} {contractorProfile.postcode}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-file-text-line text-[#94A3B8] text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">VAT Number</p>
                        <p className="text-sm text-[#3A3F3A]">{contractorProfile.vatNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-building-line text-[#94A3B8] text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">Company Number</p>
                        <p className="text-sm text-[#3A3F3A]">{contractorProfile.companyNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-calendar-line text-[#94A3B8] text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">Member Since</p>
                        <p className="text-sm text-[#3A3F3A]">{contractorProfile.memberSince}</p>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-[#94A3B8] mb-1">Bio</p>
                      <p className="text-sm text-[#3A3F3A] leading-relaxed">{contractorProfile.bio}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="font-semibold text-[#3A3F3A]">Revenue This Year</h3>
                <span className="text-sm text-[#687068]">Total: £8,392</span>
              </div>
              <div className="p-5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C28A78" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#C28A78" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#687068" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#687068" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                    <Tooltip formatter={(value: any) => [`£${value}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#C28A78" strokeWidth={2} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "certifications" && (
          <div className="space-y-3">
            {contractorProfile.certifications.map((cert, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-start gap-3">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-shield-line text-[#3B82F6] text-lg"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#3A3F3A]">{cert.name}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{cert.status}</span>
                  </div>
                  <p className="text-xs text-[#687068] mt-0.5">Issued by {cert.issuer}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-[#94A3B8]">Issued: {cert.date}</span>
                    <span className="text-xs text-[#94A3B8]">Expires: {cert.expiry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                    <i className="ri-eye-line text-[#687068] text-sm"></i>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                    <i className="ri-download-line text-[#687068] text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "insurance" && (
          <div className="space-y-3">
            {contractorProfile.insurance.map((ins, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ins.status === "Valid" ? "bg-[#10B981]/10" : "bg-[#F59E0B]/10"}`}>
                  <i className={`ri-shield-check-line text-lg ${ins.status === "Valid" ? "text-[#10B981]" : "text-[#F59E0B]"}`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#3A3F3A]">{ins.type} Insurance</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ins.status === "Valid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                      {ins.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#687068] mt-0.5">{ins.provider} · Policy {ins.policyNumber}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-[#94A3B8]">Cover: {ins.coverAmount}</span>
                    <span className="text-xs text-[#94A3B8]">Expires: {ins.expiry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                    <i className="ri-eye-line text-[#687068] text-sm"></i>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                    <i className="ri-download-line text-[#687068] text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#3A3F3A]">{contractorProfile.rating}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className={`ri-star-fill text-sm ${star <= Math.round(contractorProfile.rating) ? "text-amber-400" : "text-[#E2E8F0]"}`}></i>
                  ))}
                </div>
                <p className="text-xs text-[#687068] mt-1">{contractorProfile.totalJobs} reviews</p>
              </div>
              <div className="w-px h-16 bg-[#E2E8F0] mx-2"></div>
              <div className="flex-1 space-y-2">
                {[
                  { stars: 5, count: 38 },
                  { stars: 4, count: 6 },
                  { stars: 3, count: 2 },
                  { stars: 2, count: 1 },
                  { stars: 1, count: 1 },
                ].map((r) => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="text-xs text-[#687068] w-3">{r.stars}</span>
                    <i className="ri-star-fill text-xs text-amber-400"></i>
                    <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C28A78] rounded-full" style={{ width: `${(r.count / contractorProfile.totalJobs) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-[#687068] w-6 text-right">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "James Hart", date: "22 May 2026", rating: 5, text: "Excellent work, very tidy and professional. Tenant very happy. Will use again for future jobs." },
                { name: "Sarah Collins", date: "18 May 2026", rating: 4, text: "Good work, slightly delayed but quality was high. Communication could be improved on timing updates." },
                { name: "Sarah Collins", date: "15 May 2026", rating: 5, text: "Quick fix, tenant very satisfied. Arrived on time and solved the problem in minutes." },
              ].map((review, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#C28A78] flex items-center justify-center text-white text-sm font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{review.name}</p>
                        <p className="text-xs text-[#94A3B8]">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i key={s} className={`ri-star-fill text-sm ${s <= review.rating ? "text-amber-400" : "text-[#E2E8F0]"}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#3A3F3A] leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}