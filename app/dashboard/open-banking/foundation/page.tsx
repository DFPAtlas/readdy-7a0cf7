"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface BankConnection {
  id: string;
  provider: string;
  provider_account_id: string | null;
  account_name: string;
  account_number_masked: string | null;
  sort_code: string | null;
  bank_name: string | null;
  sync_status: string;
  last_sync: string | null;
  connection_metadata: any;
  api_connected: boolean;
  error_message: string | null;
  created_at: string;
}

interface BankTransaction {
  id: string;
  connection_id: string;
  transaction_ref: string | null;
  amount: number;
  currency: string;
  description: string | null;
  transaction_date: string;
  matched_rent_payment_id: string | null;
  matched_status: string;
  category: string | null;
  metadata: any;
}

export default function OpenBankingFoundationPage() {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [matchFilter, setMatchFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: conns }, { data: txs }] = await Promise.all([
      supabase.from("open_banking_connections").select("*").order("created_at", { ascending: false }),
      supabase.from("open_banking_transactions").select("*").order("transaction_date", { ascending: false }),
    ]);
    setConnections(conns || []);
    setTransactions(txs || []);
    setLoading(false);
  };

  const providerMeta: Record<string, { label: string; icon: string; color: string; region: string }> = {
    truelayer: { label: "TrueLayer", icon: "ri-shield-line", color: "#6366F1", region: "UK, EU, AU" },
    yapily: { label: "Yapily", icon: "ri-link", color: "#14B8A6", region: "UK, EU" },
    plaid: { label: "Plaid", icon: "ri-bank-card-line", color: "#C28A78", region: "UK, EU, US" },
    tink: { label: "Tink", icon: "ri-database-2-line", color: "#F59E0B", region: "EU, UK" },
    gocardless: { label: "GoCardless", icon: "ri-bank-line", color: "#3B82F6", region: "UK, EU" },
    token_io: { label: "Token.io", icon: "ri-key-2-line", color: "#EC4899", region: "UK, EU" },
    open_banking_generic: { label: "Generic OBIE", icon: "ri-plug-line", color: "#687068", region: "UK" },
  };

  const syncedConnections = connections.filter((c) => c.sync_status === "connected");
  const totalSyncedBalance = 497430;
  const reconciledCount = transactions.filter((t) => t.matched_status === "reconciled").length;
  const unmatchedCount = transactions.filter((t) => t.matched_status === "unmatched").length;
  const pendingCount = transactions.filter((t) => t.matched_status === "pending").length;

  const formatTimeAgo = (iso: string | null) => {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  const filteredTransactions = transactions.filter((t) => {
    if (matchFilter !== "all" && t.matched_status !== matchFilter) return false;
    return true;
  });

  const getConnectionForTx = (tx: BankTransaction) => {
    return connections.find((c) => c.id === tx.connection_id);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/open-banking" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                <i className="ri-arrow-left-line text-[#687068]"></i>
              </Link>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Open Banking Foundation</h1>
            </div>
            <p className="text-sm text-[#687068] mt-1 ml-11">
              Provider-agnostic bank connection architecture — TrueLayer, Yapily, Plaid, and more
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-2 rounded-lg font-medium">
            <i className="ri-database-2-line"></i>
            Architecture Layer
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Providers Connected", value: syncedConnections.length.toString(), sub: `${connections.length} total registered`, icon: "ri-plug-line", color: "bg-[#6366F1]" },
            { label: "Bank Accounts", value: connections.length.toString(), sub: `${syncedConnections.length} actively syncing`, icon: "ri-bank-card-line", color: "bg-[#C28A78]" },
            { label: "Transactions Loaded", value: transactions.length.toString(), sub: `${reconciledCount} reconciled · ${unmatchedCount} unmatched`, icon: "ri-exchange-line", color: "bg-[#14B8A6]" },
            { label: "Reconciliation Rate", value: `${transactions.length > 0 ? Math.round((reconciledCount / transactions.length) * 100) : 0}%`, sub: `${pendingCount} pending review`, icon: "ri-check-double-line", color: "bg-[#10B981]" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${card.icon} text-white text-lg`}></i>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{card.value}</p>
              <p className="text-sm text-[#687068] mt-1">{card.label}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Provider Grid */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Provider-Agnostic Connections</h2>
              <p className="text-xs text-[#687068] mt-0.5">Normalised across TrueLayer, Yapily, Plaid, Tink</p>
            </div>
            <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">Foundation Layer</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Provider</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Account</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Bank</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Account Ref</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">API Status</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Sync Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Last Sync</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {connections.map((conn) => {
                  const meta = providerMeta[conn.provider] || providerMeta.open_banking_generic;
                  return (
                    <tr key={conn.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: meta.color + "15" }}>
                            <i className={`${meta.icon} text-sm`} style={{ color: meta.color }}></i>
                          </div>
                          <div>
                            <p className="font-medium text-[#3A3F3A]">{meta.label}</p>
                            <p className="text-[10px] text-[#94A3B8]">{meta.region}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#3A3F3A]">{conn.account_name}</p>
                        <p className="text-xs text-[#94A3B8]">{conn.account_number_masked || "—"} {conn.sort_code ? "· " + conn.sort_code : ""}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                          {conn.bank_name || "Unconfirmed"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#687068] font-mono">
                          {conn.provider_account_id || "Not connected"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${conn.api_connected ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                          {conn.api_connected ? "Connected" : "Not Connected"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          conn.sync_status === "connected" ? "bg-[#10B981]/10 text-[#10B981]" :
                          conn.sync_status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                          conn.sync_status === "error" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                          "bg-[#F1F5F9] text-[#94A3B8]"
                        }`}>
                          {conn.sync_status === "connected" ? "Syncing" :
                           conn.sync_status === "pending" ? "Pending" :
                           conn.sync_status === "error" ? "Error" : "Disconnected"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#687068]">
                        {formatTimeAgo(conn.last_sync)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setSelectedConnection(selectedConnection === conn.id ? null : conn.id)}
                          className="text-xs text-[#C28A78] font-medium px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                        >
                          {selectedConnection === conn.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connection Metadata Panel */}
        {selectedConnection && (() => {
          const conn = connections.find((c) => c.id === selectedConnection);
          if (!conn) return null;
          const meta = providerMeta[conn.provider] || providerMeta.open_banking_generic;
          const connTxs = transactions.filter((t) => t.connection_id === conn.id);
          return (
            <div className="bg-white rounded-xl border border-[#C28A78]/20 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: meta.color + "15" }}>
                    <i className={`${meta.icon} text-xl`} style={{ color: meta.color }}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">{meta.label} Connection</h3>
                    <p className="text-sm text-[#687068]">{conn.account_name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{connTxs.length} transactions synced</p>
                  </div>
                </div>
                <button onClick={() => setSelectedConnection(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Provider", value: meta.label },
                  { label: "Region", value: meta.region },
                  { label: "API Connected", value: conn.api_connected ? "Yes" : "No" },
                  { label: "Sync Status", value: conn.sync_status },
                  { label: "Account Number", value: conn.account_number_masked || "—" },
                  { label: "Sort Code", value: conn.sort_code || "—" },
                  { label: "Bank", value: conn.bank_name || "Unconfirmed" },
                  { label: "Provider Account ID", value: conn.provider_account_id || "Not linked" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-sm font-medium text-[#3A3F3A]">{stat.value}</p>
                  </div>
                ))}
              </div>

              {conn.connection_metadata && (
                <div className="bg-[#F8FAFC] rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-[#687068] mb-2 uppercase tracking-wider">Connection Metadata (Provider-Agnostic)</p>
                  <pre className="text-xs text-[#3A3F3A] font-mono whitespace-pre-wrap overflow-auto max-h-32">
                    {JSON.stringify(conn.connection_metadata, null, 2)}
                  </pre>
                </div>
              )}

              {conn.error_message && (
                <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-[#EF4444] font-medium">Error: {conn.error_message}</p>
                </div>
              )}

              {connTxs.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#687068] mb-2 uppercase tracking-wider">Recent Transactions via this Connection</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#E2E8F0]">
                          <th className="text-left py-2 font-medium text-[#94A3B8]">Date</th>
                          <th className="text-left py-2 font-medium text-[#94A3B8]">Ref</th>
                          <th className="text-left py-2 font-medium text-[#94A3B8]">Description</th>
                          <th className="text-right py-2 font-medium text-[#94A3B8]">Amount</th>
                          <th className="text-center py-2 font-medium text-[#94A3B8]">Match</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {connTxs.slice(0, 5).map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-2 text-[#687068]">{tx.transaction_date}</td>
                            <td className="py-2 text-[#94A3B8] font-mono">{tx.transaction_ref || "—"}</td>
                            <td className="py-2 text-[#3A3F3A]">{tx.description || "—"}</td>
                            <td className="py-2 text-right font-medium" style={{ color: tx.amount >= 0 ? "#10B981" : "#EF4444" }}>
                              {tx.amount >= 0 ? "+" : ""}£{Math.abs(tx.amount).toLocaleString()}
                            </td>
                            <td className="py-2 text-center">
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                tx.matched_status === "reconciled" ? "bg-[#10B981]/10 text-[#10B981]" :
                                tx.matched_status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                                tx.matched_status === "matched" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                                "bg-[#EF4444]/10 text-[#EF4444]"
                              }`}>
                                {tx.matched_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Transaction References Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Transaction References</h2>
              <p className="text-xs text-[#687068] mt-0.5">Normalised bank transactions ready for rent matching</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1">
              {[
                { key: "all", label: "All" },
                { key: "reconciled", label: "Reconciled" },
                { key: "pending", label: "Pending" },
                { key: "unmatched", label: "Unmatched" },
                { key: "matched", label: "Matched" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setMatchFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    matchFilter === f.key ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Provider</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Reference</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Description</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Category</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Match Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Rent Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTransactions.map((tx) => {
                  const conn = getConnectionForTx(tx);
                  const meta = conn ? providerMeta[conn.provider] || providerMeta.open_banking_generic : null;
                  return (
                    <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3 text-[#687068]">{tx.transaction_date}</td>
                      <td className="px-5 py-3">
                        {meta && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: meta.color + "15" }}>
                              <i className={`${meta.icon} text-[10px]`} style={{ color: meta.color }}></i>
                            </div>
                            <span className="text-xs text-[#687068]">{meta.label}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#94A3B8] font-mono">{tx.transaction_ref || "—"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#3A3F3A]">{tx.description || "—"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{tx.category || "Uncategorised"}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        <span style={{ color: tx.amount >= 0 ? "#10B981" : "#EF4444" }}>
                          {tx.amount >= 0 ? "+" : ""}£{Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          tx.matched_status === "reconciled" ? "bg-[#10B981]/10 text-[#10B981]" :
                          tx.matched_status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                          tx.matched_status === "matched" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                          "bg-[#EF4444]/10 text-[#EF4444]"
                        }`}>
                          {tx.matched_status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#94A3B8]">
                        {tx.matched_rent_payment_id ? (
                          <span className="text-[#3B82F6]">Linked</span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="px-5 py-8 text-center">
              <i className="ri-inbox-line text-3xl text-[#CBD5E1] mb-2 block"></i>
              <p className="text-sm text-[#94A3B8]">No transactions found</p>
            </div>
          )}
        </div>

        {/* Future Use Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="font-semibold text-[#3A3F3A] mb-1">Future Use Cases</h3>
            <p className="text-xs text-[#94A3B8] mb-4">This architecture enables the following capabilities</p>
            <div className="space-y-3">
              {[
                { icon: "ri-money-pound-circle-line", color: "#10B981", label: "Rent Received Detection", desc: "Auto-detect incoming rent payments and match to tenancies" },
                { icon: "ri-alarm-warning-line", color: "#EF4444", label: "Arrears Detection", desc: "Flag overdue payments by comparing expected vs received" },
                { icon: "ri-file-list-3-line", color: "#3B82F6", label: "Owner Statements", desc: "Generate financial statements backed by real bank data" },
                { icon: "ri-bar-chart-2-line", color: "#6366F1", label: "Property Profitability", desc: "Calculate true P&L per property from actual transactions" },
                { icon: "ri-bank-card-line", color: "#F59E0B", label: "Automated Reconciliation", desc: "Rule-based and AI-driven matching of bank transactions" },
                { icon: "ri-download-line", color: "#C28A78", label: "Bulk Export", desc: "Export reconciled data to accounting software (Xero, QuickBooks)" },
              ].map((use) => (
                <div key={use.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: use.color + "15" }}>
                    <i className={`${use.icon} text-sm`} style={{ color: use.color }}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{use.label}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{use.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="font-semibold text-[#3A3F3A] mb-1">Supported Providers</h3>
            <p className="text-xs text-[#94A3B8] mb-4">Provider-agnostic — swap or add providers without changing reconciliation logic</p>
            <div className="space-y-2">
              {Object.entries(providerMeta).filter(([k]) => k !== "open_banking_generic").map(([key, p]) => {
                const isConnected = connections.some((c) => c.provider === key && c.api_connected);
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] hover:border-[#C28A78]/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + "15" }}>
                        <i className={`${p.icon} text-sm`} style={{ color: p.color }}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{p.label}</p>
                        <p className="text-[10px] text-[#94A3B8]">{p.region}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isConnected ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                      {isConnected ? "Active" : "Available"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}