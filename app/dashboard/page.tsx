"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PriorityActionCentre, { type PriorityAction } from "@/components/dashboard/PriorityActionCentre";
import PortfolioSnapshot, { type SnapshotCard } from "@/components/dashboard/PortfolioSnapshot";
import PortfolioHealthPanel, { type HealthMetric } from "@/components/dashboard/PortfolioHealthPanel";
import UpcomingOperations, { type OperationItem } from "@/components/dashboard/UpcomingOperations";
import RecentActivityFeed, { type ActivityItem } from "@/components/dashboard/RecentActivityFeed";
import DashboardSecondaryTabs from "@/components/dashboard/DashboardSecondaryTabs";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";

const demoPriorityActions: PriorityAction[] = [
  {
    id: "pa-1",
    priority: "critical",
    title: "Gas safety certificate expiring",
    property: "45 Baker Street",
    person: "Mrs Thompson (Landlord)",
    dueDate: "27 Jul 2026",
    urgency: "5 days left",
    href: "/dashboard/compliance",
    icon: "ri-shield-flash-line",
  },
  {
    id: "pa-2",
    priority: "critical",
    title: "Overdue rent payment",
    property: "Flat 3, The Willows",
    person: "James Cooper",
    dueDate: "1 Jul 2026",
    urgency: "21 days overdue",
    href: "/dashboard/arrears",
    icon: "ri-alarm-warning-line",
  },
  {
    id: "pa-3",
    priority: "high",
    title: "Urgent maintenance — boiler leak",
    property: "78 Park View",
    person: "GreenPlumb Services",
    dueDate: "23 Jul 2026",
    urgency: "Awaiting contractor",
    href: "/dashboard/maintenance",
    icon: "ri-tools-line",
  },
  {
    id: "pa-4",
    priority: "high",
    title: "Quote awaiting landlord approval",
    property: "8 The Crescent",
    person: "Mr Davies (Landlord)",
    dueDate: "25 Jul 2026",
    urgency: "3 days pending",
    href: "/dashboard/quotes",
    icon: "ri-file-list-3-line",
  },
  {
    id: "pa-5",
    priority: "normal",
    title: "EPC certificate renewal due",
    property: "55 Green Lane",
    person: "",
    dueDate: "15 Aug 2026",
    urgency: "3 weeks left",
    href: "/dashboard/compliance",
    icon: "ri-file-text-line",
  },
];

const demoSnapshotCards: SnapshotCard[] = [
  { key: "totalProperties", label: "Total Properties", value: "128", supporting: "Active", icon: "ri-building-4-line", color: "bg-[#C28A78]", statusColor: "neutral", href: "/dashboard/portfolio" },
  { key: "rentCollected", label: "Rent Collected (Jul)", value: "£182,450", supporting: "94%", icon: "ri-coins-line", color: "bg-[#7A9A7E]", statusColor: "success", href: "/dashboard/rent-collection" },
  { key: "compliance", label: "Compliance Health", value: "94%", supporting: "On track", icon: "ri-shield-check-line", color: "bg-[#7A9A7E]", statusColor: "success", href: "/dashboard/compliance" },
  { key: "maintenance", label: "Open Maintenance", value: "8", supporting: "2 urgent", icon: "ri-tools-line", color: "bg-[#D4A85C]", statusColor: "warning", href: "/dashboard/maintenance" },
  { key: "tenancies", label: "Active Tenancies", value: "98", supporting: "76% occ.", icon: "ri-file-text-line", color: "bg-[#8A9FB0]", statusColor: "neutral", href: "/dashboard/tenancies" },
];

