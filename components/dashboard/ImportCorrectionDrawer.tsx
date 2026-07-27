"use client";

import type { PreviewProperty } from "@/app/dashboard/import/ImportData";

interface Props {
  property: PreviewProperty;
  onClose: () => void;
}

export default function ImportCorrectionDrawer({ property, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-semibold text-[#3A3F3A]">{property.address || "Unnamed property"}</h3>
            <p className="text-xs text-[#94A3B8]">Row detail and corrections</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
          >
            <i className="ri-close-line text-[#687068]"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {property.validationErrors.length > 0 && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4">
              <p className="text-xs font-medium text-[#991B1B] mb-2">Validation errors</p>
              <ul className="space-y-1">
                {property.validationErrors.map((err, i) => (
                  <li key={i} className="text-sm text-[#B91C1C] flex items-start gap-2">
                    <i className="ri-close-circle-line flex-shrink-0 mt-0.5"></i>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {property.validationWarnings.length > 0 && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-4">
              <p className="text-xs font-medium text-[#92400E] mb-2">Warnings</p>
              <ul className="space-y-1">
                {property.validationWarnings.map((w, i) => (
                  <li key={i} className="text-sm text-[#B45309] flex items-start gap-2">
                    <i className="ri-error-warning-line flex-shrink-0 mt-0.5"></i>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-[#687068] mb-3">Source values</p>
            <div className="space-y-2">
              {[
                { label: "Address", value: property.address },
                { label: "City", value: property.city },
                { label: "Postcode", value: property.postcode },
                { label: "Property Type", value: property.propertyType },
                { label: "Bedrooms", value: property.bedrooms?.toString() },
                { label: "Landlord", value: property.landlord },
                { label: "Landlord Email", value: property.landlordEmail },
                { label: "Tenant", value: property.tenant },
                { label: "Rent", value: property.rent > 0 ? `£${property.rent.toLocaleString()}` : "" },
                { label: "Status", value: property.status },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between text-sm py-1.5 border-b border-[#F1F5F9]">
                  <span className="text-[#687068]">{field.label}</span>
                  <span className={`font-medium ${field.value ? "text-[#3A3F3A]" : "text-[#EF4444]"}`}>
                    {field.value || "Missing"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {property.isDuplicate && (
            <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-4">
              <p className="text-xs font-medium text-[#92400E] mb-2">Possible duplicate of {property.duplicateOf}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-[#F59E0B]/30 rounded-lg text-sm text-[#B45309] hover:bg-[#F59E0B]/10 transition-colors whitespace-nowrap">
                  Create new
                </button>
                <button className="px-3 py-1.5 bg-[#F59E0B] text-white rounded-lg text-sm font-medium hover:bg-[#D97706] transition-colors whitespace-nowrap">
                  Update existing
                </button>
                <button className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
          <button
            className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors whitespace-nowrap"
            onClick={onClose}
          >
            Skip this row
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}