"use client";

import { supabase } from "@/lib/supabaseClient";

export interface SuggestedPrompt {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  category: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  dataLoaded?: boolean;
}

export const suggestedPrompts: SuggestedPrompt[] = [
  { id: "attention", label: "Properties needing attention", icon: "ri-alert-line", prompt: "Which properties need attention today?", category: "Daily Overview" },
  { id: "certificates", label: "Expiring certificates", icon: "ri-shield-check-line", prompt: "Which certificates expire this month?", category: "Compliance" },
  { id: "arrears", label: "Tenants in arrears", icon: "ri-alarm-warning-line", prompt: "Which tenants are in arrears?", category: "Financial" },
  { id: "urgent", label: "Urgent maintenance jobs", icon: "ri-tools-line", prompt: "Show all urgent maintenance jobs.", category: "Maintenance" },
  { id: "landlords", label: "Landlord updates needed", icon: "ri-user-star-line", prompt: "Which landlords need updates?", category: "Communications" },
  { id: "inspections", label: "Overdue inspections", icon: "ri-clipboard-line", prompt: "Which inspections are overdue?", category: "Inspections" },
  { id: "portfolio", label: "Portfolio health summary", icon: "ri-building-4-line", prompt: "Give me a portfolio health summary.", category: "Daily Overview" },
  { id: "compliance", label: "Compliance status overview", icon: "ri-file-shield-2-line", prompt: "Show compliance status across all properties.", category: "Compliance" },
  { id: "rent", label: "Rent collection status", icon: "ri-bank-card-line", prompt: "What's the rent collection status this month?", category: "Financial" },
  { id: "maintenance", label: "Open maintenance jobs", icon: "ri-tools-fill", prompt: "Show all open maintenance jobs.", category: "Maintenance" },
];

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("lethub_ai_searches");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches().filter(s => s !== query);
    existing.unshift(query);
    localStorage.setItem("lethub_ai_searches", JSON.stringify(existing.slice(0, 8)));
  } catch {}
}

export function clearRecentSearches() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lethub_ai_searches");
  }
}

export { getRecentSearches };

async function formatPropertyAddress(id: string): Promise<string> {
  const { data } = await supabase.from("properties").select("line1, city, postcode").eq("id", id).maybeSingle();
  if (!data) return "Unknown Property";
  return [data.line1, data.city, data.postcode].filter(Boolean).join(", ");
}

async function formatTenantName(id: string): Promise<string> {
  const { data } = await supabase.from("tenants").select("full_name").eq("id", id).maybeSingle();
  return data?.full_name || "Unknown Tenant";
}

async function formatLandlordName(id: string): Promise<string> {
  const { data } = await supabase.from("landlords").select("full_name").eq("id", id).maybeSingle();
  return data?.full_name || "Unknown Landlord";
}

export async function getAIResponse(query: string): Promise<string> {
  const q = query.toLowerCase();

  if (q.includes("attention") || q.includes("issue") || q.includes("problem") || q.includes("flag")) {
    return await handlePropertiesNeedingAttention();
  }
  if (q.includes("certificate") || q.includes("expire") || q.includes("renewal")) {
    return await handleCertificatesExpiring(q);
  }
  if (q.includes("arrear") || q.includes("overdue") && q.includes("rent")) {
    return await handleTenantsInArrears();
  }
  if (q.includes("urgent") || q.includes("emergency") || (q.includes("maintenance") && q.includes("show"))) {
    return await handleUrgentMaintenance();
  }
  if (q.includes("landlord") && (q.includes("update") || q.includes("need") || q.includes("communicat"))) {
    return await handleLandlordUpdates();
  }
  if (q.includes("inspection") && (q.includes("overdue") || q.includes("pending") || q.includes("scheduled"))) {
    return await handleInspectionsOverdue();
  }
  if (q.includes("portfolio") && (q.includes("health") || q.includes("summary") || q.includes("overview"))) {
    return await handlePortfolioHealth();
  }
  if (q.includes("compliance") && (q.includes("status") || q.includes("overview") || q.includes("all"))) {
    return await handleComplianceOverview();
  }
  if (q.includes("rent") && (q.includes("collection") || q.includes("status") || q.includes("paid"))) {
    return await handleRentCollection();
  }
  if (q.includes("maintenance") && (q.includes("open") || q.includes("active") || q.includes("current"))) {
    return await handleOpenMaintenance();
  }

  return await handleGeneralQuery(query);
}