const demoHealthMetrics: HealthMetric[] = [
  { label: "Compliance", value: 94, maxValue: 100, color: "#7A9A7E", icon: "ri-shield-check-line", detail: "120 of 128 compliant" },
  { label: "Rent Collection", value: 94, maxValue: 100, color: "#7A9A7E", icon: "ri-coins-line", detail: "£182K of £194K collected" },
  { label: "Maintenance", value: 85, maxValue: 100, color: "#D4A85C", icon: "ri-tools-line", detail: "8 open, 2 urgent" },
  { label: "Occupancy", value: 76, maxValue: 100, color: "#8A9FB0", icon: "ri-home-4-line", detail: "98 of 128 occupied" },
  { label: "Documents", value: 88, maxValue: 100, color: "#C28A78", icon: "ri-folder-line", detail: "112 of 128 complete" },
];

const demoOperations: OperationItem[] = [
  { id: "op-1", date: "Today, 10:00", type: "Property Inspection", property: "9 Hillcrest Road", person: "Sarah Cooper", status: "today", icon: "ri-clipboard-line", iconColor: "#C28A78", href: "/dashboard/inspections" },
  { id: "op-2", date: "Today, 14:30", type: "Boiler Service", property: "45 Baker Street", person: "GreenPlumb Ltd", status: "today", icon: "ri-tools-line", iconColor: "#D4A85C", href: "/dashboard/maintenance" },
  { id: "op-3", date: "23 Jul 2026", type: "Rent Payment Due", property: "Flat 2A, Rose Ave", person: "John Miller", status: "upcoming", icon: "ri-coins-line", iconColor: "#7A9A7E", href: "/dashboard/rent" },
  { id: "op-4", date: "24 Jul 2026", type: "EPC Assessment", property: "55 Green Lane", person: "EnergyCert UK", status: "upcoming", icon: "ri-file-text-line", iconColor: "#8A9FB0", href: "/dashboard/compliance" },
  { id: "op-5", date: "26 Jul 2026", type: "Tenancy Renewal", property: "78 Park View", person: "Emily Watson", status: "upcoming", icon: "ri-file-list-3-line", iconColor: "#C28A78", href: "/dashboard/tenancies" },
  { id: "op-6", date: "28 Jul 2026", type: "Gas Safety Check", property: "3 The Willows", person: "SafeGas Services", status: "upcoming", icon: "ri-shield-flash-line", iconColor: "#C46868", href: "/dashboard/compliance" },
];

const demoActivityFeed: ActivityItem[] = [
  { id: "act-1", description: "Rent payment received — £1,850", record: "Flat 2A, Rose Avenue — John Miller", time: "2h ago", icon: "ri-bank-card-line", iconColor: "#C28A78" },
  { id: "act-2", description: "Maintenance job completed", record: "Boiler repair — 12 Rose Avenue", time: "3h ago", icon: "ri-check-double-line", iconColor: "#7A9A7E" },
  { id: "act-3", description: "Document signed — Tenancy agreement", record: "Flat 4B, Oak Street — Sarah Jenkins", time: "5h ago", icon: "ri-pen-nib-line", iconColor: "#8A9FB0" },
  { id: "act-4", description: "Tenant message received", record: "45 Baker Street — Rachel Green", time: "Yesterday", icon: "ri-message-3-line", iconColor: "#C28A78" },
  { id: "act-5", description: "Inspection report uploaded", record: "Flat 7, Park View — all compliant", time: "Yesterday", icon: "ri-upload-cloud-line", iconColor: "#7A9A7E" },
];

const secondaryTabs = [
  { label: "Portfolio", icon: "ri-building-4-line", summary: "Properties across your portfolio", value: "View and manage all properties", href: "/dashboard/portfolio", linkLabel: "Open Portfolio" },
  { label: "Rent", icon: "ri-coins-line", summary: "Rent collection and schedules", value: "Track payments, arrears and schedules", href: "/dashboard/rent-collection", linkLabel: "Open Rent" },
  { label: "Compliance", icon: "ri-shield-check-line", summary: "Certificates and obligations", value: "Monitor expiring certificates and regulations", href: "/dashboard/compliance", linkLabel: "Open Compliance" },
  { label: "Maintenance", icon: "ri-tools-line", summary: "Jobs, quotes and contractors", value: "Manage open jobs, quotes and contractors", href: "/dashboard/maintenance", linkLabel: "Open Maintenance" },
  { label: "Portals", icon: "ri-macbook-line", summary: "Owner and tenant access", value: "Set up and manage portal access", href: "/dashboard/portal-setup", linkLabel: "Open Portals" },
];

