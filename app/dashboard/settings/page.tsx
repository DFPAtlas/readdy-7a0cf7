"use client"

import { useState, useEffect, useRef } from "react"
import DashboardShell from "@/components/DashboardShell"
import BrandingTab from "./BrandingTab"
import AccountProfileCard from "@/components/settings/AccountProfileCard"
import AgencyProfileCard from "@/components/settings/AgencyProfileCard"
import PasswordSection from "@/components/settings/PasswordSection"
import SessionsSection from "@/components/settings/SessionsSection"
import SecurityActivityLog from "@/components/settings/SecurityActivityLog"
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

          {["profile", "password", "notifications", "sessions", "activity"].map((section) => (
            <div key={section} className={section === "profile" || section === "activity" ? "space-y-4" : "bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-4"}>
              {section === "profile" && (
                <AccountProfileCard onToast={showToast} />
              )}

              {section === "password" && (
                <PasswordSection onToast={showToast} />
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
                <SessionsSection onToast={showToast} />
              )}

              {section === "activity" && (
                <SecurityActivityLog />
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
              <p className="text-sm text-[#687068] mt-1">Your agency details and workspace access</p>
            </div>
          </div>

          <AgencyProfileCard />
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
              <button
                onClick={() => setView("audit")}
                className="text-xs text-[#C28A78] font-medium hover:underline cursor-pointer"
              >
                View log
              </button>
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
              <p className="text-sm text-[#687068] mt-1">Real sign-ins, password changes and session actions on your account</p>
            </div>
          </div>

          <SecurityActivityLog />
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