"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardShell from "@/components/DashboardShell"
import {
  fetchRoles, fetchPermissions, fetchRolePermissions, fetchUserRoles,
  fetchAuditLog, fetchProfiles, createRole, updateRole, deleteRole,
  setRolePermissions, assignRoleToUser, revokeUserRole, reactivateUserRole,
  PERMISSION_CATEGORIES,
  type EnterpriseRole, type EnterprisePermission, type UserRoleAssignment,
  type PermissionAuditEntry, type ProfileBrief,
} from "./EnterprisePermissionsData"

type Tab = "roles" | "users" | "audit" | "builder"

export default function EnterprisePermissionsPage() {
  const [tab, setTab] = useState<Tab>("roles")
  const [roles, setRoles] = useState<EnterpriseRole[]>([])
  const [permissions, setPermissions] = useState<EnterprisePermission[]>([])
  const [selectedRole, setSelectedRole] = useState<EnterpriseRole | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([])
  const [auditLog, setAuditLog] = useState<PermissionAuditEntry[]>([])
  const [profiles, setProfiles] = useState<ProfileBrief[]>([])
  const [loading, setLoading] = useState(true)

  const [showRoleModal, setShowRoleModal] = useState(false)
  const [roleForm, setRoleForm] = useState({ name: "", slug: "", description: "" })
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignProfileId, setAssignProfileId] = useState("")
  const [assignRoleId, setAssignRoleId] = useState("")
  const [assignAgencyId, setAssignAgencyId] = useState("")

  const [permSaveMsg, setPermSaveMsg] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    const [r, p, ur, al, pf] = await Promise.all([
      fetchRoles(), fetchPermissions(), fetchUserRoles(), fetchAuditLog(), fetchProfiles()
    ])
    setRoles(r)
    setPermissions(p)
    setUserRoles(ur)
    setAuditLog(al)
    setProfiles(pf)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function selectRole(role: EnterpriseRole) {
    setSelectedRole(role)
    setPermSaveMsg("")
    const ids = await fetchRolePermissions(role.id)
    setSelectedPerms(new Set(ids))
  }

  function togglePerm(permId: string) {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })
  }

  async function savePermissions() {
    if (!selectedRole) return
    const ok = await setRolePermissions(selectedRole.id, Array.from(selectedPerms))
    setPermSaveMsg(ok ? "Permissions saved" : "Save failed")
    if (ok) loadData()
    setTimeout(() => setPermSaveMsg(""), 2500)
  }

  function openCreateRole() {
    setEditingRoleId(null)
    setRoleForm({ name: "", slug: "", description: "" })
    setShowRoleModal(true)
  }

  function openEditRole(role: EnterpriseRole) {
    setEditingRoleId(role.id)
    setRoleForm({ name: role.name, slug: role.slug, description: role.description || "" })
    setShowRoleModal(true)
  }

  async function handleSaveRole() {
    if (editingRoleId) {
      await updateRole(editingRoleId, { name: roleForm.name, description: roleForm.description })
    } else {
      await createRole(roleForm.name, roleForm.slug, roleForm.description)
    }
    setShowRoleModal(false)
    loadData()
  }

  async function handleDeleteRole(roleId: string) {
    if (!confirm("Delete this role? This cannot be undone.")) return
    await deleteRole(roleId)
    if (selectedRole?.id === roleId) setSelectedRole(null)
    loadData()
  }

  async function handleAssign() {
    if (!assignProfileId || !assignRoleId) return
    await assignRoleToUser(assignProfileId, assignRoleId, assignAgencyId || undefined)
    setShowAssignModal(false)
    setAssignProfileId("")
    setAssignRoleId("")
    setAssignAgencyId("")
    loadData()
  }

  async function handleRevoke(id: string) {
    await revokeUserRole(id)
    loadData()
  }

  async function handleReactivate(id: string) {
    await reactivateUserRole(id)
    loadData()
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    )
  }

  const groupedPerms: Record<string, EnterprisePermission[]> = {}
  permissions.forEach(p => {
    if (!groupedPerms[p.category]) groupedPerms[p.category] = []
    groupedPerms[p.category].push(p)
  })

  const totalUsers = profiles.length
  const assignedUsers = new Set(userRoles.filter(u => u.is_active).map(u => u.profile_id)).size
  const totalAssignments = userRoles.filter(u => u.is_active).length

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Enterprise Permissions Engine</h1>
            <p className="text-sm text-[#687068] mt-1">Role-based access control — manage roles, permissions, user assignments, and audit trails</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#C28A78]/10 rounded-md flex items-center justify-center">
                <i className="ri-shield-user-line text-[#C28A78] text-xs"></i>
              </div>
              <span className="text-xs text-[#687068]">Roles</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{roles.length}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{roles.filter(r => r.is_template).length} templates</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#8B5CF6]/10 rounded-md flex items-center justify-center">
                <i className="ri-key-2-line text-[#8B5CF6] text-xs"></i>
              </div>
              <span className="text-xs text-[#687068]">Permissions</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{permissions.length}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{PERMISSION_CATEGORIES.length} categories</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#10B981]/10 rounded-md flex items-center justify-center">
                <i className="ri-user-settings-line text-[#10B981] text-xs"></i>
              </div>
              <span className="text-xs text-[#687068]">Users Assigned</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{assignedUsers}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">of {totalUsers} total · {totalAssignments} assignments</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1 w-fit">
          {([
            { key: "roles", label: "Roles", icon: "ri-shield-user-line" },
            { key: "users", label: "User Assignments", icon: "ri-user-settings-line" },
            { key: "builder", label: "Role Builder", icon: "ri-tools-line" },
            { key: "audit", label: "Audit Log", icon: "ri-file-list-3-line" },
          ] as { key: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key ? "bg-white text-[#C28A78] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className={`${t.icon} text-sm w-4 h-4 flex items-center justify-center`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Roles</h2>
                <button onClick={openCreateRole} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#C28A78] text-white hover:bg-[#143728] transition-colors">
                  <i className="ri-add-line text-sm"></i>
                </button>
              </div>
              <div className="divide-y divide-[#E2E8F0] max-h-[600px] overflow-y-auto">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => selectRole(role)}
                    className={`w-full text-left px-5 py-4 hover:bg-[#F8FAFC] transition-colors ${selectedRole?.id === role.id ? "bg-[#F1F5F9] border-l-4 border-l-[#C28A78]" : "border-l-4 border-l-transparent"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#3A3F3A] text-sm">{role.name}</span>
                      {role.is_system && (
                        <span className="text-[10px] bg-[#E2E8F0] text-[#687068] px-1.5 py-0.5 rounded-full font-medium">SYSTEM</span>
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{role.description || role.slug.replace(/_/g, " ")}</p>
                    <p className="text-xs text-[#687068] mt-1">{role.permission_count} permissions</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              {selectedRole ? (
                <>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                    <div>
                      <h2 className="font-semibold text-[#3A3F3A]">{selectedRole.name} — Permissions</h2>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{selectedRole.description || selectedRole.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {permSaveMsg && <span className={`text-xs ${permSaveMsg === "Permissions saved" ? "text-[#10B981]" : "text-[#EF4444]"}`}>{permSaveMsg}</span>}
                      {selectedRole.is_system && (
                        <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-2 py-1 rounded-full font-medium">READ ONLY</span>
                      )}
                      {!selectedRole.is_system && (
                        <>
                          <button onClick={() => openEditRole(selectedRole)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                            <i className="ri-pencil-line text-[#687068] text-sm"></i>
                          </button>
                          <button onClick={() => handleDeleteRole(selectedRole.id)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] hover:bg-[#FEF2F2] transition-colors">
                            <i className="ri-delete-bin-line text-[#EF4444] text-sm"></i>
                          </button>
                          <button onClick={savePermissions} className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors whitespace-nowrap">
                            Save
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto">
                    {PERMISSION_CATEGORIES.map(cat => {
                      const catPerms = groupedPerms[cat]
                      if (!catPerms || !catPerms.length) return null
                      const allSelected = catPerms.every(p => selectedPerms.has(p.id))
                      const someSelected = catPerms.some(p => selectedPerms.has(p.id))
                      return (
                        <div key={cat}>
                          <div className="flex items-center gap-3 mb-3">
                            <button
                              onClick={() => {
                                if (selectedRole.is_system) return
                                const newSet = new Set(selectedPerms)
                                catPerms.forEach(p => allSelected ? newSet.delete(p.id) : newSet.add(p.id))
                                setSelectedPerms(newSet)
                              }}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedRole.is_system ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${
                                allSelected ? "bg-[#C28A78] border-[#C28A78]" : someSelected ? "border-[#C28A78]" : "border-[#CBD5E1]"
                              }`}
                            >
                              {allSelected && <i className="ri-check-line text-white text-xs"></i>}
                              {someSelected && !allSelected && <i className="ri-subtract-line text-[#C28A78] text-xs"></i>}
                            </button>
                            <span className="text-sm font-semibold text-[#3A3F3A]">{cat}</span>
                            <span className="text-xs text-[#94A3B8]">({catPerms.length})</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-8">
                            {catPerms.map(perm => (
                              <button
                                key={perm.code}
                                onClick={() => { if (!selectedRole.is_system) togglePerm(perm.id) }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                  selectedRole.is_system ? "cursor-default" : "cursor-pointer hover:bg-[#F1F5F9]"
                                } ${
                                  selectedPerms.has(perm.id) ? "bg-[#F0FDF4]" : "bg-[#F8FAFC]"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  selectedRole.is_system ? "opacity-60" : ""
                                } ${
                                  selectedPerms.has(perm.id) ? "bg-[#10B981] border-[#10B981]" : "border-[#CBD5E1]"
                                }`}>
                                  {selectedPerms.has(perm.id) && <i className="ri-check-line text-white text-xs"></i>}
                                </div>
                                <div>
                                  <p className="text-sm text-[#3A3F3A]">{perm.name}</p>
                                  <p className="text-[10px] text-[#94A3B8]">{perm.code}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-24 text-[#94A3B8]">
                  <div className="text-center">
                    <i className="ri-shield-user-line text-4xl block mb-3"></i>
                    <p className="text-sm">Select a role to view its permissions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">User Role Assignments</h2>
              <button onClick={() => setShowAssignModal(true)} className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors whitespace-nowrap">
                <i className="ri-add-line text-sm mr-1"></i>
                Assign Role
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">User</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Agency</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Granted</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-[#687068]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userRoles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-sm text-[#94A3B8]">
                        <i className="ri-user-settings-line text-3xl block mb-2"></i>
                        No role assignments yet
                      </td>
                    </tr>
                  ) : (
                    userRoles.map(ur => (
                      <tr key={ur.id} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors ${!ur.is_active ? "opacity-50" : ""}`}>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-[#3A3F3A]">{ur.profile_name}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ur.role_slug === "super_admin" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                            ur.role_slug === "org_admin" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" :
                            "bg-[#3B82F6]/10 text-[#3B82F6]"
                          }`}>{ur.role_name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-[#687068] text-xs">{ur.agency_id ? ur.agency_id.slice(0, 8) + "..." : "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium ${ur.is_active ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                            {ur.is_active ? "Active" : "Revoked"}
                          </span>
                          {ur.expires_at && (
                            <span className="text-[10px] text-[#94A3B8] block">Expires {new Date(ur.expires_at).toLocaleDateString("en-GB")}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[#94A3B8] text-xs">{new Date(ur.granted_at).toLocaleDateString("en-GB")}</td>
                        <td className="px-5 py-3.5 text-right">
                          {ur.is_active ? (
                            <button onClick={() => handleRevoke(ur.id)} className="text-xs text-[#EF4444] hover:underline font-medium">Revoke</button>
                          ) : (
                            <button onClick={() => handleReactivate(ur.id)} className="text-xs text-[#10B981] hover:underline font-medium">Reactivate</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h2 className="font-semibold text-[#3A3F3A] mb-4">
                {editingRoleId ? "Edit Role" : "Create Custom Role"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#687068] mb-1.5">Role Name</label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={e => {
                      const v = e.target.value
                      setRoleForm({ ...roleForm, name: v, slug: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") })
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]"
                    placeholder="e.g., Compliance Officer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#687068] mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={roleForm.slug}
                    onChange={e => setRoleForm({ ...roleForm, slug: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#3A3F3A] font-mono focus:outline-none focus:border-[#C28A78]"
                    placeholder="compliance_officer"
                    disabled={!!editingRoleId}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#687068] mb-1.5">Description</label>
                  <textarea
                    value={roleForm.description}
                    onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78] resize-none"
                    rows={3}
                    placeholder="Describe this role..."
                  />
                </div>
                <button
                  onClick={handleSaveRole}
                  disabled={!roleForm.name || !roleForm.slug}
                  className="w-full px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {editingRoleId ? "Update Role" : "Create Role"}
                </button>
                {editingRoleId && (
                  <button onClick={() => { setShowRoleModal(false); setEditingRoleId(null); setSelectedRole(null) }} className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h2 className="font-semibold text-[#3A3F3A] mb-4">Permission Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSION_CATEGORIES.map(cat => (
                  <div key={cat} className="bg-[#F8FAFC] rounded-lg p-4">
                    <h3 className="text-sm font-medium text-[#3A3F3A] mb-2">{cat}</h3>
                    <div className="space-y-1">
                      {(groupedPerms[cat] || []).map(p => (
                        <p key={p.code} className="text-xs text-[#687068] flex items-start gap-2">
                          <i className="ri-checkbox-blank-circle-fill text-[4px] text-[#94A3B8] mt-1.5 flex-shrink-0"></i>
                          {p.name} <span className="text-[#CBD5E1]">({p.code})</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Permission Audit Log</h2>
              <span className="text-xs text-[#94A3B8]">{auditLog.length} entries</span>
            </div>
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] sticky top-0">
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Time</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Actor</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Action</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Entity</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-sm text-[#94A3B8]">
                        <i className="ri-file-list-3-line text-3xl block mb-2"></i>
                        No audit entries yet
                      </td>
                    </tr>
                  ) : (
                    auditLog.map(entry => (
                      <tr key={entry.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#3A3F3A]">{entry.actor_name}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            entry.action.includes("created") || entry.action.includes("assigned") ? "bg-[#10B981]/10 text-[#10B981]" :
                            entry.action.includes("deleted") || entry.action.includes("revoked") ? "bg-[#EF4444]/10 text-[#EF4444]" :
                            entry.action.includes("updated") ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                            "bg-[#E2E8F0] text-[#687068]"
                          }`}>
                            {entry.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#687068]">{entry.entity_type}</td>
                        <td className="px-5 py-3 text-xs text-[#94A3B8] max-w-[300px] truncate">
                          {entry.new_values ? JSON.stringify(entry.new_values).slice(0, 80) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showRoleModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowRoleModal(false)}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-[#3A3F3A] mb-4">
                  {editingRoleId ? "Edit Role" : "Create Custom Role"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Role Name</label>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={e => {
                        const v = e.target.value
                        setRoleForm({ ...roleForm, name: v, slug: v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") })
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C28A78]"
                      placeholder="e.g., Compliance Officer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={roleForm.slug}
                      onChange={e => setRoleForm({ ...roleForm, slug: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:border-[#C28A78]"
                      placeholder="compliance_officer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Description</label>
                    <textarea
                      value={roleForm.description}
                      onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:border-[#C28A78]"
                      rows={3}
                      placeholder="Describe this role..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowRoleModal(false)} className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                      Cancel
                    </button>
                    <button onClick={handleSaveRole} disabled={!roleForm.name || !roleForm.slug}
                      className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                      {editingRoleId ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showAssignModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAssignModal(false)}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-[#3A3F3A] mb-4">Assign Role to User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">User</label>
                    <select
                      value={assignProfileId}
                      onChange={e => setAssignProfileId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C28A78] pr-8"
                    >
                      <option value="">Select user...</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name || p.id.slice(0, 8)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Role</label>
                    <select
                      value={assignRoleId}
                      onChange={e => setAssignRoleId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C28A78] pr-8"
                    >
                      <option value="">Select role...</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#687068] mb-1.5">Agency (optional)</label>
                    <input
                      type="text"
                      value={assignAgencyId}
                      onChange={e => setAssignAgencyId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#C28A78]"
                      placeholder="Agency UUID"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                      Cancel
                    </button>
                    <button onClick={handleAssign} disabled={!assignProfileId || !assignRoleId}
                      className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                      Assign Role
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}