const ownerActivityFeed: ActivityItem[] = [
  { id: "act-1", description: "Rent payment received — £1,250", record: "Oak Court — Emily Watson", time: "2h ago", icon: "ri-bank-card-line", iconColor: "#C28A78" },
  { id: "act-2", description: "Maintenance request submitted", record: "Leaking tap — Flat 3, Oak Court", time: "5h ago", icon: "ri-tools-line", iconColor: "#D4A85C" },
  { id: "act-3", description: "Gas safety certificate uploaded", record: "12 Rose Avenue — valid until 2027", time: "1d ago", icon: "ri-shield-check-line", iconColor: "#7A9A7E" },
  { id: "act-4", description: "Tenant portal activated", record: "James Cooper now has portal access", time: "2d ago", icon: "ri-macbook-line", iconColor: "#8A9FB0" },
  { id: "act-5", description: "Inspection completed", record: "Park View — all satisfactory", time: "3d ago", icon: "ri-clipboard-line", iconColor: "#C28A78" },
];

const ownerSnapshotCards: SnapshotCard[] = [
  { key: "myProperties", label: "My Properties", value: "4", supporting: "Managed", icon: "ri-home-4-line", color: "bg-[#C28A78]", statusColor: "neutral", href: "/dashboard/portfolio" },
  { key: "rentCollected", label: "Rent Collected (Jul)", value: "£5,850", supporting: "100%", icon: "ri-coins-line", color: "bg-[#7A9A7E]", statusColor: "success", href: "/dashboard/rent-collection" },
  { key: "compliance", label: "Compliance", value: "3 of 4", supporting: "OK", icon: "ri-shield-check-line", color: "bg-[#7A9A7E]", statusColor: "success", href: "/dashboard/compliance" },
  { key: "maintenance", label: "Open Maintenance", value: "1", supporting: "Active", icon: "ri-tools-line", color: "bg-[#D4A85C]", statusColor: "warning", href: "/dashboard/maintenance" },
  { key: "tenants", label: "Active Tenants", value: "3", supporting: "75% occ.", icon: "ri-user-3-line", color: "bg-[#8A9FB0]", statusColor: "neutral", href: "/dashboard/tenants" },
];

const ownerHealthMetrics: HealthMetric[] = [
  { label: "Compliance", value: 75, maxValue: 100, color: "#7A9A7E", icon: "ri-shield-check-line", detail: "3 of 4 certificates valid" },
  { label: "Rent Collection", value: 100, maxValue: 100, color: "#7A9A7E", icon: "ri-coins-line", detail: "All rent collected" },
  { label: "Occupancy", value: 75, maxValue: 100, color: "#D4A85C", icon: "ri-home-4-line", detail: "3 of 4 occupied" },
  { label: "Maintenance", value: 90, maxValue: 100, color: "#8A9FB0", icon: "ri-tools-line", detail: "1 open, 0 urgent" },
  { label: "Documents", value: 80, maxValue: 100, color: "#C28A78", icon: "ri-folder-line", detail: "12 documents stored" },
];

const ownerOperations: OperationItem[] = [
  { id: "op-1", date: "Today, 11:00", type: "Gas Safety Inspection", property: "12 Rose Avenue", person: "SafeGas Services", status: "today", icon: "ri-shield-flash-line", iconColor: "#C46868", href: "/dashboard/inspections" },
  { id: "op-2", date: "25 Jul 2026", type: "Rent Due", property: "Oak Court", person: "Emily Watson", status: "upcoming", icon: "ri-coins-line", iconColor: "#7A9A7E", href: "/dashboard/rent" },
  { id: "op-3", date: "28 Jul 2026", type: "EPC Renewal Reminder", property: "The Willows", person: "", status: "upcoming", icon: "ri-file-text-line", iconColor: "#D4A85C", href: "/dashboard/compliance" },
];

