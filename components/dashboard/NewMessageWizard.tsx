"use client";

import { useState } from "react";
import {
  ParticipantType,
  MessageContext,
  participantTypes,
  messageContexts,
} from "@/lib/communicationSystem";

type Step = 1 | 2 | 3 | 4 | 5;

interface RecipientOption {
  id: string;
  name: string;
  type: ParticipantType;
  email: string;
  relatedRecord: string;
  propertyName?: string;
}

const mockEligibleRecipients: RecipientOption[] = [
  { id: "tnt-001", name: "John Miller", type: "tenant", email: "john.m@example.com", relatedRecord: "Tenancy at 12 Rose Avenue", propertyName: "12 Rose Avenue" },
  { id: "tnt-002", name: "Sarah Jenkins", type: "tenant", email: "s.jenkins@example.com", relatedRecord: "Tenancy at Flat 4B Oak Street", propertyName: "Flat 4B Oak Street" },
  { id: "tnt-003", name: "Emily Carter", type: "tenant", email: "e.carter@example.com", relatedRecord: "Tenancy at 45 Baker Street", propertyName: "45 Baker Street" },
  { id: "own-001", name: "James Richardson", type: "landlord", email: "j.richardson@example.com", relatedRecord: "3 Properties", propertyName: "Rose Court Flat 2A" },
  { id: "own-002", name: "Sarah Walker", type: "landlord", email: "s.walker@example.com", relatedRecord: "2 Properties", propertyName: "45 Baker Street" },
  { id: "ctr-001", name: "GreenPlumb Ltd", type: "contractor", email: "jobs@greenplumb.co.uk", relatedRecord: "Plumbing Contractor", propertyName: "Multiple Jobs" },
  { id: "ag-001", name: "Tom Wilson", type: "agency", email: "t.wilson@lethub.uk", relatedRecord: "Maintenance Coordinator", propertyName: "London Office" },
];

interface Props {
  onClose: () => void;
  onSend: (data: { recipient: RecipientOption; context: MessageContext; subject: string; body: string }) => void;
}

