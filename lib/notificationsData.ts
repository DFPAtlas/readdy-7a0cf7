"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { isDemoAccount } from "@/lib/demoMode";
import {
  getDefaultPreferences,
  seedNotifications,
  type NotificationEventType,
  type NotificationItem,
  type NotificationPreference,
} from "@/app/dashboard/notifications/NotificationCentreData";

const EVENT_TYPES: NotificationEventType[] = [
  "maintenance_update",
  "inspection_scheduled",
  "inspection_completed",
  "compliance_expiry",
  "rent_overdue",
  "quote_awaiting",
  "document_uploaded",
  "portal_invite",
];

function toEventType(value: string | null): NotificationEventType {
  return (EVENT_TYPES as string[]).includes(value || "") ? (value as NotificationEventType) : "maintenance_update";
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Notifications for the signed-in user (sample data in demo mode). */
export async function loadNotifications(limit = 50): Promise<NotificationItem[]> {
  if (isDemoAccount()) return seedNotifications;
  const userId = await currentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, type, is_read, action_url, created_at")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    title: row.title || "Notification",
    body: row.body || "",
    type: toEventType(row.type),
    isRead: Boolean(row.is_read),
    actionUrl: row.action_url || "/dashboard/notifications",
    channel: "push",
    sentAt: row.created_at ? relativeTime(row.created_at) : "",
    readAt: null,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isDemoAccount()) return;
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (isDemoAccount()) return;
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("notifications").update({ is_read: true }).eq("profile_id", userId).eq("is_read", false);
}

type PreferenceRow = {
  email_enabled: boolean | null;
  push_enabled: boolean | null;
  sms_enabled: boolean | null;
} & Partial<Record<NotificationEventType, boolean | null>>;

/**
 * The notification_preferences table stores one on/off switch per event and
 * one switch per channel. The UI shows a grid, so an event is shown as enabled
 * on a channel when both the event and the channel are switched on.
 */
export async function loadNotificationPreferences(): Promise<NotificationPreference[]> {
  const defaults = getDefaultPreferences();
  if (isDemoAccount()) return defaults;
  const userId = await currentUserId();
  if (!userId) return defaults;

  const { data } = await supabase
    .from("notification_preferences")
    .select("email_enabled, push_enabled, sms_enabled, " + EVENT_TYPES.join(", "))
    .eq("profile_id", userId)
    .maybeSingle();

  if (!data) return defaults;
  const row = data as unknown as PreferenceRow;

  return defaults.map((pref) => {
    const eventOn = row[pref.eventType] !== false;
    return {
      ...pref,
      emailEnabled: eventOn && row.email_enabled !== false,
      pushEnabled: eventOn && row.push_enabled !== false,
      smsEnabled: eventOn && row.sms_enabled === true,
    };
  });
}

export async function saveNotificationPreferences(prefs: NotificationPreference[]): Promise<{ ok: boolean; message: string }> {
  if (isDemoAccount()) return { ok: true, message: "Demo mode — preferences were not saved." };
  const userId = await currentUserId();
  if (!userId) return { ok: false, message: "Please sign in again to save your preferences." };

  type PreferenceInsert = Database["public"]["Tables"]["notification_preferences"]["Insert"];
  const row: PreferenceInsert = {
    profile_id: userId,
    email_enabled: prefs.some((p) => p.emailEnabled),
    push_enabled: prefs.some((p) => p.pushEnabled),
    sms_enabled: prefs.some((p) => p.smsEnabled),
    updated_at: new Date().toISOString(),
  };
  for (const pref of prefs) {
    (row as Record<string, unknown>)[pref.eventType] = pref.emailEnabled || pref.pushEnabled || pref.smsEnabled;
  }

  const { error } = await supabase.from("notification_preferences").upsert(row, { onConflict: "profile_id" });
  if (error) return { ok: false, message: "We couldn't save your preferences. Please try again." };
  return { ok: true, message: "Notification preferences saved" };
}
