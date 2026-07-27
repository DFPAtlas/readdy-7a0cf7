"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { propertyManager, tenancyInfo } from "../TenantData";

const categories = [
  { value: "general", label: "General Enquiry" },
  { value: "rent", label: "Rent" },
  { value: "maintenance", label: "Repair / Maintenance" },
  { value: "inspection", label: "Inspection" },
  { value: "document", label: "Document" },
  { value: "other", label: "Other" },
];

export default function TenantContactPage() {
  const [form, setForm] = useState({ subject: "", message: "", category: "general" });
  const [submitted, setSubmitted] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = categories.find((c) => c.value === form.category)?.label || "General Enquiry";

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ subject: "", message: "", category: "general" });
    }, 3000);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Contact Property Manager</h1>
            <p className="text-sm text-[#687068] mt-1">Get in touch with your managing agent</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center gap-4 p-5">
            <img src={propertyManager.avatar} alt={propertyManager.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-[#3A3F3A]">{propertyManager.name}</p>
              <p className="text-sm text-[#687068]">{propertyManager.role} at {propertyManager.office}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{propertyManager.officeHours}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 pb-5">
            <a href={`mailto:${propertyManager.email}`} className="flex items-center gap-3 p-3 rounded-lg border border-[#D5D9D5] hover:bg-[#F8FAFC] transition-colors">
              <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-mail-line text-[#3B82F6] text-lg"></i>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3A3F3A]">Email</p>
                <p className="text-xs text-[#687068] truncate">{propertyManager.email}</p>
              </div>
            </a>
            <a href={`tel:${propertyManager.phone}`} className="flex items-center gap-3 p-3 rounded-lg border border-[#D5D9D5] hover:bg-[#F8FAFC] transition-colors">
              <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-phone-line text-[#10B981] text-lg"></i>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3A3F3A]">Phone</p>
                <p className="text-xs text-[#687068] truncate">{propertyManager.phone}</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D5D9D5]">
            <h2 className="font-semibold text-[#3A3F3A]">Send a Message</h2>
          </div>
          <div className="p-5 space-y-4">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-line text-[#10B981] text-xl"></i>
                </div>
                <p className="text-sm font-medium text-[#3A3F3A]">Message sent</p>
                <p className="text-xs text-[#687068] mt-1">Your property manager will respond shortly.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div ref={categoryRef} className="relative">
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Category</label>
                    <button
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] hover:border-[#C28A78] transition-colors cursor-pointer"
                    >
                      <span>{selectedLabel}</span>
                      <div className="w-4 h-4 flex items-center justify-center">{categoryOpen ? <i className="ri-arrow-up-s-line text-[#94A3B8]"></i> : <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>}</div>
                    </button>
                    {categoryOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 overflow-hidden">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() => { setForm((prev) => ({ ...prev, category: cat.value })); setCategoryOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[#FBF9F4] transition-colors ${form.category === cat.value ? "bg-[#C28A78]/5 text-[#C28A78] font-medium" : "text-[#3A3F3A]"}`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Property</label>
                    <div className="px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-[#FBF9F4] text-sm text-[#687068]">
                      {tenancyInfo.property}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="What is this about?"
                    className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your message here..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none bg-white"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1 text-right">{form.message.length}/500</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors whitespace-nowrap"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => setForm({ subject: "", message: "", category: "general" })}
                    className="px-5 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#FEF2F2] rounded-xl border border-[#FECACA] p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-alarm-warning-line text-[#EF4444] text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#991B1B]">Emergency Repairs</h3>
              <p className="text-sm text-[#3A3F3A] mt-1">For emergencies such as flooding, gas leaks, or complete loss of heating, do not use this form — call your property manager immediately.</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <a href={`tel:${propertyManager.phone}`} className="flex items-center gap-2 text-sm font-medium text-[#EF4444] hover:underline whitespace-nowrap">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-phone-line"></i></div>
                  {propertyManager.phone}
                </a>
                <a href="tel:08001234567" className="flex items-center gap-2 text-sm font-medium text-[#EF4444] hover:underline whitespace-nowrap">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-phone-fill"></i></div>
                  24hr Emergency: 0800 123 4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}