export default function NewMessageWizard({ onClose, onSend }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [recipientType, setRecipientType] = useState<ParticipantType | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption | null>(null);
  const [searchRecipient, setSearchRecipient] = useState("");
  const [context, setContext] = useState<MessageContext>("general");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const filteredRecipients = mockEligibleRecipients.filter((r) => {
    if (recipientType && r.type !== recipientType) return false;
    if (searchRecipient) {
      const q = searchRecipient.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.relatedRecord.toLowerCase().includes(q);
    }
    return true;
  });

  const contextOptions: MessageContext[] = ["general", "rent", "maintenance", "inspection", "compliance", "document", "quote", "portal_invite"];

  const stepLabels = ["Type", "Recipient", "Context", "Compose", "Review"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
              <i className="ri-edit-line text-[#C28A78]"></i>
            </div>
            <div>
              <h3 className="font-semibold text-[#3A3F3A]">New Message</h3>
              <p className="text-xs text-[#687068]">Step {step} of 5 — {stepLabels[step - 1]}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#94A3B8]"></i></button>
        </div>

        <div className="flex items-center gap-1 px-6 py-3 border-b border-[#D5D9D5] bg-[#FBF9F4]">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= s ? "bg-[#C28A78] text-white" : "bg-[#D5D9D5] text-[#94A3B8]"}`}>{s}</div>
              <span className={`text-[11px] hidden sm:block ${step >= s ? "text-[#3A3F3A] font-medium" : "text-[#94A3B8]"}`}>{stepLabels[s - 1]}</span>
              {s < 5 && <div className={`flex-1 h-px ${step > s ? "bg-[#C28A78]" : "bg-[#D5D9D5]"}`}></div>}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-[#687068]">Select who you want to message:</p>
              {(["tenant", "landlord", "contractor", "agency"] as ParticipantType[]).map((pt) => {
                const config = participantTypes[pt];
                return (
                  <button
                    key={pt}
                    onClick={() => { setRecipientType(pt); setStep(2); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border border-[#D5D9D5] hover:border-[#C28A78] transition-colors text-left ${recipientType === pt ? "border-[#C28A78] bg-[#C28A78]/5" : ""}`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <i className={`${config.icon} text-lg`} style={{ color: config.color }}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{config.label}</p>
                      <p className="text-xs text-[#687068] mt-0.5">
                        {pt === "tenant" ? "Send messages about rent, maintenance, inspections" : pt === "landlord" ? "Share updates, reports, and approval requests" : pt === "contractor" ? "Discuss jobs, quotes, and appointments" : "Communicate with your team internally"}
                      </p>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center ml-auto"><i className="ri-arrow-right-s-line text-[#94A3B8]"></i></div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-search-line text-[#94A3B8] text-sm"></i></div>
                <input
                  type="text"
                  value={searchRecipient}
                  onChange={(e) => setSearchRecipient(e.target.value)}
                  placeholder="Search by name, email, or property..."
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
              {filteredRecipients.map((r) => {
                const config = participantTypes[r.type];
                return (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedRecipient(r); setStep(3); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] transition-colors text-left ${selectedRecipient?.id === r.id ? "border-[#C28A78] bg-[#C28A78]/5" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <i className={`${config.icon} text-xs`} style={{ color: config.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{r.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068]">{config.label}</span>
                        <span className="text-xs text-[#94A3B8] truncate">{r.relatedRecord}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-[#687068]">Link this message to a context:</p>
              {contextOptions.map((ctx) => {
                const ctxConfig = messageContexts[ctx];
                return (
                  <button
                    key={ctx}
                    onClick={() => { setContext(ctx); setStep(4); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] transition-colors text-left ${context === ctx ? "border-[#C28A78] bg-[#C28A78]/5" : ""}`}
                  >
                    <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${ctxConfig.icon} text-[#687068] text-sm`}></i>
                    </div>
                    <span className="text-sm font-medium text-[#3A3F3A]">{ctxConfig.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Quarterly inspection reminder — Rose Court"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={8}
                  maxLength={2000}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white resize-none"
                />
                <p className="text-xs text-[#94A3B8] mt-1">{body.length}/2000</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-[#FBF9F4] rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-[#3A3F3A]">Review Your Message</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-[#94A3B8]">To</p>
                    <p className="text-[#3A3F3A] font-medium">{selectedRecipient?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Recipient Type</p>
                    <p className="text-[#3A3F3A]">{selectedRecipient ? participantTypes[selectedRecipient.type].label : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Context</p>
                    <p className="text-[#3A3F3A]">{messageContexts[context].label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Related</p>
                    <p className="text-[#3A3F3A]">{selectedRecipient?.relatedRecord || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Subject</p>
                  <p className="text-sm text-[#3A3F3A] font-medium">{subject || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Message Preview</p>
                  <p className="text-sm text-[#3A3F3A] whitespace-pre-wrap bg-white border border-[#D5D9D5] rounded-lg p-3">{body || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4] rounded-b-2xl flex-shrink-0">
          <div>
            {step > 1 && (
              <button onClick={() => setStep((s) => (s - 1) as Step)} className="text-sm font-medium text-[#687068] px-4 py-2 rounded-lg hover:bg-[#D5D9D5] transition-colors whitespace-nowrap">Back</button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step < 4 && (
              <button onClick={() => {/* allow skipping to compose */}} disabled className="text-sm text-[#94A3B8] px-3 py-2">Fill step first</button>
            )}
            {step === 4 && (
              <button
                onClick={() => { if (subject.trim() && body.trim()) setStep(5); }}
                disabled={!subject.trim() || !body.trim()}
                className="text-sm font-medium text-white bg-[#C28A78] px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                Review
              </button>
            )}
            {step === 5 && (
              <button
                onClick={() => {
                  if (selectedRecipient) {
                    onSend({ recipient: selectedRecipient, context, subject, body });
                    onClose();
                  }
                }}
                className="text-sm font-medium text-white bg-[#7A9A7E] px-5 py-2.5 rounded-lg hover:bg-[#059669] transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-send-plane-fill text-sm"></i></div>
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}