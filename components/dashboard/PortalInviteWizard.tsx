"use client";

import { useState } from "react";
import { portalTypeConfig } from "@/lib/portalStatus";

interface PortalRecord {
  id: string;
  name: string;
  email: string;
  relatedRecord: string;
  recordLabel: string;
}

interface Props {
  onClose: () => void;
  onSend: (data: { portalType: string; recordId: string; email: string; message: string }) => void;
  sending: boolean;
  eligibleOwners: PortalRecord[];
  eligibleTenants: PortalRecord[];
  eligibleContractors: PortalRecord[];
}

const steps = ["Select Portal Type", "Select Person", "Customise", "Confirm"];

export default function PortalInviteWizard({ onClose, onSend, sending, eligibleOwners, eligibleTenants, eligibleContractors }: Props) {
  const [step, setStep] = useState(0);
  const [portalType, setPortalType] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PortalRecord | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [searchPerson, setSearchPerson] = useState("");

  const typeConfig = portalTypeConfig[portalType] || null;

  const handleSelectType = (type: string) => {
    setPortalType(type);
    setStep(1);
    setSelectedRecord(null);
    setEmail("");
  };

  const getEligibleList = (): PortalRecord[] => {
    if (portalType === "owner") return eligibleOwners;
    if (portalType === "tenant") return eligibleTenants;
    if (portalType === "contractor") return eligibleContractors;
    return [];
  };

  const filteredList = getEligibleList().filter(
    (r) =>
      r.name.toLowerCase().includes(searchPerson.toLowerCase()) ||
      r.relatedRecord.toLowerCase().includes(searchPerson.toLowerCase())
  );

  const handleSelectRecord = (record: PortalRecord) => {
    setSelectedRecord(record);
    setEmail(record.email);
    setStep(2);
  };

  const handleReview = () => {
    setStep(3);
  };

  const handleConfirm = () => {
    if (!selectedRecord) return;
    onSend({
      portalType,
      recordId: selectedRecord.id,
      email,
      message,
    });
  };

  const stepLabels = steps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
              <i className="ri-mail-send-line text-[#C28A78] text-lg"></i>
            </div>
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Invite User</h2>
              <p className="text-xs text-[#687068]">Step {step + 1} of {steps.length}: {stepLabels[step]}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>

        <div className="flex items-center gap-1 px-6 py-3 bg-[#FBF9F4] border-b border-[#D5D9D5]">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < step ? "bg-[#7A9A7E] text-white" :
                i === step ? "bg-[#C28A78] text-white" :
                "bg-[#F1F5F9] text-[#94A3B8]"
              }`}>
                {i < step ? <i className="ri-check-line text-[8px]"></i> : i + 1}
              </div>
              <span className={`text-[10px] ${i <= step ? "text-[#3A3F3A] font-medium" : "text-[#94A3B8]"} hidden sm:inline`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-4 h-px ${i < step ? "bg-[#7A9A7E]" : "bg-[#D5D9D5]"}`}></div>}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-[#687068] mb-4">What type of portal do you want to invite this person to?</p>
              {Object.entries(portalTypeConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleSelectType(key)}
                  className="w-full flex items-start gap-4 p-4 rounded-xl border border-[#D5D9D5] hover:border-[#C28A78] hover:bg-[#FBF9F4] transition-all text-left cursor-pointer"
                >
                  <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <i className={`${config.icon} ${config.color} text-xl`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3A3F3A]">{config.label}</p>
                    <p className="text-xs text-[#687068] mt-1 leading-relaxed">{config.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1 && typeConfig && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${typeConfig.bg} rounded-lg flex items-center justify-center`}>
                  <i className={`${typeConfig.icon} ${typeConfig.color} text-lg`}></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A]">{typeConfig.label}</p>
                  <p className="text-xs text-[#687068]">Select the person to invite</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                </div>
                <input
                  type="text"
                  value={searchPerson}
                  onChange={(e) => setSearchPerson(e.target.value)}
                  placeholder="Search by name or record..."
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#94A3B8]">No eligible {portalType}s found</p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {portalType === "owner" ? "Add landlords first in the Landlords section." :
                       portalType === "tenant" ? "Add tenants and tenancies first." :
                       "Add contractors in the Contractors section."}
                    </p>
                  </div>
                ) : (
                  filteredList.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => handleSelectRecord(record)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] hover:bg-[#FBF9F4] transition-all text-left cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{record.name}</p>
                        <p className="text-xs text-[#687068]">{record.relatedRecord}</p>
                        {record.email && <p className="text-xs text-[#94A3B8]">{record.email}</p>}
                      </div>
                      <i className="ri-arrow-right-s-line text-[#94A3B8]"></i>
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={() => setStep(0)}
                className="text-xs font-medium text-[#687068] hover:text-[#3A3F3A] transition-colors whitespace-nowrap"
              >
                ← Back to portal type selection
              </button>
            </div>
          )}

          {step === 2 && selectedRecord && typeConfig && (
            <div className="space-y-4">
              <div className="bg-[#FBF9F4] rounded-xl p-4 border border-[#D5D9D5]">
                <p className="text-xs text-[#94A3B8] mb-2">Recipient</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{selectedRecord.name}</p>
                <p className="text-xs text-[#687068]">{selectedRecord.relatedRecord}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Recipient Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@email.com"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                />
                {!email && <p className="text-xs text-[#EF4444] mt-1">Email address is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Personal Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${selectedRecord.name.split(" ")[0]}, you have been invited to access the ${typeConfig.label.toLowerCase()} portal...`}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white resize-none"
                />
                <p className="text-xs text-[#94A3B8] mt-1">{message.length}/500</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleReview}
                  disabled={!email}
                  className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  Review Invitation
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedRecord && typeConfig && (
            <div className="space-y-4">
              <div className="bg-[#FBF9F4] rounded-xl p-4 border border-[#D5D9D5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Portal Type</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{typeConfig.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Recipient</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedRecord.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Email</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Related Record</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">{selectedRecord.relatedRecord}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Expires</span>
                  <span className="text-sm font-medium text-[#3A3F3A]">7 days</span>
                </div>
              </div>

              {message && (
                <div className="bg-[#F0F7FF] rounded-xl p-4 border border-[#BFDBFE]">
                  <p className="text-xs text-[#94A3B8] mb-1">Message Preview</p>
                  <p className="text-sm text-[#3A3F3A]">{message}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleConfirm}
                  disabled={sending}
                  className="flex-1 bg-[#7A9A7E] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sending ? "Sending..." : "Confirm & Send Invitation"}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}