async function handlePropertiesNeedingAttention(): Promise<string> {
  const now = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [{ data: expiredCompliance }, { data: expiringCompliance }, { data: openMaintenance }, { data: activeArrears }] = await Promise.all([
    supabase.from("property_compliance_items").select("property_id, obligation_code, next_due").lt("next_due", now).eq("status", "compliant").limit(20),
    supabase.from("property_compliance_items").select("property_id, obligation_code, next_due").gte("next_due", now).lte("next_due", thirtyDaysFromNow).eq("status", "compliant").limit(20),
    supabase.from("maintenance_jobs").select("property_id, title, status").neq("status", "completed").neq("status", "cancelled").limit(20),
    supabase.from("arrears_cases").select("property_id, total_owed").neq("status", "resolved").neq("status", "cancelled").limit(20),
  ]);

  const propertyIssues: Record<string, { expired: number; expiring: number; maintenance: number; arrears: number }> = {};

  expiredCompliance?.forEach(e => {
    if (!propertyIssues[e.property_id]) propertyIssues[e.property_id] = { expired: 0, expiring: 0, maintenance: 0, arrears: 0 };
    propertyIssues[e.property_id].expired++;
  });
  expiringCompliance?.forEach(e => {
    if (!propertyIssues[e.property_id]) propertyIssues[e.property_id] = { expired: 0, expiring: 0, maintenance: 0, arrears: 0 };
    propertyIssues[e.property_id].expiring++;
  });
  openMaintenance?.forEach(m => {
    if (!propertyIssues[m.property_id]) propertyIssues[m.property_id] = { expired: 0, expiring: 0, maintenance: 0, arrears: 0 };
    propertyIssues[m.property_id].maintenance++;
  });
  activeArrears?.forEach(a => {
    if (!propertyIssues[a.property_id]) propertyIssues[a.property_id] = { expired: 0, expiring: 0, maintenance: 0, arrears: 0 };
    propertyIssues[a.property_id].arrears++;
  });

  const entries = Object.entries(propertyIssues);
  if (entries.length === 0) return "**Properties Needing Attention**\n\nNo properties currently need attention. All compliance is up to date, no open maintenance, and no arrears.\n\nGreat work keeping the portfolio in shape!";

  const addresses = await Promise.all(entries.map(([id]) => formatPropertyAddress(id)));

  let response = "**Properties Needing Attention**\n\n";
  response += `As of ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}, ${entries.length} properties need your attention:\n\n`;

  entries.forEach(([, issues], i) => {
    const flags: string[] = [];
    if (issues.expired) flags.push(`${issues.expired} expired compliance item${issues.expired > 1 ? "s" : ""}`);
    if (issues.expiring) flags.push(`${issues.expiring} expiring within 30 days`);
    if (issues.maintenance) flags.push(`${issues.maintenance} open maintenance job${issues.maintenance > 1 ? "s" : ""}`);
    if (issues.arrears) flags.push("active arrears case");
    response += `**${addresses[i]}**\n${flags.map(f => "• " + f).join("\n")}\n\n`;
  });

  response += "**Recommended Actions:** Prioritise expired compliance items first, then address arrears cases, and schedule maintenance jobs based on urgency.";
  return response;
}

async function handleCertificatesExpiring(q: string): Promise<string> {
  const now = new Date().toISOString().split("T")[0];
  let endDate: string;
  if (q.includes("month")) {
    endDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  } else if (q.includes("quarter") || q.includes("90")) {
    endDate = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0];
  } else {
    endDate = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];
  }

  const { data: items } = await supabase.from("property_compliance_items").select("property_id, obligation_code, next_due, status").gte("next_due", now).lte("next_due", endDate).eq("status", "compliant").order("next_due", { ascending: true }).limit(30);

  const { data: expired } = await supabase.from("property_compliance_items").select("property_id, obligation_code, next_due").lt("next_due", now).eq("status", "compliant").order("next_due", { ascending: true }).limit(30);

  const all = [...(expired || []), ...(items || [])];

  if (all.length === 0) {
    return `**Certificate Status**\n\nNo certificates are expiring within the next ${Math.round((new Date(endDate).getTime() - Date.now()) / 86400000)} days. All compliance is up to date.`;
  }

  const addresses = await Promise.all(all.filter((v, i, a) => a.findIndex(x => x.property_id === v.property_id) === i).map(c => formatPropertyAddress(c.property_id)));
  const addressMap: Record<string, string> = {};
  all.filter((v, i, a) => a.findIndex(x => x.property_id === v.property_id) === i).forEach((c, idx) => {
    addressMap[c.property_id] = addresses[idx] || "Unknown";
  });

  let response = "**Certificate Expiry Report**\n\n";

  if (expired && expired.length > 0) {
    response += `**IMMEDIATE ACTION — ${expired.length} Expired:**\n\n`;
    expired.forEach(e => {
      response += `**${addressMap[e.property_id]}** — ${e.obligation_code} expired ${new Date(e.next_due).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}\n`;
    });
    response += "\n";
  }

  if (items && items.length > 0) {
    response += `**Expiring Within ${Math.round((new Date(endDate).getTime() - Date.now()) / 86400000)} Days — ${items.length} items:**\n\n`;
    items.forEach(e => {
      const dueDate = new Date(e.next_due);
      const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);
      response += `**${addressMap[e.property_id]}** — ${e.obligation_code} expires ${dueDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} (${daysLeft} days)\n`;
    });
  }

  if (expired && expired.length > 0) {
    response += "\n**Warning:** Expired certificates may affect insurance validity and could result in penalties. Book inspections immediately.";
  }

  return response;
}

