"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PropertyDetailView, {
  PropertyDetailData,
  PropertyRelatedData,
} from "@/components/property/PropertyDetailView";

const nationLabels: Record<string, string> = {
  england: "England",
  wales: "Wales",
  scotland: "Scotland",
  northern_ireland: "Northern Ireland",
};

function isoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}

function portalState(rows: Array<{ user_type: string | null; status: string | null }>, userType: string): string {
  const row = rows.find((r) => r.user_type === userType);
  if (!row) return "not-invited";
  if (row.status === "active") return "active";
  if (row.status === "invited" || row.status === "pending") return "invited";
  return "not-invited";
}

function overallCompliance(statuses: string[]): string {
  if (statuses.length === 0) return "Missing";
  if (statuses.some((s) => s === "overdue" || s === "missing")) return "Overdue";
  if (statuses.some((s) => s === "due_soon")) return "Expiring Soon";
  return "Valid";
}

export default function PropertyDetail({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [related, setRelated] = useState<PropertyRelatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProperty = async () => {
      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        setProperty(null);
        setRelated(null);
        setNotFound(true);
        setLoading(false);
        return;
      }

      const [landlordRes, tenancyRes, maintenanceRes, inspectionsRes, documentsRes, complianceRes, portalRes] =
        await Promise.all([
          data.landlord_id
            ? supabase.from("landlords").select("display_name, email").eq("id", data.landlord_id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from("tenancies")
            .select("id, regime, term_type, status, start_date, end_date, rent_amount, rent_period, deposit_amount, deposit_scheme, deposit_protected_on")
            .eq("property_id", propertyId)
            .in("status", ["active", "in_possession_process", "draft"])
            .order("start_date", { ascending: false })
            .limit(1),
          supabase
            .from("maintenance_jobs")
            .select("id, title, status, created_at")
            .eq("property_id", propertyId)
            .order("created_at", { ascending: false }),
          supabase
            .from("inspections")
            .select("id, title, inspection_type, status, scheduled_date, completed_date, inspector_name, report_url")
            .eq("property_id", propertyId)
            .order("scheduled_date", { ascending: false }),
          supabase
            .from("documents")
            .select("id, kind, tenancy_id, issued_on, expires_on, created_at, file_size")
            .eq("property_id", propertyId)
            .order("created_at", { ascending: false }),
          supabase
            .from("property_compliance_items")
            .select("obligation_code, status, next_due, last_completed")
            .eq("property_id", propertyId),
          supabase.from("portal_access").select("user_type, status").eq("property_id", propertyId),
        ]);

      if (!active) return;

      const tenancy = (tenancyRes.data && tenancyRes.data[0]) || null;

      let tenantName: string | null = null;
      let tenantEmail: string | null = null;
      let payments: PropertyRelatedData["payments"] = [];

      if (tenancy) {
        const [partiesRes, paymentsRes] = await Promise.all([
          supabase
            .from("tenancy_parties")
            .select("is_lead, tenants(full_name, email)")
            .eq("tenancy_id", tenancy.id),
          supabase
            .from("rent_payments")
            .select("id, amount, due_date, paid_date, status")
            .eq("tenancy_id", tenancy.id)
            .order("due_date", { ascending: false })
            .limit(6),
        ]);
        if (!active) return;

        const parties = (partiesRes.data || []) as Array<{ is_lead: boolean | null; tenants: any }>;
        const lead = parties.find((p) => p.is_lead) || parties[0];
        const leadTenant = Array.isArray(lead?.tenants) ? lead?.tenants[0] : lead?.tenants;
        tenantName = leadTenant?.full_name || null;
        tenantEmail = leadTenant?.email || null;

        payments = (paymentsRes.data || []).map((p: any) => ({
          id: p.id,
          amount: Number(p.amount) || 0,
          dueDate: isoDate(p.due_date),
          paidDate: isoDate(p.paid_date),
          status: p.status || "pending",
        }));
      }

      const complianceRows = (complianceRes.data || []) as Array<{
        obligation_code: string;
        status: string;
        next_due: string | null;
        last_completed: string | null;
      }>;
      const gas = complianceRows.find((c) => c.obligation_code === "GAS_SAFETY");
      const eicr = complianceRows.find((c) => c.obligation_code === "EICR");
      const maintenance = (maintenanceRes.data || []) as Array<{ id: string; title: string | null; status: string | null; created_at: string }>;
      const openMaintenance = maintenance.filter((m) => !["completed", "resolved", "cancelled", "closed"].includes((m.status || "").toLowerCase()));
      const portals = (portalRes.data || []) as Array<{ user_type: string | null; status: string | null }>;
      const landlord = (landlordRes as { data: { display_name: string | null; email: string | null } | null }).data;

      const rentAmount = Number(tenancy?.rent_amount ?? data.rent_pcm ?? 0) || 0;
      const depositAmount = Number(tenancy?.deposit_amount ?? data.deposit_amount ?? 0) || 0;

      const mapped: PropertyDetailData = {
        id: data.id,
        name: data.line1 || "—",
        address: [data.line1, data.line2].filter(Boolean).join(", ") || "—",
        city: data.city || "—",
        postcode: data.postcode || "—",
        type: data.type || "—",
        bedrooms: data.bedrooms ?? 0,
        bathrooms: data.bathrooms ?? 0,
        nation: data.nation || "england",
        nationLabel: nationLabels[data.nation] || data.nation || "—",
        status: tenancy && tenancy.status === "active" ? "Occupied" : data.status || "Vacant",
        rentAmount,
        depositAmount,
        landlordName: landlord?.display_name || null,
        landlordEmail: landlord?.email || null,
        tenantName,
        tenantEmail,
        propertyManager: null,
        tenancyStart: isoDate(tenancy?.start_date),
        tenancyEnd: isoDate(tenancy?.end_date),
        epcRating: data.epc_rating || "—",
        gasExpiry: isoDate(gas?.next_due) || isoDate(data.gas_safety_expiry),
        eicrExpiry: isoDate(eicr?.next_due) || isoDate(data.eicr_expiry),
        complianceStatus: overallCompliance(complianceRows.map((c) => c.status)),
        maintenanceOpen: openMaintenance.length,
        ownerPortal: portalState(portals, "owner"),
        tenantPortal: portalState(portals, "tenant"),
        isHmo: data.is_hmo || false,
        isFurnished: data.is_furnished || false,
        dateAdded: isoDate(data.created_at) || "—",
        image: "",
        isLiveData: true,
      };

      setProperty(mapped);
      setRelated({
        tenancy: tenancy
          ? {
              regime: tenancy.regime,
              termType: tenancy.term_type,
              rentPeriod: tenancy.rent_period,
              depositScheme: tenancy.deposit_scheme,
              depositProtectedOn: isoDate(tenancy.deposit_protected_on),
            }
          : null,
        maintenance: maintenance.map((m) => ({
          id: m.id,
          title: m.title || "Untitled job",
          date: isoDate(m.created_at) || "—",
          status: m.status || "open",
        })),
        inspections: ((inspectionsRes.data || []) as any[]).map((i) => ({
          id: i.id,
          type: i.inspection_type || i.title || "Inspection",
          date: isoDate(i.completed_date) || isoDate(i.scheduled_date) || "—",
          inspector: i.inspector_name || "—",
          status: i.status || "scheduled",
          hasReport: Boolean(i.report_url),
        })),
        documents: ((documentsRes.data || []) as any[]).map((d) => ({
          id: d.id,
          kind: d.kind || "other",
          date: isoDate(d.issued_on) || isoDate(d.created_at) || "—",
          expires: isoDate(d.expires_on),
          sizeBytes: Number(d.file_size) || 0,
          linkedTo: d.tenancy_id ? "Tenancy" : "Property",
        })),
        compliance: complianceRows.map((c) => ({
          code: c.obligation_code,
          status: c.status,
          nextDue: isoDate(c.next_due),
          lastCompleted: isoDate(c.last_completed),
        })),
        payments,
      });
      setLoading(false);
    };

    fetchProperty();
    return () => {
      active = false;
    };
  }, [propertyId]);

  return <PropertyDetailView property={property} related={related} loading={loading} notFound={notFound} />;
}
