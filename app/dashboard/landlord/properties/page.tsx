"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { properties } from "@/app/dashboard/landlord/LandlordData";
import RentChangeModal from "@/components/dashboard/RentChangeModal";

export default function LandlordPropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<string>(properties[0].id);
  const [activeTab, setActiveTab] = useState("overview");
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [propertyRent, setPropertyRent] = useState<Record<string, number>>(
    Object.fromEntries(properties.map((p) => [p.id, p.rent]))
  );
  const p = properties.find((prop) => prop.id === selectedProperty) || properties[0];
  const currentRent = propertyRent[p.id] ?? p.rent;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/landlord" className="hover:text-[#C28A78] transition-colors">Landlord Portal</Link>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-s-line text-xs"></i>
            </div>
            <span className="text-[#3A3F3A] font-medium">Properties</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Properties</h1>
              <p className="text-sm text-[#687068] mt-1">View property information and details</p>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#3A3F3A]">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-building-4-line text-[#94A3B8] text-sm"></i>
                  </div>
                  {p.name}
                </span>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Property Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {properties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => setSelectedProperty(prop.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedProperty === prop.id ? "bg-[#C28A78] text-white" : "bg-white border border-[#E2E8F0] text-[#3A3F3A] hover:bg-[#F1F5F9]"
              }`}
            >
              <img src={prop.image} alt={prop.name} className="w-6 h-6 rounded object-cover" />
              {prop.name}
            </button>
          ))}
        </div>

        {/* Property Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative h-56 sm:h-72 rounded-xl overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 flex-wrap">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-xs text-white font-medium">{p.bedrooms} Beds</span>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-xs text-white font-medium">{p.bathrooms} Baths</span>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-xs text-white font-medium">{p.type}</span>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-xs text-white font-medium">EPC {p.epc}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#687068] uppercase tracking-wide font-medium">Monthly Rent</p>
                <button
                  onClick={() => setRentModalOpen(true)}
                  className="text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Change Rent
                </button>
              </div>
              <p className="text-3xl font-bold text-[#3A3F3A] mt-1">£{currentRent.toLocaleString()}</p>
              <p className="text-xs text-[#94A3B8] mt-1">per calendar month</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <p className="text-xs text-[#687068] uppercase tracking-wide font-medium">Deposit</p>
              <p className="text-3xl font-bold text-[#3A3F3A] mt-1">£{p.deposit.toLocaleString()}</p>
              <p className="text-xs text-[#94A3B8] mt-1">held in DPS</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <p className="text-xs text-[#687068] uppercase tracking-wide font-medium">Current Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">{p.status}</span>
                <span className="text-xs text-[#687068]">Tenant: {p.tenant}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center border-b border-[#E2E8F0] overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: "ri-file-list-line" },
              { id: "tenant", label: "Tenant", icon: "ri-user-3-line" },
              { id: "financial", label: "Financial", icon: "ri-money-pound-circle-line" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${tab.icon} text-sm`}></i>
                </div>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">Full Address</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{p.address}, {p.city}, {p.postcode}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">Property Type</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{p.type}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">Bedrooms</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{p.bedrooms}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">Bathrooms</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{p.bathrooms}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">EPC Rating</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">Band {p.epc}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">Council Tax Band</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">B</p>
                </div>
              </div>
            )}
            {activeTab === "tenant" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {p.tenant.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#3A3F3A]">{p.tenant}</h3>
                    <p className="text-sm text-[#687068]">Current tenant</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Email</p>
                    <p className="text-sm font-medium text-[#3A3F3A]">{p.tenantEmail}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Phone</p>
                    <p className="text-sm font-medium text-[#3A3F3A]">{p.tenantPhone}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Move-in Date</p>
                    <p className="text-sm font-medium text-[#3A3F3A]">{p.tenantMoveIn}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Tenancy End</p>
                    <p className="text-sm font-medium text-[#3A3F3A]">{p.tenantEnd}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Tenancy Type</p>
                    <p className="text-sm font-medium text-[#3A3F3A]">Assured Shorthold</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Deposit Scheme</p>
                    <p className="text-sm font-medium text-[#3A3F3A]">DPS</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "financial" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Monthly Rent</p>
                    <p className="text-xl font-bold text-[#3A3F3A]">£{currentRent.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Annual Rent</p>
                    <p className="text-xl font-bold text-[#3A3F3A]">£{(currentRent * 12).toLocaleString()}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <p className="text-xs text-[#94A3B8] mb-1">Deposit</p>
                    <p className="text-xl font-bold text-[#3A3F3A]">£{p.deposit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">Payment Status</p>
                  <p className="text-sm font-medium text-[#10B981]">Rent received on time for last 6 months</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {rentModalOpen && (
        <RentChangeModal
          propertyId={p.id}
          propertyName={p.name}
          currentRent={currentRent}
          tenantName={p.tenant}
          onClose={() => setRentModalOpen(false)}
          onUpdated={(newRent) => {
            setPropertyRent((prev) => ({ ...prev, [p.id]: newRent }));
          }}
        />
      )}
    </DashboardShell>
  );
}