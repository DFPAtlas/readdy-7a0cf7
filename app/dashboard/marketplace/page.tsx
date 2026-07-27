"use client";

import { useState, useMemo } from "react";
import { marketplaceContractors, serviceCategories, assignedContractors, pendingQuotes, tradeIconMap, tradeColorMap } from "./MarketplaceData";
import { CONTRACTOR_STATUS, QUOTE_STATUS, getStatusConfig } from "@/lib/contractorSystem";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <i key={s} className={`text-xs ${s <= Math.round(rating) ? "ri-star-fill text-amber-400" : "ri-star-fill text-[#E2E8F0]"}`} />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Active": "bg-[#10B981]/10 text-[#10B981]",
    "active": "bg-[#10B981]/10 text-[#10B981]",
    "inactive": "bg-[#94A3B8]/10 text-[#94A3B8]",
    "pending": "bg-[#F59E0B]/10 text-[#F59E0B]",
    "Completed": "bg-[#10B981]/10 text-[#10B981]",
    "Quoted": "bg-[#3B82F6]/10 text-[#3B82F6]",
    "Approved": "bg-[#8B5CF6]/10 text-[#8B5CF6]",
    "Awaiting Quote": "bg-[#F59E0B]/10 text-[#F59E0B]",
    "Pending Approval": "bg-[#F97316]/10 text-[#F97316]",
    "Submitted": "bg-[#0EA5E9]/10 text-[#0EA5E9]",
    "In Progress": "bg-[#6366F1]/10 text-[#6366F1]",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${styles[status] || "bg-[#F1F5F9] text-[#687068]"}`}>
      {status}
    </span>
  );
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "assigned" | "quotes">("marketplace");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);
  const [quoteJobTitle, setQuoteJobTitle] = useState("");
  const [quoteProperty, setQuoteProperty] = useState("");
  const [quoteDescription, setQuoteDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTrade, setInviteTrade] = useState("");
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredContractors = useMemo(() => {
    return marketplaceContractors.filter((c) => {
      if (selectedCategory !== "all") {
        const cat = serviceCategories.find((sc) => sc.key === selectedCategory);
        if (cat && c.trade !== cat.label) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = c.companyName.toLowerCase().includes(q) || c.trade.toLowerCase().includes(q) || c.serviceAreas.some((a) => a.toLowerCase().includes(q)) || c.bio.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (minRating > 0 && c.rating < minRating) return false;
      if (availableOnly && !c.available) return false;
      return true;
    });
  }, [selectedCategory, searchQuery, minRating, availableOnly]);

  const selectedContractorData = selectedContractorId ? marketplaceContractors.find((c) => c.id === selectedContractorId) : null;

  const activeCount = marketplaceContractors.filter((c) => c.status === "active").length;
  const topRatedCount = marketplaceContractors.filter((c) => c.rating >= 4.5).length;
  const availableNow = marketplaceContractors.filter((c) => c.available).length;
  const totalJobsCompleted = marketplaceContractors.reduce((s, c) => s + c.completedJobs, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#3A3F3A] text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-slide-in">
          <i className={`text-sm ${toast.type === "success" ? "ri-check-line text-[#10B981]" : "ri-error-warning-line text-[#F59E0B]"}`}></i>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">Property Services Marketplace</h1>
          <p className="text-sm text-[#687068] mt-1">Find, hire and manage trusted contractors across all trades</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#C28A78]/90 transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-user-add-line text-sm w-4 h-4 flex items-center justify-center"></i>
            Invite Contractor
          </button>
          <button onClick={() => setShowQuoteModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#C28A78] text-sm font-medium rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-file-list-3-line text-sm w-4 h-4 flex items-center justify-center"></i>
            Request Quote
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Contractors", value: marketplaceContractors.length, icon: "ri-team-line", color: "#3B82F6" },
          { label: "Active & Verified", value: activeCount, icon: "ri-shield-check-line", color: "#10B981" },
          { label: "Available Now", value: availableNow, icon: "ri-time-line", color: "#F59E0B" },
          { label: "Jobs Completed", value: totalJobsCompleted, icon: "ri-check-double-line", color: "#8B5CF6" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}10` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg px-4 py-2 flex items-center gap-2">
        <i className="ri-information-line text-[#D4A85C] text-sm"></i>
        <span className="text-xs text-[#92400E]">Marketplace shows sample data for demonstration. Live contractor data will appear once connected.</span>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1 w-fit">
        {[
          { key: "marketplace", label: "Marketplace", icon: "ri-store-2-line" },
          { key: "assigned", label: "My Contractors", icon: "ri-user-star-line" },
          { key: "quotes", label: "Quotes", icon: "ri-file-list-3-line" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
          >
            <i className={`${tab.icon} text-sm w-4 h-4 flex items-center justify-center`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* === MARKETPLACE TAB === */}
      {activeTab === "marketplace" && (
        <>
          {/* Search + Filters */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  placeholder="Search contractors, trades, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#C28A78] bg-[#F8FAFC]"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${showFilters ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#3A3F3A] border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}
              >
                <i className="ri-equalizer-line text-sm w-4 h-4 flex items-center justify-center"></i>
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#687068]">Min Rating:</span>
                  {[0, 3, 3.5, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors whitespace-nowrap cursor-pointer ${minRating === r ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]"}`}
                    >
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-[#687068] cursor-pointer">
                    <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="w-3.5 h-3.5 accent-[#C28A78]" />
                    Available now only
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            {serviceCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${selectedCategory === cat.key ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78] hover:text-[#C28A78]"}`}
              >
                <i className={`${cat.icon} text-xs w-3.5 h-3.5 flex items-center justify-center`}></i>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#687068]">
              <span className="font-medium text-[#3A3F3A]">{filteredContractors.length}</span> contractor{filteredContractors.length !== 1 ? "s" : ""} found
              {selectedCategory !== "all" && <> in <span className="font-medium text-[#3A3F3A]">{serviceCategories.find((c) => c.key === selectedCategory)?.label}</span></>}
            </p>
          </div>

          {/* Contractor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredContractors.map((contractor) => {
              const tradeColor = tradeColorMap[contractor.trade] || "#687068";
              const tradeIcon = tradeIconMap[contractor.trade] || "ri-building-4-line";
              return (
                <div key={contractor.id} className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#C28A78]/30 hover:shadow-md transition-all overflow-hidden group">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <img src={contractor.avatar} alt={contractor.companyName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 object-top" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-[#3A3F3A] text-sm">{contractor.companyName}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-[#687068] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full">{contractor.trade}</span>
                              {contractor.available && (
                                <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full">Available</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <i className="ri-star-fill text-amber-400 text-xs"></i>
                              <span className="text-sm font-bold text-[#3A3F3A]">{contractor.rating}</span>
                            </div>
                            <p className="text-[10px] text-[#94A3B8]">{contractor.reviews.length} reviews</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F1F5F9]">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-[#3A3F3A]">{contractor.completedJobs}</p>
                        <p className="text-[10px] text-[#94A3B8]">Jobs done</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-[#3A3F3A]">{contractor.responseTimeHours}h</p>
                        <p className="text-[10px] text-[#94A3B8]">Response</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-[#3A3F3A]">{contractor.onTimeRate}%</p>
                        <p className="text-[10px] text-[#94A3B8]">On time</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3">
                      {contractor.certifications.slice(0, 3).map((cert, i) => (
                        <span key={i} className="text-[10px] bg-[#F1F5F9] text-[#687068] px-1.5 py-0.5 rounded-full">{cert.name}</span>
                      ))}
                      {contractor.certifications.length > 3 && (
                        <span className="text-[10px] text-[#94A3B8]">+{contractor.certifications.length - 3}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-[#94A3B8]">Areas:</span>
                      {contractor.serviceAreas.slice(0, 3).map((area) => (
                        <span key={area} className="text-[10px] text-[#C28A78] bg-[#C28A78]/5 px-1.5 py-0.5 rounded-full">{area}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex border-t border-[#E2E8F0]">
                    <button
                      onClick={() => { setSelectedContractorId(contractor.id); setShowDetailPanel(true); }}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-eye-line text-sm w-4 h-4 flex items-center justify-center"></i>
                      View Profile
                    </button>
                    <div className="w-px bg-[#E2E8F0]" />
                    <button
                      onClick={() => {
                        setSelectedContractor(contractor.id);
                        setQuoteJobTitle("");
                        setQuoteProperty("");
                        setQuoteDescription("");
                        setShowQuoteModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-[#C28A78] hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-file-list-3-line text-sm w-4 h-4 flex items-center justify-center"></i>
                      Request Quote
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredContractors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                <i className="ri-search-line text-[#94A3B8] text-2xl"></i>
              </div>
              <p className="text-sm text-[#687068]">No contractors match your filters.</p>
              <button onClick={() => { setSelectedCategory("all"); setSearchQuery(""); setMinRating(0); setAvailableOnly(false); }} className="mt-2 text-sm text-[#C28A78] font-medium hover:underline cursor-pointer whitespace-nowrap">
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}

      {/* === MY CONTRACTORS TAB === */}
      {activeTab === "assigned" && (
        <div className="space-y-4">
          {assignedContractors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                <i className="ri-user-star-line text-[#94A3B8] text-2xl"></i>
              </div>
              <p className="text-sm text-[#687068]">No contractors assigned yet.</p>
              <button onClick={() => setActiveTab("marketplace")} className="mt-2 text-sm text-[#C28A78] font-medium hover:underline cursor-pointer whitespace-nowrap">
                Browse marketplace
              </button>
            </div>
          ) : (
            assignedContractors.map((ac) => {
              const contractor = marketplaceContractors.find((c) => c.id === ac.contractorId);
              return (
                <div key={`${ac.contractorId}-${ac.jobTitle}`} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {contractor && (
                    <img src={contractor.avatar} alt={ac.contractorName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 object-top" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#3A3F3A] text-sm">{ac.contractorName}</h3>
                      <span className="text-xs text-[#687068] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full">{ac.trade}</span>
                      <StatusBadge status={ac.status} />
                    </div>
                    <p className="text-sm text-[#3A3F3A] mt-1">{ac.jobTitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#687068]">{ac.property}</span>
                      <span className="text-xs text-[#94A3B8]">Assigned {ac.assignedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ac.quoteAmount && (
                      <span className="text-sm font-bold text-[#3A3F3A]">£{ac.quoteAmount.toLocaleString()}</span>
                    )}
                    <button className="px-3 py-1.5 text-xs font-medium bg-[#C28A78] text-white rounded-lg hover:bg-[#C28A78]/90 transition-colors whitespace-nowrap cursor-pointer">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* === QUOTES TAB === */}
      {activeTab === "quotes" && (
        <div className="space-y-4">
          {pendingQuotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                <i className="ri-file-list-3-line text-[#94A3B8] text-2xl"></i>
              </div>
              <p className="text-sm text-[#687068]">No quotes pending.</p>
              <button onClick={() => setActiveTab("marketplace")} className="mt-2 text-sm text-[#C28A78] font-medium hover:underline cursor-pointer whitespace-nowrap">
                Request a quote
              </button>
            </div>
          ) : (
            pendingQuotes.map((pq) => {
              const contractor = marketplaceContractors.find((c) => c.id === pq.contractorId);
              return (
                <div key={pq.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {contractor && (
                    <img src={contractor.avatar} alt={pq.contractorName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 object-top" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#3A3F3A] text-sm">{pq.contractorName}</h3>
                      <span className="text-xs text-[#687068] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full">{pq.trade}</span>
                      <StatusBadge status={pq.status} />
                    </div>
                    <p className="text-sm text-[#3A3F3A] mt-1">{pq.jobTitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#687068]">{pq.property}</span>
                      <span className="text-xs text-[#94A3B8]">Requested {pq.requestedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pq.amount ? (
                      <span className="text-sm font-bold text-[#3A3F3A]">£{pq.amount.toLocaleString()}</span>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">Awaiting price</span>
                    )}
                    {pq.status === "Pending Approval" && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => showToast("Quote approved for " + pq.jobTitle)} className="px-3 py-1.5 text-xs font-medium bg-[#10B981] text-white rounded-lg hover:bg-[#10B981]/90 transition-colors whitespace-nowrap cursor-pointer">
                          Approve
                        </button>
                        <button onClick={() => showToast("Quote rejected", "warn")} className="px-3 py-1.5 text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/20 transition-colors whitespace-nowrap cursor-pointer">
                          Reject
                        </button>
                      </div>
                    )}
                    {pq.status === "Submitted" && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => showToast("Quote approved for " + pq.jobTitle)} className="px-3 py-1.5 text-xs font-medium bg-[#10B981] text-white rounded-lg hover:bg-[#10B981]/90 transition-colors whitespace-nowrap cursor-pointer">
                          Approve
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium bg-white text-[#687068] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors whitespace-nowrap cursor-pointer">
                          View
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* === DETAIL PANEL MODAL === */}
      {showDetailPanel && selectedContractorData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20" onClick={() => setShowDetailPanel(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <img src={selectedContractorData.avatar} alt={selectedContractorData.companyName} className="w-12 h-12 rounded-xl object-cover object-top" />
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{selectedContractorData.companyName}</h3>
                  <p className="text-xs text-[#687068]">{selectedContractorData.trade} · Member since {selectedContractorData.memberSince}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Rating", value: selectedContractorData.rating, suffix: "/5", icon: "ri-star-fill", color: "#F59E0B" },
                  { label: "Jobs Done", value: selectedContractorData.completedJobs, suffix: "", icon: "ri-check-double-line", color: "#10B981" },
                  { label: "Response", value: selectedContractorData.responseTimeHours + "h", suffix: "", icon: "ri-time-line", color: "#3B82F6" },
                  { label: "On Time", value: selectedContractorData.onTimeRate + "%", suffix: "", icon: "ri-timer-line", color: "#8B5CF6" },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 bg-[#F8FAFC] rounded-xl">
                    <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: `${s.color}15` }}>
                      <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                    </div>
                    <p className="text-lg font-bold text-[#3A3F3A]">{s.value}</p>
                    <p className="text-[10px] text-[#94A3B8]">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div>
                <h4 className="text-sm font-semibold text-[#3A3F3A] mb-1">About</h4>
                <p className="text-sm text-[#687068] leading-relaxed">{selectedContractorData.bio}</p>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-xl">
                  <i className="ri-mail-line text-[#94A3B8] text-sm"></i>
                  <span className="text-sm text-[#3A3F3A]">{selectedContractorData.email}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-xl">
                  <i className="ri-phone-line text-[#94A3B8] text-sm"></i>
                  <span className="text-sm text-[#3A3F3A]">{selectedContractorData.phone}</span>
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <h4 className="text-sm font-semibold text-[#3A3F3A] mb-2">Service Areas</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedContractorData.serviceAreas.map((area) => (
                    <span key={area} className="text-xs text-[#C28A78] bg-[#C28A78]/8 px-2.5 py-1 rounded-full">{area}</span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {selectedContractorData.certifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#3A3F3A] mb-2">Certifications</h4>
                  <div className="space-y-2">
                    {selectedContractorData.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                        <div className="flex items-center gap-2">
                          <i className="ri-file-shield-line text-[#3B82F6] text-sm"></i>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{cert.name}</p>
                            <p className="text-xs text-[#94A3B8]">{cert.issuer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{cert.status}</span>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">Expires {cert.expiry}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insurance */}
              {selectedContractorData.insurance.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#3A3F3A] mb-2">Insurance</h4>
                  <div className="space-y-2">
                    {selectedContractorData.insurance.map((ins, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                        <div className="flex items-center gap-2">
                          <i className="ri-shield-check-line text-[#10B981] text-sm"></i>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{ins.type}</p>
                            <p className="text-xs text-[#94A3B8]">{ins.provider} · {ins.coverAmount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{ins.status}</span>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">Expires {ins.expiry}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Jobs */}
              <div>
                <h4 className="text-sm font-semibold text-[#3A3F3A] mb-2">Recent Jobs</h4>
                <div className="space-y-2">
                  {selectedContractorData.recentJobs.map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                        <p className="text-xs text-[#94A3B8]">{job.property} · {job.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#3A3F3A]">£{job.amount.toLocaleString()}</span>
                        <StatusBadge status={job.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              {selectedContractorData.reviews.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#3A3F3A] mb-2">Reviews ({selectedContractorData.reviews.length})</h4>
                  <div className="space-y-3">
                    {selectedContractorData.reviews.map((rev, i) => (
                      <div key={i} className="p-3 bg-[#F8FAFC] rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#C28A78] flex items-center justify-center text-white text-xs font-bold">{rev.reviewer.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-medium text-[#3A3F3A]">{rev.reviewer}</p>
                              <p className="text-xs text-[#94A3B8]">{rev.jobType} · {rev.date}</p>
                            </div>
                          </div>
                          <RatingStars rating={rev.rating} />
                        </div>
                        <p className="text-sm text-[#687068] leading-relaxed mt-2">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => {
                    setShowDetailPanel(false);
                    setSelectedContractor(selectedContractorData.id);
                    setQuoteJobTitle("");
                    setQuoteProperty("");
                    setQuoteDescription("");
                    setShowQuoteModal(true);
                  }}
                  className="flex-1 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#C28A78]/90 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Request Quote
                </button>
                <button
                  onClick={() => showToast("Invitation sent to " + selectedContractorData.companyName)}
                  className="flex-1 py-2.5 bg-white text-[#C28A78] text-sm font-medium rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Assign Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === REQUEST QUOTE MODAL === */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowQuoteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#3A3F3A]">Request Quote</h3>
              <button onClick={() => setShowQuoteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selectedContractor && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl flex items-center gap-3">
                  <img src={marketplaceContractors.find((c) => c.id === selectedContractor)?.avatar} alt="" className="w-10 h-10 rounded-lg object-cover object-top" />
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{marketplaceContractors.find((c) => c.id === selectedContractor)?.companyName}</p>
                    <p className="text-xs text-[#687068]">{marketplaceContractors.find((c) => c.id === selectedContractor)?.trade}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#687068] mb-1.5">Job Title</label>
                <input type="text" value={quoteJobTitle} onChange={(e) => setQuoteJobTitle(e.target.value)} placeholder="e.g. Boiler repair" className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#C28A78]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#687068] mb-1.5">Property</label>
                <input type="text" value={quoteProperty} onChange={(e) => setQuoteProperty(e.target.value)} placeholder="e.g. Rose Court Flat 2A" className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#C28A78]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#687068] mb-1.5">Description</label>
                <textarea value={quoteDescription} onChange={(e) => setQuoteDescription(e.target.value)} placeholder="Describe the job..." rows={3} maxLength={500} className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#C28A78] resize-none" />
              </div>
              <button
                onClick={() => {
                  showToast("Quote request sent successfully!");
                  setShowQuoteModal(false);
                  setSelectedContractor(null);
                }}
                className="w-full py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#C28A78]/90 transition-colors whitespace-nowrap cursor-pointer"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === INVITE CONTRACTOR MODAL === */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#3A3F3A]">Invite Contractor</h3>
              <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#687068] mb-1.5">Contractor Email</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="contractor@example.com" className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#C28A78]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#687068] mb-1.5">Trade</label>
                <select value={inviteTrade} onChange={(e) => setInviteTrade(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#C28A78] bg-white pr-8">
                  <option value="">Select a trade...</option>
                  {serviceCategories.filter((c) => c.key !== "all").map((cat) => (
                    <option key={cat.key} value={cat.label}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                We'll send an invitation email with instructions to create their contractor profile and join the marketplace.
              </p>
              <button
                onClick={() => {
                  showToast("Invitation sent to " + (inviteEmail || "contractor"));
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteTrade("");
                }}
                className="w-full py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#C28A78]/90 transition-colors whitespace-nowrap cursor-pointer"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}