"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  createTenancy,
  fetchSelectableProperties,
  fetchSelectableTenants,
  SelectableProperty,
  SelectableTenant,
} from "@/lib/tenancyFlow";

interface CreateTenancyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
  showToast: (message: string) => void;
}

type TenancyStatus = "draft" | "active";

export default function CreateTenancyModal({
  open,
  onClose,
  onCreated,
  showToast,
}: CreateTenancyModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<SelectableProperty[]>([]);
  const [tenants, setTenants] = useState<SelectableTenant[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [periodic, setPeriodic] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"property" | "tenant" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    setPropertyId("");
    setTenantId("");
    setStartDate("");
    setEndDate("");
    setRent("");
    setDeposit("");
    setPeriodic(false);
    setOpenDropdown(null);
    (async () => {
      const [props, tns] = await Promise.all([
        fetchSelectableProperties(supabase),
        fetchSelectableTenants(supabase),
      ]);
      if (!active) return;
      setProperties(props);
      setTenants(tns);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const selectedProperty = properties.find((p) => p.id === propertyId) || null;
  const selectedTenant = tenants.find((t) => t.id === tenantId) || null;

  const submit = async (status: TenancyStatus) => {
    setError(null);
    if (!propertyId) return setError("Select a property.");
    if (!tenantId) return setError("Select a tenant.");
    if (!startDate) return setError("Enter a start date.");
    const rentValue = Number(rent);
    if (!rent || !Number.isFinite(rentValue) || rentValue <= 0) {
      return setError("Enter a valid monthly rent greater than zero.");
    }
    const depositValue = deposit === "" ? 0 : Number(deposit);
    if (!Number.isFinite(depositValue) || depositValue < 0) {
      return setError("Enter a valid deposit amount.");
    }
    if (!periodic && endDate && endDate < startDate) {
      return setError("End date cannot be before the start date.");
    }

    setSubmitting(true);
    const result = await createTenancy(supabase, {
      propertyId,
      tenantId,
      startDate,
      endDate: periodic ? undefined : endDate || undefined,
      rentAmount: rentValue,
      depositAmount: depositValue,
      termType: periodic ? "periodic" : "fixed_term",
      regime: "ast_legacy",
      status,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      showToast(result.message);
      return;
    }
    onCreated(result.message);
  };

  if (!open) return null;

  const noProperties = !loading && properties.length === 0;
  const noTenants = !loading && tenants.length === 0;
  const blocked = noProperties || noTenants;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#3A3F3A]">Create Tenancy</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {noProperties && (
              <div className="flex items-start gap-2 bg-[#F59E0B]/10 text-[#B45309] text-sm rounded-lg px-3 py-2.5">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line"></i>
                </div>
                Add a landlord and property before creating a tenancy.
              </div>
            )}
            {noTenants && (
              <div className="flex items-start gap-2 bg-[#F59E0B]/10 text-[#B45309] text-sm rounded-lg px-3 py-2.5">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line"></i>
                </div>
                Add a tenant before creating a tenancy.
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Property *</label>
              <button
                type="button"
                disabled={noProperties}
                onClick={() => setOpenDropdown(openDropdown === "property" ? null : "property")}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-left bg-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] cursor-pointer"
              >
                <span className={selectedProperty ? "text-[#3A3F3A]" : "text-[#94A3B8]"}>
                  {selectedProperty ? selectedProperty.label : "Select a property"}
                </span>
                <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
              </button>
              {openDropdown === "property" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                  {properties.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setPropertyId(p.id); setOpenDropdown(null); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] cursor-pointer"
                    >
                      <span className="block font-medium">{p.label}</span>
                      {p.address && <span className="block text-xs text-[#94A3B8]">{p.address}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Tenant *</label>
              <button
                type="button"
                disabled={noTenants}
                onClick={() => setOpenDropdown(openDropdown === "tenant" ? null : "tenant")}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-left bg-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] cursor-pointer"
              >
                <span className={selectedTenant ? "text-[#3A3F3A]" : "text-[#94A3B8]"}>
                  {selectedTenant ? selectedTenant.fullName : "Select a tenant"}
                </span>
                <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
              </button>
              {openDropdown === "tenant" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setTenantId(t.id); setOpenDropdown(null); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] cursor-pointer"
                    >
                      <span className="block font-medium">{t.fullName}</span>
                      {t.email && <span className="block text-xs text-[#94A3B8]">{t.email}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Owner</label>
              <div className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm bg-[#FBF9F4] text-[#3A3F3A]">
                {selectedProperty?.landlordName || <span className="text-[#94A3B8]">Derived from the selected property</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">End Date</label>
                <input
                  type="date"
                  value={periodic ? "" : endDate}
                  disabled={periodic}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] bg-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Monthly Rent (£) *</label>
                <input
                  type="number"
                  min="0"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="e.g. 1850"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Deposit (£)</label>
                <input
                  type="number"
                  min="0"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="e.g. 1850"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setPeriodic(!periodic)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${periodic ? "bg-[#C28A78] border-[#C28A78]" : "border-[#D5D9D5]"}`}
              >
                {periodic && <i className="ri-check-line text-white text-xs"></i>}
              </button>
              <span className="text-sm text-[#3A3F3A]">Periodic tenancy (rolling, no end date)</span>
            </label>

            {error && (
              <div className="flex items-start gap-2 bg-[#EF4444]/10 text-[#EF4444] text-sm rounded-lg px-3 py-2.5">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-error-warning-line"></i>
                </div>
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={blocked || submitting}
                onClick={() => submit("draft")}
                className="flex-1 border border-[#C28A78] text-[#C28A78] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#FBF9F4] transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={blocked || submitting}
                onClick={() => submit("active")}
                className="flex-1 bg-[#C28A78] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Saving..." : "Create & Activate"}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-sm font-medium text-[#687068] border border-[#D5D9D5] py-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}