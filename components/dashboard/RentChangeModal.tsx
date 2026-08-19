"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface RentChangeModalProps {
  propertyId: string;
  propertyName: string;
  currentRent: number;
  tenantName?: string;
  onClose: () => void;
  onUpdated: (newRent: number) => void;
}

export default function RentChangeModal({
  propertyId,
  propertyName,
  currentRent,
  tenantName,
  onClose,
  onUpdated,
}: RentChangeModalProps) {
  const [newRent, setNewRent] = useState(currentRent.toString());
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const diff = parseInt(newRent || "0", 10) - currentRent;
  const percent = currentRent > 0 ? ((diff / currentRent) * 100).toFixed(1) : "0";

  async function handleSubmit() {
    const amount = parseInt(newRent, 10);
    if (!amount || amount <= 0) {
      setError("Enter a valid rent amount");
      return;
    }
    setError("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not logged in");
      setSaving(false);
      return;
    }

    const { error: updateErr } = await supabase
      .from("properties")
      .update({ rent_pcm: amount })
      .eq("id", propertyId)
      .eq("landlord_id", user.id);

    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }

    const { error: auditErr } = await supabase.from("rent_increases").insert({
      tenancy_id: propertyId,
      old_amount: currentRent,
      new_amount: amount,
      effective_from: effectiveDate,
      notice_served_on: new Date().toISOString().split("T")[0],
      tenant_challenged: false,
    });

    if (auditErr) {
      setError(auditErr.message);
      setSaving(false);
      return;
    }

    setDone(true);
    onUpdated(amount);
    setTimeout(() => onClose(), 1200);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="font-semibold text-[#3A3F3A]">Change Rent</h3>
            <p className="text-xs text-[#94A3B8]">{propertyName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-close-line text-[#687068]"></i>
            </div>
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-check-line text-[#10B981] text-xl"></i>
              </div>
            </div>
            <h4 className="font-semibold text-[#3A3F3A] mb-1">Rent Updated</h4>
            <p className="text-sm text-[#687068]">
              New rent of £{parseInt(newRent, 10).toLocaleString()} saved
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Current vs New */}
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-[#F8FAFC] rounded-xl p-4 text-center">
                <p className="text-xs text-[#94A3B8] mb-1">Current Rent</p>
                <p className="text-xl font-bold text-[#3A3F3A]">
                  £{currentRent.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-arrow-right-line text-[#C28A78]"></i>
              </div>
              <div className="flex-1 bg-[#C28A78]/5 rounded-xl p-4 text-center border border-[#C28A78]/10">
                <p className="text-xs text-[#C28A78] mb-1">New Rent</p>
                <p className="text-xl font-bold text-[#C28A78]">
                  £
                  {parseInt(newRent || "0", 10).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Change indicator */}
            {diff !== 0 && (
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    diff > 0 ? "text-[#EF4444]" : "text-[#10B981]"
                  }`}
                >
                  {diff > 0 ? "+" : ""}
                  £{diff.toLocaleString()} ({diff > 0 ? "+" : ""}
                  {percent}%)
                </span>
                {tenantName && (
                  <span className="text-xs text-[#94A3B8]">
                    for {tenantName}
                  </span>
                )}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">
                  New Monthly Rent (£)
                </label>
                <input
                  type="number"
                  min={1}
                  value={newRent}
                  onChange={(e) => setNewRent(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:ring-2 focus:ring-[#C28A78]/30 focus:border-[#C28A78]"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">
                  Effective From
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:ring-2 focus:ring-[#C28A78]/30 focus:border-[#C28A78]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={200}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:ring-2 focus:ring-[#C28A78]/30 focus:border-[#C28A78]"
                  placeholder="e.g. Market rate increase, annual review..."
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/5 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Update Rent"}
              </button>
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}