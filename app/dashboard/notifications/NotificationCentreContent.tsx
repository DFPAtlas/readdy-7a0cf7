"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  NotificationItem,
  NotificationPreference,
  NotificationEventType,
  notificationEventLabels,
  eventIcons,
  eventColors,
  seedNotifications,
  getDefaultPreferences,
  getChannelStats,
} from "./NotificationCentreData";

type Tab = "inbox" | "settings" | "analytics";

export default function NotificationCentreContent() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(seedNotifications);
  const [preferences, setPreferences] = useState<NotificationPreference[]>(getDefaultPreferences());
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [filterType, setFilterType] = useState<"all" | "unread" | "action_required" | NotificationEventType>("all");
  const [channelFilter, setChannelFilter] = useState<"all" | "push" | "email">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const actionRequired = notifications.filter((n) => n.type === "compliance_expiry" || n.type === "rent_overdue" || n.type === "quote_awaiting").filter((n) => !n.isRead);
  const deliveryProblems = 0;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const summaryCards = [
    { label: "Action Required", value: actionRequired.length, icon: "ri-error-warning-line", color: "#EF4444", bg: "bg-[#EF4444]/10", filter: "action_required" as const },
    { label: "Unread", value: unreadCount, icon: "ri-mail-unread-line", color: "#3B82F6", bg: "bg-[#3B82F6]/10", filter: "unread" as const },
    { label: "Delivery Problems", value: deliveryProblems, icon: "ri-alert-line", color: "#F59E0B", bg: "bg-[#F59E0B]/10", filter: "all" as const },
    { label: "System", value: notifications.filter((n) => n.type === "maintenance_update").length, icon: "ri-settings-3-line", color: "#8B5CF6", bg: "bg-[#8B5CF6]/10", filter: "all" as const },
  ];

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (filterType === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (filterType === "action_required") {
      filtered = filtered.filter((n) => n.type === "compliance_expiry" || n.type === "rent_overdue" || n.type === "quote_awaiting");
    } else if (filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    if (channelFilter !== "all") {
      filtered = filtered.filter((n) => n.channel === channelFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          (n.property && n.property.toLowerCase().includes(q)) ||
          (n.tenant && n.tenant.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [notifications, filterType, channelFilter, searchQuery]);

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    showToast("All notifications marked as read");
  };

  const togglePreference = (
    eventType: NotificationEventType,
    channel: "emailEnabled" | "pushEnabled" | "smsEnabled"
  ) => {
    setPreferences((prev) =>
      prev.map((p) =>
        p.eventType === eventType ? { ...p, [channel]: !p[channel] } : p
      )
    );
  };

  const channelStats = useMemo(() => getChannelStats(notifications), [notifications]);

  const eventTypes = Object.keys(notificationEventLabels) as NotificationEventType[];

  const handleSavePreferences = () => {
    showToast("Notification preferences saved");
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">Notification Centre</h1>
          <p className="text-sm text-[#687068] mt-1">
            Manage alerts, preferences, and delivery channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "inbox" && unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap"
            >
              Mark all as read
            </button>
          )}
          {activeTab === "settings" && (
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143728] transition-colors whitespace-nowrap"
            >
              Save Preferences
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-xl p-1 mb-6 w-fit">
        {([{ key: "inbox", icon: "ri-mail-line", label: "Inbox" }, { key: "settings", icon: "ri-settings-3-line", label: "Preferences" }, { key: "analytics", icon: "ri-bar-chart-2-line", label: "Analytics" }] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white text-[#3A3F3A] shadow-sm"
                : "text-[#687068] hover:text-[#3A3F3A]"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${tab.icon} text-sm`}></i>
            </div>
            {tab.label}
            {tab.key === "inbox" && unreadCount > 0 && (
              <span className="bg-[#EF4444] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "inbox" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card) => (
              <button
                key={card.label}
                onClick={() => setFilterType(card.filter)}
                className={`bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:border-[#C28A78] transition-colors ${filterType === card.filter ? "border-[#C28A78] bg-[#C28A78]/5" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <i className={`${card.icon} text-sm`} style={{ color: card.color }}></i>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">{card.value}</p>
                <p className="text-xs text-[#687068] mt-1">{card.label}</p>
              </button>
            ))}
          </div>

          {actionRequired.length > 0 && (
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#D5D9D5] bg-[#FEF3C7]/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line text-[#F59E0B] text-sm"></i></div>
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Requires Action</h3>
                </div>
                <span className="text-xs text-[#687068]">{actionRequired.length} item{actionRequired.length > 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-[#D5D9D5]">
                {actionRequired.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    href={n.actionUrl}
                    onClick={() => markRead(n.id)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[#FBF9F4] transition-colors block"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: eventColors[n.type] + "14" }}>
                      <i className={`${eventIcons[n.type]} text-sm`} style={{ color: eventColors[n.type] }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{n.title}</p>
                      <p className="text-xs text-[#687068] truncate">{n.property || ""}{n.tenant ? ` · ${n.tenant}` : ""}</p>
                    </div>
                    <span className="text-xs text-[#94A3B8] flex-shrink-0">{n.sentAt}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-[240px] max-w-[400px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#F1F5F9] rounded-lg p-0.5 overflow-x-auto">
              <button onClick={() => setFilterType("all")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filterType === "all" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}>All</button>
              <button onClick={() => setFilterType("unread")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filterType === "unread" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}>Unread</button>
              <button onClick={() => setFilterType("action_required")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filterType === "action_required" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}>Action Required</button>
              {eventTypes.slice(0, 4).map((et) => (
                <button
                  key={et}
                  onClick={() => setFilterType(filterType === et ? "all" : et)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filterType === et ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}
                >
                  {notificationEventLabels[et]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="divide-y divide-[#F1F5F9]">
              {filteredNotifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionUrl}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors block ${
                    !n.isRead ? "bg-[#F0FDF4]/30" : ""
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: eventColors[n.type] + "14" }}
                  >
                    <i
                      className={`${eventIcons[n.type]} text-lg`}
                      style={{ color: eventColors[n.type] }}
                    ></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-sm ${
                            !n.isRead ? "text-[#3A3F3A] font-semibold" : "text-[#475569] font-medium"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-sm text-[#687068] mt-1 line-clamp-2">{n.body}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[11px] px-2 py-1 rounded-full font-medium capitalize whitespace-nowrap"
                          style={{
                            backgroundColor: eventColors[n.type] + "14",
                            color: eventColors[n.type],
                          }}
                        >
                          {notificationEventLabels[n.type]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#94A3B8]">{n.sentAt}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068] capitalize">
                        {n.channel}
                      </span>
                      {n.property && (
                        <span className="text-xs text-[#687068]">{n.property}</span>
                      )}
                      {n.tenant && (
                        <span className="text-xs text-[#687068]">· {n.tenant}</span>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C28A78] flex-shrink-0 mt-1.5"></div>
                  )}
                </Link>
              ))}
            </div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto flex items-center justify-center bg-[#F1F5F9] rounded-full">
                  <i className="ri-inbox-line text-[#94A3B8] text-2xl"></i>
                </div>
                <p className="text-sm font-medium text-[#687068] mt-4">No notifications found</p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  {searchQuery ? "Try adjusting your search or filters" : "You're all caught up"}
                </p>
              </div>
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <p className="text-xs text-[#94A3B8] mt-3 text-center">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { icon: "ri-mail-line", title: "Email", desc: "Delivered to your registered email address" },
              { icon: "ri-notification-3-line", title: "In-app", desc: "Appear in the notification bell and this centre" },
              { icon: "ri-smartphone-line", title: "SMS", desc: "Text messages for critical alerts (coming soon)" },
            ].map((ch) => (
              <div key={ch.title} className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4">
                <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center mb-2">
                  <i className={`${ch.icon} text-[#C28A78] text-sm`}></i>
                </div>
                <p className="text-sm font-medium text-[#3A3F3A]">{ch.title}</p>
                <p className="text-xs text-[#687068] mt-0.5">{ch.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {(["Properties", "Rent & Arrears", "Compliance", "Maintenance", "Documents & Signatures", "Portal Activity"] as const).map((group) => {
              const groupPrefs = preferences.filter((p) => {
                if (group === "Properties") return p.eventType === "inspection_scheduled" || p.eventType === "inspection_completed";
                if (group === "Rent & Arrears") return p.eventType === "rent_overdue";
                if (group === "Compliance") return p.eventType === "compliance_expiry";
                if (group === "Maintenance") return p.eventType === "maintenance_update" || p.eventType === "quote_awaiting";
                if (group === "Documents & Signatures") return p.eventType === "document_uploaded";
                if (group === "Portal Activity") return p.eventType === "portal_invite";
                return false;
              });
              if (groupPrefs.length === 0) return null;
              return (
                <div key={group} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">{group}</h3>
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    {groupPrefs.map((pref) => (
                      <div key={pref.eventType} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: eventColors[pref.eventType] + "14" }}
                          >
                            <i className={`${eventIcons[pref.eventType]} text-sm`} style={{ color: eventColors[pref.eventType] }}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{pref.label}</p>
                            <p className="text-[11px] text-[#687068] mt-0.5">{pref.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => togglePreference(pref.eventType, "emailEnabled")}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${pref.emailEnabled ? "bg-[#C28A78]/10 text-[#C28A78]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}
                            title="Email"
                          >
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-line text-sm"></i></div>
                          </button>
                          <button
                            onClick={() => togglePreference(pref.eventType, "pushEnabled")}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${pref.pushEnabled ? "bg-[#C28A78]/10 text-[#C28A78]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}
                            title="Push"
                          >
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-notification-3-line text-sm"></i></div>
                          </button>
                          <button
                            onClick={() => togglePreference(pref.eventType, "smsEnabled")}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${pref.smsEnabled ? "bg-[#C28A78]/10 text-[#C28A78]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}
                            title="SMS"
                          >
                            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-smartphone-line text-sm"></i></div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#FEF3C7]/50 rounded-xl border border-[#FCD34D]/40 p-5 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-[#D97706] text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[#92400E]">Quiet Hours & Required Notifications</p>
                <p className="text-xs text-[#A16207] mt-1">
                  Push notifications are muted between 10 PM and 7 AM. Urgent compliance expiry and arrears alerts bypass quiet hours. These critical alerts cannot be disabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Sent", value: channelStats.totalSent, icon: "ri-send-plane-line", color: "#3B82F6" },
              { label: "Push Delivered", value: channelStats.pushDelivered, icon: "ri-notification-3-line", color: "#10B981" },
              { label: "Email Delivered", value: channelStats.emailDelivered, icon: "ri-mail-line", color: "#8B5CF6" },
              { label: "Unread", value: unreadCount, icon: "ri-mail-unread-line", color: "#EF4444" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color + "14" }}
                  >
                    <i className={`${stat.icon} text-base`} style={{ color: stat.color }}></i>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
              <h3 className="font-semibold text-[#3A3F3A] text-sm mb-4">Open Rate by Channel</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-notification-3-line text-[#10B981] text-xs"></i>
                      </div>
                      <span className="text-sm text-[#475569]">Push</span>
                    </div>
                    <span className="text-sm font-semibold text-[#3A3F3A]">{channelStats.pushOpenRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full transition-all"
                      style={{ width: `${channelStats.pushOpenRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-mail-line text-[#8B5CF6] text-xs"></i>
                      </div>
                      <span className="text-sm text-[#475569]">Email</span>
                    </div>
                    <span className="text-sm font-semibold text-[#3A3F3A]">{channelStats.emailOpenRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8B5CF6] rounded-full transition-all"
                      style={{ width: `${channelStats.emailOpenRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
              <h3 className="font-semibold text-[#3A3F3A] text-sm mb-4">By Event Type</h3>
              <div className="space-y-3">
                {eventTypes.slice(0, 6).map((et) => {
                  const count = notifications.filter((n) => n.type === et).length;
                  const pct = Math.round((count / notifications.length) * 100);
                  return (
                    <div key={et} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: eventColors[et] }}
                      ></div>
                      <span className="text-sm text-[#475569] flex-1 min-w-0 truncate">
                        {notificationEventLabels[et]}
                      </span>
                      <span className="text-sm font-medium text-[#3A3F3A]">{count}</span>
                      <span className="text-xs text-[#94A3B8] w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
            <h3 className="font-semibold text-[#3A3F3A] text-sm mb-4">Push Notification Status</h3>
            <div className="flex flex-wrap items-center gap-6">
              {[
                { color: "#10B981", label: "Browser Push", status: "Active — Chrome on macOS" },
                { color: "#10B981", label: "PWA Push", status: "Active — Installed on iOS" },
                { color: "#F59E0B", label: "Mobile Push", status: "Architecture ready — native app pending" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{item.label}</p>
                    <p className="text-xs text-[#687068]">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#7A9A7E]"></i>{toast}
        </div>
      )}
    </div>
  );
}