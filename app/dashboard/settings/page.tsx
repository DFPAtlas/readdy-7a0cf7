"use client"

import { useState, useEffect, useRef } from "react"
import DashboardShell from "@/components/DashboardShell"
import BrandingTab from "./BrandingTab"
import { SETTINGS_CATEGORIES } from "@/lib/settingsSystem"
import Link from "next/link"

type SettingsView = "cards" | string

export default function SettingsPage() {
  const [view, setView] = useState<SettingsView>("cards")
  const [search, setSearch] = useState("")
  const [personalOpen, setPersonalOpen] = useState(true)
  const [agencyOpen, setAgencyOpen] = useState(true)
  const [saveToast, setSaveToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setSaveToast(null), 3000);
  }

  const personalCategories = SETTINGS_CATEGORIES.filter((c) => c.level === "personal")
  const agencyCategories = SETTINGS_CATEGORIES.filter((c) => c.level === "agency")

  const filteredPersonal = search
    ? personalCategories.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
    : personalCategories

  const filteredAgency = search
    ? agencyCategories.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
    : agencyCategories

  if (view === "my-account") {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("cards")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">My Account</h1>
              <p className="text-sm text-[#687068] mt-1">Manage your personal profile, security and preferences</p>
            </div>
          </div>

          {["profile", "password", "notifications", "sessions"].map((section) => (
            <div key={section} className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-4">
              {section === "profile" && (
                <>
                  <h2 className="font-semibold text-[#3A3F3A]">Profile Information</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#C28A78] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      A
                    </div>
                    <div>
                      <button className="text-sm font-medium text-[#C28A78] hover:text-[#143828] transition-colors">
                        Change photo
                      </button>
                      <p className="text-xs text-[#94A3B8] mt-0.5">JPG, PNG. Max 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">First name</label>
                      <input
                        type="text"
                        defaultValue="Alex"
                        className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Last name</label>
                      <input
                        type="text"
                        defaultValue="Smith"
                        className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email</label>
                      <input
                        type="email"
                        defaultValue="alex.smith@lethub.co.uk"
                        className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Phone</label>
                      <input
                        type="tel"
                        defaultValue="+44 7700 900123"
                        className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-[#D5D9D5]">
                    <button
                      onClick={() => showToast("Profile saved")}
                      className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg whitespace-nowrap transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {section === "password" && (
                <>
                  <h2 className="font-semibold text-[#3A3F3A]">Password & Security</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Current password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">New password</label>
                      <input
                        type="password"
                        placeholder="Min 8 characters"
                        className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Confirm new password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-[#D5D9D5]">
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">Two-factor authentication</p>
                      <p className="text-xs text-[#687068] mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <button className="text-sm font-medium text-[#C28A78] hover:text-[#143828] transition-colors">
                      Enable
                    </button>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-[#D5D9D5]">
                    <button
                      onClick={() => showToast("Password updated")}
                      className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg whitespace-nowrap transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </>
              )}

              {section === "notifications" && (
                <>
                  <h2 className="font-semibold text-[#3A3F3A]">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { label: "New maintenance requests", desc: "Get notified when a tenant reports an issue", email: true, push: true },
                      { label: "Rent payments", desc: "Get notified when rent is paid or overdue", email: true, push: false },
                      { label: "Compliance expiry", desc: "Get notified before certificates expire", email: true, push: true },
                      { label: "New messages", desc: "Get notified when you receive a new message", email: true, push: true },
                      { label: "Property viewings", desc: "Get notified about scheduled viewings", email: false, push: true },
                      { label: "Marketing updates", desc: "Receive product updates and tips", email: false, push: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#D5D9D5] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{item.label}</p>
                          <p className="text-xs text-[#687068] mt-0.5">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-[#687068]">
                            <input type="checkbox" defaultChecked={item.email} className="w-4 h-4 rounded border-[#D5D9D5] text-[#C28A78] focus:ring-[#C28A78]" />
                            Email
                          </label>
                          <label className="flex items-center gap-2 text-sm text-[#687068]">
                            <input type="checkbox" defaultChecked={item.push} className="w-4 h-4 rounded border-[#D5D9D5] text-[#C28A78] focus:ring-[#C28A78]" />
                            Push
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {section === "sessions" && (
                <>
                  <h2 className="font-semibold text-[#3A3F3A]">Active Sessions</h2>
                  <div className="space-y-3">
                    {[
                      { device: "Chrome on Windows", location: "London, UK", ip: "203.0.113.45", current: true },
                      { device: "Safari on iPhone", location: "London, UK", ip: "203.0.113.46", current: false },
                      { device: "Chrome on MacBook", location: "Manchester, UK", ip: "198.51.100.22", current: false },
                    ].map((session) => (
                      <div key={session.device} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                            <i className="ri-computer-line text-[#C28A78] text-sm"></i>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#3A3F3A]">{session.device}</p>
                              {session.current && (
                                <span className="text-[10px] font-medium text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full">Current</span>
                              )}
                            </div>
                            <p className="text-xs text-[#687068]">{session.location} · {session.ip}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <button className="text-xs font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors">
                            Sign out
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-[#D5D9D5]">
                    <button className="text-sm font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors">
                      Sign out of all other sessions
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <i className="ri-check-line text-[#10B981]"></i>
            {saveToast}
          </div>
        )}
      </DashboardShell>
    )
  }

  if (view === "agency-profile") {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("cards")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Agency Profile</h1>
              <p className="text-sm text-[#687068] mt-1">Manage your agency details and business information</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-4">
            <h2 className="font-semibold text-[#3A3F3A]">Agency Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Agency name</label>
                <input
                  type="text"
                  defaultValue="Acme Property Management Ltd"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Company registration number</label>
                <input
                  type="text"
                  defaultValue="08512345"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">VAT number</label>
                <input
                  type="text"
                  defaultValue="GB123456789"
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Office address</label>
                <textarea
                  defaultValue="123 Property Lane, London, EC2A 4BX"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Time zone</label>
                  <div className="relative">
                    <button className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white">
                      Europe/London
                      <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Currency</label>
                  <div className="relative">
                    <button className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] bg-white">
                      GBP (£)
                      <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-[#D5D9D5]">
              <button
                onClick={() => showToast("Agency profile saved")}
                className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg whitespace-nowrap transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <i className="ri-check-line text-[#10B981]"></i>
            {saveToast}
          </div>
        )}
      </DashboardShell>
    )
  }

  if (view === "team") {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("cards")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Team & Permissions</h1>
              <p className="text-sm text-[#687068] mt-1">Invite team members and manage access levels</p>
            </div>
            <button className="flex items-center gap-2 bg-[#C28A78] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
              <i className="ri-user-add-line text-sm"></i>
              Invite Member
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">User</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Role</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Office scope</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Status</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Last active</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {[
                    { name: "David Chen", email: "david.c@lethub.com", role: "Administrator", office: "All offices", status: "Active", lastActive: "Today" },
                    { name: "Alex Smith", email: "alex.s@lethub.com", role: "Agent", office: "London", status: "Active", lastActive: "Today" },
                    { name: "Lisa Patel", email: "lisa.p@lethub.com", role: "Agent", office: "Manchester", status: "Active", lastActive: "Yesterday" },
                    { name: "Tom Harris", email: "tom.h@lethub.com", role: "Viewer", office: "London", status: "Invited", lastActive: "—" },
                  ].map((member) => (
                    <tr key={member.email} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#C28A78] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{member.name}</p>
                            <p className="text-xs text-[#687068]">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[#3A3F3A]">{member.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[#687068]">{member.office}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${member.status === "Active" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-[#687068]">{member.lastActive}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="text-xs text-[#C28A78] font-medium hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <i className="ri-check-line text-[#10B981]"></i>
            {saveToast}
          </div>
        )}
      </DashboardShell>
    )
  }

  if (view === "security") {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("cards")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Security</h1>
              <p className="text-sm text-[#687068] mt-1">Password policy, authentication, and session management</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-6">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">Two-factor authentication</p>
                <p className="text-xs text-[#687068] mt-0.5">Require a verification code in addition to your password</p>
              </div>
              <button className="text-sm font-medium text-[#C28A78] hover:text-[#143828] transition-colors">Enable for agency</button>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-[#D5D9D5]">
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">Password policy</p>
                <p className="text-xs text-[#687068] mt-0.5">Minimum 8 characters. Expires every 90 days.</p>
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">Enforced</span>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-[#D5D9D5]">
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">Session timeout</p>
                <p className="text-xs text-[#687068] mt-0.5">Automatically sign out after inactivity</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#687068]">4 hours</span>
                <button className="text-xs text-[#C28A78] font-medium hover:underline">Change</button>
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-[#D5D9D5]">
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">Audit log</p>
                <p className="text-xs text-[#687068] mt-0.5">View all security-related activity and settings changes</p>
              </div>
              <button className="text-xs text-[#C28A78] font-medium hover:underline">View log</button>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (view === "notifications") {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("cards")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Notification Preferences</h1>
              <p className="text-sm text-[#687068] mt-1">Choose how you receive alerts grouped by business area</p>
            </div>
          </div>

          {[
            {
              group: "Properties",
              items: [
                { label: "New property added", email: true, push: true },
                { label: "Property status changes", email: true, push: false },
              ],
            },
            {
              group: "Rent & Arrears",
              items: [
                { label: "Rent payment received", email: true, push: true },
                { label: "Rent overdue", email: true, push: true },
                { label: "Arrears case created", email: true, push: false },
              ],
            },
            {
              group: "Compliance",
              items: [
                { label: "Certificate expiring", email: true, push: true },
                { label: "Compliance alert", email: true, push: true },
              ],
            },
            {
              group: "Maintenance",
              items: [
                { label: "New maintenance request", email: true, push: true },
                { label: "Job completed", email: false, push: true },
              ],
            },
            {
              group: "Documents & Signatures",
              items: [
                { label: "Document awaiting signature", email: true, push: false },
                { label: "Signature completed", email: false, push: true },
              ],
            },
            {
              group: "Portal Activity",
              items: [
                { label: "Portal invitation accepted", email: true, push: false },
                { label: "Portal user login", email: false, push: false },
              ],
            },
          ].map((group) => (
            <div key={group.group} className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-3">
              <h2 className="font-semibold text-[#3A3F3A]">{group.group}</h2>
              {group.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <p className="text-sm text-[#3A3F3A]">{item.label}</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-[#687068]">
                      <input type="checkbox" defaultChecked={item.email} className="w-4 h-4 rounded border-[#D5D9D5] text-[#C28A78] focus:ring-[#C28A78]" />
                      Email
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#687068]">
                      <input type="checkbox" defaultChecked={item.push} className="w-4 h-4 rounded border-[#D5D9D5] text-[#C28A78] focus:ring-[#C28A78]" />
                      Push
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <i className="ri-check-line text-[#10B981]"></i>
            {saveToast}
          </div>
        )}
      </DashboardShell>
    )
  }

  if (view === "branding") {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("cards")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Branding</h1>
              <p className="text-sm text-[#687068] mt-1">Customise portal appearance for landlords and tenants</p>
            </div>
          </div>
          <BrandingTab />
        </div>
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <i className="ri-check-line text-[#10B981]"></i>
            {saveToast}
          </div>
        )}
      </DashboardShell>
    )
  }

  if (view === "audit") {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("cards")}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Audit & Activity</h1>
              <p className="text-sm text-[#687068] mt-1">View recent account activity and settings changes</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">User</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Action</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {[
                    { date: "Today, 10:23", user: "Alex Smith", action: "Updated agency profile", detail: "Changed office address" },
                    { date: "Today, 09:15", user: "David Chen", action: "Invited team member", detail: "tom.h@lethub.com as Viewer" },
                    { date: "Yesterday, 16:42", user: "Alex Smith", action: "Changed notification settings", detail: "Disabled marketing emails" },
                    { date: "Yesterday, 14:05", user: "Lisa Patel", action: "Updated branding", detail: "Changed primary colour" },
                    { date: "22 Jul 2026, 11:30", user: "David Chen", action: "Created API key", detail: "Production Web App" },
                    { date: "21 Jul 2026, 09:00", user: "Alex Smith", action: "Updated password", detail: "Password changed successfully" },
                  ].map((entry) => (
                    <tr key={entry.date + entry.action} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-3.5 text-xs text-[#687068]">{entry.date}</td>
                      <td className="px-5 py-3.5 text-sm text-[#3A3F3A]">{entry.user}</td>
                      <td className="px-5 py-3.5 text-sm text-[#3A3F3A]">{entry.action}</td>
                      <td className="px-5 py-3.5 text-xs text-[#687068]">{entry.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">Settings</h1>
          <p className="text-sm text-[#687068] mt-1">Manage your account, agency, and platform preferences</p>
        </div>

        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#D5D9D5] rounded-xl text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
          />
        </div>

        <div className="space-y-6">
          <div>
            <button
              onClick={() => setPersonalOpen(!personalOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-[#687068] mb-3 hover:text-[#3A3F3A] transition-colors"
            >
              <i className={`${personalOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} text-xs`}></i>
              My Account
            </button>
            {personalOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPersonal.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} onClick={() => setView(cat.id)} />
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setAgencyOpen(!agencyOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-[#687068] mb-3 hover:text-[#3A3F3A] transition-colors"
            >
              <i className={`${agencyOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} text-xs`}></i>
              Agency Settings
            </button>
            {agencyOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAgency.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} onClick={() => {
                    if (cat.href) {
                      window.location.href = cat.href
                    } else {
                      setView(cat.id)
                    }
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {search && filteredPersonal.length === 0 && filteredAgency.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-search-line text-[#94A3B8] text-xl"></i>
            </div>
            <p className="text-sm text-[#687068]">No settings match your search</p>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

function CategoryCard({ category, onClick }: { category: typeof SETTINGS_CATEGORIES[number]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-[#D5D9D5] p-5 text-left hover:border-[#C28A78] hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#C28A78] transition-colors">
          <i className={`${category.icon} text-[#C28A78] text-lg group-hover:text-white transition-colors`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#3A3F3A]">{category.label}</h3>
            {category.attention && (
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0"></span>
            )}
          </div>
          <p className="text-xs text-[#687068] mt-1">{category.description}</p>
          {category.attention && category.attentionLabel && (
            <p className="text-xs text-[#F59E0B] font-medium mt-1.5">{category.attentionLabel}</p>
          )}
          {category.requiresAdmin && (
            <span className="inline-block text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded mt-1.5">
              Admin only
            </span>
          )}
        </div>
        <i className="ri-arrow-right-s-line text-[#94A3B8] group-hover:text-[#C28A78] transition-colors"></i>
      </div>
    </button>
  )
}