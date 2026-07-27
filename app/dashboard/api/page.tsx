"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import FeatureGate from "@/components/entitlements/FeatureGate";
import { supabase } from "@/lib/supabaseClient";
import {
  APIKey,
  WebhookEndpoint,
  AuditLogEntry,
  API_MODULES,
  WEBHOOK_EVENTS,
  ScopeGrant,
  METHOD_COLORS,
} from "./APIData";

type Tab = "keys" | "webhooks" | "audit" | "reference";
type SafeAPIKey = Omit<APIKey, "key_hash">;
type SafeWebhook = Omit<WebhookEndpoint, "secret_hash">;

type BootstrapData = {
  api_keys: SafeAPIKey[];
  webhooks: SafeWebhook[];
  audit: AuditLogEntry[];
};

async function invokeSecurityAction<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("api-security-admin", { body });
  if (error) throw new Error(error.message || "Security service request failed");
  if (data?.error) throw new Error(data.error);
  return data as T;
}

function APIPlatformContent() {
  const [activeTab, setActiveTab] = useState<Tab>("keys");
  const [apiKeys, setApiKeys] = useState<SafeAPIKey[]>([]);
  const [webhooks, setWebhooks] = useState<SafeWebhook[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [oneTimeSecret, setOneTimeSecret] = useState<{ label: string; value: string } | null>(null);

  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<ScopeGrant[]>([]);
  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await invokeSecurityAction<BootstrapData>({ action: "bootstrap" });
      setApiKeys(data.api_keys || []);
      setWebhooks(data.webhooks || []);
      setAuditLogs(data.audit || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load API security data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const lastDay = Date.now() - 24 * 60 * 60 * 1000;
    return {
      activeKeys: apiKeys.filter((key) => !key.is_revoked).length,
      activeWebhooks: webhooks.filter((webhook) => webhook.is_active).length,
      calls: auditLogs.filter((entry) => new Date(entry.created_at).getTime() >= lastDay).length,
      errors: auditLogs.filter((entry) => new Date(entry.created_at).getTime() >= lastDay && (entry.status_code || 0) >= 400).length,
    };
  }, [apiKeys, webhooks, auditLogs]);

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const result = await invokeSecurityAction<{ api_key: SafeAPIKey; secret: string }>({
        action: "generate_api_key",
        name: newKeyName.trim(),
        scopes: newKeyScopes,
      });
      setApiKeys((current) => [result.api_key, ...current]);
      setOneTimeSecret({ label: "API key", value: result.secret });
      setNewKeyName("");
      setNewKeyScopes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate API key");
    } finally {
      setBusy(false);
    }
  };

  const revokeKey = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      await invokeSecurityAction({ action: "revoke_api_key", id });
      setApiKeys((current) => current.map((key) => key.id === id ? { ...key, is_revoked: true } : key));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to revoke API key");
    } finally {
      setBusy(false);
    }
  };

  const createWebhook = async () => {
    if (!webhookName.trim() || !webhookUrl.trim()) return;
    setBusy(true);
    setError("");
    try {
      const result = await invokeSecurityAction<{ webhook: SafeWebhook; secret: string }>({
        action: "create_webhook",
        name: webhookName.trim(),
        url: webhookUrl.trim(),
        events: webhookEvents,
      });
      setWebhooks((current) => [result.webhook, ...current]);
      setOneTimeSecret({ label: "Webhook signing secret", value: result.secret });
      setWebhookName("");
      setWebhookUrl("");
      setWebhookEvents([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create webhook");
    } finally {
      setBusy(false);
    }
  };

  const toggleWebhook = async (webhook: SafeWebhook) => {
    setBusy(true);
    setError("");
    try {
      await invokeSecurityAction({
        action: "toggle_webhook",
        id: webhook.id,
        is_active: !webhook.is_active,
      });
      setWebhooks((current) => current.map((item) => item.id === webhook.id ? { ...item, is_active: !item.is_active } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update webhook");
    } finally {
      setBusy(false);
    }
  };

  const toggleScope = (module: string, access: ScopeGrant["access"]) => {
    setNewKeyScopes((current) => {
      const existing = current.find((scope) => scope.module === module);
      if (existing?.access === access) return current.filter((scope) => scope.module !== module);
      if (existing) return current.map((scope) => scope.module === module ? { module, access } : scope);
      return [...current, { module, access }];
    });
  };

  const copySecret = async () => {
    if (!oneTimeSecret) return;
    await navigator.clipboard.writeText(oneTimeSecret.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#3A3F3A]">Public API Security</h1>
        <p className="text-sm text-[#687068] mt-1">Credentials are generated and hashed server-side. Raw secrets are displayed once only.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {oneTimeSecret && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-amber-900">Copy this {oneTimeSecret.label} now</p>
              <p className="text-xs text-amber-800 mt-1">It cannot be recovered after you dismiss this notice.</p>
              <code className="mt-3 block overflow-x-auto rounded-lg bg-white border border-amber-200 p-3 text-xs text-[#3A3F3A]">{oneTimeSecret.value}</code>
            </div>
            <div className="flex gap-2">
              <button onClick={copySecret} className="rounded-lg bg-[#C28A78] px-3 py-2 text-xs font-semibold text-white">Copy</button>
              <button onClick={() => setOneTimeSecret(null)} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Active API keys", stats.activeKeys, "ri-key-2-line"],
          ["Active webhooks", stats.activeWebhooks, "ri-webhook-line"],
          ["API calls (24h)", stats.calls, "ri-pulse-line"],
          ["Errors (24h)", stats.errors, "ri-error-warning-line"],
        ].map(([label, value, icon]) => (
          <div key={String(label)} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
            <i className={`${icon} text-[#C28A78]`}></i>
            <p className="mt-2 text-xl font-bold text-[#3A3F3A]">{value}</p>
            <p className="text-xs text-[#687068]">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-[#E2E8F0] bg-white p-2">
        {(["keys", "webhooks", "audit", "reference"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F8FAFC]"}`}
          >
            {tab}
          </button>
        ))}
        <button onClick={load} disabled={loading || busy} className="ml-auto rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#687068] disabled:opacity-50">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-[#687068]">Loading secure API settings…</div>
      ) : activeTab === "keys" ? (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <h2 className="font-semibold text-[#3A3F3A]">Generate API key</h2>
            <input value={newKeyName} onChange={(event) => setNewKeyName(event.target.value)} placeholder="Integration name" className="mt-4 w-full rounded-lg border border-[#D5D9D5] px-3 py-2 text-sm outline-none focus:border-[#C28A78]" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Scopes</p>
            <div className="mt-2 space-y-2">
              {API_MODULES.map((module) => {
                const selected = newKeyScopes.find((scope) => scope.module === module.key)?.access;
                return (
                  <div key={module.key} className="rounded-lg border border-[#E2E8F0] p-3">
                    <p className="text-sm font-medium text-[#3A3F3A]">{module.label}</p>
                    <div className="mt-2 flex gap-1">
                      {(["read", "write", "read_write"] as ScopeGrant["access"][]).map((access) => (
                        <button key={access} onClick={() => toggleScope(module.key, access)} className={`rounded-md px-2 py-1 text-[10px] ${selected === access ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068]"}`}>
                          {access.replace("_", " + ")}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={generateKey} disabled={busy || !newKeyName.trim()} className="mt-4 w-full rounded-lg bg-[#C28A78] py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Working…" : "Generate secure key"}
            </button>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
            <div className="border-b border-[#E2E8F0] px-5 py-4"><h2 className="font-semibold text-[#3A3F3A]">API keys</h2></div>
            {apiKeys.length === 0 ? <p className="p-8 text-center text-sm text-[#94A3B8]">No API keys created.</p> : apiKeys.map((key) => (
              <div key={key.id} className="flex flex-col gap-3 border-b border-[#F1F5F9] px-5 py-4 last:border-0 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#3A3F3A]">{key.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${key.is_revoked ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>{key.is_revoked ? "Revoked" : "Active"}</span>
                  </div>
                  <code className="mt-1 block text-xs text-[#687068]">{key.key_prefix}…</code>
                  <p className="mt-1 text-xs text-[#94A3B8]">{(key.scopes || []).map((scope) => `${scope.module}:${scope.access}`).join(", ") || "No scopes"}</p>
                </div>
                {!key.is_revoked && <button onClick={() => revokeKey(key.id)} disabled={busy} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">Revoke</button>}
              </div>
            ))}
          </section>
        </div>
      ) : activeTab === "webhooks" ? (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <h2 className="font-semibold text-[#3A3F3A]">Add webhook</h2>
            <input value={webhookName} onChange={(event) => setWebhookName(event.target.value)} placeholder="Webhook name" className="mt-4 w-full rounded-lg border border-[#D5D9D5] px-3 py-2 text-sm" />
            <input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://example.com/webhooks/lethub" className="mt-3 w-full rounded-lg border border-[#D5D9D5] px-3 py-2 text-sm" />
            <div className="mt-4 max-h-60 space-y-1 overflow-y-auto">
              {WEBHOOK_EVENTS.map((event) => (
                <label key={event.key} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#687068] hover:bg-[#F8FAFC]">
                  <input type="checkbox" checked={webhookEvents.includes(event.key)} onChange={() => setWebhookEvents((current) => current.includes(event.key) ? current.filter((item) => item !== event.key) : [...current, event.key])} />
                  {event.label}
                </label>
              ))}
            </div>
            <button onClick={createWebhook} disabled={busy || !webhookName.trim() || !webhookUrl.trim()} className="mt-4 w-full rounded-lg bg-[#C28A78] py-2.5 text-sm font-semibold text-white disabled:opacity-50">Create secure webhook</button>
          </section>
          <section className="space-y-3">
            {webhooks.length === 0 ? <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#94A3B8]">No webhooks configured.</div> : webhooks.map((webhook) => (
              <div key={webhook.id} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-[#3A3F3A]">{webhook.name}</p>
                    <p className="mt-1 truncate text-xs text-[#687068]">{webhook.url}</p>
                    <p className="mt-2 text-xs text-[#94A3B8]">{(webhook.events || []).join(", ") || "No events selected"}</p>
                  </div>
                  <button onClick={() => toggleWebhook(webhook)} disabled={busy} className={`rounded-lg px-3 py-2 text-xs font-semibold ${webhook.is_active ? "bg-emerald-50 text-emerald-700" : "bg-[#F1F5F9] text-[#687068]"}`}>{webhook.is_active ? "Active" : "Paused"}</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : activeTab === "audit" ? (
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#687068]"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Key</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Endpoint</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody>{auditLogs.map((entry) => (
              <tr key={entry.id} className="border-t border-[#F1F5F9]"><td className="px-4 py-3 text-[#687068]">{new Date(entry.created_at).toLocaleString("en-GB")}</td><td className="px-4 py-3 font-mono">{entry.key_prefix || "—"}</td><td className="px-4 py-3 font-semibold" style={{ color: METHOD_COLORS[entry.method] }}>{entry.method}</td><td className="px-4 py-3">{entry.endpoint}</td><td className="px-4 py-3">{entry.status_code || "—"}</td></tr>
            ))}</tbody>
          </table>
          {auditLogs.length === 0 && <p className="p-8 text-center text-sm text-[#94A3B8]">No API activity recorded.</p>}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {API_MODULES.map((module) => <div key={module.key} className="rounded-xl border border-[#E2E8F0] bg-white p-5"><h3 className="font-semibold text-[#3A3F3A]">{module.label}</h3><div className="mt-3 space-y-1">{module.endpoints.map((endpoint) => <code key={endpoint} className="block text-xs text-[#687068]">{endpoint}</code>)}</div></div>)}
        </div>
      )}
    </div>
  );
}

export default function APIPlatformPage() {
  return (
    <DashboardShell>
      <FeatureGate featureKey="api_access">
        <APIPlatformContent />
      </FeatureGate>
    </DashboardShell>
  );
}