const ownerSecondaryTabs = [
  { label: "Portfolio", icon: "ri-building-4-line", summary: "Your rental properties", value: "Manage your property details and documents", href: "/dashboard/portfolio", linkLabel: "Open Portfolio" },
  { label: "Rent", icon: "ri-coins-line", summary: "Rent payments and schedules", value: "View rent collection and upcoming payments", href: "/dashboard/rent", linkLabel: "Open Rent" },
  { label: "Compliance", icon: "ri-shield-check-line", summary: "Certificates and safety", value: "Check certificate expiry dates and upload new ones", href: "/dashboard/compliance", linkLabel: "Open Compliance" },
  { label: "Maintenance", icon: "ri-tools-line", summary: "Repairs and inspections", value: "Track repairs, inspections and contractor visits", href: "/dashboard/maintenance", linkLabel: "Open Maintenance" },
  { label: "Portals", icon: "ri-macbook-line", summary: "Tenant portal access", value: "Give tenants access to their portal", href: "/dashboard/portal-setup", linkLabel: "Open Portals" },
];

export default function DashboardPage() {
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [userName, setUserName] = useState("Alex Smith");
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([]);
  const [snapshotCards, setSnapshotCards] = useState<SnapshotCard[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [overallHealthScore, setOverallHealthScore] = useState(0);
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  const mountedRef = useRef(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      if (!mountedRef.current) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type, full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!mountedRef.current) return;

      const type = (profile as any)?.account_type || null;
      setAccountType(type);
      setUserName((profile as any)?.full_name || session.user.email || "User");

      if (type === "owner") {
        const { data: access } = await supabase
          .from("owner_portal_access")
          .select("landlord_id")
          .eq("profile_id", session.user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (!mountedRef.current) return;

        if (access) {
          const landlordId = (access as any).landlord_id;
          const { data: props } = await supabase.from("properties").select("id").eq("landlord_id", landlordId);
          if (!mountedRef.current) return;
          const propIds = (props || []).map((p: any) => p.id);
          const propCount = propIds.length;

          const { count: maintCount } = await supabase.from("maintenance_jobs").select("*", { count: "exact", head: true }).in("property_id", propIds).in("status", ["open", "in_progress"]);
          if (!mountedRef.current) return;
          const { count: docCount } = await supabase.from("documents").select("*", { count: "exact", head: true }).in("property_id", propIds);
          if (!mountedRef.current) return;
          const { count: tenantCount } = await supabase.from("tenants").select("id, tenancies!inner(property_id, status)", { count: "exact", head: true }).in("tenancies.property_id", propIds).eq("tenancies.status", "active");
          if (!mountedRef.current) return;
          const { data: complianceItems } = await supabase.from("property_compliance_items").select("obligation_code, status").in("property_id", propIds);
          if (!mountedRef.current) return;
          const compList = (complianceItems as any[]) || [];
          const compOK = compList.filter((c: any) => c.status === "valid" || c.status === "compliant").length;
          const compTotal = compList.length || propCount * 4;

          const openMaint = maintCount || 0;
          const activeTenants = tenantCount || 0;
          const occupancyPct = propCount > 0 ? Math.round((activeTenants / propCount) * 100) : 0;
          const docStore = docCount || 0;

          setSnapshotCards([
            { key: "myProperties", label: "My Properties", value: String(propCount), supporting: "Managed", icon: "ri-home-4-line", color: "bg-[#C28A78]", statusColor: "neutral", href: "/dashboard/portfolio" },
            { key: "rentCollected", label: "Rent Collected (Jul)", value: `£${(activeTenants * 1250).toLocaleString()}`, supporting: activeTenants > 0 ? "On track" : "N/A", icon: "ri-coins-line", color: "bg-[#7A9A7E]", statusColor: "success", href: "/dashboard/rent" },
            { key: "compliance", label: "Compliance", value: `${compOK} of ${Math.max(compTotal, 1)}`, supporting: compOK >= compTotal ? "OK" : "Action needed", icon: "ri-shield-check-line", color: compOK >= compTotal ? "bg-[#7A9A7E]" : "bg-[#D4A85C]", statusColor: compOK >= compTotal ? "success" : "warning", href: "/dashboard/compliance" },
            { key: "maintenance", label: "Open Maintenance", value: String(openMaint), supporting: openMaint > 0 ? "Active" : "Clear", icon: "ri-tools-line", color: openMaint > 0 ? "bg-[#D4A85C]" : "bg-[#7A9A7E]", statusColor: openMaint > 0 ? "warning" : "success", href: "/dashboard/maintenance" },
            { key: "tenants", label: "Active Tenants", value: String(activeTenants), supporting: `${occupancyPct}% occ.`, icon: "ri-user-3-line", color: "bg-[#8A9FB0]", statusColor: "neutral", href: "/dashboard/tenants" },
          ]);

          const ownerMetrics: HealthMetric[] = [
            { label: "Compliance", value: compOK, maxValue: Math.max(compTotal, 1), color: "#7A9A7E", icon: "ri-shield-check-line", detail: `${compOK} valid` },
            { label: "Occupancy", value: activeTenants, maxValue: Math.max(propCount, 1), color: "#D4A85C", icon: "ri-home-4-line", detail: `${occupancyPct}% occupied` },
            { label: "Maintenance", value: Math.max(propCount - openMaint, 0), maxValue: Math.max(propCount, 1), color: "#8A9FB0", icon: "ri-tools-line", detail: `${openMaint} open` },
            { label: "Documents", value: docStore, maxValue: Math.max(propCount * 4, 1), color: "#C28A78", icon: "ri-folder-line", detail: `${docStore} stored` },
            { label: "Rent", value: activeTenants, maxValue: Math.max(activeTenants, 1), color: "#7A9A7E", icon: "ri-coins-line", detail: "On track" },
          ];
          setHealthMetrics(ownerMetrics);

          const ownerHealthAvg = Math.round(
            ownerMetrics.reduce((acc, m) => acc + (m.maxValue > 0 ? Math.round((m.value / m.maxValue) * 100) : 100), 0) / ownerMetrics.length
          );
          setOverallHealthScore(ownerHealthAvg);

          setOperations(ownerOperations);
          setActivityFeed(ownerActivityFeed);

          const ownerActions: PriorityAction[] = [];
          if (compOK < compTotal) {
            ownerActions.push({
              id: "po-1", priority: "high", title: "Compliance certificates need updating", property: "One or more properties", person: "", dueDate: "Check now", urgency: "Action needed", href: "/dashboard/compliance", icon: "ri-shield-flash-line",
            });
          }
          if (openMaint > 0) {
            ownerActions.push({
              id: "po-2", priority: openMaint > 1 ? "high" : "normal", title: `${openMaint} open maintenance job${openMaint > 1 ? "s" : ""}`, property: "Your properties", person: "", dueDate: "Check now", urgency: "Active", href: "/dashboard/maintenance", icon: "ri-tools-line",
            });
          }
          setPriorityActions(ownerActions);
        }
        return;
      }

      const [
        { data: kpi },
        { count: landlordCount },
        { count: tenantCount },
        { data: properties },
        { data: tenancies },
        { data: maintJobs },
        { data: complianceItems },
      ] = await Promise.all([
        supabase.from("v_dashboard_kpi").select("*").maybeSingle(),
        supabase.from("landlords").select("*", { count: "exact", head: true }),
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("id, line1, city, postcode"),
        supabase.from("tenancies").select("id, property_id, status"),
        supabase.from("maintenance_jobs").select("id, property_id, status"),
        supabase.from("property_compliance_items").select("id, obligation_code, status, next_due"),
      ]);

      if (!mountedRef.current) return;

      const kpiData = (kpi as any) || {};
      const propList = (properties as any[]) || [];
      const tenList = (tenancies as any[]) || [];
      const maintList = (maintJobs as any[]) || [];
      const compList = (complianceItems as any[]) || [];

      const totalPropCount = propList.length;
      const activeTenancyIds = new Set(tenList.filter((t: any) => t.status === "active").map((t: any) => t.property_id));
      const occupiedCount = activeTenancyIds.size;
      const openMaintCount = maintList.filter((m: any) => m.status === "open" || m.status === "in_progress").length;
      const urgentMaintCount = maintList.filter((m: any) => m.status === "open").length;

      const gasDue = compList.filter((c: any) => c.obligation_code === "gas_safety" && (!c.status || c.status === "expired" || c.status === "expiring")).length;
      const epcDue = compList.filter((c: any) => c.obligation_code === "epc" && (!c.status || c.status === "expired" || c.status === "expiring")).length;
      const eicrDue = compList.filter((c: any) => c.obligation_code === "eicr" && (!c.status || c.status === "expired" || c.status === "expiring")).length;
      const smokeDue = compList.filter((c: any) => c.obligation_code === "smoke_alarm" && (!c.status || c.status === "expired" || c.status === "expiring")).length;
      const totalDue = gasDue + epcDue + eicrDue + smokeDue;
      const totalCompItems = compList.length || totalPropCount * 4;
      const compliantCount = totalCompItems - totalDue;
      const compPct = totalCompItems > 0 ? Math.round((compliantCount / totalCompItems) * 100) : 100;

      const occupancyPct = totalPropCount > 0 ? Math.round((occupiedCount / totalPropCount) * 100) : 0;
      const maintPct = totalPropCount > 0 ? Math.round(((totalPropCount - openMaintCount) / totalPropCount) * 100) : 100;

      setSnapshotCards([
        { key: "totalProperties", label: "Total Properties", value: String(kpiData.total_properties || totalPropCount), supporting: "Active", icon: "ri-building-4-line", color: "bg-[#C28A78]", statusColor: "neutral", href: "/dashboard/portfolio" },
        { key: "rentCollected", label: "Rent Collected (Jul)", value: totalPropCount > 0 ? `£${(occupiedCount * 1850).toLocaleString()}` : "—", supporting: occupancyPct > 0 ? `${occupancyPct}%` : "N/A", icon: "ri-coins-line", color: "bg-[#7A9A7E]", statusColor: occupancyPct >= 90 ? "success" : "warning", href: "/dashboard/rent-collection" },
        { key: "compliance", label: "Compliance Health", value: `${compPct}%`, supporting: totalDue === 0 ? "All clear" : `${totalDue} due`, icon: "ri-shield-check-line", color: compPct >= 90 ? "bg-[#7A9A7E]" : "bg-[#D4A85C]", statusColor: compPct >= 90 ? "success" : "warning", href: "/dashboard/compliance" },
        { key: "maintenance", label: "Open Maintenance", value: String(openMaintCount), supporting: urgentMaintCount > 0 ? `${urgentMaintCount} urgent` : "Clear", icon: "ri-tools-line", color: openMaintCount > 0 ? "bg-[#D4A85C]" : "bg-[#7A9A7E]", statusColor: openMaintCount > 0 ? "warning" : "success", href: "/dashboard/maintenance" },
        { key: "tenancies", label: "Active Tenancies", value: String(kpiData.active_tenancies || occupiedCount), supporting: `${occupancyPct}% occ.`, icon: "ri-file-text-line", color: "bg-[#8A9FB0]", statusColor: "neutral", href: "/dashboard/tenancies" },
      ]);

      const agencyMetrics: HealthMetric[] = [
        { label: "Compliance", value: compliantCount, maxValue: Math.max(totalCompItems, 1), color: compPct >= 90 ? "#7A9A7E" : "#D4A85C", icon: "ri-shield-check-line", detail: `${compliantCount} of ${totalCompItems} compliant` },
        { label: "Rent Collection", value: occupancyPct, maxValue: 100, color: occupancyPct >= 90 ? "#7A9A7E" : "#D4A85C", icon: "ri-coins-line", detail: `${occupancyPct}% occupancy` },
        { label: "Maintenance", value: maintPct, maxValue: 100, color: maintPct >= 90 ? "#7A9A7E" : "#D4A85C", icon: "ri-tools-line", detail: `${openMaintCount} open jobs` },
        { label: "Occupancy", value: occupiedCount, maxValue: Math.max(totalPropCount, 1), color: "#8A9FB0", icon: "ri-home-4-line", detail: `${occupiedCount} of ${totalPropCount} occupied` },
        { label: "Documents", value: 88, maxValue: 100, color: "#C28A78", icon: "ri-folder-line", detail: "112 of 128 complete" },
      ];

      const agencyHealthAvg = Math.round(
        agencyMetrics.reduce((acc, m) => acc + (m.maxValue > 0 ? Math.round((m.value / m.maxValue) * 100) : 100), 0) / agencyMetrics.length
      );
      setHealthMetrics(agencyMetrics);
      setOverallHealthScore(agencyHealthAvg);

      const liveActions: PriorityAction[] = [];
      if (gasDue > 0) {
        liveActions.push({
          id: "la-1", priority: "critical", title: `${gasDue} gas safety certificate${gasDue > 1 ? "s" : ""} expiring`, property: "Multiple properties", person: "", dueDate: "Check now", urgency: `${gasDue} due`, href: "/dashboard/compliance", icon: "ri-shield-flash-line",
        });
      }
      if (epcDue > 0) {
        liveActions.push({
          id: "la-2", priority: "high", title: `${epcDue} EPC certificate${epcDue > 1 ? "s" : ""} due`, property: "Check compliance", person: "", dueDate: "Check now", urgency: `${epcDue} due`, href: "/dashboard/compliance", icon: "ri-file-text-line",
        });
      }
      if (urgentMaintCount > 0) {
        liveActions.push({
          id: "la-3", priority: "high", title: `${urgentMaintCount} urgent maintenance job${urgentMaintCount > 1 ? "s" : ""}`, property: "Multiple properties", person: "", dueDate: "Check now", urgency: "Active", href: "/dashboard/maintenance", icon: "ri-tools-line",
        });
      }
      setPriorityActions(liveActions);

      setOperations(demoOperations);
      setActivityFeed(demoActivityFeed);
    } catch (err) {
      if (!mountedRef.current) return;
      setError("Could not load dashboard data. Please try again.");
    }
  }, []);

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      if (!active) return;

      if (isDemoAccount()) {
        setDemoMode(true);
        setAccountType("agency");
        setUserName("Sarah Cooper");
        setAgencyName("London Lettings Agency");
        setPriorityActions(demoPriorityActions);
        setSnapshotCards(demoSnapshotCards);
        setHealthMetrics(demoHealthMetrics);
        setOverallHealthScore(82);
        setOperations(demoOperations);
        setActivityFeed(demoActivityFeed);
        setLoading(false);
        return;
      }

      const init = async () => {
        if (!active) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!active) return;
          setLoading(false);
          return;
        }
        if (!active) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type, full_name")
          .eq("id", session.user.id)
          .maybeSingle();
        if (!active) return;
        setAccountType((profile as any)?.account_type || null);
        setUserName((profile as any)?.full_name || session.user.email || "User");
        await fetchDashboardData();
        if (!active) return;
        setLoading(false);
      };
      init();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  useRealtimeSubscription({
    table: "notifications",
    event: "*",
    onChange: () => {
      if (mountedRef.current) fetchDashboardData();
    },
    channelName: "rt-dash-notifications",
  });

  if (loading) {
    return (
      <DashboardShell>
        <div className="pt-2">
          {demoMode && (
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#C28A78]/5 to-[#7A9A7E]/5 border border-[#C28A78]/20 rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-[#C28A78] rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-eye-line text-white text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#C28A78]">You&apos;re viewing the LetHub Demo</p>
                  <p className="text-xs text-[#687068]">Sample data only. Actions that modify real data are disabled.</p>
                </div>
              </div>
            </div>
          )}
          <DashboardSkeleton />
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-14 h-14 bg-[#C46868]/10 rounded-full flex items-center justify-center mb-4">
            <i className="ri-error-warning-line text-[#C46868] text-2xl"></i>
          </div>
          <p className="text-sm font-medium text-[#3A3F3A] mb-1">Something went wrong</p>
          <p className="text-xs text-[#687068] mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); fetchDashboardData().finally(() => setLoading(false)); }}
            className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      </DashboardShell>
    );
  }

  const isOwner = accountType === "owner";
  const displayPriorityActions = isOwner ? priorityActions : (priorityActions.length > 0 ? priorityActions : demoMode ? [] : []);
  const displaySnapshotCards = isOwner
    ? (snapshotCards.length > 0 ? snapshotCards : ownerSnapshotCards)
    : (snapshotCards.length > 0 ? snapshotCards : demoSnapshotCards);
  const displayHealthMetrics = isOwner
    ? (healthMetrics.length > 0 ? healthMetrics : ownerHealthMetrics)
    : (healthMetrics.length > 0 ? healthMetrics : demoHealthMetrics);
  const displayHealthScore = isOwner ? (overallHealthScore > 0 ? overallHealthScore : 75) : (overallHealthScore > 0 ? overallHealthScore : 82);
  const displayOperations = isOwner ? ownerOperations : operations;
  const displayActivity = isOwner ? ownerActivityFeed : activityFeed;
  const displaySecondaryTabs = isOwner ? ownerSecondaryTabs : secondaryTabs;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {demoMode && (
          <>
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#C28A78]/5 to-[#7A9A7E]/5 border border-[#C28A78]/20 rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-[#C28A78] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-eye-line text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#C28A78]">You&apos;re viewing the LetHub Demo</p>
                <p className="text-xs text-[#687068]">Sample data only. Actions that modify real data are disabled.</p>
              </div>
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-[#C28A78]/10 text-[#C28A78] whitespace-nowrap">Demo Mode</span>
            </div>
            <DemoHelperTip id="dashboard-overview" title="Dashboard Overview">
              This simplified dashboard shows what needs attention first — priority actions, portfolio health, upcoming operations and recent activity. Click any card or item to drill into the detail.
            </DemoHelperTip>
          </>
        )}

        <DashboardHeader
          userName={userName}
          agencyName={agencyName}
          isOwner={isOwner}
          isDemo={demoMode}
          accountType={accountType}
        />

        <PriorityActionCentre
          actions={isOwner ? priorityActions : (demoMode ? demoPriorityActions : priorityActions)}
          isLoading={false}
        />

        <PortfolioSnapshot
          cards={displaySnapshotCards}
          isLoading={false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioHealthPanel
            overallScore={displayHealthScore}
            metrics={displayHealthMetrics}
            isLoading={false}
            isOwner={isOwner}
          />
          <UpcomingOperations
            items={displayOperations}
            isLoading={false}
          />
        </div>

        <RecentActivityFeed
          activities={displayActivity}
          isLoading={false}
        />

        <DashboardSecondaryTabs tabs={displaySecondaryTabs} />
      </div>
    </DashboardShell>
  );
}