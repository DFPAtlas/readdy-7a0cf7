import { supabase } from "@/lib/supabaseClient"

export interface EnterpriseRole {
  id: string
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_template: boolean
  agency_id: string | null
  created_at: string
  updated_at: string
  permission_count?: number
}

export interface EnterprisePermission {
  id: string
  code: string
  name: string
  category: string
  description: string | null
  created_at: string
}

export interface RolePermissionAssignment {
  id: string
  role_id: string
  permission_id: string
  granted_at: string
  granted_by: string | null
}

export interface UserRoleAssignment {
  id: string
  profile_id: string
  role_id: string
  agency_id: string | null
  office_id: string | null
  granted_at: string
  granted_by: string | null
  expires_at: string | null
  is_active: boolean
  profile_name?: string
  role_name?: string
  role_slug?: string
}

export interface PermissionAuditEntry {
  id: string
  actor_profile_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: any
  new_values: any
  ip_address: string | null
  created_at: string
  actor_name?: string
}

export interface ProfileBrief {
  id: string
  full_name: string | null
  role: string
}

export const PERMISSION_CATEGORIES = [
  "Platform", "Organisation", "Region", "Office", "Properties",
  "Financials", "Compliance", "Maintenance", "Inspections",
  "Tenants", "Landlords", "Contractors", "Reports", "Documents",
  "Messages", "Notifications", "Audit", "Permissions", "Settings",
  "Import", "Integrations", "Billing", "Possession", "Marketplace",
  "CRM", "Open Banking", "Accounting"
]

export async function fetchRoles(): Promise<EnterpriseRole[]> {
  const { data } = await supabase.from("enterprise_roles").select("*, enterprise_role_permissions(count)").order("is_system", { ascending: false }).order("name")
  return (data || []).map((r: any) => ({
    ...r,
    permission_count: r.enterprise_role_permissions?.[0]?.count || 0
  }))
}

export async function fetchPermissions(): Promise<EnterprisePermission[]> {
  const { data } = await supabase.from("enterprise_permissions").select("*").order("category").order("name")
  return (data || []) as EnterprisePermission[]
}

export async function fetchRolePermissions(roleId: string): Promise<string[]> {
  const { data } = await supabase.from("enterprise_role_permissions").select("permission_id").eq("role_id", roleId)
  return (data || []).map((r: any) => r.permission_id)
}

export async function fetchUserRoles(profileId?: string): Promise<UserRoleAssignment[]> {
  let query = supabase.from("enterprise_user_roles").select("*, profiles:profile_id(full_name), enterprise_roles:role_id(name, slug)")
  if (profileId) query = query.eq("profile_id", profileId)
  const { data } = await query.order("granted_at", { ascending: false })
  return (data || []).map((r: any) => ({
    ...r,
    profile_name: r.profiles?.full_name || "Unknown",
    role_name: r.enterprise_roles?.name || "Unknown",
    role_slug: r.enterprise_roles?.slug || "unknown"
  }))
}

export async function fetchAuditLog(limit = 50): Promise<PermissionAuditEntry[]> {
  const { data } = await supabase.from("enterprise_permission_audit").select("*, profiles:actor_profile_id(full_name)").order("created_at", { ascending: false }).limit(limit)
  return (data || []).map((r: any) => ({
    ...r,
    actor_name: r.profiles?.full_name || "System"
  }))
}

export async function fetchProfiles(): Promise<ProfileBrief[]> {
  const { data } = await supabase.from("profiles").select("id, full_name, role").order("full_name")
  return (data || []) as ProfileBrief[]
}

export async function createRole(name: string, slug: string, description: string): Promise<string | null> {
  const { data, error } = await supabase.from("enterprise_roles").insert({
    name, slug, description, is_system: false, is_template: false
  }).select("id").single()
  if (error) return null
  await logAudit("role_created", "enterprise_roles", data.id, null, { name, slug, description })
  return data.id
}

export async function updateRole(roleId: string, updates: { name?: string; description?: string }): Promise<boolean> {
  const { data: old } = await supabase.from("enterprise_roles").select("name, description").eq("id", roleId).single()
  const { error } = await supabase.from("enterprise_roles").update(updates).eq("id", roleId)
  if (error) return false
  await logAudit("role_updated", "enterprise_roles", roleId, old || {}, updates)
  return true
}

export async function deleteRole(roleId: string): Promise<boolean> {
  const { data: old } = await supabase.from("enterprise_roles").select("name, slug").eq("id", roleId).single()
  const { error } = await supabase.from("enterprise_roles").delete().eq("id", roleId)
  if (error) return false
  await logAudit("role_deleted", "enterprise_roles", roleId, old || {}, null)
  return true
}

export async function setRolePermissions(roleId: string, permissionIds: string[]): Promise<boolean> {
  const { data: oldPerms } = await supabase.from("enterprise_role_permissions").select("permission_id").eq("role_id", roleId)
  await supabase.from("enterprise_role_permissions").delete().eq("role_id", roleId)
  if (permissionIds.length > 0) {
    const inserts = permissionIds.map(pid => ({ role_id: roleId, permission_id: pid }))
    const { error } = await supabase.from("enterprise_role_permissions").insert(inserts)
    if (error) return false
  }
  await logAudit("role_permissions_set", "enterprise_role_permissions", roleId, { previous: (oldPerms || []).map((p: any) => p.permission_id) }, { new: permissionIds })
  return true
}

export async function assignRoleToUser(profileId: string, roleId: string, agencyId?: string, officeId?: string, expiresAt?: string): Promise<boolean> {
  const { error } = await supabase.from("enterprise_user_roles").insert({
    profile_id: profileId, role_id: roleId, agency_id: agencyId || null,
    office_id: officeId || null, expires_at: expiresAt || null, is_active: true
  })
  if (error) return false
  await logAudit("user_role_assigned", "enterprise_user_roles", profileId, null, { role_id: roleId, agency_id: agencyId, office_id: officeId })
  return true
}

export async function revokeUserRole(assignmentId: string): Promise<boolean> {
  const { data: old } = await supabase.from("enterprise_user_roles").select("profile_id, role_id").eq("id", assignmentId).single()
  const { error } = await supabase.from("enterprise_user_roles").update({ is_active: false }).eq("id", assignmentId)
  if (error) return false
  await logAudit("user_role_revoked", "enterprise_user_roles", assignmentId, old || {}, { is_active: false })
  return true
}

export async function reactivateUserRole(assignmentId: string): Promise<boolean> {
  const { error } = await supabase.from("enterprise_user_roles").update({ is_active: true }).eq("id", assignmentId)
  if (error) return false
  await logAudit("user_role_reactivated", "enterprise_user_roles", assignmentId, {}, { is_active: true })
  return true
}

async function logAudit(action: string, entityType: string, entityId: string, oldValues: any, newValues: any) {
  await supabase.from("enterprise_permission_audit").insert({
    action, entity_type: entityType, entity_id: entityId,
    old_values: oldValues, new_values: newValues
  })
}