async function handleTenantsInArrears(): Promise<string> {
  const { data: cases } = await supabase.from("arrears_cases").select("tenancy_id, tenant_id, property_id, total_owed, status, payment_plan_amount").neq("status", "resolved").neq("status", "cancelled").order("total_owed", { ascending: false }).limit(20);

  if (!cases || cases.length === 0) return "**Arrears Report**\n\nNo tenants are currently in arrears. All rent is up to date.";

  const addresses = await Promise.all([...new Set(cases.map(c => c.property_id))].map(formatPropertyAddress));
  const tenants = await Promise.all([...new Set(cases.map(c => c.tenant_id))].map(formatTenantName));
  const addressMap: Record<string, string> = {};
  const tenantMap: Record<string, string> = {};
  [...new Set(cases.map(c => c.property_id))].forEach((id, i) => { addressMap[id] = addresses[i] || "Unknown"; });
  [...new Set(cases.map(c => c.tenant_id))].forEach((id, i) => { tenantMap[id] = tenants[i] || "Unknown"; });

  const total = cases.reduce((sum, c) => sum + (Number(c.total_owed) || 0), 0);

  let response = "**Tenants in Arrears**\n\n";
  response += `${cases.length} tenants are currently behind on rent. Total outstanding: £${total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

  cases.forEach(c => {
    const statusBadge = c.status === "payment_plan" ? " (Payment Plan: £" + (Number(c.payment_plan_amount) || 0) + "/mo)" : "";
    response += `**${tenantMap[c.tenant_id]}**\n`;
    response += `${addressMap[c.property_id]}\n`;
    response += `Outstanding: £${Number(c.total_owed).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${statusBadge}\n`;
    response += `Status: ${c.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}\n\n`;
  });

  response += "**Recommended:** Contact high-value cases immediately. For payment plan cases, verify next instalment dates.";
  return response;
}

async function handleUrgentMaintenance(): Promise<string> {
  const { data: jobs } = await supabase.from("maintenance_jobs").select("property_id, title, description, status, created_at").or("status.eq.urgent,status.eq.emergency").order("created_at", { ascending: false }).limit(20);

  if (!jobs || jobs.length === 0) {
    return "**Urgent Maintenance**\n\nNo urgent or emergency maintenance jobs currently open. All critical issues are resolved.";
  }

  const addresses = await Promise.all([...new Set(jobs.map(j => j.property_id))].map(formatPropertyAddress));
  const addressMap: Record<string, string> = {};
  [...new Set(jobs.map(j => j.property_id))].forEach((id, i) => { addressMap[id] = addresses[i] || "Unknown"; });

  let response = "**Urgent Maintenance Jobs**\n\n";
  response += `${jobs.length} urgent jobs require immediate attention:\n\n`;

  jobs.forEach(j => {
    const daysOpen = Math.ceil((Date.now() - new Date(j.created_at).getTime()) / 86400000);
    response += `**${addressMap[j.property_id]}** — ${j.title}\n`;
    if (j.description) response += `${j.description.slice(0, 100)}${j.description.length > 100 ? "..." : ""}\n`;
    response += `Status: ${(j.status || "open").replace(/\b\w/g, (l: string) => l.toUpperCase())} | Open for ${daysOpen} days\n\n`;
  });

  response += "**Recommended:** Escalate jobs open more than 7 days. Verify contractors have been instructed and tenants kept informed.";
  return response;
}

async function handleLandlordUpdates(): Promise<string> {
  const now = new Date().toISOString().split("T")[0];

  const { data: properties } = await supabase.from("properties").select("id, landlord_id").not("landlord_id", "is", null).limit(50);

  if (!properties || properties.length === 0) return "**Landlord Updates Needed**\n\nNo landlords found in the system.";

  const propertyIds = properties.map(p => p.id);
  const landlordIds = [...new Set(properties.map(p => p.landlord_id))];

  const [{ data: maintenance }, { data: arrears }, { data: compliance }] = await Promise.all([
    supabase.from("maintenance_jobs").select("property_id").neq("status", "completed").neq("status", "cancelled").in("property_id", propertyIds),
    supabase.from("arrears_cases").select("property_id").neq("status", "resolved").neq("status", "cancelled").in("property_id", propertyIds),
    supabase.from("property_compliance_items").select("property_id, next_due").lt("next_due", now).in("property_id", propertyIds),
  ]);

  const landlordFlags: Record<string, string[]> = {};
  properties.forEach(p => {
    const lid = p.landlord_id;
    if (!landlordFlags[lid]) landlordFlags[lid] = [];
    if (maintenance?.some(m => m.property_id === p.id)) landlordFlags[lid].push("Open maintenance");
    if (arrears?.some(a => a.property_id === p.id)) landlordFlags[lid].push("Arrears case");
    if (compliance?.some(c => c.property_id === p.id)) landlordFlags[lid].push("Expired compliance");
  });

  const needs = Object.entries(landlordFlags).filter(([, flags]) => flags.length > 0);
  if (needs.length === 0) return "**Landlord Updates**\n\nNo landlords currently need updates. All properties are in good standing with no open issues.";

  const names = await Promise.all(needs.map(([id]) => formatLandlordName(id)));

  let response = `**Landlords Needing Updates — ${needs.length}**\n\n`;

  needs.forEach(([lid, flags], i) => {
    response += `**${names[i] || "Unknown Landlord"}**\n`;
    response += flags.map(f => "• " + f).join("\n") + "\n\n";
  });

  response += "**Recommended:** Draft and send updates to these landlords with specific details about their property. Use the AI Assistant to draft professional landlord update messages.";
  return response;
}

async function handleInspectionsOverdue(): Promise<string> {
  const now = new Date().toISOString().split("T")[0];

  const { data: inspections } = await supabase.from("inspections").select("property_id, title, inspection_type, scheduled_date, status").lt("scheduled_date", now).neq("status", "completed").neq("status", "cancelled").order("scheduled_date", { ascending: true }).limit(20);

  if (!inspections || inspections.length === 0) return "**Inspection Report**\n\nNo inspections are overdue. All scheduled inspections are up to date.";

  const addresses = await Promise.all([...new Set(inspections.map(i => i.property_id))].map(formatPropertyAddress));
  const addressMap: Record<string, string> = {};
  [...new Set(inspections.map(i => i.property_id))].forEach((id, i) => { addressMap[id] = addresses[i] || "Unknown"; });

  let response = `**Overdue Inspections — ${inspections.length}**\n\n`;

  inspections.forEach(i => {
    const daysOverdue = Math.ceil((Date.now() - new Date(i.scheduled_date).getTime()) / 86400000);
    response += `**${addressMap[i.property_id]}** — ${i.title || i.inspection_type || "Inspection"}\n`;
    response += `Scheduled: ${new Date(i.scheduled_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} | Overdue by ${daysOverdue} days\n`;
    response += `Status: ${(i.status || "scheduled").replace(/\b\w/g, (l: string) => l.toUpperCase())}\n\n`;
  });

  response += "**Recommended:** Reschedule overdue inspections immediately. Contact tenants to confirm access and prioritise properties with the longest overdue periods.";
  return response;
}

async function handlePortfolioHealth(): Promise<string> {
  const [{ data: kpi }, { data: properties }, { data: activeTenancies }, { data: expiredCompliance }, { data: openMaintenance }] = await Promise.all([
    supabase.from("v_dashboard_kpi").select("*").maybeSingle(),
    supabase.from("properties").select("id").limit(100),
    supabase.from("tenancies").select("id").eq("status", "active").limit(100),
    supabase.from("property_compliance_items").select("id").lt("next_due", new Date().toISOString().split("T")[0]).eq("status", "compliant").limit(30),
    supabase.from("maintenance_jobs").select("id").neq("status", "completed").neq("status", "cancelled").limit(50),
  ]);

  const totalProperties = kpi?.total_properties || properties?.length || 0;
  const activeTenantCount = kpi?.active_tenancies || activeTenancies?.length || 0;
  const openJobs = kpi?.open_maintenance || openMaintenance?.length || 0;
  const arrearsCount = kpi?.active_arrears || 0;
  const totalArrears = kpi?.total_arrears_value || 0;
  const expiredCerts = expiredCompliance?.length || 0;

  let response = "**Portfolio Health Summary**\n\n";
  response += `Report generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}\n\n`;

  response += `**Overview:**\n`;
  response += `• Total Properties: ${totalProperties}\n`;
  response += `• Active Tenancies: ${activeTenantCount}\n`;
  response += `• Occupancy Rate: ${totalProperties > 0 ? Math.round((activeTenantCount / totalProperties) * 100) : 0}%\n\n`;

  response += `**Issues:**\n`;
  response += `• Expired Compliance Items: ${expiredCerts}\n`;
  response += `• Open Maintenance Jobs: ${openJobs}\n`;
  response += `• Active Arrears Cases: ${arrearsCount}\n`;
  response += `• Total Arrears Value: £${Number(totalArrears).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

  const healthScore = expiredCerts === 0 && openJobs < 3 && arrearsCount === 0 ? "Excellent" : expiredCerts < 2 && arrearsCount < 2 ? "Good" : "Needs Attention";
  response += `**Overall Portfolio Health:** ${healthScore}\n\n`;

  if (healthScore === "Needs Attention") {
    response += "**Priority Actions:**\n1. Resolve expired compliance items immediately\n2. Contact tenants in arrears\n3. Review open maintenance jobs\n";
  } else if (healthScore === "Good") {
    response += "**Suggested:** Keep monitoring. Address the few open items to reach Excellent status.\n";
  } else {
    response += "**Status:** Portfolio is well-maintained. Keep up the good work!\n";
  }

  return response;
}

async function handleComplianceOverview(): Promise<string> {
  const { data: items } = await supabase.from("property_compliance_items").select("property_id, obligation_code, status, next_due").order("next_due", { ascending: true }).limit(50);

  if (!items || items.length === 0) return "**Compliance Overview**\n\nNo compliance records found. Start by adding compliance items to your properties.";

  const now = new Date().toISOString().split("T")[0];
  const expired = items.filter(i => i.next_due && i.next_due < now && i.status === "compliant");
  const compliant = items.filter(i => i.next_due && i.next_due >= now && i.status === "compliant");
  const exempt = items.filter(i => i.status === "exempt");
  const missing = items.filter(i => !i.next_due || i.status === "not_compliant");

  const addresses = await Promise.all([...new Set(items.map(i => i.property_id))].map(formatPropertyAddress));
  const addressMap: Record<string, string> = {};
  [...new Set(items.map(i => i.property_id))].forEach((id, i) => { addressMap[id] = addresses[i] || "Unknown"; });

  let response = "**Compliance Status — Portfolio Overview**\n\n";

  response += `**Summary:**\n`;
  response += `• Total Compliance Items: ${items.length}\n`;
  response += `• Compliant: ${compliant.length}\n`;
  response += `• Expired: ${expired.length} (IMMEDIATE ACTION)\n`;
  response += `• Exempt: ${exempt.length}\n`;
  response += `• Not Compliant: ${missing.length}\n\n`;

  if (expired.length > 0) {
    response += `**Expired Items:**\n`;
    expired.forEach(e => {
      response += `• ${addressMap[e.property_id] || "Unknown"} — ${e.obligation_code} expired ${new Date(e.next_due!).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}\n`;
    });
    response += "\n";
  }

  const upcoming = compliant.filter(c => {
    const d = new Date(c.next_due!);
    return (d.getTime() - Date.now()) < 60 * 86400000;
  });
  if (upcoming.length > 0) {
    response += `**Expiring Within 60 Days:**\n`;
    upcoming.forEach(c => {
      const days = Math.ceil((new Date(c.next_due!).getTime() - Date.now()) / 86400000);
      response += `• ${addressMap[c.property_id] || "Unknown"} — ${c.obligation_code} in ${days} days\n`;
    });
    response += "\n";
  }

  response += "**Recommended:** Address expired items as a priority. Set calendar reminders 60 days before each renewal date.";
  return response;
}

async function handleRentCollection(): Promise<string> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: kpi } = await supabase.from("v_dashboard_kpi").select("overdue_payments, active_arrears, total_arrears_value").maybeSingle();

  const { data: tenancies } = await supabase.from("tenancies").select("id, property_id, rent_amount").eq("status", "active").limit(50);

  let response = "**Rent Collection Status**\n\n";
  response += `Month: ${now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}\n\n`;

  if (kpi) {
    response += `**Summary:**\n`;
    response += `• Overdue Payments: ${kpi.overdue_payments || 0}\n`;
    response += `• Active Arrears Cases: ${kpi.active_arrears || 0}\n`;
    response += `• Total Outstanding: £${Number(kpi.total_arrears_value || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
  }

  if (tenancies && tenancies.length > 0) {
    const totalExpected = tenancies.reduce((sum, t) => sum + (Number(t.rent_amount) || 0), 0);
    response += `**Portfolio:**\n`;
    response += `• Active Tenancies: ${tenancies.length}\n`;
    response += `• Expected Monthly Rent: £${totalExpected.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  }

  response += "\nFor detailed tenant-level breakdown, ask: 'Which tenants are in arrears?'";
  return response;
}

async function handleOpenMaintenance(): Promise<string> {
  const { data: jobs } = await supabase.from("maintenance_jobs").select("property_id, title, status, created_at").neq("status", "completed").neq("status", "cancelled").order("created_at", { ascending: false }).limit(30);

  if (!jobs || jobs.length === 0) return "**Open Maintenance Jobs**\n\nNo open maintenance jobs. All repairs are completed.";

  const addresses = await Promise.all([...new Set(jobs.map(j => j.property_id))].map(formatPropertyAddress));
  const addressMap: Record<string, string> = {};
  [...new Set(jobs.map(j => j.property_id))].forEach((id, i) => { addressMap[id] = addresses[i] || "Unknown"; });

  let response = `**Open Maintenance Jobs — ${jobs.length}**\n\n`;

  const byStatus: Record<string, typeof jobs> = {};
  jobs.forEach(j => {
    const s = j.status || "open";
    if (!byStatus[s]) byStatus[s] = [];
    byStatus[s].push(j);
  });

  const order = ["emergency", "urgent", "in_progress", "assigned", "open", "pending"];
  order.forEach(status => {
    const list = byStatus[status];
    if (list && list.length > 0) {
      response += `**${status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} (${list.length}):**\n`;
      list.forEach(j => {
        const daysOpen = Math.ceil((Date.now() - new Date(j.created_at).getTime()) / 86400000);
        response += `• ${addressMap[j.property_id]} — ${j.title} (${daysOpen}d)\n`;
      });
      response += "\n";
    }
  });

  response += "For more detail on any job, visit the Maintenance dashboard.";
  return response;
}

async function handleGeneralQuery(query: string): Promise<string> {
  const [{ data: kpi }, { data: expiredCerts }, { data: openJobs }, { data: arrears }] = await Promise.all([
    supabase.from("v_dashboard_kpi").select("*").maybeSingle(),
    supabase.from("property_compliance_items").select("id").lt("next_due", new Date().toISOString().split("T")[0]).eq("status", "compliant").limit(5),
    supabase.from("maintenance_jobs").select("id").neq("status", "completed").neq("status", "cancelled").limit(5),
    supabase.from("arrears_cases").select("id").neq("status", "resolved").neq("status", "cancelled").limit(5),
  ]);

  let response = "I can help you with your property portfolio. Here's a quick snapshot and some things you can ask me:\n\n";

  if (kpi) {
    response += `**Your Portfolio:**\n`;
    response += `• ${kpi.total_properties || 0} properties\n`;
    response += `• ${kpi.active_tenancies || 0} active tenancies\n`;
    response += `• ${kpi.open_maintenance || openJobs?.length || 0} open maintenance jobs\n`;
    response += `• ${kpi.active_arrears || arrears?.length || 0} active arrears cases\n`;
    response += `• ${expiredCerts?.length || 0} expired compliance items\n\n`;
  }

  response += "**Try asking:**\n";
  response += "• Which properties need attention today?\n";
  response += "• Which certificates expire this month?\n";
  response += "• Which tenants are in arrears?\n";
  response += "• Show all urgent maintenance jobs.\n";
  response += "• Which inspections are overdue?\n";
  response += "• Give me a portfolio health summary.\n\n";

  response += "I query your live property data to give you real-time answers.";

  return response;
}