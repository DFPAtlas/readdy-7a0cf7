"use client";

import { useState, useEffect, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import { AI_SAFETY_NOTICE, type AIActionItem } from "@/lib/aiSystem";
import {
  triageHistory,
  demoIssues,
  severityConfig,
  categoryConfig,
  categoryBreakdown,
  recentActivity,
  tradeMatchScores,
} from "./TriageData";
import type { TriageIssue, TriageCategory, TriageSeverity } from "./TriageData";

export default function AIMaintenanceTriagePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [issueText, setIssueText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<TriageIssue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<TriageIssue | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [typingIndex, setTypingIndex] = useState(0);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredIssues = triageHistory.filter((issue) => {
    if (selectedCategory !== "all" && issue.category !== selectedCategory) return false;
    if (selectedSeverity !== "all" && issue.severity !== selectedSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.description.toLowerCase().includes(q) ||
        issue.tenantName.toLowerCase().includes(q) ||
        issue.propertyAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const emergencyCount = triageHistory.filter((i) => i.severity === "Emergency").length;
  const urgentCount = triageHistory.filter((i) => i.severity === "Urgent").length;
  const newCount = triageHistory.filter((i) => i.status === "new").length;
  const safetyCount = triageHistory.filter((i) => i.safetyFlag).length;
  const awaitingApproval = triageHistory.filter((i) => i.status === "awaiting_approval").length;
  const lowConfidenceCount = triageHistory.filter((i) => i.confidence < 85).length;

  const actionItems: AIActionItem[] = [
    ...triageHistory.filter(i => i.status === "new").map(i => ({
      id: i.id, agentName: "Maintenance Triage", issue: `New report: ${i.description.slice(0, 50)}...`, relatedRecord: i.propertyAddress, time: i.submittedAt, urgency: "warning" as const, actionLabel: "Review", actionHref: "#",
    })),
    ...triageHistory.filter(i => i.status === "awaiting_approval").map(i => ({
      id: i.id, agentName: "Maintenance Triage", issue: `Awaiting approval: ${i.category} at ${i.propertyAddress}`, relatedRecord: i.propertyAddress, time: i.submittedAt, urgency: "critical" as const, actionLabel: "Approve", actionHref: "#",
    })),
  ].slice(0, 5);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - photos.length);
    if (newFiles.length === 0) return;
    setPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPhotoPreviews((prev) => [...prev, url]);
    });
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      showError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const removeVoiceNote = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const analyzeIssue = (description: string, isDemo: boolean = false) => {
    setAnalyzing(true);
    setAnalyzed(false);
    setCurrentIssue(null);
    setTypingIndex(0);

    const progressInterval = setInterval(() => {
      setTypingIndex((prev) => {
        if (prev >= 7) { clearInterval(progressInterval); return 7; }
        return prev + 1;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(progressInterval);
      const lower = description.toLowerCase();
      let category: TriageCategory = "General Maintenance";
      let severity: TriageSeverity = "Standard";
      let confidence = 88;
      let trade = "Handyman";
      let safetyFlag = false;
      let complianceFlag = false;
      let estimatedCost = "£80 - £150";
      let estimatedTime = "1 - 2 hours";
      let keyPhrases: string[] = [];
      let actions: string[] = [];

      if (lower.includes("mould") || lower.includes("mold") || lower.includes("damp") || lower.includes("condensation") || lower.includes("musty") || lower.includes("black spot") || lower.includes("mildew") || lower.includes("fungus")) {
        category = "Mould/Damp";
        trade = "Damp Specialist";
        if (lower.includes("black mould") || lower.includes("spreading") || lower.includes("throughout") || lower.includes("health")) { severity = "Urgent"; confidence = 92; safetyFlag = true; }
        else if (lower.includes("ceiling") && (lower.includes("peeling") || lower.includes("stain"))) { severity = "Urgent"; confidence = 89; safetyFlag = true; }
        else { severity = "Standard"; confidence = 88; }
        estimatedCost = severity === "Urgent" ? "£300 - £800" : "£200 - £500";
        estimatedTime = severity === "Urgent" ? "1 - 3 days investigation" : "1 - 2 days";
        safetyFlag = severity === "Urgent";
        keyPhrases = ["mould growth", "damp", "ventilation issue", "humidity", "health risk"];
        actions = [severity === "Urgent" ? "Book damp specialist urgently — health risk to tenant" : "Schedule damp survey", "Check ventilation, extractor fans, and heating", "Identify source: condensation vs penetrating vs rising damp", "Treat affected area with anti-fungal treatment", "If structural damp, prepare landlord for full damp-proofing quote"];
      } else if (lower.includes("crack") || lower.includes("subsidence") || lower.includes("foundation") || lower.includes("structural")) {
        category = "Structural";
        trade = lower.includes("subsidence") || lower.includes("foundation") ? "Structural Engineer" : "Builder";
        if (lower.includes("subsidence") || lower.includes("foundation") || lower.includes("diagonal")) { severity = "Emergency"; confidence = 94; safetyFlag = true; }
        else if (lower.includes("large crack") || lower.includes("widening")) { severity = "Urgent"; confidence = 90; safetyFlag = true; }
        else { severity = "Standard"; confidence = 82; }
        estimatedCost = severity === "Emergency" ? "£1,000 - £5,000" : severity === "Urgent" ? "£500 - £2,000" : "£200 - £800";
        estimatedTime = severity === "Emergency" ? "Survey within 24h" : severity === "Urgent" ? "Survey within 5 days" : "1 - 2 weeks";
        safetyFlag = severity === "Emergency" || severity === "Urgent";
        keyPhrases = ["structural crack", "subsidence risk", "wall movement", "building integrity", "survey required"];
        actions = [severity === "Emergency" ? "Commission emergency structural engineer survey" : "Arrange structural inspection", "Check neighbouring properties for similar issues", "Review building insurance for subsidence cover", "Ask tenant to monitor and photograph weekly", "If movement confirmed, prepare landlord for full repair scope"];
      } else if (lower.includes("water") || lower.includes("leak") || lower.includes("drip") || lower.includes("pipe") || lower.includes("flood") || lower.includes("burst")) {
        category = "Leak"; trade = "Plumber";
        if (lower.includes("flood") || lower.includes("ceiling") || lower.includes("pouring") || lower.includes("burst")) { severity = "Emergency"; confidence = 96; }
        else if (lower.includes("leak") || lower.includes("drip")) { severity = lower.includes("ceiling") || lower.includes("through") ? "Emergency" : "Standard"; confidence = 91; }
        else { severity = "Standard"; confidence = 89; }
        estimatedCost = severity === "Emergency" ? "£150 - £400" : "£60 - £120";
        estimatedTime = severity === "Emergency" ? "2 - 4 hours" : "30 - 60 mins";
        safetyFlag = severity === "Emergency";
        keyPhrases = ["water leak", "plumbing issue", "pipe fault", "drip"];
        actions = [severity === "Emergency" ? "Dispatch emergency plumber immediately" : "Schedule plumber visit", "Advise tenant to turn off water if safe to do so", "Request photos of affected area", "Check for secondary damage (electrics, plaster)", "Update landlord on repair scope"];
      } else if (lower.includes("electric") || lower.includes("socket") || lower.includes("spark") || lower.includes("wire") || lower.includes("tripped") || lower.includes("smoke alarm") || lower.includes("burning smell")) {
        category = "Electrical"; trade = "Electrician";
        if (lower.includes("spark") || lower.includes("burning smell") || lower.includes("tripped")) { severity = "Emergency"; confidence = 94; }
        else if (lower.includes("smoke alarm") || lower.includes("beeping")) { severity = "Urgent"; complianceFlag = true; confidence = 93; }
        else { severity = "Standard"; confidence = 88; }
        estimatedCost = severity === "Emergency" ? "£150 - £350" : severity === "Urgent" ? "£80 - £150" : "£60 - £120";
        estimatedTime = severity === "Emergency" ? "1 - 3 hours" : "1 - 2 hours";
        safetyFlag = severity === "Emergency";
        keyPhrases = ["electrical fault", "lighting issue", "socket problem", "wiring"];
        actions = [severity === "Emergency" ? "Dispatch emergency electrician immediately" : "Schedule electrician", "Advise tenant to avoid using affected outlets/switches", "Check consumer unit for trip patterns", "If smoke alarm, verify all alarms in property", "Log for compliance tracking if safety-critical"];
      } else if (lower.includes("boiler") || lower.includes("heating") || lower.includes("radiator") || lower.includes("hot water") || lower.includes("gas")) {
        category = "Heating";
        trade = lower.includes("gas") || lower.includes("smell") ? "Gas Safe Engineer" : "Heating Engineer";
        if (lower.includes("gas smell") || lower.includes("hissing") || lower.includes("carbon monoxide")) { severity = "Emergency"; confidence = 98; }
        else if (lower.includes("no heating") || lower.includes("no hot water")) { severity = "Urgent"; confidence = 94; }
        else { severity = "Standard"; confidence = 87; }
        estimatedCost = severity === "Emergency" ? "£200 - £500" : severity === "Urgent" ? "£120 - £280" : "£80 - £180";
        estimatedTime = "1 - 3 hours";
        safetyFlag = severity === "Emergency";
        complianceFlag = lower.includes("gas") || lower.includes("boiler");
        keyPhrases = ["heating fault", "boiler issue", "hot water failure", "gas"];
        actions = [severity === "Emergency" ? "Evacuate tenant if gas leak suspected, call emergency gas line" : "Book Gas Safe engineer", "Check if temporary heating can be provided", "Verify boiler service history", "If beyond repair, prepare replacement quote", "Follow up 24h after repair"];
      } else if (lower.includes("roof") || lower.includes("tile") || lower.includes("gutter") || lower.includes("loft")) {
        category = "Structural"; trade = "Roofer";
        if (lower.includes("collapsed") || lower.includes("hole") || lower.includes("major")) { severity = "Emergency"; confidence = 95; }
        else if (lower.includes("loose") || lower.includes("missing") || lower.includes("daylight")) { severity = "Urgent"; confidence = 85; }
        else { severity = "Standard"; confidence = 82; }
        estimatedCost = severity === "Emergency" ? "£500 - £1500" : severity === "Urgent" ? "£200 - £500" : "£150 - £350";
        estimatedTime = severity === "Emergency" ? "4 - 8 hours" : "2 - 4 hours";
        safetyFlag = severity === "Emergency" || lower.includes("loose");
        keyPhrases = ["roof damage", "tile issue", "gutter problem", "water ingress"];
        actions = ["Arrange roofer for urgent inspection", "Ask tenant to avoid area below if loose tiles", "Check for interior damp signs", "Document with photos for insurance", "If water ingress, book plasterer for follow-up"];
      } else if (lower.includes("fridge") || lower.includes("oven") || lower.includes("washing machine") || lower.includes("dishwasher") || lower.includes("appliance")) {
        category = "Appliance"; trade = "Appliance Engineer";
        if (lower.includes("smoke") || lower.includes("burning") || lower.includes("fire")) { severity = "Emergency"; confidence = 97; }
        else if (lower.includes("not working") || lower.includes("broken") || lower.includes("cold")) { severity = "Urgent"; confidence = 90; }
        else { severity = "Standard"; confidence = 85; }
        estimatedCost = severity === "Emergency" ? "£150 - £300" : severity === "Urgent" ? "£100 - £200" : "£80 - £150";
        estimatedTime = "1 - 2 hours";
        safetyFlag = severity === "Emergency";
        keyPhrases = ["appliance fault", "white goods issue", "repair needed"];
        actions = ["Book appliance engineer", "Check warranty status", "Ask tenant to check power/plug/obstructions", "If food storage affected, advise temporary measures", "Prepare replacement quote if unrepairable"];
      } else if (lower.includes("lock") || lower.includes("door") || lower.includes("window") || lower.includes("security") || lower.includes("break-in")) {
        category = "Security"; trade = lower.includes("lock") || lower.includes("key") ? "Locksmith" : "Security Installer";
        if (lower.includes("break-in") || lower.includes("broken in") || lower.includes("forced")) { severity = "Emergency"; confidence = 98; }
        else if (lower.includes("broken") || lower.includes("not locking") || lower.includes("sticking")) { severity = "Urgent"; confidence = 89; }
        else { severity = "Standard"; confidence = 84; }
        estimatedCost = severity === "Emergency" ? "£200 - £400" : severity === "Urgent" ? "£90 - £180" : "£60 - £120";
        estimatedTime = severity === "Emergency" ? "2 - 3 hours" : "1 - 2 hours";
        safetyFlag = severity === "Emergency";
        keyPhrases = ["security issue", "lock fault", "door problem", "break-in"];
        actions = [severity === "Emergency" ? "Call police if break-in, arrange emergency locksmith" : "Arrange locksmith or security engineer", "If break-in, arrange board-up service immediately", "Check if tenant is safe and provide reassurance", "If lock issue, verify all entry points are secure", "Review security measures with landlord"];
      } else {
        category = "General Maintenance"; trade = "Handyman"; severity = "Planned"; confidence = 82;
        estimatedCost = "£80 - £200"; estimatedTime = "2 - 4 hours";
        keyPhrases = ["general maintenance", "cosmetic issue", "minor repair"];
        actions = ["Schedule handyman for next routine visit", "Check if tenant-caused damage (chargeable)", "Batch with other minor jobs to reduce costs", "Confirm with landlord if chargeable or wear-and-tear", "If end of tenancy soon, consider delaying"];
      }

      const issue: TriageIssue = {
        id: `tri-${Date.now()}`, tenantName: isDemo ? "Demo Tenant" : "Current Tenant",
        propertyAddress: isDemo ? "Demo Property" : "Current Property", description,
        submittedAt: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", ""),
        category, severity, confidence, trade, estimatedCost, estimatedTime,
        recommendedActions: actions, keyPhrases, safetyFlag, complianceFlag,
        status: "new", photoCount: isDemo ? 0 : photos.length, hasVoiceNote: isDemo ? false : audioBlob !== null,
      };
      setCurrentIssue(issue); setAnalyzing(false); setAnalyzed(true);
    }, 3200);
  };

  const handleDemoClick = (description: string) => {
    setIssueText(description); setActiveTab("new-issue");
    setTimeout(() => analyzeIssue(description, true), 300);
  };

  const showSuccess = (msg: string) => { setToastMsg(msg); setToastType("success"); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };
  const showError = (msg: string) => { setToastMsg(msg); setToastType("error"); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  const clearSubmission = () => {
    setIssueText(""); setAnalyzed(false); setCurrentIssue(null);
    photos.forEach((_, i) => { if (photoPreviews[i]) URL.revokeObjectURL(photoPreviews[i]); });
    setPhotos([]); setPhotoPreviews([]); removeVoiceNote();
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {showToast && (
          <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toastType === "success" ? "bg-[#10B981] text-white" : "bg-[#EF4444] text-white"}`}>
            <i className={`${toastType === "success" ? "ri-check-line" : "ri-error-warning-line"} text-lg`}></i>
            <span className="text-sm font-medium">{toastMsg}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">AI Maintenance Triage</h1>
            <p className="text-sm text-[#687068] mt-1">AI predicts issue category, assigns priority, and recommends the right contractor</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-1.5 rounded-lg font-medium"><i className="ri-alarm-warning-line mr-1"></i>{emergencyCount} emergency</span>
            <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1.5 rounded-lg font-medium"><i className="ri-time-line mr-1"></i>{urgentCount} urgent</span>
            <span className="text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1.5 rounded-lg font-medium"><i className="ri-shield-user-line mr-1"></i>{awaitingApproval} awaiting</span>
          </div>
        </div>

        {/* AI Safety Notice */}
        <div className="bg-[#FEF3C7]/30 border border-[#F59E0B]/20 rounded-xl p-3 flex items-start gap-3">
          <div className="w-6 h-6 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-information-line text-[#F59E0B] text-sm"></i>
          </div>
          <p className="text-xs text-[#92400E]">{AI_SAFETY_NOTICE}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Awaiting Triage", value: newCount, icon: "ri-file-list-3-line", color: "bg-[#C28A78]", sub: "New reports" },
            { label: "Safety Concerns", value: safetyCount, icon: "ri-shield-check-line", color: "bg-[#EF4444]", sub: "Hazard flagged" },
            { label: "Low Confidence", value: lowConfidenceCount, icon: "ri-question-line", color: "bg-[#F59E0B]", sub: "Needs human review" },
            { label: "Recently Reviewed", value: triageHistory.filter(i => i.status === "triaged" || i.status === "assigned").length, icon: "ri-eye-line", color: "bg-[#3B82F6]", sub: "Reviewed today" },
            { label: "Service Status", value: "Active", icon: "ri-check-double-line", color: "bg-[#10B981]", sub: "AI engine running" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-sm transition-shadow">
              <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center mb-2`}>
                <i className={`${card.icon} text-white text-sm`}></i>
              </div>
              <p className="text-xl font-bold text-[#3A3F3A]">{card.value}</p>
              <p className="text-xs text-[#687068]">{card.label}</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Action Centre */}
        {actionItems.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="text-sm font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
              <i className="ri-shield-user-line text-[#C28A78] text-sm"></i>
              Actions Requiring Attention
            </h2>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.urgency === "critical" ? "bg-[#EF4444]/5 border-[#EF4444]/20" : "bg-[#F59E0B]/5 border-[#F59E0B]/20"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.urgency === "critical" ? "bg-[#EF4444]/10" : "bg-[#F59E0B]/10"}`}>
                    <i className={`${item.urgency === "critical" ? "ri-error-warning-line text-[#EF4444]" : "ri-time-line text-[#F59E0B]"} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3F3A]">{item.issue}</p>
                    <p className="text-xs text-[#94A3B8]">{item.agentName} · {item.relatedRecord} · {item.time}</p>
                  </div>
                  <button onClick={() => { setActiveTab("issues"); }} className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap cursor-pointer">
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
            { id: "new-issue", label: "New Issue", icon: "ri-add-circle-line" },
            { id: "issues", label: "Triaged Issues", icon: "ri-file-list-3-line" },
            { id: "demo", label: "Demo Mode", icon: "ri-test-tube-line" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"}`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <h2 className="font-semibold text-[#3A3F3A] mb-4">Issues by Category</h2>
                <div className="space-y-3">
                  {Object.entries(categoryBreakdown).map(([cat, data]) => {
                    const cfg = categoryConfig[cat as TriageCategory];
                    const max = Math.max(...Object.values(categoryBreakdown).map((d) => d.count));
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className={`w-7 h-7 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <i className={`${cfg.icon} ${cfg.color} text-xs`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#3A3F3A]">{cfg.predictionLabel}</span>
                            <span className="text-[10px] text-[#687068]">{data.count}</span>
                          </div>
                          <div className="w-full h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#C28A78]/30" style={{ width: `${(data.count / max) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <h2 className="font-semibold text-[#3A3F3A] mb-4">Severity Distribution</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(["Emergency", "Urgent", "Standard", "Planned"] as TriageSeverity[]).map((sev) => {
                    const cfg = severityConfig[sev];
                    const count = triageHistory.filter((i) => i.severity === sev).length;
                    return (
                      <div key={sev} className="border border-[#E2E8F0] rounded-xl p-3 text-center">
                        <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                          <i className={`${cfg.icon} ${cfg.color} text-sm`}></i>
                        </div>
                        <p className="text-lg font-bold text-[#3A3F3A]">{count}</p>
                        <p className="text-xs text-[#687068]">{sev}</p>
                        <p className="text-[10px] text-[#94A3B8]">{cfg.responseTime}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEW ISSUE TAB */}
        {activeTab === "new-issue" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h2 className="font-semibold text-[#3A3F3A] mb-1">Tenant Report</h2>
              <p className="text-sm text-[#687068] mb-4">Enter the tenant&apos;s description. Upload photos and voice notes for better AI accuracy.</p>
              <textarea
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                placeholder="e.g. There's black mould spreading across the bedroom ceiling..."
                className="w-full h-28 text-sm text-[#3A3F3A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 outline-none resize-none placeholder:text-[#94A3B8]"
              />
              <div className="mt-4">
                <p className="text-xs text-[#687068] mb-2 font-medium">Photos ({photos.length}/5)</p>
                <div className="flex flex-wrap gap-2">
                  {photoPreviews.map((preview, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E2E8F0] group">
                      <img src={preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="ri-close-line text-white text-xs"></i>
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <button onClick={() => photoInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-1 hover:border-[#C28A78]/30 hover:bg-[#FBFCFD] transition-colors">
                      <i className="ri-camera-line text-[#94A3B8] text-lg"></i><span className="text-[10px] text-[#94A3B8]">Add</span>
                    </button>
                  )}
                  <input ref={photoInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoSelect} className="hidden" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-[#687068] mb-2 font-medium">Voice Note</p>
                {!audioBlob ? (
                  isRecording ? (
                    <div className="flex items-center gap-3 p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse"></span>
                      <span className="text-sm text-[#EF4444] font-medium">Recording... {formatTime(recordingTime)}</span>
                      <button onClick={stopRecording} className="ml-auto px-3 py-1.5 bg-[#EF4444] text-white rounded-lg text-xs font-medium hover:bg-[#DC2626] transition-colors whitespace-nowrap">Stop</button>
                    </div>
                  ) : (
                    <button onClick={startRecording} className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#FBFCFD] hover:border-[#C28A78]/30 transition-colors">
                      <i className="ri-mic-line text-lg"></i>Tap to record voice note
                    </button>
                  )
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-[#C28A78]/5 border border-[#C28A78]/20 rounded-lg">
                    <i className="ri-voiceprint-line text-[#C28A78] text-lg"></i>
                    <div className="flex-1"><p className="text-sm text-[#3A3F3A] font-medium">Voice note recorded</p><p className="text-xs text-[#687068]">{formatTime(recordingTime)}</p></div>
                    <audio src={audioUrl || undefined} controls className="h-8 max-w-[140px]" />
                    <button onClick={removeVoiceNote} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EF4444]/10 transition-colors"><i className="ri-delete-bin-line text-[#94A3B8] text-sm"></i></button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-5">
                <span className="text-xs text-[#94A3B8]">{issueText.length} characters · {photos.length} photos · {audioBlob ? "1 voice note" : "0 voice notes"}</span>
                <div className="flex items-center gap-3">
                  <button onClick={clearSubmission} className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Clear All</button>
                  <button
                    onClick={() => analyzeIssue(issueText)}
                    disabled={!issueText.trim() || analyzing}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${issueText.trim() && !analyzing ? "bg-[#C28A78] text-white hover:bg-[#143828]" : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"}`}
                  >
                    {analyzing ? (<><i className="ri-loader-4-line animate-spin"></i>Analysing...</>) : (<><i className="ri-magic-line"></i>Analyse Submission</>)}
                  </button>
                </div>
              </div>
            </div>

            {analyzing && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
                <div className="w-14 h-14 bg-[#C28A78]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-brain-line text-[#C28A78] text-2xl animate-pulse"></i>
                </div>
                <h3 className="text-lg font-semibold text-[#3A3F3A] mb-1">AI Analysing Submission</h3>
                <p className="text-sm text-[#94A3B8] mb-4">Processing description, photos, and voice input</p>
                <div className="max-w-sm mx-auto space-y-2">
                  {["Extracting key phrases", "Analysing photo content", "Transcribing voice note", "Matching against known patterns", "Calculating severity and priority", "Predicting issue category", "Recommending contractor trade"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i <= typingIndex ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                        {i <= typingIndex ? <i className="ri-check-line text-xs"></i> : <i className="ri-loader-4-line text-xs"></i>}
                      </div>
                      <span className={i <= typingIndex ? "text-[#3A3F3A]" : "text-[#94A3B8]"}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analyzed && currentIssue && (
              <div className="space-y-4">
                <div className={`rounded-xl border p-5 flex items-start gap-4 ${currentIssue.severity === "Emergency" ? "bg-[#EF4444]/5 border-[#EF4444]/20" : currentIssue.severity === "Urgent" ? "bg-[#F59E0B]/5 border-[#F59E0B]/20" : "bg-[#3B82F6]/5 border-[#3B82F6]/20"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${severityConfig[currentIssue.severity].bg}`}>
                    <i className={`${severityConfig[currentIssue.severity].icon} ${severityConfig[currentIssue.severity].color} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-bold ${severityConfig[currentIssue.severity].color}`}>{currentIssue.severity.toUpperCase()}</span>
                    <p className="text-sm text-[#3A3F3A] font-medium">{categoryConfig[currentIssue.category].predictionLabel} — {currentIssue.trade}</p>
                    <p className="text-xs text-[#687068]">AI Confidence: {currentIssue.confidence}% · Response: {severityConfig[currentIssue.severity].responseTime}</p>
                  </div>
                  {currentIssue.safetyFlag && <span className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full font-medium flex-shrink-0"><i className="ri-error-warning-line mr-1"></i>Safety</span>}
                  {currentIssue.complianceFlag && <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full font-medium flex-shrink-0"><i className="ri-shield-check-line mr-1"></i>Compliance</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-4"><p className="text-xs text-[#94A3B8] mb-1">Estimated Cost</p><p className="text-sm font-medium text-[#3A3F3A]">{currentIssue.estimatedCost}</p></div>
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-4"><p className="text-xs text-[#94A3B8] mb-1">Estimated Time</p><p className="text-sm font-medium text-[#3A3F3A]">{currentIssue.estimatedTime}</p></div>
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-4"><p className="text-xs text-[#94A3B8] mb-1">Recommended Trade</p><p className="text-sm font-medium text-[#3A3F3A]">{currentIssue.trade}</p></div>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Recommended Actions</h3>
                  <div className="space-y-2">
                    {currentIssue.recommendedActions.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC]">
                        <div className="w-6 h-6 bg-[#C28A78]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[10px] font-bold text-[#C28A78]">{i + 1}</span></div>
                        <span className="text-sm text-[#3A3F3A]">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0"><i className="ri-shield-user-line text-[#F59E0B] text-base"></i></div>
                  <div><p className="text-sm font-semibold text-[#3A3F3A]">Human Approval Required</p><p className="text-xs text-[#687068] mt-0.5">AI recommends this action but a human must review and approve before a contractor is dispatched.</p></div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={() => setShowActionModal(true)} className="px-5 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors flex items-center gap-2 whitespace-nowrap"><i className="ri-file-add-line"></i>Create Maintenance Action</button>
                  <button onClick={() => setShowAssignModal(true)} className="px-5 py-2.5 border border-[#C28A78]/20 text-[#C28A78] rounded-lg text-sm font-medium hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 whitespace-nowrap"><i className="ri-user-add-line"></i>Assign Contractor</button>
                  <button onClick={() => showSuccess("Issue saved to queue")} className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] font-medium hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 whitespace-nowrap"><i className="ri-save-line"></i>Save to Queue</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRIAGED ISSUES TAB */}
        {activeTab === "issues" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 flex-1 bg-[#F8FAFC] rounded-lg px-3 py-2">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input type="text" placeholder="Search issues..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="text-sm text-[#3A3F3A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 outline-none pr-8">
                  <option value="all">All Predictions</option>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (<option key={key} value={key}>{cfg.predictionLabel}</option>))}
                </select>
                <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} className="text-sm text-[#3A3F3A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 outline-none pr-8">
                  <option value="all">All Priorities</option>
                  <option value="Emergency">Emergency</option><option value="Urgent">Urgent</option><option value="Standard">Standard</option><option value="Planned">Planned</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Issue</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenant</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Prediction</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Priority</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3"><p className="text-sm text-[#3A3F3A] font-medium line-clamp-2 max-w-[240px]">{issue.description}</p><p className="text-xs text-[#94A3B8] mt-0.5">{issue.propertyAddress}</p></td>
                        <td className="px-5 py-3 text-[#687068]">{issue.tenantName}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 ${categoryConfig[issue.category].bg} rounded flex items-center justify-center`}><i className={`${categoryConfig[issue.category].icon} ${categoryConfig[issue.category].color} text-[10px]`}></i></div>
                            <span className="text-xs text-[#687068]">{categoryConfig[issue.category].predictionLabel}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${severityConfig[issue.severity].bg} ${severityConfig[issue.severity].color}`}>{issue.severity}</span></td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${issue.status === "resolved" ? "bg-[#10B981]/10 text-[#10B981]" : issue.status === "in_progress" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : issue.status === "assigned" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : issue.status === "awaiting_approval" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : issue.status === "triaged" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                            {issue.status === "awaiting_approval" ? "Awaiting Approval" : issue.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => { setSelectedIssue(issue); setShowIssueModal(true); }} className="text-xs text-[#C28A78] font-medium px-2 py-1 rounded hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredIssues.length === 0 && (<div className="px-5 py-8 text-center"><p className="text-sm text-[#94A3B8]">No issues match your filters</p></div>)}
            </div>
          </div>
        )}

        {/* DEMO MODE TAB */}
        {activeTab === "demo" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h2 className="font-semibold text-[#3A3F3A] mb-2">Demo Mode</h2>
              <p className="text-sm text-[#687068] mb-6">Click any example to see how the AI analyses the submission.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoIssues.map((demo, i) => (
                  <button key={i} onClick={() => handleDemoClick(demo.description)} className="text-left p-4 rounded-xl border border-[#E2E8F0] hover:border-[#C28A78]/30 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold text-[#C28A78]">{i + 1}</span></div>
                      <div><p className="text-sm text-[#3A3F3A] line-clamp-2">{demo.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium">{categoryConfig[demo.expected]?.predictionLabel || demo.expected}</span>
                          <span className="text-[10px] text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium">{demo.expectedSeverity}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Issue Detail Modal */}
        {showIssueModal && selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowIssueModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-lg font-semibold text-[#3A3F3A]">Issue Details</h3><p className="text-xs text-[#94A3B8]">ID: {selectedIssue.id}</p></div>
                <button onClick={() => setShowIssueModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"><i className="ri-close-line text-[#687068]"></i></button>
              </div>
              <div className={`rounded-xl border p-4 mb-4 flex items-start gap-3 ${selectedIssue.severity === "Emergency" ? "bg-[#EF4444]/5 border-[#EF4444]/20" : selectedIssue.severity === "Urgent" ? "bg-[#F59E0B]/5 border-[#F59E0B]/20" : "bg-[#3B82F6]/5 border-[#3B82F6]/20"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${severityConfig[selectedIssue.severity].bg}`}><i className={`${severityConfig[selectedIssue.severity].icon} ${severityConfig[selectedIssue.severity].color} text-lg`}></i></div>
                <div><span className={`text-sm font-bold ${severityConfig[selectedIssue.severity].color}`}>{selectedIssue.severity.toUpperCase()}</span><p className="text-sm text-[#3A3F3A] font-medium">{categoryConfig[selectedIssue.category].predictionLabel} — {selectedIssue.trade}</p><p className="text-xs text-[#687068]">Confidence: {selectedIssue.confidence}%</p></div>
              </div>
              <div className="space-y-4 mb-6">
                <div><p className="text-xs text-[#94A3B8] mb-1">Description</p><p className="text-sm text-[#3A3F3A] bg-[#F8FAFC] rounded-lg p-3">{selectedIssue.description}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-[#94A3B8] mb-1">Estimated Cost</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedIssue.estimatedCost}</p></div>
                  <div><p className="text-xs text-[#94A3B8] mb-1">Estimated Time</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedIssue.estimatedTime}</p></div>
                </div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Recommended Actions</p><div className="space-y-2">{selectedIssue.recommendedActions.map((action, i) => (<div key={i} className="flex items-start gap-2 text-sm text-[#3A3F3A]"><span className="text-[#C28A78] font-bold">{i + 1}.</span>{action}</div>))}</div></div>
              </div>
              <div className="flex gap-3">
                {selectedIssue.status === "awaiting_approval" ? (
                  <button onClick={() => { setShowIssueModal(false); showSuccess("Approved! Contractor will be dispatched."); }} className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">Approve & Dispatch</button>
                ) : (
                  <button onClick={() => { setShowIssueModal(false); showSuccess("Issue marked as resolved"); }} className="flex-1 py-2.5 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors whitespace-nowrap">Mark Resolved</button>
                )}
                <button onClick={() => { setShowIssueModal(false); setShowAssignModal(true); }} className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">Re-assign</button>
                <button onClick={() => setShowIssueModal(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAssignModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#3A3F3A]">Assign Contractor</h3>
                <button onClick={() => setShowAssignModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"><i className="ri-close-line text-[#687068]"></i></button>
              </div>
              <p className="text-sm text-[#687068] mb-4">Select a contractor. Assignment will require human approval before dispatch.</p>
              <div className="space-y-2 mb-6">
                {[{ name: "Mike's Heating Ltd", trade: "Heating Engineer", rating: "4.9", jobs: 156 }, { name: "SecureLock Services", trade: "Locksmith", rating: "4.8", jobs: 89 }, { name: "PlumbRight 24/7", trade: "Plumber", rating: "4.7", jobs: 234 }, { name: "SafeWire Electrical", trade: "Electrician", rating: "4.9", jobs: 112 }, { name: "UK Damp Solutions", trade: "Damp Specialist", rating: "4.7", jobs: 143 }].map((c) => (
                  <button key={c.name} onClick={() => { setShowAssignModal(false); showSuccess("Contractor assigned — awaiting human approval"); }} className="w-full text-left p-3 rounded-lg border border-[#E2E8F0] hover:border-[#C28A78]/30 hover:bg-[#F8FAFC] transition-all flex items-center justify-between">
                    <div><p className="text-sm font-medium text-[#3A3F3A]">{c.name}</p><p className="text-xs text-[#94A3B8]">{c.trade} · {c.jobs} jobs</p></div>
                    <div className="flex items-center gap-1"><i className="ri-star-fill text-[#F59E0B] text-xs"></i><span className="text-xs text-[#687068]">{c.rating}</span></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Action Modal */}
        {showActionModal && currentIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowActionModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div><h3 className="text-lg font-semibold text-[#3A3F3A]">Create Maintenance Action</h3><p className="text-xs text-[#94A3B8]">Recommendation Record #{currentIssue.id}</p></div>
                  <button onClick={() => setShowActionModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"><i className="ri-close-line text-[#687068]"></i></button>
                </div>
                <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4 mb-5 flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0"><i className="ri-shield-user-line text-[#F59E0B] text-lg"></i></div>
                  <div><p className="text-sm font-semibold text-[#3A3F3A]">Human Remains in Control</p><p className="text-xs text-[#687068] mt-0.5">This action will not be auto-approved. A human must review and approve before any contractor is dispatched.</p></div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Priority</p><span className={`text-sm font-bold ${severityConfig[currentIssue.severity].color}`}>{currentIssue.severity}</span></div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Prediction</p><span className="text-sm font-semibold text-[#3A3F3A]">{categoryConfig[currentIssue.category].predictionLabel}</span></div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Contractor</p><span className="text-sm font-semibold text-[#3A3F3A]">{currentIssue.trade}</span></div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Confidence</p><span className="text-sm font-semibold text-[#3A3F3A]">{currentIssue.confidence}%</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Estimated Cost</p><p className="text-sm font-semibold text-[#3A3F3A]">{currentIssue.estimatedCost}</p></div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3"><p className="text-xs text-[#94A3B8]">Estimated Time</p><p className="text-sm font-semibold text-[#3A3F3A]">{currentIssue.estimatedTime}</p></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowActionModal(false); showSuccess("Approved! Contractor will be dispatched. Tenant notified."); }} className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">Approve & Create Action</button>
                  <button onClick={() => { setShowActionModal(false); showSuccess("Maintenance action created and recommendation record logged. Awaiting human approval."); }} className="flex-1 py-2.5 border border-[#C28A78]/20 text-[#C28A78] rounded-lg text-sm font-medium hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Create for Review</button>
                  <button onClick={() => setShowActionModal(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}