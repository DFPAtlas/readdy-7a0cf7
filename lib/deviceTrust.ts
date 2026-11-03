"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { currentDeviceLabel } from "@/lib/accountSession";
import { isDemoAccount } from "@/lib/demoMode";

export interface NewDeviceAlert {
  deviceLabel: string;
  previousDevice: string | null;
  signedInAt: string | null;
  marker: string;
}

const TRUST_PREFIX = "lethub_trusted_devices";
const DISMISS_PREFIX = "lethub_new_device_dismissed";

function readTrusted(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${TRUST_PREFIX}_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function rememberDevice(userId: string, label: string) {
  try {
    const existing = readTrusted(userId);
    if (existing.includes(label)) return;
    localStorage.setItem(
      `${TRUST_PREFIX}_${userId}`,
      JSON.stringify([...existing, label].slice(-12))
    );
  } catch {
    /* storage unavailable */
  }
}

function alreadyAcknowledged(marker: string): boolean {
  try {
    return localStorage.getItem(`${DISMISS_PREFIX}_${marker}`) === "1";
  } catch {
    return false;
  }
}

function acknowledge(marker: string) {
  try {
    localStorage.setItem(`${DISMISS_PREFIX}_${marker}`, "1");
  } catch {
    /* storage unavailable */
  }
}

export function useNewDeviceAlert() {
  const [alert, setAlert] = useState<NewDeviceAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const inspect = async () => {
      try {
        if (typeof window === "undefined" || isDemoAccount()) return;

        const { data, error } = await supabase.auth.getSession();
        const session = data.session;
        if (error || !session) return;

        const userId = session.user.id;
        const label = currentDeviceLabel();
        const signedInAt = session.user.last_sign_in_at || null;
        const marker = `${userId}_${signedInAt || "current"}`;

        if (readTrusted(userId).includes(label)) return;
        if (alreadyAcknowledged(marker)) return;

        const signedInMs = signedInAt ? new Date(signedInAt).getTime() : Date.now();
        const cutoff = new Date(
          (Number.isNaN(signedInMs) ? Date.now() : signedInMs) - 60000
        ).toISOString();

        const { data: priorRows, error: priorError } = await supabase
          .from("user_security_events")
          .select("device, created_at")
          .eq("user_id", userId)
          .eq("device", label)
          .lt("created_at", cutoff)
          .limit(1);

        if (!active) return;
        if (priorError) return;

        if (priorRows && priorRows.length > 0) {
          rememberDevice(userId, label);
          return;
        }

        const { data: previousRows } = await supabase
          .from("user_security_events")
          .select("device, created_at")
          .eq("user_id", userId)
          .in("event_type", ["sign_in", "email_otp"])
          .lt("created_at", cutoff)
          .order("created_at", { ascending: false })
          .limit(8);

        if (!active) return;

        const previousDevice =
          (previousRows || []).find((row) => row.device && row.device !== label)?.device ||
          null;

        setAlert({ deviceLabel: label, previousDevice, signedInAt, marker });
      } catch {
        /* fail quietly, never block the dashboard */
      } finally {
        if (active) setLoading(false);
      }
    };

    inspect();

    return () => {
      active = false;
    };
  }, []);

  const dismiss = useCallback(() => {
    setAlert((current) => {
      if (!current) return null;
      acknowledge(current.marker);
      const userId = current.marker.split("_")[0];
      if (userId) rememberDevice(userId, current.deviceLabel);
      return null;
    });
  }, []);

  return { alert, loading, dismiss };
}

export function formatAlertTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === today.toDateString()) return `Today at ${time}`;
  return `${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })} at ${time}`;
}