"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { properties } from "../LandlordData";

export default function LandlordTenantsPage() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  const filtered = selectedProperty === "all" ? properties : properties.filter((p) => p.id === selectedProperty);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/landlord" className="hover:text-[#C28A78] transition-colors">Landlord Portal</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-[#3A3F3A] font-medium">Tenants</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Tenants</h1>
              <p className="text-sm text-[#687068] mt-1">View tenant details for all your properties</p>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#3A3F3A]">
                <span className="flex items-center gap-2">
                  <i className="ri-building-4-line text-[#94A3B8] text-sm"></i>
                  {selectedProperty === "all" ? "All Properties" : properties.find((p) => p.id === selectedProperty)?.name}
                </span>
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Tenant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="relative h-40">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <p className="text-xs text-white font-medium">{p.name}</p>
                    <p className="text-[10px] text-white/70">{p.address}, {p.city}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold">
                    {p.tenant.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3A3F3A]">{p.tenant}</p>
                    <p className="text-xs text-[#687068]">Current tenant</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[#687068]">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-mail-line text-xs"></i>
                    </div>
                    <span className="text-xs">{p.tenantEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#687068]">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-phone-line text-xs"></i>
                    </div>
                    <span className="text-xs">{p.tenantPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#687068]">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-calendar-line text-xs"></i>
                    </div>
                    <span className="text-xs">{p.tenantMoveIn} — {p.tenantEnd}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs text-[#687068]">Rent: <span className="font-medium text-[#3A3F3A]">£{p.rent.toLocaleString()}</span>/mo</span>
                  <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}