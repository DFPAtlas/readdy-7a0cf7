export interface SettingsCategory {
  id: string
  label: string
  icon: string
  description: string
  level: 'personal' | 'agency' | 'platform'
  requiresAdmin: boolean
  href?: string
  attention?: boolean
  attentionLabel?: string
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'my-account',
    label: 'My Account',
    icon: 'ri-user-line',
    description: 'Your profile, password, security, notifications, and session settings',
    level: 'personal',
    requiresAdmin: false,
  },
  {
    id: 'agency-profile',
    label: 'Agency Profile',
    icon: 'ri-building-line',
    description: 'Agency name, business details, contact information, and operational region',
    level: 'agency',
    requiresAdmin: true,
  },
  {
    id: 'team',
    label: 'Team & Permissions',
    icon: 'ri-group-line',
    description: 'Invite team members, manage roles, and set data access scopes',
    level: 'agency',
    requiresAdmin: true,
    attention: false,
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: 'ri-brush-line',
    description: 'Portal logo, colours, custom domain, and white-label settings',
    level: 'agency',
    requiresAdmin: true,
  },
  {
    id: 'portals',
    label: 'Portals',
    icon: 'ri-macbook-line',
    description: 'Configure landlord, tenant, and contractor portal access and settings',
    level: 'agency',
    requiresAdmin: true,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'ri-notification-3-line',
    description: 'Email, push, and in-app notification preferences grouped by business area',
    level: 'personal',
    requiresAdmin: false,
  },
  {
    id: 'billing',
    label: 'Subscription & Billing',
    icon: 'ri-bill-line',
    description: 'View your plan, manage payment methods, and download invoices',
    level: 'agency',
    requiresAdmin: true,
    href: '/dashboard/billing',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'ri-puzzle-2-line',
    description: 'Connect accounting, banking, workspace, automation, and communication tools',
    level: 'agency',
    requiresAdmin: true,
    href: '/dashboard/integrations',
  },
  {
    id: 'data',
    label: 'Data & Imports',
    icon: 'ri-database-2-line',
    description: 'Import properties, tenants, and documents. Manage export and data retention',
    level: 'agency',
    requiresAdmin: true,
    href: '/dashboard/import',
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'ri-shield-keyhole-line',
    description: 'Password policy, two-factor authentication, session management, and audit log',
    level: 'agency',
    requiresAdmin: true,
  },
  {
    id: 'api',
    label: 'API & Webhooks',
    icon: 'ri-code-s-slash-line',
    description: 'Generate API keys, configure webhook endpoints, and monitor API usage',
    level: 'agency',
    requiresAdmin: true,
    href: '/dashboard/api',
  },
  {
    id: 'audit',
    label: 'Audit & Activity',
    icon: 'ri-history-line',
    description: 'View account activity, settings changes, and security events',
    level: 'agency',
    requiresAdmin: true,
  },
]

export const SUBSCRIPTION_STATUSES: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  trialing: { label: 'Trial Active', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: 'ri-timer-line' },
  active: { label: 'Active', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: 'ri-shield-check-line' },
  past_due: { label: 'Payment Overdue', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', icon: 'ri-error-warning-line' },
  cancelled: { label: 'Cancelled', color: 'text-[#94A3B8]', bg: 'bg-[#94A3B8]/10', icon: 'ri-close-circle-line' },
  expired: { label: 'Trial Expired', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', icon: 'ri-timer-flash-line' },
  restricted: { label: 'Restricted', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', icon: 'ri-lock-line' },
  enterprise: { label: 'Enterprise Managed', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', icon: 'ri-building-2-line' },
  demo: { label: 'Demo', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', icon: 'ri-computer-line' },
}

export function getSubscriptionStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown'
  return SUBSCRIPTION_STATUSES[status]?.label || status
}

export function getSubscriptionStatusConfig(status: string | null | undefined) {
  if (!status) return SUBSCRIPTION_STATUSES.demo
  return SUBSCRIPTION_STATUSES[status] || SUBSCRIPTION_STATUSES.demo
}