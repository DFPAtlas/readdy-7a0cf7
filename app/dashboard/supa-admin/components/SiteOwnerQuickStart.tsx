"use client";

import { useEffect, useState } from "react";
import type { OverviewKpi } from "../SupaAdminData";

interface SiteOwnerQuickStartProps {
  overview: OverviewKpi | null;
  onNavigate: (tab: string) => void;
}

interface DailyTodo {
  id: string;
  label: string;
  detail: string;
  count: number | null;
  icon: string;
  color: string;
  tab: string;
  urgent: boolean;
}

export default function SiteOwnerQuickStart({ overview, onNavigate }: SiteOwnerQuickStartProps) {
  const [done, setDone] = useState<Record<string, boolean>>({});

  const STORAGE_KEY = "site-owner-quick-start";
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today && typeof parsed.done === "object") {
          setDone(parsed.done);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [today]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, done }));
    } catch {
      // ignore
    }
  }, [done, today]);

  const todos: DailyTodo[] = [
    {
      id: "compliance",
      label: "Review platform entities",
      detail: "Check agencies, offices and regions for anomalies",
      count: null,
      icon: "ri-building-2-line",
      color: "bg-[#EF4444]",
      tab: "entities",
      urgent: false,
    },
    {
      id: "maintenance",
      label: "Review admin tasks",
      detail: "Clear open tasks flagged for platform review",
      count: null,
      icon: "ri-task-line",
      color: "bg-[#F59E0B]",
      tab: "tasks",
      urgent: false,
    },
    {
      id: "arrears",
      label: "Review billing & Stripe",
      detail: "Check active subscriptions and payment issues",
      count: overview?.activeSubscriptions.count ?? null,
      icon: "ri-bank-card-line",
      color: "bg-[#8B5CF6]",
      tab: "billing",
      urgent: false,
    },
    {
      id: "users",
      label: "Check new user signups",
      detail: "Verify roles are correct and flag any anomalies",
      count: overview?.totalUsers.count ?? null,
      icon: "ri-group-line",
      color: "bg-[#3B82F6]",
      tab: "users",
      urgent: false,
    },
    {
      id: "notifications",
      label: "Clear unread notifications",
      detail: "Respond to tenant and landlord messages",
      count: overview?.unreadNotifications.count ?? null,
      icon: "ri-notification-4-line",
      color: "bg-purple-500",
      tab: "notifications",
      urgent: (overview?.unreadNotifications.count ?? 0) > 0,
    },
    {
      id: "health",
      label: "Run system health check",
      detail: "Confirm auth, payments and automation are online",
      count: null,
      icon: "ri-heart-pulse-line",
      color: "bg-[#10B981]",
      tab: "health",
      urgent: false,
    },
    {
      id: "audit",
      label: "Scan the audit trail",
      detail: "Spot-check recent admin activity for anything unusual",
      count: null,
      icon: "ri-shield-keyhole-line",
      color: "bg-[#687068]",
      tab: "audit",
      urgent: false,
    },
  ];

  const completed = todos.filter((t) => done[t.id]).length;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  const toggle = (id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#6366F1]/15 rounded-lg flex items-center justify-center">
            <i className="ri-sun-line text-[#818CF8] text-lg"></i>
          </div>
          <div>
            <h3 className="font-semibold text-[#E2E8F0]">Site Owner Quick Start</h3>
            <p className="text-xs text-[#94A3B8]">Your daily to-dos for running the platform</p>
          </div>
        </div>
        <span className="text-xs font-medium text-[#94A3B8] bg-[#1E293B] px-2.5 py-1 rounded-full whitespace-nowrap">
          {completed}/{todos.length} done
        </span>
      </div>

      <div className="mt-3 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#6366F1] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="mt-4 space-y-1.5">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#1E293B] transition-colors"
          >
            <button
              onClick={() => toggle(todo.id)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                done[todo.id] ? "bg-[#6366F1] border-[#818CF8]" : "border-[#1E293B] bg-white hover:border-[#818CF8]"
              }`}
              title={done[todo.id] ? "Mark as not done" : "Mark as done"}
            >
              {done[todo.id] && <i className="ri-check-line text-white text-xs"></i>}
            </button>

            <button
              onClick={() => onNavigate(todo.tab)}
              className="flex-1 min-w-0 text-left flex items-center gap-2.5"
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${todo.color}`}>
                <i className={`${todo.icon} text-white text-sm`}></i>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#E2E8F0] truncate">
                  {todo.label}
                </span>
                <span className="block text-xs text-[#94A3B8] truncate">{todo.detail}</span>
              </span>
            </button>

            {todo.count !== null && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  todo.urgent ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#1E293B] text-[#94A3B8]"
                }`}
              >
                {todo.count}
              </span>
            )}

            <button
              onClick={() => onNavigate(todo.tab)}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1E293B] flex-shrink-0"
              title={`Open ${todo.label.toLowerCase()}`}
            >
              <i className="ri-arrow-right-s-line text-[#64748B] text-lg"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}