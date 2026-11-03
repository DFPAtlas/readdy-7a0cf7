"use client";

import { useEffect, useState } from "react";
import AvatarUploader from "@/components/dashboard/AvatarUploader";
import { nameParts, joinName, useAccountProfile } from "@/lib/accountProfile";
import { ROLE_LABELS, type AppRole } from "@/lib/rbac";

export default function AccountProfileCard({ onToast }: { onToast: (message: string) => void }) {
  const { profile, loading, error, saveFullName, setAvatarUrl } = useAccountProfile();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const parts = nameParts(profile.fullName);
    setFirstName(parts.firstName);
    setLastName(parts.lastName);
  }, [profile?.fullName]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-[#F1F5F9] animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#F1F5F9] animate-pulse" />
          <div className="h-4 w-32 rounded bg-[#F1F5F9] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 rounded bg-[#F1F5F9] animate-pulse" />
          <div className="h-10 rounded bg-[#F1F5F9] animate-pulse" />
          <div className="h-10 rounded bg-[#F1F5F9] animate-pulse" />
          <div className="h-10 rounded bg-[#F1F5F9] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-xl border border-[#FECACA] p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#FEF2F2] flex-shrink-0">
            <i className="ri-error-warning-line text-[#DC2626]"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-[#3A3F3A]">Account details unavailable</p>
            <p className="text-xs text-[#687068] mt-1">{error || "Please refresh the page and try again."}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const fullName = joinName(firstName, lastName);
    if (!fullName) {
      setFormError("Please enter your name before saving.");
      return;
    }

    setFormError(null);
    setSaving(true);
    const result = await saveFullName(fullName);
    setSaving(false);

    if (!result.success) {
      setFormError(result.error || "We couldn't save your changes.");
      return;
    }

    onToast(profile.demo ? "Saved for this demo session" : "Profile saved");
  };

  const roleLabel = ROLE_LABELS[profile.role as AppRole] || "Team member";

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-semibold text-[#3A3F3A]">Profile Information</h2>
        <span className="text-xs text-[#687068] bg-[#FBF9F4] border border-[#D5D9D5] rounded-full px-2.5 py-1">
          {roleLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16">
          <AvatarUploader
            userId={profile.userId}
            currentUrl={profile.avatarUrl}
            userName={profile.fullName || profile.email}
            role={profile.role}
            onAvatarUpdate={(url) => {
              setAvatarUrl(url);
              onToast("Photo updated");
            }}
            size="lg"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-[#3A3F3A]">{profile.fullName || "Your name"}</p>
          <p className="text-xs text-[#687068] mt-0.5">
            {profile.demo ? "Demo account — changes stay in this browser" : "Click your photo to upload a new one"}
          </p>
          <p className="text-xs text-[#94A3B8] mt-0.5">JPG or PNG, up to 5MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="min-w-0">
          <label htmlFor="settings-first-name" className="block text-sm font-medium text-[#3A3F3A] mb-1.5">
            First name
          </label>
          <input
            id="settings-first-name"
            name="first_name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="First name"
            className="w-full box-border px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="settings-last-name" className="block text-sm font-medium text-[#3A3F3A] mb-1.5">
            Last name
          </label>
          <input
            id="settings-last-name"
            name="last_name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Last name"
            className="w-full box-border px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="settings-email" className="block text-sm font-medium text-[#3A3F3A] mb-1.5">
            Email
          </label>
          <input
            id="settings-email"
            name="email"
            type="email"
            value={profile.email}
            readOnly
            className="w-full box-border px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] bg-[#FBF9F4] outline-none cursor-not-allowed"
          />
          <p className="text-xs text-[#94A3B8] mt-1">This is your sign-in email. Contact support to change it.</p>
        </div>
        <div className="min-w-0">
          <label htmlFor="settings-company" className="block text-sm font-medium text-[#3A3F3A] mb-1.5">
            Company
          </label>
          <input
            id="settings-company"
            name="company"
            type="text"
            value={profile.agencyName || "Not linked to an agency"}
            readOnly
            className="w-full box-border px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] bg-[#FBF9F4] outline-none cursor-not-allowed"
          />
          <p className="text-xs text-[#94A3B8] mt-1">Your agency name is managed by your platform admin.</p>
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA] px-3 py-2">
          <i className="ri-error-warning-line text-[#DC2626] text-sm"></i>
          <p className="text-xs text-[#B91C1C]">{formError}</p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-[#D5D9D5]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#C28A78] hover:bg-[#143828] disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}