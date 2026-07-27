export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: ScopeGrant[];
  is_revoked: boolean;
  last_used_at: string | null;
  created_at: string;
  created_by: string;
}

export interface ScopeGrant {
  module: string;
  access: 'read' | 'write' | 'read_write';
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_hash: string | null;
  last_triggered_at: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  api_key_id: string | null;
  key_prefix: string | null;
  module: string;
  action: string;
  endpoint: string;
  method: string;
  status_code: number | null;
  response_ms: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const API_MODULES = [
  { key: 'properties', label: 'Properties', icon: 'ri-building-line', color: '#3B82F6', endpoints: ['GET /properties', 'GET /properties/:id', 'POST /properties', 'PUT /properties/:id'] },
  { key: 'tenants', label: 'Tenants', icon: 'ri-user-line', color: '#10B981', endpoints: ['GET /tenants', 'GET /tenants/:id', 'POST /tenants', 'PUT /tenants/:id'] },
  { key: 'owners', label: 'Owners', icon: 'ri-shield-user-line', color: '#F59E0B', endpoints: ['GET /owners', 'GET /owners/:id', 'POST /owners'] },
  { key: 'tenancies', label: 'Tenancies', icon: 'ri-file-list-3-line', color: '#8B5CF6', endpoints: ['GET /tenancies', 'GET /tenancies/:id', 'POST /tenancies', 'PUT /tenancies/:id'] },
  { key: 'compliance', label: 'Compliance', icon: 'ri-checkbox-circle-line', color: '#EF4444', endpoints: ['GET /compliance', 'GET /compliance/check', 'GET /compliance/alerts'] },
  { key: 'maintenance', label: 'Maintenance', icon: 'ri-tools-line', color: '#F97316', endpoints: ['GET /maintenance/jobs', 'GET /maintenance/jobs/:id', 'POST /maintenance/actions', 'PUT /maintenance/jobs/:id'] },
  { key: 'inspections', label: 'Inspections', icon: 'ri-search-eye-line', color: '#06B6D4', endpoints: ['GET /inspections', 'GET /inspections/:id', 'POST /inspections', 'PUT /inspections/:id'] },
  { key: 'documents', label: 'Documents', icon: 'ri-file-text-line', color: '#EC4899', endpoints: ['GET /documents', 'GET /documents/:id', 'GET /documents/download', 'POST /documents'] },
  { key: 'reports', label: 'Reports', icon: 'ri-bar-chart-line', color: '#6366F1', endpoints: ['GET /reports', 'POST /reports/generate', 'GET /reports/export'] },
];

export const WEBHOOK_EVENTS = [
  { key: 'property.created', label: 'Property Created', module: 'properties', color: '#3B82F6' },
  { key: 'property.updated', label: 'Property Updated', module: 'properties', color: '#3B82F6' },
  { key: 'tenant.created', label: 'Tenant Created', module: 'tenants', color: '#10B981' },
  { key: 'inspection.completed', label: 'Inspection Completed', module: 'inspections', color: '#06B6D4' },
  { key: 'compliance.alert.created', label: 'Compliance Alert Created', module: 'compliance', color: '#EF4444' },
  { key: 'maintenance.action.created', label: 'Maintenance Action Created', module: 'maintenance', color: '#F97316' },
  { key: 'tenancy.created', label: 'Tenancy Created', module: 'tenancies', color: '#8B5CF6' },
  { key: 'document.created', label: 'Document Created', module: 'documents', color: '#EC4899' },
  { key: 'report.generated', label: 'Report Generated', module: 'reports', color: '#6366F1' },
  { key: 'rent.payment.received', label: 'Rent Payment Received', module: 'properties', color: '#10B981' },
];

export const METHOD_COLORS: Record<string, string> = {
  GET: '#10B981',
  POST: '#3B82F6',
  PUT: '#F59E0B',
  DELETE: '#EF4444',
  PATCH: '#8B5CF6',
};