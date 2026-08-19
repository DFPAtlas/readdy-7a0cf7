"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  complianceServices,
  complianceProviders,
  complianceProperties,
  compliancePropertyImages,
  initialRequests,
  ComplianceService,
  ComplianceServiceKey,
  ComplianceProvider,
  ComplianceRequest,
  ComplianceQuote,
  ComplianceProperty,
} from "./ComplianceMarketplaceData";

const statusStyles: Record<string, string> = {
  draft: "bg-[#94A3B8]/10 text-[#94A3B8]",
  requested: "bg-[#3B82F6]/10 text-[#3B82F6]",
  quoting: "bg-[#F59E0B]/10 text-[#F59E0B]",
  quoted: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  approved: "bg-[#10B981]/10 text-[#10B981]",
  completed: "bg-[#10B981]/10 text-[#10B981]",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  requested: "Awaiting Quotes",
  quoting: "Providers Quoting",
  quoted: "Quotes Received",
  approved: "Approved",
  completed: "Completed",
};

const priorityColors: Record<string, string> = {
  standard: "bg-[#3B82F6]/10 text-[#3B82F6]",
  urgent: "bg-[#EF4444]/10 text-[#EF4444]",
};

const complianceHealthColors: Record<string, string> = {
  good: "bg-[#10B981]/10 text-[#10B981]",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
  critical: "bg-[#EF4444]/10 text-[#EF4444]",
};

