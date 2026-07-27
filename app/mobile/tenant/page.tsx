"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/MobileBottomNav";
import {
  tenantProfile,
  rentHistory,
  maintenanceRequests,
  tenantDocuments,
  tenantNotices,
  tenantMessages,
  tenantQuickActions,
  agentInfo,
  getStatusColor,
  getPriorityColor,
  getNoticeIcon,
} from "./data";

type Tab = "dashboard" | "maintenance" | "docs" | "notices" | "messages";

export default function MobileTenantPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [showNoticeDetail, setShowNoticeDetail] = useState<string | null>(null);
  const [showMessageDetail, setShowMessageDetail] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<{ blob: string; duration: number }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [reportForm, setReportForm] = useState({ title: "", category: "Plumbing", description: "", priority: "Medium" });
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRent = rentHistory[0];
  const nextDue = "1 July 2026";
  const openRequests = maintenanceRequests.filter((m) => m.status !== "Completed").length;
  const unreadNotices = tenantNotices.filter((n) => n.isNew).length;
  const unreadMessages = tenantMessages.filter((m) => m.isNew).length;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-trigger")) {
        setCategoryOpen(false);
        setPriorityOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setVoiceNotes((prev) => [...prev, { blob: url, duration: recordingTime }]);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      alert("Microphone access is required to record voice notes.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePhotoCapture = () => {
    const input = fileInputRef.current;
    if (input) input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length && photos.length + i < 5; i++) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError("");
    if (!reportForm.title || !reportForm.description) {
      setReportError("Please fill in all required fields.");
      return;
    }
    setReportSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.append("title", reportForm.title);
      body.append("category", reportForm.category);
      body.append("description", reportForm.description);
      body.append("priority", reportForm.priority);
      body.append("property", tenantProfile.propertyName);
      body.append("tenancy_ref", tenantProfile.tenancyRef);
      await fetch("https://readdy.ai/api/form/d8vemh04jh3v1cgksf2g", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch {}
    setReportSubmitting(false);
    setShowReportForm(false);
    setReportSuccess(true);
    setReportForm({ title: "", category: "Plumbing", description: "", priority: "Medium" });
    setTimeout(() => setReportSuccess(false), 4000);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const rentStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-[#10B981]/10 text-[#10B981]";
      case "pending": return "bg-[#F59E0B]/10 text-[#F59E0B]";
      case "overdue": return "bg-[#EF4444]/10 text-[#EF4444]";
      default: return "bg-[#94A3B8]/10 text-[#94A3B8]";
    }
  };

  return (
    <MobileLayout>
      <style>{`.honeypot-field{position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none}`}</style>

      {/* Header */}
      <div className="bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white px-4 pt-3 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] text-white/60">Tenant Dashboard</p>
            <h1 className="text-xl font-bold">{tenantProfile.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContactSheet(true)}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <i className="ri-customer-service-2-line text-lg"></i>
            </button>
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center text-sm font-bold">
              {tenantProfile.initials}
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-white/60">Current Rent</p>
            <p className="text-[11px] text-white/60">Due: {nextDue}</p>
          </div>
          <p className="text-3xl font-bold">£{currentRent.amount.toLocaleString()}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rentStatusBadge(currentRent.status)}`}>
              {currentRent.status === "paid" ? "Paid" : currentRent.status === "pending" ? "Pending" : "Overdue"}
            </span>
            <span className="text-[11px] text-white/60">{tenantProfile.propertyName}</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: "100%" }}></div>
            </div>
            <span className="text-[10px] text-white/70">On track</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-3">
        <div className="grid grid-cols-4 gap-2">
          {tenantQuickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.action === "report") setShowReportForm(true);
                else if (action.action === "photo") setShowPhotoUpload(true);
                else if (action.action === "contact") setShowContactSheet(true);
                else if (action.action === "docs") setActiveTab("docs");
              }}
              className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: action.color + "14" }}
              >
                <i className={`${action.icon} text-lg`} style={{ color: action.color }}></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] text-center leading-tight whitespace-nowrap">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl overflow-x-auto">
          {([
            { key: "dashboard" as Tab, label: "Home" },
            { key: "maintenance" as Tab, label: "Repairs", badge: openRequests },
            { key: "docs" as Tab, label: "Docs" },
            { key: "notices" as Tab, label: "Notices", badge: unreadNotices },
            { key: "messages" as Tab, label: "Messages", badge: unreadMessages },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"
              }`}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 mt-4 space-y-3 pb-6">

        {/* === DASHBOARD TAB === */}
        {activeTab === "dashboard" && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
                  <i className="ri-home-4-line text-[#3B82F6]"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A]">{tenantProfile.propertyName}</p>
                  <p className="text-[11px] text-[#687068]">{tenantProfile.propertyAddress}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8]">Move In</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{tenantProfile.moveInDate}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8]">Tenancy Ends</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{tenantProfile.tenancyEndDate}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8]">Deposit</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">£{tenantProfile.depositAmount.toLocaleString()}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8]">Scheme</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{tenantProfile.depositScheme}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Rent History</h3>
                <span className="text-[10px] text-[#10B981] font-medium">All paid</span>
              </div>
              <div className="space-y-2">
                {rentHistory.slice(0, 4).map((pmt, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-check-line text-[#10B981] text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#3A3F3A]">{pmt.month}</p>
                        <p className="text-[10px] text-[#94A3B8]">{pmt.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#10B981]">£{pmt.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#C28A78] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  AS
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#3A3F3A]">{agentInfo.name}</p>
                  <p className="text-[11px] text-[#687068]">{agentInfo.role} · {agentInfo.agency}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${agentInfo.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#10B981]/10 rounded-xl text-xs font-medium text-[#10B981] active:bg-[#10B981]/20">
                  <i className="ri-phone-line"></i> Call
                </a>
                <button
                  onClick={() => { setActiveTab("messages"); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#3B82F6]/10 rounded-xl text-xs font-medium text-[#3B82F6] active:bg-[#3B82F6]/20"
                >
                  <i className="ri-message-3-line"></i> Message
                </button>
              </div>
            </div>
          </>
        )}

        {/* === MAINTENANCE TAB === */}
        {activeTab === "maintenance" && (
          <>
            {maintenanceRequests.map((req) => {
              const sc = getStatusColor(req.status);
              const pc = getPriorityColor(req.priority);
              return (
                <div key={req.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-[#94A3B8]">{req.id}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: pc + "14", color: pc }}>
                        {req.priority}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: sc + "14", color: sc }}>
                      {req.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#3A3F3A]">{req.title}</h4>
                  <p className="text-xs text-[#687068] mt-1">{req.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <i className="ri-calendar-line text-[10px]"></i> {req.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line text-[10px]"></i> Updated {req.lastUpdate}
                    </span>
                    {req.photos && (
                      <span className="flex items-center gap-1">
                        <i className="ri-camera-line text-[10px]"></i> {req.photos} photo{req.photos > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setShowReportForm(true)}
              className="w-full py-4 text-sm font-medium text-white bg-[#EF4444] rounded-xl shadow-sm active:bg-[#DC2626] flex items-center justify-center gap-2"
            >
              <i className="ri-add-line"></i> Report New Issue
            </button>
          </>
        )}

        {/* === DOCUMENTS TAB === */}
        {activeTab === "docs" && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Tenancy Documents</h3>
              <div className="space-y-2">
                {tenantDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9]">
                    <div className={`w-10 h-10 ${doc.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`${doc.icon} text-white text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{doc.name}</p>
                      <p className="text-[11px] text-[#687068]">{doc.type} · {doc.date} · {doc.size}</p>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-[#E2E8F0]">
                      <i className="ri-download-line text-[#94A3B8]"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* === NOTICES TAB === */}
        {activeTab === "notices" && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">
                Notices & Alerts
                {unreadNotices > 0 && (
                  <span className="ml-2 text-[10px] font-medium text-[#EF4444]">{unreadNotices} new</span>
                )}
              </h3>
              <div className="space-y-2">
                {tenantNotices.map((notice) => {
                  const ni = getNoticeIcon(notice.type);
                  return (
                    <button
                      key={notice.id}
                      onClick={() => setShowNoticeDetail(notice.id)}
                      className="w-full text-left flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9] relative"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: ni.bg + "14" }}
                      >
                        <i className={`${ni.icon} text-base`} style={{ color: ni.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#3A3F3A]">{notice.title}</p>
                          {notice.isNew && (
                            <span className="w-2 h-2 bg-[#EF4444] rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-[#687068] mt-0.5 line-clamp-2">{notice.message}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">{notice.date}</p>
                      </div>
                      <i className="ri-arrow-right-s-line text-[#94A3B8] flex-shrink-0 mt-1"></i>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* === MESSAGES TAB === */}
        {activeTab === "messages" && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">
                Messages
                {unreadMessages > 0 && (
                  <span className="ml-2 text-[10px] font-medium text-[#EF4444]">{unreadMessages} new</span>
                )}
              </h3>
              <div className="space-y-2">
                {tenantMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setShowMessageDetail(msg.id)}
                    className="w-full text-left flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9] relative"
                  >
                    <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#3B82F6]">
                        {msg.from.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#3A3F3A]">{msg.from}</p>
                        {msg.isNew && (
                          <span className="w-2 h-2 bg-[#EF4444] rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#3B82F6] mt-0.5">{msg.subject}</p>
                      <p className="text-xs text-[#687068] mt-0.5 line-clamp-1">{msg.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#94A3B8]">{msg.fromRole}</span>
                        <span className="text-[10px] text-[#94A3B8]">·</span>
                        <span className="text-[10px] text-[#94A3B8]">{msg.date}</span>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-[#94A3B8] flex-shrink-0 mt-1"></i>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* === REPORT ISSUE MODAL === */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowReportForm(false)}>
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <h3 className="text-base font-semibold text-[#3A3F3A] mb-4">Report an Issue</h3>

            <form onSubmit={handleSubmitReport} className="space-y-4" data-readdy-form>
              {reportError && (
                <div className="bg-[#EF4444]/10 text-[#EF4444] text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <i className="ri-error-warning-line text-sm"></i>
                  {reportError}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Issue Title *</label>
                <input
                  type="text"
                  name="title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Leaking tap in kitchen"
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative dropdown-trigger">
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Category</label>
                  <button
                    type="button"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className="w-full flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC]"
                  >
                    {reportForm.category}
                    <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                  </button>
                  {categoryOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                      {["Plumbing", "Electrical", "Heating", "Appliances", "Damp & Mould", "Structural", "Pest Control", "Security", "Other"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setReportForm((f) => ({ ...f, category: c })); setCategoryOpen(false); }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] first:rounded-t-xl last:rounded-b-xl"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative dropdown-trigger">
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Priority</label>
                  <button
                    type="button"
                    onClick={() => setPriorityOpen(!priorityOpen)}
                    className="w-full flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC]"
                  >
                    {reportForm.priority}
                    <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                  </button>
                  {priorityOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30">
                      {["Low", "Medium", "High", "Emergency"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { setReportForm((f) => ({ ...f, priority: p })); setPriorityOpen(false); }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] first:rounded-t-xl last:rounded-b-xl"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Description *</label>
                <textarea
                  name="description"
                  value={reportForm.description}
                  onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] resize-none"
                  required
                ></textarea>
                <p className="text-[10px] text-[#94A3B8] mt-1">{reportForm.description.length}/500</p>
              </div>

              <input type="text" name="website_alt" tabIndex={-1} autoComplete="off" aria-hidden="true" className="honeypot-field" />

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="flex-1 py-3 text-sm font-medium text-white bg-[#EF4444] rounded-xl active:bg-[#DC2626] disabled:opacity-50 whitespace-nowrap"
                >
                  {reportSubmitting ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl active:bg-[#F8FAFC] whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === PHOTO UPLOAD MODAL === */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowPhotoUpload(false)}>
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <h3 className="text-base font-semibold text-[#3A3F3A] mb-4">Upload Photos</h3>
            <p className="text-xs text-[#687068] mb-4">Add up to 5 photos of the issue for your property manager.</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {photos.map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden relative">
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <i className="ri-close-line text-white text-xs"></i>
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={handlePhotoCapture}
                  className="aspect-square bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-1 active:bg-[#F1F5F9]"
                >
                  <i className="ri-camera-line text-[#94A3B8] text-xl"></i>
                  <span className="text-[10px] text-[#94A3B8]">Add Photo</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Voice Note */}
            <div className="border-t border-[#F1F5F9] pt-4 mb-4">
              <p className="text-xs font-medium text-[#687068] mb-3">Voice Note</p>
              {voiceNotes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {voiceNotes.map((vn, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-xl">
                      <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-mic-line text-[#3B82F6]"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-[#3A3F3A]">Voice Note {idx + 1}</p>
                        <p className="text-[10px] text-[#94A3B8]">{formatTime(vn.duration)}</p>
                      </div>
                      <audio src={vn.blob} controls className="w-24 h-7" />
                      <button
                        onClick={() => setVoiceNotes(voiceNotes.filter((_, i) => i !== idx))}
                        className="w-6 h-6 flex items-center justify-center"
                      >
                        <i className="ri-close-line text-[#94A3B8] text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onMouseLeave={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-medium transition-colors ${
                  isRecording
                    ? "bg-[#EF4444] text-white"
                    : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#687068] active:bg-[#F1F5F9]"
                }`}
              >
                <i className={`${isRecording ? "ri-mic-line animate-pulse" : "ri-mic-line"} text-lg`}></i>
                {isRecording ? `Recording... ${formatTime(recordingTime)}` : "Hold to Record Voice Note"}
              </button>
            </div>

            <button
              onClick={() => {
                setPhotos([]);
                setVoiceNotes([]);
                setShowPhotoUpload(false);
              }}
              className="w-full py-3 text-sm font-medium text-white bg-[#3B82F6] rounded-xl active:bg-[#2563EB]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* === CONTACT MANAGER SHEET === */}
      {showContactSheet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowContactSheet(false)}>
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <h3 className="text-base font-semibold text-[#3A3F3A] mb-4">Contact Property Manager</h3>

            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl mb-4">
              <div className="w-14 h-14 bg-[#C28A78] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                AS
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3A3F3A]">{agentInfo.name}</p>
                <p className="text-xs text-[#687068]">{agentInfo.role}</p>
                <p className="text-xs text-[#94A3B8]">{agentInfo.agency}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <a
                href={`tel:${agentInfo.phone}`}
                className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9]"
              >
                <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
                  <i className="ri-phone-line text-[#10B981] text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">{agentInfo.phone}</p>
                  <p className="text-[11px] text-[#687068]">{agentInfo.hours}</p>
                </div>
              </a>

              <a
                href={`mailto:${agentInfo.email}`}
                className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9]"
              >
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
                  <i className="ri-mail-line text-[#3B82F6] text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">{agentInfo.email}</p>
                  <p className="text-[11px] text-[#687068]">Response within 24 hours</p>
                </div>
              </a>

              <button
                onClick={() => {
                  setShowContactSheet(false);
                  setActiveTab("messages");
                }}
                className="w-full flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9]"
              >
                <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center">
                  <i className="ri-message-3-line text-[#8B5CF6] text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">Send Message</p>
                  <p className="text-[11px] text-[#687068]">Chat directly in the app</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowContactSheet(false)}
              className="w-full py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl active:bg-[#F8FAFC]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* === NOTICE DETAIL MODAL === */}
      {showNoticeDetail && (() => {
        const notice = tenantNotices.find((n) => n.id === showNoticeDetail);
        if (!notice) return null;
        const ni = getNoticeIcon(notice.type);
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowNoticeDetail(null)}>
            <div
              className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: ni.bg + "14" }}
                >
                  <i className={`${ni.icon} text-xl`} style={{ color: ni.color }}></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#3A3F3A]">{notice.title}</h3>
                  <p className="text-xs text-[#687068]">{notice.date}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4">
                <p className="text-sm text-[#3A3F3A] leading-relaxed">{notice.message}</p>
              </div>
              <button
                onClick={() => setShowNoticeDetail(null)}
                className="w-full py-3 text-sm font-medium text-white bg-[#3B82F6] rounded-xl active:bg-[#2563EB]"
              >
                Got It
              </button>
            </div>
          </div>
        );
      })()}

      {/* === MESSAGE DETAIL MODAL === */}
      {showMessageDetail && (() => {
        const msg = tenantMessages.find((m) => m.id === showMessageDetail);
        if (!msg) return null;
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowMessageDetail(null)}>
            <div
              className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#3B82F6]">
                    {msg.from.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#3A3F3A]">{msg.from}</h3>
                  <p className="text-xs text-[#687068]">{msg.fromRole} · {msg.date}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-[#3B82F6] mb-3">{msg.subject}</p>
              <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4">
                <p className="text-sm text-[#3A3F3A] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageDetail(null)}
                  className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl active:bg-[#F8FAFC]"
                >
                  Close
                </button>
                <a
                  href={`mailto:${agentInfo.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                  className="flex-1 py-3 text-sm font-medium text-white bg-[#3B82F6] rounded-xl active:bg-[#2563EB] text-center"
                >
                  Reply
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Success Toast */}
      {reportSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#10B981] text-white text-xs font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <i className="ri-checkbox-circle-line"></i>
          Issue reported successfully!
        </div>
      )}
    </MobileLayout>
  );
}