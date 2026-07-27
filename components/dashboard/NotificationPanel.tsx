"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "urgent" | "warning" | "info" | "success";
  read: boolean;
}

const typeStyles: Record<string, { dot: string; bg: string }> = {
  urgent: { dot: "bg-[#C46868]", bg: "bg-[#C46868]/5" },
  warning: { dot: "bg-[#D4A85C]", bg: "bg-[#D4A85C]/5" },
  info: { dot: "bg-[#3B82F6]", bg: "bg-[#3B82F6]/5" },
  success: { dot: "bg-[#7A9A7E]", bg: "bg-[#7A9A7E]/5" },
};

const mockNotifications: Notification[] = [
  { id: "m1", title: "Gas Safety Certificate Expiring", description: "45 Baker Street — expires in 5 days", time: "5 min ago", type: "urgent", read: false },
  { id: "m2", title: "EPC Rating Due", description: "8 The Crescent, Leeds — expires 12 Dec", time: "1 hour ago", type: "warning", read: false },
  { id: "m3", title: "Rent Overdue", description: "John Miller — £1,850 outstanding for 3 days", time: "2 hours ago", type: "urgent", read: false },
  { id: "m4", title: "Contractor Quote Received", description: "GreenPlumb Ltd — Boiler repair £340", time: "3 hours ago", type: "info", read: false },
  { id: "m5", title: "Inspection Completed", description: "Flat 4B Oak Street — all clear", time: "5 hours ago", type: "success", read: true },
  { id: "m6", title: "New Tenancy Application", description: "Sarah Jenkins — 12 Rose Avenue", time: "1 day ago", type: "info", read: true },
  { id: "m7", title: "EICR Certificate Expiring", description: "34 Maple Gardens — expires 18 Dec", time: "1 day ago", type: "warning", read: false },
  { id: "m8", title: "Smoke Alarm Test Due", description: "21 High Street — quarterly test", time: "2 days ago", type: "info", read: true },
];

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function mapType(notifType: string | null): Notification["type"] {
  const t = (notifType || "").toLowerCase();
  if (t === "urgent" || t === "critical" || t === "alert") return "urgent";
  if (t === "warning" || t === "expiring") return "warning";
  if (t === "success" || t === "completed") return "success";
  return "info";
}

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setNotifications(mockNotifications);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, type, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!data || data.length === 0) {
        setNotifications(mockNotifications);
        setLoading(false);
        return;
      }

      const built: Notification[] = data.map((n: any) => ({
        id: n.id,
        title: n.title || "Notification",
        description: n.body || "",
        time: timeAgo(n.created_at),
        type: mapType(n.type),
        read: n.is_read || false,
      }));

      setNotifications(built);
    } catch {
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtimeSubscription({
    table: "notifications",
    event: "*",
    onChange: fetchNotifications,
    channelName: "rt-notification-panel",
  });

  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
          <h2 className="font-semibold text-[#3A3F3A]">Notifications</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[#3A3F3A]">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-[#C46868] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-[#EBE5DA] p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${filter === "all" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${filter === "unread" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-[#C28A78] font-medium hover:underline">
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-[#D5D9D5]">
        {filtered.map((n) => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors ${n.read ? "hover:bg-[#FBF9F4]" : `${typeStyles[n.type].bg} hover:bg-[#FBF9F4]`}`}
          >
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeStyles[n.type].dot}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${n.read ? "text-[#687068]" : "text-[#3A3F3A] font-medium"}`}>{n.title}</p>
              <p className="text-xs text-[#687068] mt-0.5">{n.description}</p>
            </div>
            <span className="text-xs text-[#94A3B8] whitespace-nowrap">{n.time}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-check-double-line text-[#94A3B8] text-2xl"></i>
            <p className="text-sm text-[#687068] mt-2">All caught up</p>
          </div>
        )}
      </div>
    </div>
  );
}