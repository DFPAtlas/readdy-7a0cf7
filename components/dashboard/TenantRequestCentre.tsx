"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PetRequest {
  id: string;
  tenancy_ref: string;
  tenant_name: string;
  tenant_email: string;
  tenant_profile_id: string;
  property_name: string;
  description: string;
  status: string;
  created_at: string;
  refusal_reason: string | null;
}

interface ModRequest {
  id: string;
  tenancy_ref: string;
  tenant_name: string;
  tenant_email: string;
  tenant_profile_id: string;
  property_name: string;
  modification_type: string;
  description: string;
  status: string;
  created_at: string;
  refusal_reason: string | null;
}

const statusBadge: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  requested: { label: "Pending", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-time-line" },
  approved: { label: "Approved", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-line" },
  refused: { label: "Refused", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", icon: "ri-close-line" },
  withdrawn: { label: "Withdrawn", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-arrow-go-back-line" },
};

export default function TenantRequestCentre() {
  const [petRequests, setPetRequests] = useState<PetRequest[]>([]);
  const [modRequests, setModRequests] = useState<ModRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"pets" | "mods">("pets");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refuseId, setRefuseId] = useState<string | null>(null);
  const [refuseTable, setRefuseTable] = useState<"pet_requests" | "modification_requests">("pet_requests");
  const [refuseReason, setRefuseReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showDemo = process.env.NEXT_PUBLIC_DEMO === "true" || typeof window !== "undefined";

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: petData } = await supabase
        .from("pet_requests")
        .select("id, status, description, created_at, decided_on, refusal_reason, tenancy_id")
        .order("created_at", { ascending: false });

      const { data: modData } = await supabase
        .from("modification_requests")
        .select("id, status, modification_type, description, created_at, decided_on, refusal_reason, tenancy_id")
        .order("created_at", { ascending: false });

      const tenancyIds = new Set<string>();
      (petData || []).forEach((p: any) => tenancyIds.add(p.tenancy_id));
      (modData || []).forEach((m: any) => tenancyIds.add(m.tenancy_id));

      const tenancyMap: Record<string, { ref: string; property_name: string; tenant_name: string; tenant_email: string; tenant_profile_id: string }> = {};

      if (tenancyIds.size > 0) {
        const { data: tenancies } = await supabase
          .from("tenancies")
          .select("id, ref, property_id")
          .in("id", Array.from(tenancyIds));

        const { data: parties } = await supabase
          .from("tenancy_parties")
          .select("tenancy_id, tenant_id")
          .in("tenancy_id", Array.from(tenancyIds))
          .eq("is_lead", true);

        const tenantIds = [...new Set((parties || []).map((p: any) => p.tenant_id))];
        const propertyIds = [...new Set((tenancies || []).map((t: any) => t.property_id))];

        const { data: tenants } = await supabase
          .from("tenants")
          .select("id, name, email")
          .in("id", tenantIds);

        const { data: properties } = await supabase
          .from("properties")
          .select("id, line1, city, postcode")
          .in("id", propertyIds);

        const { data: portalAccess } = await supabase
          .from("tenant_portal_access")
          .select("tenant_id, profile_id")
          .in("tenant_id", tenantIds)
          .eq("is_active", true);

        const profileMap: Record<string, string> = {};
        (portalAccess || []).forEach((pa: any) => {
          if (pa.tenant_id && pa.profile_id) profileMap[pa.tenant_id] = pa.profile_id;
        });

        for (const ten of tenancies || []) {
          const t = ten as any;
          const party = (parties || []).find((p: any) => p.tenancy_id === t.id);
          const tenant = party ? (tenants || []).find((tn: any) => tn.id === party.tenant_id) : null;
          const prop = (properties || []).find((pr: any) => pr.id === t.property_id);
          tenancyMap[t.id] = {
            ref: t.ref || "—",
            property_name: prop ? `${prop.line1 || ""}, ${prop.city || ""}` : "Unknown property",
            tenant_name: tenant?.name || "Unknown tenant",
            tenant_email: tenant?.email || "",
            tenant_profile_id: tenant ? (profileMap[tenant.id] || "") : "",
          };
        }
      }

      setPetRequests(
        (petData || []).map((p: any) => ({
          ...p,
          tenancy_ref: tenancyMap[p.tenancy_id]?.ref || "—",
          tenant_name: tenancyMap[p.tenancy_id]?.tenant_name || "Unknown tenant",
          tenant_email: tenancyMap[p.tenancy_id]?.tenant_email || "",
          tenant_profile_id: tenancyMap[p.tenancy_id]?.tenant_profile_id || "",
          property_name: tenancyMap[p.tenancy_id]?.property_name || "Unknown property",
        }))
      );

      setModRequests(
        (modData || []).map((m: any) => ({
          ...m,
          tenancy_ref: tenancyMap[m.tenancy_id]?.ref || "—",
          tenant_name: tenancyMap[m.tenancy_id]?.tenant_name || "Unknown tenant",
          tenant_email: tenancyMap[m.tenancy_id]?.tenant_email || "",
          tenant_profile_id: tenancyMap[m.tenancy_id]?.tenant_profile_id || "",
          property_name: tenancyMap[m.tenancy_id]?.property_name || "Unknown property",
        }))
      );
    } catch (e) {
      console.error("Failed to fetch tenant requests", e);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string, table: "pet_requests" | "modification_requests", reqInfo: { profileId: string; tenantName: string; description: string; modificationType?: string }) => {
    setActionLoading(id);
    const { error } = await supabase
      .from(table)
      .update({ status: "approved", decided_on: new Date().toISOString().split("T")[0] })
      .eq("id", id);
    setActionLoading(null);
    if (error) {
      setToast("Failed to approve — please try again");
    } else {
      setToast("Request approved");
      if (table === "pet_requests") {
        setPetRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
      } else {
        setModRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
      }
      if (reqInfo.profileId) {
        const firstLine = reqInfo.description?.split("\n")[0] || "Your request";
        const isPet = table === "pet_requests";
        const title = isPet ? "Pet request approved" : "Modification request approved";
        const body = isPet
          ? `Your request "${firstLine}" has been approved. You may now keep your pet at the property.`
          : `Your request "${firstLine}" has been approved. You may now proceed with the changes as described.`;
        await supabase.from("notifications").insert({
          profile_id: reqInfo.profileId,
          title,
          body,
          type: isPet ? "pet_request_approved" : "mod_request_approved",
          is_read: false,
          related_id: id,
          related_table: table,
        });
      }
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefuse = async () => {
    if (!refuseId || !refuseReason.trim()) return;
    setActionLoading(refuseId);
    const { error } = await supabase
      .from(refuseTable)
      .update({ status: "refused", refusal_reason: refuseReason.trim(), decided_on: new Date().toISOString().split("T")[0] })
      .eq("id", refuseId);
    setActionLoading(null);
    if (error) {
      setToast("Failed to refuse — please try again");
    } else {
      setToast("Request refused");
      if (refuseTable === "pet_requests") {
        setPetRequests((prev) =>
          prev.map((r) => (r.id === refuseId ? { ...r, status: "refused", refusal_reason: refuseReason.trim() } : r))
        );
      } else {
        setModRequests((prev) =>
          prev.map((r) => (r.id === refuseId ? { ...r, status: "refused", refusal_reason: refuseReason.trim() } : r))
        );
      }
      const targetReq = refuseTable === "pet_requests"
        ? petRequests.find((r) => r.id === refuseId)
        : modRequests.find((r) => r.id === refuseId);
      if (targetReq?.tenant_profile_id) {
        const firstLine = targetReq.description?.split("\n")[0] || "Your request";
        const isPet = refuseTable === "pet_requests";
        const title = isPet ? "Pet request refused" : "Modification request refused";
        const body = isPet
          ? `Your request "${firstLine}" has been refused. Reason: ${refuseReason.trim()}`
          : `Your request "${firstLine}" has been refused. Reason: ${refuseReason.trim()}`;
        await supabase.from("notifications").insert({
          profile_id: targetReq.tenant_profile_id,
          title,
          body,
          type: isPet ? "pet_request_refused" : "mod_request_refused",
          is_read: false,
          related_id: refuseId,
          related_table: refuseTable,
        });
      }
      setRefuseId(null);
      setRefuseReason("");
    }
    setTimeout(() => setToast(null), 3000);
  };

  const pendingPets = petRequests.filter((r) => r.status === "requested");
  const resolvedPets = petRequests.filter((r) => r.status !== "requested");
  const pendingMods = modRequests.filter((r) => r.status === "requested");
  const resolvedMods = modRequests.filter((r) => r.status !== "requested");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const totalPending = pendingPets.length + pendingMods.length;

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
            <i className="ri-user-voice-line text-[#C28A78] text-sm"></i>
          </div>
          <h2 className="font-semibold text-[#3A3F3A]">Tenant Requests</h2>
          {totalPending > 0 && (
            <span className="text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">
              {totalPending} pending
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D5D9D5]">
        <button
          onClick={() => setActiveTab("pets")}
          className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "pets"
              ? "text-[#C28A78] border-b-2 border-[#C28A78] bg-[#FBF9F4]/50"
              : "text-[#687068] hover:bg-[#FBF9F4]/30"
          }`}
        >
          <i className="ri-bear-smile-line mr-1.5"></i>
          Pet Requests
          {pendingPets.length > 0 && (
            <span className="ml-1.5 text-[10px] font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded-full">
              {pendingPets.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("mods")}
          className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "mods"
              ? "text-[#C28A78] border-b-2 border-[#C28A78] bg-[#FBF9F4]/50"
              : "text-[#687068] hover:bg-[#FBF9F4]/30"
          }`}
        >
          <i className="ri-home-gear-line mr-1.5"></i>
          Modifications
          {pendingMods.length > 0 && (
            <span className="ml-1.5 text-[10px] font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded-full">
              {pendingMods.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === "pets" ? (
          <div className="space-y-3">
            {pendingPets.length === 0 && resolvedPets.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-bear-smile-line text-[#94A3B8] text-xl"></i>
                </div>
                <p className="text-sm text-[#94A3B8]">No pet requests from tenants</p>
                <p className="text-xs text-[#94A3B8] mt-1">Requests submitted by tenants will appear here for review</p>
              </div>
            ) : (
              <>
                {pendingPets.map((req) => (
                  <PetRequestCard key={req.id} req={req} actionLoading={actionLoading} onApprove={() => handleApprove(req.id, "pet_requests", { profileId: req.tenant_profile_id, tenantName: req.tenant_name, description: req.description })} onRefuse={() => { setRefuseId(req.id); setRefuseTable("pet_requests"); setRefuseReason(""); }} formatDate={formatDate} />
                ))}
                {pendingPets.length > 0 && resolvedPets.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide px-1 mb-2">Resolved</p>
                  </div>
                )}
                {resolvedPets.map((req) => (
                  <PetRequestCard key={req.id} req={req} actionLoading={actionLoading} resolved formatDate={formatDate} />
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMods.length === 0 && resolvedMods.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-home-gear-line text-[#94A3B8] text-xl"></i>
                </div>
                <p className="text-sm text-[#94A3B8]">No modification requests from tenants</p>
                <p className="text-xs text-[#94A3B8] mt-1">Requests submitted by tenants will appear here for review</p>
              </div>
            ) : (
              <>
                {pendingMods.map((req) => (
                  <ModRequestCard key={req.id} req={req} actionLoading={actionLoading} onApprove={() => handleApprove(req.id, "modification_requests", { profileId: req.tenant_profile_id, tenantName: req.tenant_name, description: req.description, modificationType: req.modification_type })} onRefuse={() => { setRefuseId(req.id); setRefuseTable("modification_requests"); setRefuseReason(""); }} formatDate={formatDate} />
                ))}
                {pendingMods.length > 0 && resolvedMods.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide px-1 mb-2">Resolved</p>
                  </div>
                )}
                {resolvedMods.map((req) => (
                  <ModRequestCard key={req.id} req={req} actionLoading={actionLoading} resolved formatDate={formatDate} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Refuse Modal */}
      {refuseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setRefuseId(null); setRefuseReason(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-[#D5D9D5]">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">Refuse Request</h3>
              <p className="text-xs text-[#687068] mt-1">Please provide a reason — the tenant will see this</p>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                placeholder="e.g. The lease agreement does not permit pets in this property"
                rows={3}
                maxLength={500}
                className="w-full px-3.5 py-2.5 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#EF4444] bg-white resize-none"
              />
              <p className="text-xs text-[#94A3B8] text-right">{refuseReason.length}/500</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRefuse}
                  disabled={!refuseReason.trim() || actionLoading === refuseId}
                  className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {actionLoading === refuseId ? "Processing..." : "Confirm Refusal"}
                </button>
                <button
                  onClick={() => { setRefuseId(null); setRefuseReason(""); }}
                  className="flex-1 border border-[#D5D9D5] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#F1F5F9] transition-colors text-[#3A3F3A] whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <i className="ri-check-line text-[#10B981]"></i>
          {toast}
        </div>
      )}
    </div>
  );
}

function PetRequestCard({
  req,
  actionLoading,
  onApprove,
  onRefuse,
  resolved,
  formatDate,
}: {
  req: PetRequest;
  actionLoading: string | null;
  onApprove?: () => void;
  onRefuse?: () => void;
  resolved?: boolean;
  formatDate: (iso: string) => string;
}) {
  const badge = statusBadge[req.status] || statusBadge.requested;
  const firstLine = req.description?.split("\n")[0] || "Pet request";

  return (
    <div className={`rounded-xl border p-4 ${resolved ? "bg-[#FBF9F4] border-[#EBE5DA] opacity-80" : "bg-[#FDFAF5] border-[#FDE68A]/50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#3A3F3A]">{firstLine}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.bg} ${badge.color}`}>
              <div className="w-3 h-3 flex items-center justify-center">
                <i className={`${badge.icon} text-[10px]`}></i>
              </div>
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#94A3B8] flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-user-3-line text-[10px]"></i>
              </div>
              {req.tenant_name}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-building-4-line text-[10px]"></i>
              </div>
              {req.property_name}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-calendar-line text-[10px]"></i>
              </div>
              {formatDate(req.created_at)}
            </span>
            <span className="text-[#94A3B8]">{req.tenancy_ref}</span>
          </div>
          {req.status === "refused" && req.refusal_reason && (
            <div className="mt-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-[#EF4444] uppercase tracking-wide mb-0.5">Refusal Reason</p>
              <p className="text-xs text-[#3A3F3A]">{req.refusal_reason}</p>
            </div>
          )}
        </div>

        {!resolved && onApprove && onRefuse && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onApprove}
              disabled={actionLoading === req.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-check-line text-xs"></i>
              </div>
              Approve
            </button>
            <button
              onClick={onRefuse}
              disabled={actionLoading === req.id}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D5D9D5] hover:bg-[#FEF2F2] hover:border-[#EF4444] hover:text-[#EF4444] text-[#687068] text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-close-line text-xs"></i>
              </div>
              Refuse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ModRequestCard({
  req,
  actionLoading,
  onApprove,
  onRefuse,
  resolved,
  formatDate,
}: {
  req: ModRequest;
  actionLoading: string | null;
  onApprove?: () => void;
  onRefuse?: () => void;
  resolved?: boolean;
  formatDate: (iso: string) => string;
}) {
  const badge = statusBadge[req.status] || statusBadge.requested;
  const proposedChange = req.description?.split("\n")[1]?.replace("Proposed Change: ", "") || req.description?.split("\n")[0] || "Modification request";

  return (
    <div className={`rounded-xl border p-4 ${resolved ? "bg-[#FBF9F4] border-[#EBE5DA] opacity-80" : "bg-[#F0FDFA] border-[#5EEAD4]/30"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] whitespace-nowrap">{req.modification_type}</span>
            <span className="text-sm font-semibold text-[#3A3F3A] truncate">{proposedChange}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.bg} ${badge.color}`}>
              <div className="w-3 h-3 flex items-center justify-center">
                <i className={`${badge.icon} text-[10px]`}></i>
              </div>
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#94A3B8] flex-wrap">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-user-3-line text-[10px]"></i>
              </div>
              {req.tenant_name}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-building-4-line text-[10px]"></i>
              </div>
              {req.property_name}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-calendar-line text-[10px]"></i>
              </div>
              {formatDate(req.created_at)}
            </span>
            <span className="text-[#94A3B8]">{req.tenancy_ref}</span>
          </div>
          {req.status === "refused" && req.refusal_reason && (
            <div className="mt-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-[#EF4444] uppercase tracking-wide mb-0.5">Refusal Reason</p>
              <p className="text-xs text-[#3A3F3A]">{req.refusal_reason}</p>
            </div>
          )}
        </div>

        {!resolved && onApprove && onRefuse && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onApprove}
              disabled={actionLoading === req.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-check-line text-xs"></i>
              </div>
              Approve
            </button>
            <button
              onClick={onRefuse}
              disabled={actionLoading === req.id}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D5D9D5] hover:bg-[#FEF2F2] hover:border-[#EF4444] hover:text-[#EF4444] text-[#687068] text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-close-line text-xs"></i>
              </div>
              Refuse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}