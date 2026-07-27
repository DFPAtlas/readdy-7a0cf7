"use client";

import { useState, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  inventoryServices,
  inventoryProviders,
  inventoryProperties,
  initialRequests,
  propertyImages,
  statusStyles,
  statusLabels,
  statusIcons,
  InventoryServiceKey,
  InventoryProvider,
  InventoryRequest,
} from "./InventoryMarketplaceData";

const serviceCategories = [
  { key: "all", name: "All Services", icon: "ri-clipboard-line", color: "#C28A78" },
  { key: "move-in-out", name: "Move In & Out", icon: "ri-login-box-line", color: "#3B82F6" },
  { key: "routine", name: "Routine", icon: "ri-calendar-check-line", color: "#F59E0B" },
  { key: "inventory", name: "Inventory", icon: "ri-file-list-3-line", color: "#10B981" },
];

const categoryServiceMap: Record<string, InventoryServiceKey[]> = {
  "move-in-out": ["check_in", "check_out"],
  routine: ["mid_term"],
  inventory: ["inventory_creation", "inventory_verification"],
};

export default function InventoryMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeService, setActiveService] = useState<InventoryServiceKey | "all">("all");
  const [requests, setRequests] = useState<InventoryRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showProviderDetail, setShowProviderDetail] = useState<InventoryProvider | null>(null);
  const [showUploadPhotos, setShowUploadPhotos] = useState<InventoryRequest | null>(null);
  const [showUploadReport, setShowUploadReport] = useState<InventoryRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [newRequestForm, setNewRequestForm] = useState({
    propertyId: "",
    serviceKey: "check_in" as InventoryServiceKey,
    priority: "standard" as "standard" | "urgent",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeServiceData = inventoryServices.find((s) => s.key === activeService);

  const filteredRequests = useMemo(() => {
    let filtered = requests;
    if (activeCategory !== "all") {
      const services = categoryServiceMap[activeCategory] || [];
      filtered = filtered.filter((r) => services.includes(r.serviceKey));
    }
    if (activeService !== "all") {
      filtered = filtered.filter((r) => r.serviceKey === activeService);
    }
    return filtered;
  }, [requests, activeCategory, activeService]);

  const stats = useMemo(() => {
    return {
      active: requests.filter((r) => !["completed"].includes(r.status)).length,
      inProgress: requests.filter((r) => ["accepted", "in_progress", "photos_uploaded", "report_uploaded"].includes(r.status)).length,
      completed: requests.filter((r) => r.status === "completed").length,
      photosTotal: requests.reduce((sum, r) => sum + r.photoCount, 0),
      awaiting: requests.filter((r) => r.status === "requested").length,
    };
  }, [requests]);

  const handleNewRequest = () => {
    if (!newRequestForm.propertyId || !newRequestForm.serviceKey) return;
    const property = inventoryProperties.find((p) => p.id === newRequestForm.propertyId);
    const service = inventoryServices.find((s) => s.key === newRequestForm.serviceKey);
    if (!property || !service) return;

    const matchingProviders = inventoryProviders.filter((p) => p.serviceKeys.includes(newRequestForm.serviceKey)).slice(0, 2);

    const newReq: InventoryRequest = {
      id: `inv-req-${Date.now()}`,
      propertyId: property.id,
      propertyName: property.name,
      propertyAddress: `${property.address}, ${property.city} ${property.postcode}`,
      serviceKey: newRequestForm.serviceKey,
      serviceName: service.name,
      status: "requested",
      priority: newRequestForm.priority,
      requestedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      scheduledDate: new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      notes: newRequestForm.notes || `${service.name} requested for ${property.name}.`,
      providerIds: matchingProviders.map((p) => p.id),
      providers: matchingProviders,
      selectedProviderId: null,
      quoteAmount: null,
      quoteAccepted: false,
      inspectionDate: null,
      inspectorName: null,
      photosUploaded: false,
      photoCount: 0,
      reportUploaded: false,
      reportUrl: null,
      propertyUpdated: false,
      roomCount: property.bedrooms + 2,
    };

    setRequests((prev) => [newReq, ...prev]);
    setShowNewRequest(false);
    setNewRequestForm({ propertyId: "", serviceKey: "check_in", priority: "standard", notes: "" });
    showToast("Service requested. Providers will be notified.");
  };

  const handleAcceptProvider = (reqId: string, providerId: string) => {
    const provider = inventoryProviders.find((p) => p.id === providerId);
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        return {
          ...r,
          status: "accepted",
          selectedProviderId: providerId,
          quoteAmount: provider?.basePrice || null,
          quoteAccepted: true,
          inspectorName: provider?.contactName || null,
          inspectionDate: r.scheduledDate,
        };
      })
    );
    showToast("Provider accepted. Inspection scheduled.");
  };

  const handleStartInspection = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "in_progress" as const } : r))
    );
    showToast("Inspection marked as in progress.");
  };

  const handleUploadPhotos = (reqId: string) => {
    const photoCount = Math.floor(Math.random() * 30) + 15;
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "photos_uploaded" as const, photosUploaded: true, photoCount } : r))
    );
    setShowUploadPhotos(null);
    showToast(`${photoCount} photos uploaded.`);
  };

  const handleUploadReport = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "report_uploaded" as const, reportUploaded: true } : r))
    );
    setShowUploadReport(null);
    showToast("Report uploaded. Property records updated.");
  };

  const handleMarkComplete = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "completed" as const, propertyUpdated: true } : r))
    );
    showToast("Service completed. Property updated.");
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Inventory & Inspection Marketplace</h1>
            <p className="text-sm text-[#687068] mt-1">Book inventory clerks and inspection providers for Check In, Mid-Term, Check Out, Inventory Creation & Verification</p>
          </div>
          <button
            onClick={() => setShowNewRequest(true)}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Book Service
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Active", value: stats.active, icon: "ri-file-list-3-line", bg: "bg-[#3B82F6]" },
            { label: "In Progress", value: stats.inProgress, icon: "ri-time-line", bg: "bg-[#F59E0B]" },
            { label: "Completed", value: stats.completed, icon: "ri-check-double-line", bg: "bg-[#10B981]" },
            { label: "Photos Captured", value: stats.photosTotal, icon: "ri-image-line", bg: "bg-[#0EA5E9]" },
            { label: "Awaiting Provider", value: stats.awaiting, icon: "ri-user-search-line", bg: "bg-[#8B5CF6]" },
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
          <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Service Categories</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {serviceCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setActiveService("all"); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.key && activeService === "all"
                    ? "text-white shadow-md"
                    : "bg-white border border-[#E2E8F0] text-[#687068] hover:border-[#C28A78] hover:text-[#3A3F3A]"
                }`}
                style={activeCategory === cat.key && activeService === "all" ? { backgroundColor: cat.color } : undefined}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${cat.icon} text-sm`}></i>
                </div>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Service Types */}
        <div>
          <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Service Types</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {[{ key: "all", name: "All Types", icon: "ri-apps-line", color: "#C28A78", bg: "bg-[#C28A78]" } as any, ...inventoryServices].map((srv) => (
              <button
                key={srv.key}
                onClick={() => { setActiveService(srv.key); setActiveCategory("all"); }}
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
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Turnaround:</span> {activeServiceData.turnaroundDays}</span>
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Avg Cost:</span> {activeServiceData.averageCost}</span>
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Category:</span> {activeServiceData.category}</span>
                  <span className="text-xs text-[#687068]"><span className="font-medium text-[#3A3F3A]">Typical Rooms:</span> {activeServiceData.typicalRooms}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewRequestForm((f) => ({ ...f, serviceKey: activeServiceData.key }));
                  setShowNewRequest(true);
                }}
                className="bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line text-sm"></i>
                </div>
                Book This
              </button>
            </div>
          </div>
        )}

        {/* Requests */}
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
              <p className="text-xs text-[#94A3B8] mt-1">Click Book Service to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                          {propertyImages[req.propertyId] ? (
                            <img src={propertyImages[req.propertyId]} alt={req.propertyName} className="w-full h-full object-cover object-top" />
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
                            {req.priority === "urgent" && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444]">Urgent</span>
                            )}
                          </div>
                          <p className="text-xs text-[#687068] mt-0.5">{req.propertyName} — {req.propertyAddress}</p>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-[#94A3B8]">
                            <span>Requested: {req.requestedDate}</span>
                            <span>Scheduled: {req.scheduledDate}</span>
                            {req.inspectorName && <span>Inspector: {req.inspectorName}</span>}
                            <span>{req.roomCount} rooms</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {req.status === "requested" && (
                          <button
                            onClick={() => setSelectedRequest(selectedRequest?.id === req.id ? null : req)}
                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                          >
                            View Providers
                          </button>
                        )}
                        {req.status === "accepted" && (
                          <button
                            onClick={() => handleStartInspection(req.id)}
                            className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                          >
                            Start Inspection
                          </button>
                        )}
                        {req.status === "in_progress" && (
                          <button
                            onClick={() => setShowUploadPhotos(req)}
                            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                          >
                            Upload Photos
                          </button>
                        )}
                        {req.status === "photos_uploaded" && (
                          <button
                            onClick={() => setShowUploadReport(req)}
                            className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                          >
                            Upload Report
                          </button>
                        )}
                        {req.status === "report_uploaded" && (
                          <button
                            onClick={() => handleMarkComplete(req.id)}
                            className="bg-[#C28A78] hover:bg-[#143828] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                          >
                            Mark Complete
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
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                        >
                          <i className={`${selectedRequest?.id === req.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-[#94A3B8]`}></i>
                        </button>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-[#687068] mt-3 bg-[#F8FAFC] rounded-lg p-3">{req.notes}</p>
                    )}

                    {/* Flow Progress */}
                    <div className="flex items-center gap-1 mt-4 flex-wrap">
                      {[
                        { key: "requested", label: "Requested", icon: "ri-file-list-3-line" },
                        { key: "accepted", label: "Accepted", icon: "ri-check-line" },
                        { key: "in_progress", label: "Inspecting", icon: "ri-time-line" },
                        { key: "photos_uploaded", label: "Photos", icon: "ri-image-line" },
                        { key: "report_uploaded", label: "Report", icon: "ri-file-text-line" },
                        { key: "completed", label: "Completed", icon: "ri-check-double-line" },
                      ].map((step, idx) => {
                        const statusOrder = ["requested", "accepted", "in_progress", "photos_uploaded", "report_uploaded", "completed"];
                        const currentIdx = statusOrder.indexOf(req.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={step.key} className="flex items-center gap-1">
                            {idx > 0 && (
                              <div className={`w-6 h-0.5 rounded-full ${isDone ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}></div>
                            )}
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                                isCurrent ? "bg-[#10B981]/10 text-[#10B981]" : isDone ? "bg-[#F1F5F9] text-[#10B981]" : "bg-[#F1F5F9] text-[#94A3B8]"
                              }`}
                            >
                              <div className="w-3 h-3 flex items-center justify-center">
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
                      {/* Providers (for requested/accepted) */}
                      {["requested", "accepted"].includes(req.status) && (
                        <>
                          <h5 className="text-xs font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-user-star-line text-[#687068] text-xs"></i>
                            </div>
                            {req.status === "requested" ? "Available Providers" : "Selected Provider"} ({req.providers.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {req.providers.map((prov) => {
                              const isSelected = req.selectedProviderId === prov.id;
                              return (
                                <div
                                  key={prov.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg border bg-white transition-colors cursor-pointer ${
                                    isSelected ? "border-[#10B981] bg-[#10B981]/5" : "border-[#E2E8F0] hover:border-[#C28A78]"
                                  }`}
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
                                      {isSelected && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] flex-shrink-0">Selected</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-[#687068]">{prov.contactName}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs">
                                      <span className="text-[#F59E0B] font-medium">
                                        <i className="ri-star-fill text-[#F59E0B] text-[10px]"></i> {prov.rating}
                                      </span>
                                      <span className="text-[#94A3B8]">{prov.jobsCompleted} jobs</span>
                                      <span className="text-[#94A3B8]">{prov.responseTimeHours}h</span>
                                      <span className="text-[#94A3B8]">{prov.onTimeRate}% on-time</span>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-[#3A3F3A]">£{prov.basePrice}</p>
                                    <p className="text-[10px] text-[#94A3B8]">est.</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {req.status === "requested" && (
                            <div className="grid grid-cols-2 gap-3">
                              {req.providers.map((prov) => (
                                <button
                                  key={prov.id}
                                  onClick={() => handleAcceptProvider(req.id, prov.id)}
                                  className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium py-2 rounded-lg transition-colors cursor-pointer"
                                >
                                  Accept {prov.companyName} — £{prov.basePrice}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Inspection Summary (for in_progress and beyond) */}
                      {["in_progress", "photos_uploaded", "report_uploaded", "completed"].includes(req.status) && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                              <p className="text-[10px] text-[#94A3B8]">Inspector</p>
                              <p className="text-sm font-medium text-[#3A3F3A]">{req.inspectorName}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                              <p className="text-[10px] text-[#94A3B8]">Inspection Date</p>
                              <p className="text-sm font-medium text-[#3A3F3A]">{req.inspectionDate}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                              <p className="text-[10px] text-[#94A3B8]">Rooms</p>
                              <p className="text-sm font-medium text-[#3A3F3A]">{req.roomCount}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                              <p className="text-[10px] text-[#94A3B8]">Quote</p>
                              <p className="text-sm font-medium text-[#3A3F3A]">£{req.quoteAmount}</p>
                            </div>
                          </div>

                          {/* Photos Status */}
                          <div className="bg-white rounded-lg p-4 border border-[#E2E8F0] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${req.photosUploaded ? "bg-[#10B981]/10" : "bg-[#F1F5F9]"}`}>
                                <div className="w-5 h-5 flex items-center justify-center">
                                  <i className={`ri-image-line text-lg ${req.photosUploaded ? "text-[#10B981]" : "text-[#94A3B8]"}`}></i>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#3A3F3A]">Photos</p>
                                <p className="text-xs text-[#687068]">
                                  {req.photosUploaded ? `${req.photoCount} photos uploaded` : "Not yet uploaded"}
                                </p>
                              </div>
                            </div>
                            {req.status === "in_progress" && (
                              <button
                                onClick={() => setShowUploadPhotos(req)}
                                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Upload Now
                              </button>
                            )}
                          </div>

                          {/* Report Status */}
                          <div className="bg-white rounded-lg p-4 border border-[#E2E8F0] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${req.reportUploaded ? "bg-[#10B981]/10" : "bg-[#F1F5F9]"}`}>
                                <div className="w-5 h-5 flex items-center justify-center">
                                  <i className={`ri-file-text-line text-lg ${req.reportUploaded ? "text-[#10B981]" : "text-[#94A3B8]"}`}></i>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#3A3F3A]">Inspection Report</p>
                                <p className="text-xs text-[#687068]">
                                  {req.reportUploaded ? "Report uploaded" : "Awaiting upload"}
                                </p>
                              </div>
                            </div>
                            {req.status === "photos_uploaded" && (
                              <button
                                onClick={() => setShowUploadReport(req)}
                                className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Upload Now
                              </button>
                            )}
                          </div>

                          {/* Property Status */}
                          <div className={`rounded-lg p-3 flex items-center gap-3 ${req.propertyUpdated ? "bg-[#10B981]/10" : "bg-[#F59E0B]/10"}`}>
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              <i className={`${req.propertyUpdated ? "ri-check-line text-[#10B981]" : "ri-time-line text-[#F59E0B]"} text-sm`}></i>
                            </div>
                            <p className="text-xs">
                              {req.propertyUpdated
                                ? "Property records updated with latest inspection data"
                                : "Property records will be updated when report is uploaded and service is marked complete"}
                            </p>
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
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Book Inventory or Inspection Service</h3>
              <button onClick={() => setShowNewRequest(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Property */}
              <div>
                <label className="text-xs text-[#687068] mb-1.5 block font-medium">Select Property</label>
                <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto">
                  {inventoryProperties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => setNewRequestForm((f) => ({ ...f, propertyId: prop.id }))}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        newRequestForm.propertyId === prop.id
                          ? "border-[#C28A78] bg-[#C28A78]/5"
                          : "border-[#E2E8F0] hover:border-[#C28A78]"
                      }`}
                    >
                      <div className="w-12 h-9 rounded-md overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                        {propertyImages[prop.id] ? (
                          <img src={propertyImages[prop.id]} alt={prop.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-building-line text-[#94A3B8]"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3F3A]">{prop.name}</p>
                        <p className="text-xs text-[#687068]">{prop.address}, {prop.city} {prop.postcode} &middot; {prop.bedrooms} bed{prop.bathrooms ? ` &middot; ${prop.bathrooms} bath` : ""}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {prop.isFurnished && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#687068]">Furnished</span>}
                          {prop.isHMO && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6]">HMO</span>}
                          {prop.hasGarden && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981]">Garden</span>}
                          {prop.assignedTenant && (
                            <span className="text-[10px] text-[#94A3B8]">{prop.assignedTenant}</span>
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
                  {inventoryServices.map((srv) => (
                    <button
                      key={srv.key}
                      onClick={() => setNewRequestForm((f) => ({ ...f, serviceKey: srv.key }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all cursor-pointer ${
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
                        <p className="text-[10px] text-[#94A3B8]">{srv.averageCost}</p>
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
                      className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        newRequestForm.priority === p
                          ? p === "urgent" ? "bg-[#EF4444] text-white" : "bg-[#3B82F6] text-white"
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
                  className="flex-1 border border-[#E2E8F0] text-sm font-medium py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewRequest}
                  disabled={!newRequestForm.propertyId}
                  className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer ${
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
                <p className="text-xs text-[#687068]">{showProviderDetail.contactName}</p>
              </div>
              <button onClick={() => setShowProviderDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
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

              <div>
                <h4 className="text-xs font-semibold text-[#3A3F3A] mb-2">Services</h4>
                <div className="flex flex-wrap gap-1">
                  {showProviderDetail.serviceKeys.map((key) => {
                    const srv = inventoryServices.find((s) => s.key === key);
                    return (
                      <span key={key} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${srv?.bg || "bg-[#F1F5F9]"} text-white`}>
                        {srv?.name || key}
                      </span>
                    );
                  })}
                </div>
              </div>

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

              <div>
                <h4 className="text-xs font-semibold text-[#3A3F3A] mb-2">Service Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {showProviderDetail.serviceAreas.map((area, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068]">{area}</span>
                  ))}
                </div>
              </div>

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
            </div>
          </div>
        </div>
      )}

      {/* Upload Photos Modal */}
      {showUploadPhotos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowUploadPhotos(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Upload Inspection Photos</h3>
              <button onClick={() => setShowUploadPhotos(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-[#F8FAFC] rounded-lg p-3">
                <p className="text-xs text-[#94A3B8] mb-1">Service</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{showUploadPhotos.serviceName} — {showUploadPhotos.propertyName}</p>
                <p className="text-xs text-[#687068]">{showUploadPhotos.roomCount} rooms expected</p>
              </div>

              <div className="bg-[#0EA5E9]/10 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-[#0EA5E9] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-image-add-line text-white text-sm"></i>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#0EA5E9]">Drop photos here or click to browse</p>
                <p className="text-xs text-[#687068] mt-1">JPG or PNG — max 10MB each</p>
              </div>

              <div className="bg-[#F59E0B]/10 rounded-lg p-3 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line text-[#F59E0B] text-sm"></i>
                </div>
                <p className="text-xs text-[#F59E0B]">
                  Upload photos for each room. Photos will be linked to the inspection report and property records.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowUploadPhotos(null)}
                  className="flex-1 border border-[#E2E8F0] text-sm font-medium py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUploadPhotos(showUploadPhotos.id)}
                  className="flex-1 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Simulate Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowUploadReport(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Upload Inspection Report</h3>
              <button onClick={() => setShowUploadReport(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-[#F8FAFC] rounded-lg p-3">
                <p className="text-xs text-[#94A3B8] mb-1">Service</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{showUploadReport.serviceName} — {showUploadReport.propertyName}</p>
                <p className="text-xs text-[#687068]">{showUploadReport.photoCount} photos captured</p>
              </div>

              <div className="bg-[#10B981]/10 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-file-upload-line text-white text-sm"></i>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#10B981]">Drop report file here or click to browse</p>
                <p className="text-xs text-[#687068] mt-1">PDF — max 20MB</p>
              </div>

              <div className="bg-[#10B981]/10 rounded-lg p-3 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line text-[#10B981] text-sm"></i>
                </div>
                <p className="text-xs text-[#10B981]">
                  Uploading the report will automatically update property records and make it available in owner and tenant portals.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowUploadReport(null)}
                  className="flex-1 border border-[#E2E8F0] text-sm font-medium py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUploadReport(showUploadReport.id)}
                  className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Upload & Update Property
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