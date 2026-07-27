"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { showRlsError } from "@/lib/rlsErrorHandler";
import { agencySteps, ownerSteps, agencyQuestions, ownerQuestions } from "./SetupData";

export default function SetupPage() {
  const [accountType, setAccountType] = useState<"agency" | "owner" | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const steps = accountType === "agency" ? agencySteps : ownerSteps;
  const questions = accountType === "agency" ? agencyQuestions : ownerQuestions;
  const currentStepData = steps[currentStep];
  const currentQuestions = questions[currentStepData.id];

  const [profileForm, setProfileForm] = useState({
    companyName: "",
    displayName: "",
    email: "",
    phone: "",
    staffCount: "",
    yearsTrading: "",
    propertyCount: "",
  });

  const [propertyList, setPropertyList] = useState<{ id: number; address: string; city: string; postcode: string; bedrooms: number }[]>([]);
  const [newProperty, setNewProperty] = useState({ address: "", city: "", postcode: "", bedrooms: 1 });
  const [tenantList, setTenantList] = useState<{ id: number; name: string; email: string; property: string }[]>([]);
  const [newTenant, setNewTenant] = useState({ name: "", email: "", property: "" });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectType = async (type: "agency" | "owner") => {
    setAccountType(type);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          account_type: type,
        }, { onConflict: "id" });
      }
    } catch (err: any) {
      showRlsError(err, "profiles");
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          account_type: accountType,
          setup_completed: true,
          full_name: profileForm.displayName || undefined,
        }, { onConflict: "id" });
      }
    } catch (err: any) {
      showRlsError(err, "profiles");
    }
    setSaving(false);
    setCompleted(true);
    showToast("Setup complete! Welcome to LetHub.");
  };

  const handleAddProperty = () => {
    if (!newProperty.address || !newProperty.city || !newProperty.postcode) return;
    if (accountType === "owner" && propertyList.length >= 5) {
      showToast("Self-managing owners can add up to 5 properties.");
      return;
    }
    setPropertyList((prev) => [...prev, { ...newProperty, id: Date.now(), bedrooms: newProperty.bedrooms }]);
    setNewProperty({ address: "", city: "", postcode: "", bedrooms: 1 });
    showToast("Property added!");
  };

  const handleRemoveProperty = (id: number) => {
    setPropertyList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddTenant = () => {
    if (!newTenant.name || !newTenant.email || !newTenant.property) return;
    setTenantList((prev) => [...prev, { ...newTenant, id: Date.now() }]);
    setNewTenant({ name: "", email: "", property: "" });
    showToast("Tenant added!");
  };

  const handleRemoveTenant = (id: number) => {
    setTenantList((prev) => prev.filter((t) => t.id !== id));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalSteps = steps.length;

  if (!accountType) {
    return (
      <DashboardShell>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#3A3F3A]">Welcome to LetHub</h1>
            <p className="text-sm text-[#687068] mt-2 max-w-lg mx-auto">
              Let&apos;s get you set up. First, tell us what kind of property manager you are so we can tailor your experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleSelectType("agency")}
              className="bg-white rounded-2xl border-2 border-[#E2E8F0] hover:border-[#C28A78] p-8 text-left transition-all hover:shadow-xl group cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#C28A78]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#C28A78] transition-colors">
                <i className="ri-building-4-line text-[#C28A78] text-2xl group-hover:text-white transition-colors"></i>
              </div>
              <h2 className="text-lg font-bold text-[#3A3F3A] mb-2">Estate Agency / Letting Agent</h2>
              <p className="text-sm text-[#687068] leading-relaxed mb-4">
                I am an estate agent managing properties for multiple landlords. I need to manage portfolios, landlords, tenants, and compliance across many properties.
              </p>
              <ul className="space-y-2 mb-6">
                {["Manage multiple landlords", "Bulk property import", "Full compliance suite", "Owner & tenant portals"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#475569]">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-check-line text-[#10B981] text-sm"></i>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-semibold text-[#C28A78] flex items-center gap-1 group-hover:gap-2 transition-all">
                Get Started
                <i className="ri-arrow-right-line text-sm"></i>
              </span>
            </button>

            <button
              onClick={() => handleSelectType("owner")}
              className="bg-white rounded-2xl border-2 border-[#E2E8F0] hover:border-[#10B981] p-8 text-left transition-all hover:shadow-xl group cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#10B981] transition-colors">
                <i className="ri-home-4-line text-[#10B981] text-2xl group-hover:text-white transition-colors"></i>
              </div>
              <h2 className="text-lg font-bold text-[#3A3F3A] mb-2">Self-Managing Property Owner</h2>
              <p className="text-sm text-[#687068] leading-relaxed mb-4">
                I am a property owner managing my own rental properties. I have 1 to 5 properties and want a simple way to manage tenants, documents, and compliance.
              </p>
              <ul className="space-y-2 mb-6">
                {["Simple property management", "Up to 5 properties", "Tenant portal setup", "Compliance document tracking"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#475569]">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-check-line text-[#10B981] text-sm"></i>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-semibold text-[#10B981] flex items-center gap-1 group-hover:gap-2 transition-all">
                Get Started
                <i className="ri-arrow-right-line text-sm"></i>
              </span>
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (completed) {
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-[#10B981]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-[#10B981] text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mb-2">Setup Complete!</h1>
          <p className="text-sm text-[#687068] mb-2">
            {accountType === "agency" ? "Your agency account" : "Your property owner account"} is now configured.
          </p>
          <p className="text-sm text-[#687068] mb-8">
            You can always update your settings from the dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#C28A78] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
          >
            Go to Dashboard
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">
              {accountType === "agency" ? "Agency Onboarding" : "Property Owner Onboarding"}
            </h1>
            <p className="text-sm text-[#687068] mt-1">Step {currentStep + 1} of {totalSteps}: {currentStepData.label}</p>
          </div>
          <button
            onClick={() => { setAccountType(null); setCurrentStep(0); }}
            className="text-sm text-[#687068] hover:text-[#3A3F3A] transition-colors flex items-center gap-1"
          >
            <i className="ri-arrow-left-line text-xs"></i>
            Change account type
          </button>
        </div>

        {/* Completion Progress */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#3A3F3A]">Setup progress</span>
            <span className="text-xs text-[#687068]">{currentStep + 1} of {totalSteps} stages</span>
          </div>
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#C28A78] rounded-full transition-all" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}></div>
          </div>
          <div className="mt-3 p-3 bg-[#FEF9F0] border border-[#F5E6C8] rounded-lg">
            <p className="text-xs text-[#8A6D3B]">
              <i className="ri-lightbulb-line mr-1"></i>
              <strong>Recommended next:</strong> {currentStepData.label} — {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            const isFuture = idx > currentStep;
            return (
              <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive ? "bg-[#C28A78] text-white" : isDone ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F1F5F9] text-[#94A3B8]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : isDone ? "bg-[#10B981] text-white" : "bg-[#E2E8F0] text-[#94A3B8]"
                    }`}
                  >
                    {isDone ? <i className="ri-check-line text-xs"></i> : idx + 1}
                  </div>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {idx < totalSteps - 1 && (
                  <div className={`w-4 h-px flex-shrink-0 ${idx < currentStep ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
          {/* Profile Step */}
          {(currentStepData.id === "profile") && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">{currentQuestions.label}</h2>
                <p className="text-sm text-[#687068] mt-1">Tell us a bit about {accountType === "agency" ? "your agency" : "yourself"}.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestions.fields.map((field) => (
                  <div key={field.name} className={field.name === "companyName" ? "sm:col-span-2" : ""}>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">
                      {field.label}
                      {field.required && <span className="text-[#EF4444] ml-0.5">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(profileForm as any)[field.name] || ""}
                      onChange={handleProfileChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Import Step (Agency only) */}
          {(currentStepData.id === "portfolio") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Portfolio Setup</h2>
                <p className="text-sm text-[#687068] mt-1">Import your existing property portfolio or add properties manually.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/import" className="block bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 hover:border-[#C28A78] hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-[#C28A78]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#C28A78] transition-colors">
                    <i className="ri-upload-cloud-line text-[#C28A78] text-xl group-hover:text-white transition-colors"></i>
                  </div>
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Bulk Import</h3>
                  <p className="text-xs text-[#687068] mb-4">Upload CSV or Excel files with your property data. Auto-maps fields and validates records.</p>
                  <span className="text-xs font-medium text-[#C28A78] flex items-center gap-1">
                    Open Import Tool
                    <i className="ri-arrow-right-line text-xs"></i>
                  </span>
                </Link>
                <Link href="/dashboard/portfolio" className="block bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 hover:border-[#C28A78] hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3B82F6] transition-colors">
                    <i className="ri-add-line text-[#3B82F6] text-xl group-hover:text-white transition-colors"></i>
                  </div>
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Add Manually</h3>
                  <p className="text-xs text-[#687068] mb-4">Add properties one by one with full details including address, bedrooms, and compliance info.</p>
                  <span className="text-xs font-medium text-[#C28A78] flex items-center gap-1">
                    Go to Portfolio
                    <i className="ri-arrow-right-line text-xs"></i>
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Landlords Step (Agency only) */}
          {(currentStepData.id === "landlords") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Add Landlords</h2>
                <p className="text-sm text-[#687068] mt-1">Add the property owners you manage on behalf of.</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
                <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-star-line text-[#3B82F6] text-2xl"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Landlord Management</h3>
                <p className="text-xs text-[#687068] mb-4 max-w-md mx-auto">
                  You can add landlords through the Landlord Portal once setup is complete. Each landlord gets their own dashboard to view properties, rent collection, and reports.
                </p>
                <Link
                  href="/dashboard/landlord"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Landlord Portal
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Properties Step (both flows) */}
          {(currentStepData.id === "properties" && accountType === "agency") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Configure Properties</h2>
                <p className="text-sm text-[#687068] mt-1">Once imported or added, manage your properties from the Portfolio page.</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
                <div className="w-16 h-16 bg-[#C28A78]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-home-4-line text-[#C28A78] text-2xl"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Property Management</h3>
                <p className="text-xs text-[#687068] mb-4 max-w-md mx-auto">
                  View and manage all your properties — track occupancy, rent, compliance, and maintenance all in one place.
                </p>
                <Link
                  href="/dashboard/portfolio"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Portfolio
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Properties Step (Owner flow - add manually) */}
          {(currentStepData.id === "properties" && accountType === "owner") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Add Your Properties</h2>
                <p className="text-sm text-[#687068] mt-1">Add up to 5 properties you own and manage.</p>
              </div>

              {propertyList.length > 0 && (
                <div className="space-y-3">
                  {propertyList.map((prop) => (
                    <div key={prop.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                          <i className="ri-home-4-line text-[#C28A78] text-sm"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{prop.address}</p>
                          <p className="text-xs text-[#687068]">{prop.city}, {prop.postcode} · {prop.bedrooms} bed{prop.bedrooms > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveProperty(prop.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] transition-colors">
                        <i className="ri-delete-bin-line text-[#EF4444] text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Add a Property</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#687068] block mb-1">Address</label>
                    <input
                      type="text"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty((p) => ({ ...p, address: e.target.value }))}
                      placeholder="e.g. 12 Rose Avenue"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#687068] block mb-1">City</label>
                    <input
                      type="text"
                      value={newProperty.city}
                      onChange={(e) => setNewProperty((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. London"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#687068] block mb-1">Postcode</label>
                    <input
                      type="text"
                      value={newProperty.postcode}
                      onChange={(e) => setNewProperty((p) => ({ ...p, postcode: e.target.value }))}
                      placeholder="e.g. E1 6AN"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#687068] block mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty((p) => ({ ...p, bedrooms: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddProperty}
                  className="bg-[#C28A78] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#143828] transition-colors flex items-center gap-2"
                >
                  <i className="ri-add-line text-sm"></i>
                  Add Property
                </button>
              </div>
            </div>
          )}

          {/* Tenants Step (Agency) */}
          {(currentStepData.id === "tenants" && accountType === "agency") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Add Tenants</h2>
                <p className="text-sm text-[#687068] mt-1">Manage tenant records across your portfolio.</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
                <div className="w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-3-line text-[#8B5CF6] text-2xl"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Tenant Management</h3>
                <p className="text-xs text-[#687068] mb-4 max-w-md mx-auto">
                  You can add and manage tenants through the Tenant Portal. Each tenant gets access to their own dashboard for rent payments, maintenance requests, and documents.
                </p>
                <Link
                  href="/dashboard/tenant"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Tenant Portal
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Tenants Step (Owner) */}
          {(currentStepData.id === "tenants" && accountType === "owner") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Add Your Tenants</h2>
                <p className="text-sm text-[#687068] mt-1">Add tenants for your properties.</p>
              </div>

              {tenantList.length > 0 && (
                <div className="space-y-3">
                  {tenantList.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                          <i className="ri-user-3-line text-[#8B5CF6] text-sm"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{tenant.name}</p>
                          <p className="text-xs text-[#687068]">{tenant.email} · {tenant.property}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveTenant(tenant.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] transition-colors">
                        <i className="ri-delete-bin-line text-[#EF4444] text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Add a Tenant</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#687068] block mb-1">Tenant Name</label>
                    <input
                      type="text"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant((t) => ({ ...t, name: e.target.value }))}
                      placeholder="e.g. John Smith"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#687068] block mb-1">Email</label>
                    <input
                      type="email"
                      value={newTenant.email}
                      onChange={(e) => setNewTenant((t) => ({ ...t, email: e.target.value }))}
                      placeholder="e.g. john@email.com"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#687068] block mb-1">Property</label>
                    <input
                      type="text"
                      value={newTenant.property}
                      onChange={(e) => setNewTenant((t) => ({ ...t, property: e.target.value }))}
                      placeholder="e.g. 12 Rose Avenue"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddTenant}
                  className="bg-[#C28A78] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#143828] transition-colors flex items-center gap-2"
                >
                  <i className="ri-add-line text-sm"></i>
                  Add Tenant
                </button>
              </div>
            </div>
          )}

          {/* Tenancies Step (Agency only) */}
          {(currentStepData.id === "tenancies") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Create Tenancies</h2>
                <p className="text-sm text-[#687068] mt-1">Link tenants to properties and set up tenancy agreements.</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
                <div className="w-16 h-16 bg-[#14B8A6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-file-text-line text-[#14B8A6] text-2xl"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Tenancy Agreements</h3>
                <p className="text-xs text-[#687068] mb-4 max-w-md mx-auto">
                  Create and manage tenancy agreements linking tenants to properties. Set rent amounts, deposit details, and tenancy dates.
                </p>
                <Link
                  href="/dashboard/tenant"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Tenant Portal
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Owner Portals Step (Agency only) */}
          {(currentStepData.id === "owner-portals") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Set Up Owner Portals</h2>
                <p className="text-sm text-[#687068] mt-1">Give landlords access to their own dashboards.</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
                <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-macbook-line text-[#3B82F6] text-2xl"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Landlord Dashboards</h3>
                <p className="text-xs text-[#687068] mb-4 max-w-md mx-auto">
                  Each landlord gets a secure portal to view their properties, rent collection, maintenance status, and compliance reports. Set up access through the Landlord Portal.
                </p>
                <Link
                  href="/dashboard/landlord"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Landlord Portal
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Tenant Portals Step (Agency) */}
          {(currentStepData.id === "tenant-portals" && accountType === "agency") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Set Up Tenant Portals</h2>
                <p className="text-sm text-[#687068] mt-1">Give tenants secure access to manage their tenancy.</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
                <div className="w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-smartphone-line text-[#8B5CF6] text-2xl"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Tenant Access</h3>
                <p className="text-xs text-[#687068] mb-4 max-w-md mx-auto">
                  Tenants can view their tenancy details, pay rent, submit maintenance requests, and access documents through their own secure portal.
                </p>
                <Link
                  href="/dashboard/tenant"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Tenant Portal
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Tenant Portals Step (Owner) */}
          {(currentStepData.id === "portals") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Set Up Tenant Portals</h2>
                <p className="text-sm text-[#687068] mt-1">Give your tenants secure access to manage their tenancy.</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
                <div className="w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-smartphone-line text-[#8B5CF6] text-2xl"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Tenant Access</h3>
                <p className="text-xs text-[#687068] mb-4 max-w-md mx-auto">
                  Your tenants can view tenancy details, pay rent, submit maintenance requests, and access documents through their secure portal.
                </p>
                <Link
                  href="/dashboard/tenant"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Tenant Portal
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Compliance Step (Agency) */}
          {(currentStepData.id === "compliance" && accountType === "agency") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Compliance Setup</h2>
                <p className="text-sm text-[#687068] mt-1">Configure compliance tracking for your portfolio.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "ri-fire-line", label: "Gas Safety", desc: "CP12 certificates", color: "bg-[#EF4444]" },
                  { icon: "ri-flashlight-line", label: "EICR", desc: "Electrical safety checks", color: "bg-[#F59E0B]" },
                  { icon: "ri-bar-chart-line", label: "EPC", desc: "Energy performance", color: "bg-[#3B82F6]" },
                  { icon: "ri-alarm-line", label: "Smoke Alarms", desc: "Fire safety compliance", color: "bg-[#10B981]" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15` }}>
                      <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                    </div>
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">{item.label}</h3>
                    <p className="text-xs text-[#687068] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 text-center">
                <p className="text-xs text-[#687068] mb-3">Track and manage all compliance certificates from one dashboard.</p>
                <Link
                  href="/dashboard/compliance"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Compliance
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Documents Step (Owner only) */}
          {(currentStepData.id === "documents") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Upload Compliance Documents</h2>
                <p className="text-sm text-[#687068] mt-1">Upload gas safety certificates, EPCs, EICRs, and other compliance documents.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "ri-fire-line", label: "Gas Safety (CP12)", desc: "Annual gas safety check", color: "bg-[#EF4444]" },
                  { icon: "ri-flashlight-line", label: "EICR", desc: "Electrical installation report", color: "bg-[#F59E0B]" },
                  { icon: "ri-bar-chart-line", label: "EPC", desc: "Energy Performance Certificate", color: "bg-[#3B82F6]" },
                  { icon: "ri-file-shield-line", label: "Deposit Certificate", desc: "Tenancy deposit protection", color: "bg-[#10B981]" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15` }}>
                      <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                    </div>
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">{item.label}</h3>
                    <p className="text-xs text-[#687068] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 text-center">
                <p className="text-xs text-[#687068] mb-3">Upload and manage all property documents from the Documents hub.</p>
                <Link
                  href="/dashboard/documents"
                  className="inline-flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors"
                >
                  Go to Documents
                  <i className="ri-arrow-right-line text-sm"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Review Step */}
          {(currentStepData.id === "review") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#3A3F3A]">Review Your Dashboard</h2>
                <p className="text-sm text-[#687068] mt-1">You&apos;re almost there! Here&apos;s what your dashboard gives you.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: "ri-building-4-line", label: "Portfolio Overview", desc: "See all properties at a glance", color: "bg-[#C28A78]" },
                  { icon: "ri-coins-line", label: "Rent Collection", desc: "Track rent payments and arrears", color: "bg-[#10B981]" },
                  { icon: "ri-tools-line", label: "Maintenance", desc: "Manage repairs and contractors", color: "bg-[#F59E0B]" },
                  { icon: "ri-shield-check-line", label: "Compliance", desc: "Stay on top of certificates", color: "bg-[#3B82F6]" },
                  { icon: "ri-clipboard-line", label: "Inspections", desc: "Schedule and review inspections", color: "bg-[#14B8A6]" },
                  { icon: "ri-folder-line", label: "Documents", desc: "All property documents in one place", color: "bg-[#8B5CF6]" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 text-center">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <i className={`${item.icon} text-white text-lg`}></i>
                    </div>
                    <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">{item.label}</h3>
                    <p className="text-xs text-[#687068]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E2E8F0] mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 0 ? "text-[#94A3B8] cursor-not-allowed" : "text-[#687068] hover:bg-[#F1F5F9]"
              }`}
            >
              <i className="ri-arrow-left-line text-sm"></i>
              Back
            </button>

            <span className="text-xs text-[#94A3B8]">{currentStep + 1} / {totalSteps}</span>

            <button
              onClick={handleNext}
              disabled={saving}
              className="flex items-center gap-2 bg-[#C28A78] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : currentStep === totalSteps - 1 ? (
                <>
                  Complete Setup
                  <i className="ri-check-line text-sm"></i>
                </>
              ) : (
                <>
                  Continue
                  <i className="ri-arrow-right-line text-sm"></i>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-[#10B981]"></i>
          {toast}
        </div>
      )}
    </DashboardShell>
  );
}