export default function ComplianceMarketplacePage() {
  const [activeService, setActiveService] = useState<ComplianceServiceKey | "all">("all");
  const [requests, setRequests] = useState<ComplianceRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<ComplianceRequest | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showProviderDetail, setShowProviderDetail] = useState<ComplianceProvider | null>(null);
  const [showQuoteCompare, setShowQuoteCompare] = useState<ComplianceRequest | null>(null);
  const [showCertificateUpload, setShowCertificateUpload] = useState<ComplianceRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [newRequestForm, setNewRequestForm] = useState({
    propertyId: "",
    serviceKey: "epc" as ComplianceServiceKey,
    priority: "standard" as "standard" | "urgent",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const activeServiceData = complianceServices.find((s) => s.key === activeService);

  const filteredRequests = useMemo(() => {
    if (activeService === "all") return requests;
    return requests.filter((r) => r.serviceKey === activeService);
  }, [requests, activeService]);

  const stats = useMemo(() => {
    return {
      activeRequests: requests.filter((r) => r.status !== "completed").length,
      quotesReceived: requests.filter((r) => r.status === "quoted" || r.status === "approved").length,
      awaitingApproval: requests.filter((r) => r.status === "quoted").length,
      certificatesIssued: requests.filter((r) => r.status === "completed" && r.certificateUploaded).length,
      urgentCount: requests.filter((r) => r.priority === "urgent" && r.status !== "completed").length,
    };
  }, [requests]);

  const handleNewRequest = () => {
    if (!newRequestForm.propertyId || !newRequestForm.serviceKey) return;
    const property = complianceProperties.find((p) => p.id === newRequestForm.propertyId);
    const service = complianceServices.find((s) => s.key === newRequestForm.serviceKey);
    if (!property || !service) return;

    const matchingProviders = complianceProviders.filter((p) => p.serviceKey === newRequestForm.serviceKey);

    const newReq: ComplianceRequest = {
      id: `req-${Date.now()}`,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: `${property.address}, ${property.city}`,
      serviceKey: newRequestForm.serviceKey,
      serviceName: service.name,
      status: "requested",
      priority: newRequestForm.priority,
      requestedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      requiredBy: new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      notes: newRequestForm.notes || "Compliance service requested via marketplace.",
      providerIds: matchingProviders.slice(0, 2).map((p) => p.id),
      providers: matchingProviders.slice(0, 2),
      selectedProviderId: null,
      quotes: [],
      approvedQuoteId: null,
      certificateUploaded: false,
      complianceUpdated: false,
    };

    setRequests((prev) => [newReq, ...prev]);
    setShowNewRequest(false);
    setNewRequestForm({ propertyId: "", serviceKey: "epc", priority: "standard", notes: "" });
    showToast("Service request created. Providers will be notified.");
  };

  const handleRequestQuote = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        const simulatedQuotes: ComplianceQuote[] = r.providers.map((prov, idx) => ({
          id: `q-${reqId}-${idx + 1}`,
          providerId: prov.id,
          providerName: prov.companyName,
          amount: prov.basePrice + (idx === 0 ? 0 : Math.floor(Math.random() * 60 - 20)),
          estimatedDays: idx === 0 ? 2 : 3,
          includesVat: true,
          includesRemedial: idx === 1,
          submittedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          validUntil: new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          notes: `Quote provided for ${r.serviceName}. ${idx === 0 ? "Standard service within 48 hours." : "Includes remedial work if needed."}`,
          status: "submitted" as const,
        }));
        return { ...r, status: "quoted", quotes: simulatedQuotes };
      })
    );
    showToast("Quotes received from providers.");
  };

  const handleApproveQuote = (reqId: string, quoteId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        return {
          ...r,
          status: "approved",
          selectedProviderId: quoteId.split("-").slice(-1)[0] === "1" ? r.providers[0]?.id || null : r.providers[1]?.id || null,
          approvedQuoteId: quoteId,
          quotes: r.quotes.map((q) => ({ ...q, status: q.id === quoteId ? ("accepted" as const) : ("rejected" as const) })),
        };
      })
    );
    showToast("Quote approved. Provider will be notified.");
  };

  const handleUploadCertificate = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        return { ...r, certificateUploaded: true, complianceUpdated: true, status: "completed" };
      })
    );
    setShowCertificateUpload(null);
    showToast("Certificate uploaded. Compliance records updated.");
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Compliance Marketplace</h1>
            <p className="text-sm text-[#687068] mt-1">Source EPC, Gas Safety, EICR, Fire Safety & Legionella services from approved providers</p>
          </div>
          <button
            onClick={() => setShowNewRequest(true)}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Request Service
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Active Requests", value: stats.activeRequests, icon: "ri-file-list-3-line", bg: "bg-[#3B82F6]" },
            { label: "Quotes Received", value: stats.quotesReceived, icon: "ri-chat-quote-line", bg: "bg-[#8B5CF6]" },
            { label: "Awaiting Approval", value: stats.awaitingApproval, icon: "ri-time-line", bg: "bg-[#F59E0B]" },
            { label: "Certificates Issued", value: stats.certificatesIssued, icon: "ri-check-double-line", bg: "bg-[#10B981]" },
            { label: "Urgent", value: stats.urgentCount, icon: "ri-alert-line", bg: "bg-[#EF4444]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 flex items-center justify-center ${stat.bg} rounded-md`}>
                  <i className={`${stat.icon} text-white text-xs`}></i>
                </div>
                <span className="text-xs text-[#687068]">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Service Categories */}
        <div>
          <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Compliance Services</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {[{ key: "all", name: "All Services", icon: "ri-shield-check-line", color: "#C28A78", bg: "bg-[#C28A78]" } as any, ...complianceServices].map((srv) => (
              <button
                key={srv.key}
                onClick={() => setActiveService(srv.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeService === srv.key
                    ? "text-white shadow-md"
                    : "bg-white border border-[#E2E8F0] text-[#687068] hover:border-[#C28A78] hover:text-[#3A3F3A]"
                }`}
                style={activeService === srv.key ? { backgroundColor: srv.color } : undefined}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${srv.icon} text-sm`}></i>
                </div>
                {srv.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Service Info */}
        {activeServiceData && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${activeServiceData.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className={`${activeServiceData.icon} text-white text-xl`}></i>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#3A3F3A]">{activeServiceData.name}</h3>
                <p className="text-sm text-[#687068] mt-1">{activeServiceData.description}</p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Renewal:</span> {activeServiceData.renewalPeriod}</span>
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Avg Cost:</span> {activeServiceData.averageCost}</span>
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Turnaround:</span> {activeServiceData.turnaroundDays}</span>
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Legally Required:</span> {activeServiceData.requiredByLaw ? "Yes" : "No"}</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-2 italic">{activeServiceData.regulation}</p>
              </div>
              <button
                onClick={() => {
                  setNewRequestForm((f) => ({ ...f, serviceKey: activeServiceData.key }));
                  setShowNewRequest(true);
                }}
                className="bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line text-sm"></i>
                </div>
                Request This
              </button>
            </div>
          </div>
        )}

        {/* Request Flow */}
        <div>
          <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">
            {activeService === "all" ? "All Requests" : `${activeServiceData?.name || ""} Requests`}
          </h3>

          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-[#F1F5F9] rounded-full">
                <i className="ri-file-search-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#687068]">No requests for this service yet</p>
              <p className="text-xs text-[#94A3B8] mt-1">Click &quot;Request Service&quot; to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                  {/* Request Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Property Image */}
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                          {(compliancePropertyImages as any)[req.propertyId] ? (
                            <img
                              src={(compliancePropertyImages as any)[req.propertyId]}
                              alt={req.propertyName}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="ri-building-line text-[#94A3B8] text-lg"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-[#3A3F3A]">{req.serviceName}</h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[req.status]}`}>
                              {statusLabels[req.status]}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[req.priority]}`}>
                              {req.priority === "urgent" ? "Urgent" : "Standard"}
                            </span>
                          </div>
                          <p className="text-xs text-[#687068] mt-0.5">{req.propertyName} — {req.propertyAddress}</p>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-[#94A3B8]">
                            <span>Requested: {req.requestedDate}</span>
                            <span>Required by: {req.requiredBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {req.status === "requested" && (
                          <button
                            onClick={() => handleRequestQuote(req.id)}
                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Request Quotes
                          </button>
                        )}
                        {req.status === "quoted" && (
                          <button
                            onClick={() => setShowQuoteCompare(req)}
                            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Compare Quotes
                          </button>
                        )}
                        {req.status === "approved" && !req.certificateUploaded && (
                          <button
                            onClick={() => setShowCertificateUpload(req)}
                            className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Upload Certificate
                          </button>
                        )}
                        {req.status === "completed" && (
                          <span className="text-xs font-medium px-2 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center gap-1">
                            <div className="w-3 h-3 flex items-center justify-center">
                              <i className="ri-check-line text-[10px]"></i>
                            </div>
                            Complete
                          </span>
                        )}
                        <button
                          onClick={() => setSelectedRequest(selectedRequest?.id === req.id ? null : req)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                        >
                          <i className={`${selectedRequest?.id === req.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-[#94A3B8]`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    {req.notes && (
                      <p className="text-xs text-[#687068] mt-3 bg-[#F8FAFC] rounded-lg p-3">{req.notes}</p>
                    )}

                    {/* Flow Progress */}
                    <div className="flex items-center gap-1 mt-4">
                      {[
                        { key: "requested", label: "Requested", icon: "ri-file-list-3-line" },
                        { key: "quoting", label: "Quoting", icon: "ri-chat-quote-line" },
                        { key: "quoted", label: "Quoted", icon: "ri-file-text-line" },
                        { key: "approved", label: "Approved", icon: "ri-check-line" },
                        { key: "completed", label: "Certificate", icon: "ri-shield-check-line" },
                      ].map((step, idx) => {
                        const statusOrder = ["requested", "quoting", "quoted", "approved", "completed"];
                        const currentIdx = statusOrder.indexOf(req.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={step.key} className="flex items-center gap-1">
                            {idx > 0 && (
                              <div className={`w-8 h-0.5 rounded-full ${isDone ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}></div>
                            )}
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                                isCurrent ? "bg-[#10B981]/10 text-[#10B981]" : isDone ? "bg-[#F1F5F9] text-[#10B981]" : "bg-[#F1F5F9] text-[#94A3B8]"
                              }`}
                            >
                              <div className={`w-3 h-3 flex items-center justify-center`}>
                                <i className={`${step.icon} ${isDone ? "text-[#10B981]" : "text-[#94A3B8]"} text-[10px]`}></i>
                              </div>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {selectedRequest?.id === req.id && (
                    <div className="border-t border-[#E2E8F0] p-5 bg-[#F8FAFC]">
                      {/* Providers */}
                      <h5 className="text-xs font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-user-star-line text-[#687068] text-xs"></i>
                        </div>
                        Approved Providers ({req.providers.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {req.providers.map((prov) => (
                          <div
                            key={prov.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#C28A78] transition-colors cursor-pointer"
                            onClick={() => setShowProviderDetail(prov)}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                              <img src={prov.avatar} alt={prov.companyName} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-[#3A3F3A] truncate">{prov.companyName}</p>
                                {prov.verified && (
                                  <div className="w-3.5 h-3.5 flex items-center justify-center bg-[#3B82F6] rounded-full flex-shrink-0">
                                    <i className="ri-verified-badge-fill text-white text-[8px]"></i>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-[#687068]">{prov.accreditation}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs">
                                <span className="text-[#F59E0B] font-medium">
                                  <i className="ri-star-fill text-[#F59E0B] text-[10px]"></i> {prov.rating}
                                </span>
                                <span className="text-[#94A3B8]">{prov.jobsCompleted} jobs</span>
                                <span className="text-[#94A3B8]">{prov.responseTimeHours}h response</span>
                                <span className="text-[#94A3B8]">{prov.onTimeRate}% on-time</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-[#3A3F3A]">£{prov.basePrice}</p>
                              <p className="text-[10px] text-[#94A3B8]">est. cost</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quotes if available */}
                      {req.quotes.length > 0 && (
                        <>
                          <h5 className="text-xs font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-file-text-line text-[#687068] text-xs"></i>
                            </div>
                            Quotes ({req.quotes.length})
                          </h5>
                          <div className="space-y-2 mb-4">
                            {req.quotes.map((quote) => (
                              <div
                                key={quote.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  quote.status === "accepted"
                                    ? "border-[#10B981] bg-[#10B981]/5"
                                    : quote.status === "rejected"
                                    ? "border-[#EF4444]/20 bg-[#EF4444]/5 opacity-60"
                                    : "border-[#E2E8F0] bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    quote.status === "accepted" ? "bg-[#10B981]" : quote.status === "rejected" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                                  }`}></div>
                                  <div>
                                    <p className="text-sm font-medium text-[#3A3F3A]">{quote.providerName}</p>
                                    <p className="text-xs text-[#94A3B8]">{quote.notes}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-[#3A3F3A]">£{quote.amount}</p>
                                    <p className="text-[10px] text-[#94A3B8]">{quote.includesVat ? "inc. VAT" : "ex. VAT"} &middot; {quote.estimatedDays}d</p>
                                  </div>
                                  {quote.status === "submitted" && (
                                    <button
                                      onClick={() => handleApproveQuote(req.id, quote.id)}
                                      className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {quote.status === "accepted" && (
                                    <span className="text-xs font-medium text-[#10B981] flex items-center gap-1">
                                      <div className="w-3 h-3 flex items-center justify-center">
                                        <i className="ri-check-line text-[10px]"></i>
                                      </div>
                                      Accepted
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Certificate / Compliance status */}
                      {req.status === "completed" && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#10B981]/10">
                          <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-shield-check-line text-white text-sm"></i>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#10B981]">Certificate Uploaded & Compliance Updated</p>
                            <p className="text-xs text-[#687068]">Compliance records, expiry dates and property health score have been updated.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowNewRequest(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Request Compliance Service</h3>
              <button onClick={() => setShowNewRequest(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Property Selector */}
              <div>
                <label className="text-xs text-[#687068] mb-1.5 block font-medium">Select Property</label>
                <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto">
                  {complianceProperties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setNewRequestForm((f) => ({ ...f, propertyId: prop.id }))}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                        newRequestForm.propertyId === prop.id
                          ? "border-[#C28A78] bg-[#C28A78]/5"
                          : "border-[#E2E8F0] hover:border-[#C28A78]"
                      }`}
                    >
                      <div className="w-12 h-9 rounded-md overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                        {(compliancePropertyImages as any)[prop.id] ? (
                          <img src={(compliancePropertyImages as any)[prop.id]} alt={prop.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-building-line text-[#94A3B8]"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3F3A]">{prop.name}</p>
                        <p className="text-xs text-[#687068]">{prop.address}, {prop.city} {prop.postcode} &middot; {prop.bedCount} bed</p>
                        <div className="flex items-center gap-2 mt-1">
                          {prop.epcRating && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#687068]">
                              EPC {prop.epcRating}
                            </span>
                          )}
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${complianceHealthColors[prop.complianceHealth]}`}>
                            {prop.complianceHealth === "critical" ? "Critical" : prop.complianceHealth === "warning" ? "Needs Attention" : "Good"}
                          </span>
                          {prop.expiredCount > 0 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444]">
                              {prop.expiredCount} expired
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="text-xs text-[#687068] mb-1.5 block font-medium">Service Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {complianceServices.map((srv) => (
                    <button
                      key={srv.key}
                      onClick={() => setNewRequestForm((f) => ({ ...f, serviceKey: srv.key }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                        newRequestForm.serviceKey === srv.key
                          ? "border-[#C28A78] bg-[#C28A78]/5"
                          : "border-[#E2E8F0] hover:border-[#C28A78]"
                      }`}
                    >
                      <div className={`w-8 h-8 ${srv.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${srv.icon} text-white text-sm`}></i>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#3A3F3A] truncate">{srv.name}</p>
                        <p className="text-[10px] text-[#94A3B8]">{srv.renewalPeriod}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-[#687068] mb-1.5 block font-medium">Priority</label>
                <div className="flex items-center gap-2">
                  {(["standard", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewRequestForm((f) => ({ ...f, priority: p }))}
                      className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all ${
                        newRequestForm.priority === p
                          ? p === "urgent"
                            ? "bg-[#EF4444] text-white"
                            : "bg-[#3B82F6] text-white"
                          : "bg-[#F1F5F9] text-[#687068] hover:text-[#3A3F3A]"
                      }`}
                    >
                      {p === "urgent" ? "Urgent" : "Standard"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-[#687068] mb-1.5 block font-medium">Notes</label>
                <textarea
                  value={newRequestForm.notes}
                  onChange={(e) => setNewRequestForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Describe what you need..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] resize-none"
                ></textarea>
                <p className="text-xs text-[#94A3B8] mt-1 text-right">Max 500 characters</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowNewRequest(false)}
                  className="flex-1 border border-[#E2E8F0] text-sm font-medium py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewRequest}
                  disabled={!newRequestForm.propertyId}
                  className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors ${
                    newRequestForm.propertyId
                      ? "bg-[#C28A78] hover:bg-[#143828] text-white"
                      : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
                  }`}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Detail Modal */}
      {showProviderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowProviderDetail(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={showProviderDetail.avatar} alt={showProviderDetail.companyName} className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">{showProviderDetail.companyName}</h3>
                  {showProviderDetail.verified && (
                    <div className="w-4 h-4 flex items-center justify-center bg-[#3B82F6] rounded-full">
                      <i className="ri-verified-badge-fill text-white text-[9px]"></i>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#687068]">{showProviderDetail.accreditation}</p>
              </div>
              <button onClick={() => setShowProviderDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Rating", value: `${showProviderDetail.rating}`, color: "text-[#F59E0B]", icon: "ri-star-fill" },
                  { label: "Jobs Done", value: String(showProviderDetail.jobsCompleted), color: "text-[#3A3F3A]", icon: "ri-briefcase-line" },
                  { label: "Response", value: `${showProviderDetail.responseTimeHours}h`, color: "text-[#3A3F3A]", icon: "ri-time-line" },
                  { label: "On-Time", value: `${showProviderDetail.onTimeRate}%`, color: "text-[#3A3F3A]", icon: "ri-check-line" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 bg-[#F8FAFC] rounded-lg">
                    <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-[#94A3B8]">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-xs font-semibold text-[#3A3F3A] mb-2">Certifications</h4>
                <div className="space-y-1.5">
                  {showProviderDetail.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-[#F8FAFC] rounded-lg px-3 py-2">
                      <span className="text-[#3A3F3A] font-medium">{cert.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cert.status === "Valid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                        {cert.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div>
                <h4 className="text-xs font-semibold text-[#3A3F3A] mb-2">Insurance</h4>
                <div className="space-y-1.5">
                  {showProviderDetail.insurance.map((ins, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-[#F8FAFC] rounded-lg px-3 py-2">
                      <div>
                        <span className="text-[#3A3F3A] font-medium">{ins.type}</span>
                        <span className="text-[#94A3B8] ml-2">{ins.provider}</span>
                      </div>
                      <span className="text-[#10B981] font-medium">{ins.coverAmount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <h4 className="text-xs font-semibold text-[#3A3F3A] mb-2">Service Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {showProviderDetail.serviceAreas.map((area, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068]">{area}</span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h4 className="text-xs font-semibold text-[#3A3F3A] mb-2">Recent Reviews</h4>
                <div className="space-y-2">
                  {showProviderDetail.reviews.map((rev, i) => (
                    <div key={i} className="bg-[#F8FAFC] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <i key={j} className={`${j < rev.rating ? "ri-star-fill" : "ri-star-line"} text-[#F59E0B] text-[10px]`}></i>
                          ))}
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">{rev.reviewer} &middot; {rev.date}</span>
                      </div>
                      <p className="text-xs text-[#3A3F3A]">{rev.text}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-1">{rev.jobType}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                Request Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Compare Modal */}
      {showQuoteCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowQuoteCompare(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Compare Quotes — {showQuoteCompare.serviceName}</h3>
              <button onClick={() => setShowQuoteCompare(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-[#687068]">{showQuoteCompare.propertyName} — {showQuoteCompare.propertyAddress}</p>
              {showQuoteCompare.quotes.map((quote) => {
                const provider = showQuoteCompare.providers.find((p) => p.id === quote.providerId);
                return (
                  <div key={quote.id} className="border border-[#E2E8F0] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {provider && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={provider.avatar} alt={quote.providerName} className="w-full h-full object-cover object-top" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{quote.providerName}</p>
                        {provider && <p className="text-xs text-[#687068]">Rating {provider.rating} &middot; {provider.jobsCompleted} jobs</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-[#F8FAFC] rounded-lg p-2">
                        <p className="text-[10px] text-[#94A3B8]">Quote Amount</p>
                        <p className="text-lg font-bold text-[#3A3F3A]">£{quote.amount}</p>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2">
                        <p className="text-[10px] text-[#94A3B8]">Est. Completion</p>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{quote.estimatedDays} days</p>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2">
                        <p className="text-[10px] text-[#94A3B8]">VAT</p>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{quote.includesVat ? "Included" : "Excluded"}</p>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2">
                        <p className="text-[10px] text-[#94A3B8]">Remedial Work</p>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{quote.includesRemedial ? "Included" : "Not Included"}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#687068] mb-3 italic">{quote.notes}</p>
                    <p className="text-[10px] text-[#94A3B8] mb-3">Valid until: {quote.validUntil}</p>
                    <button
                      onClick={() => handleApproveQuote(showQuoteCompare.id, quote.id)}
                      className="w-full bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                    >
                      Approve This Quote — £{quote.amount}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Upload Modal */}
      {showCertificateUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCertificateUpload(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Upload Certificate</h3>
              <button onClick={() => setShowCertificateUpload(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-[#F8FAFC] rounded-lg p-3">
                <p className="text-xs text-[#94A3B8] mb-1">Service</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{showCertificateUpload.serviceName}</p>
                <p className="text-xs text-[#687068]">{showCertificateUpload.propertyName}</p>
              </div>

              <div className="bg-[#10B981]/10 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-upload-cloud-line text-white text-sm"></i>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#10B981]">Drag & drop certificate file</p>
                <p className="text-xs text-[#687068] mt-1">PDF, JPG or PNG — max 10MB</p>
              </div>

              <div className="bg-[#F59E0B]/10 rounded-lg p-3 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line text-[#F59E0B] text-sm"></i>
                </div>
                <p className="text-xs text-[#F59E0B]">
                  Uploading this certificate will automatically update compliance records, expiry dates, and property health scores.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCertificateUpload(null)}
                  className="flex-1 border border-[#E2E8F0] text-sm font-medium py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUploadCertificate(showCertificateUpload.id)}
                  className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  Upload & Update Compliance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-[#3A3F3A] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-bounce">
          {toast}
        </div>
      )}
    </DashboardShell>
  );
}