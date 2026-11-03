"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EnsureLandlordRecord() {
  useEffect(() => {
    const ensure = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile || profile.role !== "landlord") return;

      const { data: existing } = await supabase
        .from("landlords")
        .select("id")
        .eq("owner_profile_id", session.user.id)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("landlords").insert({
          display_name: profile.full_name || session.user.email || "Landlord",
          owner_profile_id: session.user.id,
          is_company: false,
        });
        if (error) {
          console.error("Failed to create landlord record:", error);
        }
      }
    };

    ensure();
  }, []);

  return null;
}