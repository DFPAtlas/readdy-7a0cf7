"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { NotificationItem, eventIcons, eventColors, seedNotifications } from "@/app/dashboard/notifications/NotificationCentreData";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(seedNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const recent = notifications.slice(0, 6);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#3A3F3A] transition-colors"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-notification-3-line text-[#94A3B8] text-xl"></i>
        </div>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-[#C46868] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl border border-[#D5D9D5] shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#3A3F3A] text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#C46868] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[#C28A78] font-medium hover:underline">
                  Mark all read
                </button>
              )}
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-[#687068] hover:text-[#3A3F3A] font-medium"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-[#F1F5F9]">
            {recent.map((n) => (
              <Link
                key={n.id}
                href={n.actionUrl}
                onClick={() => { markRead(n.id); setOpen(false); }}
                className={`flex items-start gap-3 px-5 py-3 hover:bg-[#F8FAFC] transition-colors block ${!n.isRead ? "bg-[#F0FDF4]/50" : ""}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: eventColors[n.type] + "14" }}
                >
                  <i className={`${eventIcons[n.type]} text-sm`} style={{ color: eventColors[n.type] }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? "text-[#3A3F3A] font-medium" : "text-[#475569]"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-[#687068] mt-0.5 line-clamp-2">{n.body}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-[#94A3B8]">{n.sentAt}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068] capitalize">
                      {n.channel}
                    </span>
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-[#C28A78] flex-shrink-0 mt-1.5"></div>
                )}
              </Link>
            ))}
          </div>

          {recent.length === 0 && (
            <div className="text-center py-10">
              <div className="w-12 h-12 mx-auto flex items-center justify-center">
                <i className="ri-notification-off-line text-[#94A3B8] text-2xl"></i>
              </div>
              <p className="text-sm text-[#687068] mt-2">All caught up</p>
              <p className="text-xs text-[#94A3B8] mt-1">No new notifications</p>
            </div>
          )}

          <div className="px-5 py-3 border-t border-[#D5D9D5] bg-[#F8FAFC]">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-sm text-[#C28A78] font-medium hover:underline"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-settings-3-line text-sm"></i>
              </div>
              Notification Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}