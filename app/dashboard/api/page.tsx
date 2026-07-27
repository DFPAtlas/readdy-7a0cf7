"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { APIKey, WebhookEndpoint, AuditLogEntry, API_MODULES, WEBHOOK_EVENTS, ScopeGrant, METHOD_COLORS } from "./APIData";
import Link from "next/link";

type Tab = "keys" | "webhooks" | "audit" | "reference";

export default function APIPlatformPage() {
  const [activeTab, setActiveTab] = useState<Tab>("keys");
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchAudit, setSearchAudit] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<ScopeGrant[]>([]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [webhookSecret, setWebhookSecret] = useState("");

  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;

    async function load() {
      setLoading(true);
      try {
        const [keysRes, webhooksRes, auditRes] = await Promise.all([
          supabase.from("api_keys").select("*").order("created_at", { ascending: false }),
          supabase.from("webhook_endpoints").select("*").order("created_at", { ascending: false }),
          supabase.from("api_audit_log").select("*, api_keys(key_prefix)").order("created_at", { ascending: false }).limit(100),
        ]);

        if (!controller?.signal?.aborted) {
          if (keysRes.data) setApiKeys(keysRes.data as APIKey[]);
          if (webhooksRes.data) setWebhooks(webhooksRes.data as WebhookEndpoint[]);
          if (auditRes.data) {
            const mapped = (auditRes.data as any[]).map((entry) => ({
              ...entry,
              key_prefix: entry.api_keys?.key_prefix || null,
            }));
            setAuditLogs(mapped);
          }
        }
      } catch (e) {
        /* silent */
      } finally {
        if (!controller?.signal?.aborted) setLoading(false);
      }
    }

    load();
    return () => controller?.abort();
  }, []);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((entry) => {
      if (filterModule !== "all" && entry.module !== filterModule) return false;
      if (filterMethod !== "all" && entry.method !== filterMethod) return false;
      if (searchAudit && !entry.endpoint.toLowerCase().includes(searchAudit.toLowerCase()) && !entry.module.toLowerCase().includes(searchAudit.toLowerCase())) return false;
      return true;
    });
  }, [auditLogs, filterModule, filterMethod, searchAudit]);

  const stats = useMemo(() => {
    const activeKeys = apiKeys.filter((k) => !k.is_revoked);
    const activeWebhooks = webhooks.filter((w) => w.is_active);
    const recentCalls = auditLogs.filter((a) => {
      const dt = new Date(a.created_at);
      return (Date.now() - dt.getTime()) < 24 * 60 * 60 * 1000;
    });
    const errors = auditLogs.filter((a) => a.status_code && a.status_code >= 400);
    return { activeKeys: activeKeys.length, activeWebhooks: activeWebhooks.length, recentCalls: recentCalls.length, errors: errors.length };
  }, [apiKeys, webhooks, auditLogs]);

  function generateRandomKey(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "lh_";
    for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  }

  async function handleGenerateKey() {
    if (!newKeyName.trim()) return;
    setGenerating(true);
    const rawKey = generateRandomKey();
    const prefix = rawKey.slice(0, 8);
    const hash = rawKey;

    const { error } = await supabase.from("api_keys").insert({
      name: newKeyName.trim(),
      key_prefix: prefix,
      key_hash: hash,
      scopes: newKeyScopes,
      created_by: "admin",
    });

    if (!error) {
      setGeneratedKey(rawKey);
      const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
      if (data) setApiKeys(data as APIKey[]);
    }
    setGenerating(false);
  }

  async function handleRevokeKey(id: string) {
    await supabase.from("api_keys").update({ is_revoked: true }).eq("id", id);
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, is_revoked: true } : k)));
  }

  async function handleToggleWebhook(id: string, currentActive: boolean) {
    await supabase.from("webhook_endpoints").update({ is_active: !currentActive }).eq("id", id);
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, is_active: !currentActive } : w)));
  }

  async function handleAddWebhook() {
    if (!webhookName.trim() || !webhookUrl.trim()) return;
    const { error } = await supabase.from("webhook_endpoints").insert({
      name: webhookName.trim(),
      url: webhookUrl.trim(),
      events: webhookEvents,
      secret_hash: webhookSecret.trim() || null,
    });
    if (!error) {
      setShowWebhookDialog(false);
      setWebhookName("");
      setWebhookUrl("");
      setWebhookEvents([]);
      setWebhookSecret("");
      const { data } = await supabase.from("webhook_endpoints").select("*").order("created_at", { ascending: false });
      if (data) setWebhooks(data as WebhookEndpoint[]);
    }
  }

  function toggleScope(module: string, access: "read" | "write" | "read_write") {
    setNewKeyScopes((prev) => {
      const existing = prev.find((s) => s.module === module);
      if (existing && existing.access === access) return prev.filter((s) => s.module !== module);
      if (existing) return prev.map((s) => (s.module === module ? { ...s, access } : s));
      return [...prev, { module, access }];
    });
  }

  function scopeLabel(access: string) {
    if (access === "read_write") return "Read & Write";
    if (access === "read") return "Read Only";
    return "Write Only";
  }

  function scopeColor(access: string) {
    if (access === "read_write") return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30";
    if (access === "read") return "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30";
    return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30";
  }

  function formatTime(ts: string | null) {
    if (!ts) return "Never";
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/integrations" className="text-xs text-[#687068] hover:text-[#3A3F3A] transition-colors cursor-pointer">
              Integrations
            </Link>
            <span className="text-xs text-[#CBD5E1]">/</span>
            <span className="text-xs font-medium text-[#3A3F3A]">Public API</span>
          </div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">Public API Platform</h1>
          <p className="text-sm text-[#687068] mt-1">Generate API keys, configure webhooks, and monitor external system integrations</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active API Keys", value: stats.activeKeys, icon: "ri-key-2-line", color: "#3B82F6" },
          { label: "Active Webhooks", value: stats.activeWebhooks, icon: "ri-webhook-line", color: "#8B5CF6" },
          { label: "API Calls (24h)", value: stats.recentCalls, icon: "ri-pulse-line", color: "#10B981" },
          { label: "Errors (24h)", value: stats.errors, icon: "ri-error-warning-line", color: "#EF4444" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg w-4 h-4 flex items-center justify-center`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] px-1 py-1">
        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1">
          {[
            { key: "keys", label: "API Keys", icon: "ri-key-2-line" },
            { key: "webhooks", label: "Webhooks", icon: "ri-webhook-line" },
            { key: "audit", label: "Audit Log", icon: "ri-history-line" },
            { key: "reference", label: "API Reference", icon: "ri-book-open-line" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
            >
              <i className={`${tab.icon} text-[10px] w-3 h-3 flex items-center justify-center`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Keys Tab */}
      {activeTab === "keys" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#687068]">Manage API keys for external system access. Keys are shown once upon generation — store them securely.</p>
            <button
              onClick={() => { setShowGenerateDialog(true); setGeneratedKey(null); setNewKeyName(""); setNewKeyScopes([]); }}
              className="flex items-center gap-2 px-3 py-2 bg-[#C28A78] text-white text-xs font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-add-line text-sm w-3 h-3 flex items-center justify-center"></i>
              Generate Key
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Key Prefix</div>
              <div className="col-span-3">Scopes</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Last Used</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {apiKeys.map((key) => (
              <div key={key.id}>
                <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#F1F5F9] items-center hover:bg-[#F8FAFC] transition-colors">
                  <div className="col-span-3 flex items-center gap-2">
                    <i className="ri-key-2-line text-sm w-4 h-4 flex items-center justify-center text-[#687068]"></i>
                    <span className="text-sm font-medium text-[#3A3F3A]">{key.name}</span>
                  </div>
                  <div className="col-span-2">
                    <code className="text-xs bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#687068] font-mono">{key.key_prefix}...</code>
                  </div>
                  <div className="col-span-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes && (key.scopes as ScopeGrant[]).length > 0 ? (
                        (key.scopes as ScopeGrant[]).slice(0, 2).map((s, i) => (
                          <span key={i} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${scopeColor(s.access)}`}>
                            {s.module}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-[#CBD5E1]">No scopes</span>
                      )}
                      {key.scopes && (key.scopes as ScopeGrant[]).length > 2 && (
                        <span className="text-[9px] text-[#94A3B8]">+{key.scopes.length - 2}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${key.is_revoked ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#F0FDF4] text-[#10B981]"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${key.is_revoked ? "bg-[#EF4444]" : "bg-[#10B981]"}`}></div>
                      {key.is_revoked ? "Revoked" : "Active"}
                    </span>
                  </div>
                  <div className="col-span-1 text-xs text-[#94A3B8]">{formatTime(key.last_used_at)}</div>
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setExpandedKey(expandedKey === key.id ? null : key.id)}
                      className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0] transition-colors"
                    >
                      {expandedKey === key.id ? (
                        <i className="ri-arrow-up-s-line text-sm w-3 h-3 flex items-center justify-center text-[#687068]"></i>
                      ) : (
                        <i className="ri-arrow-down-s-line text-sm w-3 h-3 flex items-center justify-center text-[#687068]"></i>
                      )}
                    </button>
                    {!key.is_revoked && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2] transition-colors"
                      >
                        <i className="ri-close-circle-line text-sm w-3 h-3 flex items-center justify-center text-[#EF4444]"></i>
                      </button>
                    )}
                  </div>
                </div>
                {expandedKey === key.id && (
                  <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9] grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-medium text-[#94A3B8] uppercase mb-1">All Scopes</p>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes && (key.scopes as ScopeGrant[]).length > 0 ? (
                          (key.scopes as ScopeGrant[]).map((s, i) => (
                            <span key={i} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${scopeColor(s.access)}`}>
                              {s.module} · {scopeLabel(s.access)}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#CBD5E1]">Full access (all modules, read & write)</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-[#94A3B8] uppercase mb-1">Details</p>
                      <div className="space-y-1 text-xs text-[#687068]">
                        <p>Created: {new Date(key.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                        <p>Created by: {key.created_by}</p>
                        <p>Key ID: {key.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-[#94A3B8] uppercase mb-1">Example Usage</p>
                      <code className="text-[10px] bg-white border border-[#E2E8F0] px-2 py-1.5 rounded block text-[#3A3F3A] font-mono">
                        curl -H &quot;Authorization: Bearer {key.key_prefix}...&quot; https://api.lethub.co/v1/properties
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {apiKeys.length === 0 && (
              <div className="px-4 py-16 text-center">
                <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                  <i className="ri-key-2-line text-[#94A3B8] text-xl"></i>
                </div>
                <p className="text-sm text-[#687068]">No API keys yet. Generate your first key above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#687068]">Configure webhook endpoints that receive event notifications from your Lethub account.</p>
            <button
              onClick={() => setShowWebhookDialog(true)}
              className="flex items-center gap-2 px-3 py-2 bg-[#C28A78] text-white text-xs font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-add-line text-sm w-3 h-3 flex items-center justify-center"></i>
              Add Webhook
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${wh.is_active ? "border-[#E2E8F0]" : "border-[#F1F5F9] opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${wh.is_active ? "bg-[#8B5CF6]/10" : "bg-[#F1F5F9]"}`}>
                      <i className={`ri-webhook-line text-lg w-4 h-4 flex items-center justify-center ${wh.is_active ? "text-[#8B5CF6]" : "text-[#CBD5E1]"}`}></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#3A3F3A]">{wh.name}</h3>
                      <p className="text-[10px] text-[#94A3B8] font-mono truncate max-w-[240px]">{wh.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${wh.is_active ? "bg-[#F0FDF4] text-[#10B981]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${wh.is_active ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`}></div>
                      {wh.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {wh.events && (wh.events as string[]).map((evt, i) => {
                    const cfg = WEBHOOK_EVENTS.find((e) => e.key === evt);
                    return (
                      <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border" style={{ backgroundColor: cfg ? `${cfg.color}10` : "#F1F5F9", color: cfg?.color || "#94A3B8", borderColor: cfg ? `${cfg.color}30` : "#E2E8F0" }}>
                        {cfg?.label || evt}
                      </span>
                    );
                  })}
                  {(!wh.events || (wh.events as string[]).length === 0) && (
                    <span className="text-[10px] text-[#CBD5E1]">No events configured</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#94A3B8]">Last triggered: {formatTime(wh.last_triggered_at)}</span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0] transition-colors">
                      <i className="ri-file-copy-line text-sm w-3 h-3 flex items-center justify-center text-[#687068]"></i>
                    </button>
                    <button
                      onClick={() => handleToggleWebhook(wh.id, wh.is_active)}
                      className={`text-[10px] font-medium px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${wh.is_active ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]" : "bg-[#C28A78] text-white hover:bg-[#2D6A4F]"}`}
                    >
                      {wh.is_active ? "Pause" : "Resume"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {webhooks.length === 0 && (
              <div className="col-span-2 bg-white rounded-xl border border-[#E2E8F0] text-center py-16">
                <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                  <i className="ri-webhook-line text-[#94A3B8] text-xl"></i>
                </div>
                <p className="text-sm text-[#687068]">No webhooks configured yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="relative flex-1 max-w-xs">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"></i>
              <input
                type="text"
                placeholder="Search endpoint or module..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
              />
            </div>
            <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1">
              <button
                onClick={() => setFilterModule("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${filterModule === "all" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
              >
                All Modules
              </button>
              {API_MODULES.map((mod) => (
                <button
                  key={mod.key}
                  onClick={() => setFilterModule(filterModule === mod.key ? "all" : mod.key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${filterModule === mod.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
                >
                  <i className={`${mod.icon} text-[10px] w-3 h-3 flex items-center justify-center`}></i>
                  {mod.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {["all", "GET", "POST", "PUT", "DELETE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m === filterMethod ? "all" : m)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-colors whitespace-nowrap cursor-pointer ${filterMethod === m ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]"}`}
                >
                  {m === "all" ? "All Methods" : m}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">
              <div className="col-span-2">Time</div>
              <div className="col-span-1">Method</div>
              <div className="col-span-3">Endpoint</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Response</div>
              <div className="col-span-2">API Key</div>
              <div className="col-span-2">IP Address</div>
            </div>
            {filteredAuditLogs.map((entry) => (
              <div key={entry.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-[#F1F5F9] items-center hover:bg-[#F8FAFC] transition-colors text-xs">
                <div className="col-span-2 text-[#94A3B8]">{formatTime(entry.created_at)}</div>
                <div className="col-span-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: METHOD_COLORS[entry.method] || "#687068" }}>
                    {entry.method}
                  </span>
                </div>
                <div className="col-span-3 text-[#3A3F3A] font-mono text-[10px]">{entry.endpoint}</div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full ${entry.status_code && entry.status_code < 400 ? "bg-[#F0FDF4] text-[#10B981]" : entry.status_code ? "bg-[#FEF2F2] text-[#EF4444]" : "text-[#94A3B8]"}`}>
                    {entry.status_code || "—"}
                  </span>
                </div>
                <div className="col-span-1 text-[#94A3B8]">{entry.response_ms ? `${entry.response_ms}ms` : "—"}</div>
                <div className="col-span-2 text-[#687068]">{entry.key_prefix ? `${entry.key_prefix}...` : "—"}</div>
                <div className="col-span-2 text-[#94A3B8] font-mono text-[10px]">{entry.ip_address || "—"}</div>
              </div>
            ))}
            {filteredAuditLogs.length === 0 && (
              <div className="px-4 py-16 text-center">
                <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                  <i className="ri-history-line text-[#94A3B8] text-xl"></i>
                </div>
                <p className="text-sm text-[#687068]">No audit log entries match your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Reference Tab */}
      {activeTab === "reference" && (
        <div className="space-y-4">
          <div className="bg-[#3A3F3A] rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold bg-[#10B981] px-2 py-0.5 rounded">BASE URL</span>
              <code className="text-sm text-[#E2E8F0] font-mono">https://api.lethub.co/v1</code>
            </div>
            <p className="text-sm text-[#94A3B8]">All API requests require an API key passed in the Authorization header: <code className="text-[#10B981] bg-[#0F172A] px-1.5 py-0.5 rounded text-xs">Bearer lh_pk_8a...</code></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {API_MODULES.map((mod) => (
              <div key={mod.key} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${mod.color}15` }}>
                    <i className={`${mod.icon} text-base w-4 h-4 flex items-center justify-center`} style={{ color: mod.color }}></i>
                  </div>
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">{mod.label}</h3>
                </div>
                <div className="space-y-1.5">
                  {mod.endpoints.map((ep, j) => {
                    const method = ep.split(" ")[0];
                    return (
                      <div key={j} className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] font-bold w-10 text-right" style={{ color: METHOD_COLORS[method] || "#687068" }}>{method}</span>
                        <code className="text-[11px] text-[#687068] font-mono">{ep.split(" ").slice(1).join(" ")}</code>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
              <i className="ri-flashlight-line text-[#F59E0B] w-4 h-4 flex items-center justify-center"></i>
              Rate Limits & Headers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-medium text-[#94A3B8] uppercase mb-1">Rate Limit</p>
                <p className="text-sm text-[#3A3F3A]">1,000 requests per minute per API key</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#94A3B8] uppercase mb-1">Response Format</p>
                <p className="text-sm text-[#3A3F3A]">JSON: {`{ "data": {...}, "meta": {...} }`}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#94A3B8] uppercase mb-1">Pagination</p>
                <p className="text-sm text-[#3A3F3A]">Cursor-based: <code className="text-xs bg-[#F1F5F9] px-1 py-0.5 rounded">?cursor=xxx&limit=50</code></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Key Dialog */}
      {showGenerateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { if (!generating) setShowGenerateDialog(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#3A3F3A]">Generate API Key</h2>
              <button onClick={() => setShowGenerateDialog(false)} className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0]">
                <i className="ri-close-line text-sm w-4 h-4 flex items-center justify-center text-[#687068]"></i>
              </button>
            </div>

            {generatedKey ? (
              <div className="p-6 space-y-4">
                <div className="bg-[#F0FDF4] border border-[#10B981]/20 rounded-xl p-4 text-center">
                  <i className="ri-checkbox-circle-fill text-[#10B981] text-2xl mb-2 w-6 h-6 mx-auto flex items-center justify-center"></i>
                  <p className="text-sm font-semibold text-[#3A3F3A] mb-1">Key Generated Successfully</p>
                  <p className="text-xs text-[#687068] mb-3">Copy this key now — it won&apos;t be shown again.</p>
                  <div className="bg-[#3A3F3A] rounded-lg p-3 flex items-center justify-between">
                    <code className="text-sm text-[#10B981] font-mono break-all mr-2">{generatedKey}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedKey)}
                      className="w-8 h-8 rounded-lg bg-[#334155] flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-[#475569] transition-colors"
                    >
                      <i className="ri-file-copy-line text-white text-sm w-4 h-4 flex items-center justify-center"></i>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowGenerateDialog(false)}
                  className="w-full py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#3A3F3A] mb-1">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Production Web App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3A3F3A] mb-2">Access Scopes</label>
                  <div className="space-y-2">
                    {API_MODULES.map((mod) => (
                      <div key={mod.key} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${mod.color}15` }}>
                            <i className={`${mod.icon} text-xs w-3 h-3 flex items-center justify-center`} style={{ color: mod.color }}></i>
                          </div>
                          <span className="text-xs font-medium text-[#3A3F3A]">{mod.label}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#E2E8F0]/50 rounded-full p-0.5">
                          {(["read", "write", "read_write"] as const).map((level) => {
                            const active = newKeyScopes.some((s) => s.module === mod.key && s.access === level);
                            return (
                              <button
                                key={level}
                                onClick={() => toggleScope(mod.key, level)}
                                className={`px-2 py-1 text-[9px] font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${active ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#94A3B8] hover:text-[#687068]"}`}
                              >
                                {level === "read" ? "Read" : level === "write" ? "Write" : "R/W"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateKey}
                  disabled={!newKeyName.trim() || generating}
                  className="w-full py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? "Generating..." : "Generate Key"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Webhook Dialog */}
      {showWebhookDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowWebhookDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#3A3F3A]">Add Webhook Endpoint</h2>
              <button onClick={() => setShowWebhookDialog(false)} className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0]">
                <i className="ri-close-line text-sm w-4 h-4 flex items-center justify-center text-[#687068]"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#3A3F3A] mb-1">Webhook Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production Alerts"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3A3F3A] mb-1">Endpoint URL</label>
                <input
                  type="text"
                  placeholder="https://your-app.com/webhooks/lethub"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3A3F3A] mb-1">Secret (for HMAC verification)</label>
                <input
                  type="text"
                  placeholder="Optional shared secret"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3A3F3A] mb-2">Events to Subscribe</label>
                <div className="grid grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map((evt) => {
                    const active = webhookEvents.includes(evt.key);
                    return (
                      <button
                        key={evt.key}
                        onClick={() => setWebhookEvents((prev) => active ? prev.filter((e) => e !== evt.key) : [...prev, evt.key])}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${active ? "text-white shadow-sm" : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#687068] hover:border-[#C28A78]"}`}
                        style={active ? { backgroundColor: evt.color } : {}}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${active ? "bg-white/20" : ""}`}>
                          <i className={`${active ? "ri-check-line" : "ri-add-line"} text-[10px] w-3 h-3 flex items-center justify-center`}></i>
                        </div>
                        {evt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleAddWebhook}
                disabled={!webhookName.trim() || !webhookUrl.trim()}
                className="w-full py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}