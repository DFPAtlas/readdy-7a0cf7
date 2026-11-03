"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { currentDeviceLabel } from "@/lib/accountSession";

export type SecurityEventType =
  | "sign_in"
  | "sign_out"
  | "password_changed"
  | "email_otp"
  | "session_revoked"
  | "profile_updated";

export interface SecurityEvent {
  id: string;
  event_type: SecurityEventType;
  description: string | null;
  device: string | null;
  created_at: string;
}

export async function logSecurityEvent(
  eventType: SecurityEventType,
  description: string
): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;

    const { error } = await supabase.from("user_security_events").insert({
      user_id: userId,
      event_type: eventType,
      description,
      device: currentDeviceLabel(),
    });

    if (error) {
      console.warn("Security event could not be recorded", error.message);
    }
  } catch {
    console.warn("Security event could not be recorded");
  }
}

export function formatEventTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) return `Today, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}, ${time}`;
}

export function useSecurityEvents(limit = 12) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("user_security_events")
        .select("id, event_type, description, device, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fetchError) {
        setError("We couldn't load your security activity. Please refresh the page.");
        setLoading(false);
        return;
      }

      setEvents((data || []) as SecurityEvent[]);
    } catch {
      setError("Something went wrong while loading your security activity.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { events, loading, error, reload: load };
}