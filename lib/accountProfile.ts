"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";

export interface AccountProfile {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  agencyId: string | null;
  agencyName: string | null;
  workspaceRole: string | null;
  demo: boolean;
}

export interface AccountProfileState {
  profile: AccountProfile | null;
  loading: boolean;
  error: string | null;
  saveFullName: (fullName: string) => Promise<{ success: boolean; error?: string }>;
  setAvatarUrl: (url: string | null) => void;
  reload: () => Promise<void>;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function joinName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export function useAccountProfile(): AccountProfileState {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoAccount()) {
      const stored = typeof window !== "undefined" ? localStorage.getItem("lethub_name") : null;
      setProfile({
        userId: "demo",
        fullName: stored || "Sarah Cooper",
        email: "demo@lethub.uk",
        avatarUrl: null,
        role: "estate_agent_admin",
        agencyId: null,
        agencyName: "Demo agency workspace",
        workspaceRole: "agency_admin",
        demo: true,
      });
      setLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;

      if (userError || !user) {
        setError("We couldn't load your account details. Please sign in again.");
        setLoading(false);
        return;
      }

      const { data: row, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("We couldn't load your profile details. Please refresh the page.");
        setLoading(false);
        return;
      }

      let agencyId: string | null = null;
      let agencyName: string | null = null;
      let workspaceRole: string | null = null;

      const { data: membership } = await supabase
        .from("agency_members")
        .select("agency_id, role")
        .eq("profile_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membership?.agency_id) {
        agencyId = membership.agency_id;
        workspaceRole = membership.role || null;

        const { data: agency } = await supabase
          .from("agencies")
          .select("name")
          .eq("id", membership.agency_id)
          .maybeSingle();

        agencyName = agency?.name || null;
      }

      setProfile({
        userId: user.id,
        fullName: row?.full_name || user.email || "",
        email: row?.email || user.email || "",
        avatarUrl: row?.avatar_url || null,
        role: row?.role || "estate_agent_staff",
        agencyId,
        agencyName,
        workspaceRole,
        demo: false,
      });
    } catch {
      setError("Something went wrong while loading your account details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveFullName = useCallback(
    async (fullName: string) => {
      const cleaned = fullName.trim();
      if (!cleaned) return { success: false, error: "Please enter your name." };

      if (!profile) return { success: false, error: "Your account is still loading." };

      if (profile.demo) {
        if (typeof window !== "undefined") localStorage.setItem("lethub_name", cleaned);
        setProfile({ ...profile, fullName: cleaned });
        return { success: true };
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: cleaned })
        .eq("id", profile.userId);

      if (updateError) {
        return { success: false, error: "We couldn't save your name. Please try again." };
      }

      setProfile({ ...profile, fullName: cleaned });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("account-profile-updated", { detail: cleaned }));
      }
      return { success: true };
    },
    [profile]
  );

  const setAvatarUrl = useCallback((url: string | null) => {
    setProfile((current) => (current ? { ...current, avatarUrl: url } : current));
  }, []);

  return { profile, loading, error, saveFullName, setAvatarUrl, reload: load };
}

export function nameParts(fullName: string) {
  return splitName(fullName);
}