export interface DocumentStatus {
  key: string;
  label: string;
  meaning: string;
  color: string;
  bg: string;
  icon: string;
  dot: string;
  sortPriority: number;
  availableActions: string[];
}

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  { key: 'draft', label: 'Draft', meaning: 'Not yet sent or shared', color: 'text-[#64748B]', bg: 'bg-[#F1F5F9]', icon: 'ri-draft-line', dot: 'bg-[#64748B]', sortPriority: 1, availableActions: ['edit', 'send_for_signature', 'delete', 'archive'] },
  { key: 'ready', label: 'Ready', meaning: 'Prepared and awaiting action', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', icon: 'ri-file-check-line', dot: 'bg-[#3B82F6]', sortPriority: 2, availableActions: ['send_for_signature', 'share', 'download'] },
  { key: 'sent', label: 'Sent', meaning: 'Sent to recipients', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', icon: 'ri-send-plane-line', dot: 'bg-[#8B5CF6]', sortPriority: 3, availableActions: ['view', 'remind', 'cancel', 'download'] },
  { key: 'viewed', label: 'Viewed', meaning: 'Opened by recipient', color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', icon: 'ri-eye-line', dot: 'bg-[#14B8A6]', sortPriority: 4, availableActions: ['view', 'remind', 'download'] },
  { key: 'signature_required', label: 'Signature Required', meaning: 'Awaiting signature', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: 'ri-pen-nib-line', dot: 'bg-[#F59E0B]', sortPriority: 5, availableActions: ['sign', 'view', 'remind'] },
  { key: 'partially_signed', label: 'Partially Signed', meaning: 'Some parties have signed', color: 'text-[#D4A85C]', bg: 'bg-[#D4A85C]/10', icon: 'ri-pen-nib-line', dot: 'bg-[#D4A85C]', sortPriority: 6, availableActions: ['sign', 'view', 'remind', 'download'] },
  { key: 'signed', label: 'Signed', meaning: 'All signatures complete', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: 'ri-check-double-line', dot: 'bg-[#10B981]', sortPriority: 7, availableActions: ['download', 'view_audit', 'share'] },
  { key: 'expiring_soon', label: 'Expiring Soon', meaning: 'Approaching expiry or review date', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: 'ri-time-line', dot: 'bg-[#F59E0B]', sortPriority: 8, availableActions: ['renew', 'view', 'download'] },
  { key: 'expired', label: 'Expired', meaning: 'Past expiry or review date', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', icon: 'ri-error-warning-line', dot: 'bg-[#EF4444]', sortPriority: 9, availableActions: ['renew', 'replace', 'archive'] },
  { key: 'cancelled', label: 'Cancelled', meaning: 'Signature request cancelled', color: 'text-[#9CA3AF]', bg: 'bg-[#F3F4F6]', icon: 'ri-close-circle-line', dot: 'bg-[#9CA3AF]', sortPriority: 10, availableActions: ['view', 'archive'] },
  { key: 'under_review', label: 'Under Review', meaning: 'Awaiting approval', color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', icon: 'ri-search-eye-line', dot: 'bg-[#6366F1]', sortPriority: 11, availableActions: ['review', 'approve', 'reject'] },
  { key: 'rejected', label: 'Rejected', meaning: 'Returned for revision', color: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]', icon: 'ri-close-circle-line', dot: 'bg-[#DC2626]', sortPriority: 12, availableActions: ['re_upload', 'delete', 'archive'] },
  { key: 'upload_failed', label: 'Upload Failed', meaning: 'File could not be uploaded', color: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]', icon: 'ri-error-warning-line', dot: 'bg-[#DC2626]', sortPriority: 13, availableActions: ['retry', 'delete'] },
];

export function getDocumentStatusConfig(key: string): DocumentStatus {
  return DOCUMENT_STATUSES.find(s => s.key === key) || DOCUMENT_STATUSES[0];
}

export const DOCUMENT_CATEGORIES = [
  { key: 'property', label: 'Property', icon: 'ri-building-4-line' },
  { key: 'tenancy', label: 'Tenancy', icon: 'ri-file-list-3-line' },
  { key: 'landlord', label: 'Landlord', icon: 'ri-user-line' },
  { key: 'tenant', label: 'Tenant', icon: 'ri-user-4-line' },
  { key: 'compliance', label: 'Compliance', icon: 'ri-shield-check-line' },
  { key: 'inspection', label: 'Inspection', icon: 'ri-search-eye-line' },
  { key: 'maintenance', label: 'Maintenance', icon: 'ri-tools-line' },
  { key: 'contractor', label: 'Contractor', icon: 'ri-briefcase-line' },
  { key: 'financial', label: 'Financial', icon: 'ri-money-pound-circle-line' },
  { key: 'agency', label: 'Agency', icon: 'ri-building-line' },
];

export interface DocumentAction {
  id: string;
  documentName: string;
  documentType: string;
  relatedRecord: string;
  issue: string;
  responsiblePerson: string;
  deadline: string;
  priority: 'critical' | 'high' | 'medium';
  actionLabel: string;
}

export const PRIORITY_CONFIG = {
  critical: { color: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]', icon: 'ri-alert-line', label: 'Critical' },
  high: { color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]', icon: 'ri-error-warning-line', label: 'High' },
  medium: { color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]', icon: 'ri-information-line', label: 'Medium' },
};

export function getTypeStyle(type: string): string {
  const map: Record<string, string> = {
    'Tenancy Agreement': 'bg-[#3B82F6]/10 text-[#3B82F6]',
    'Inventory': 'bg-[#F59E0B]/10 text-[#F59E0B]',
    'Gas Safety': 'bg-[#10B981]/10 text-[#10B981]',
    'EICR': 'bg-[#10B981]/10 text-[#10B981]',
    'EPC': 'bg-[#10B981]/10 text-[#10B981]',
    'Legionella': 'bg-[#10B981]/10 text-[#10B981]',
    'Smoke Alarm': 'bg-[#10B981]/10 text-[#10B981]',
    'Insurance': 'bg-[#EF4444]/10 text-[#EF4444]',
    'Inspection Report': 'bg-[#14B8A6]/10 text-[#14B8A6]',
    'Invoice': 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    'Receipt': 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    'Deposit Certificate': 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    'Property Photo': 'bg-[#EC4899]/10 text-[#EC4899]',
    'Contractor Insurance': 'bg-[#F59E0B]/10 text-[#F59E0B]',
    'Contractor Certification': 'bg-[#F59E0B]/10 text-[#F59E0B]',
    'Completion Photo': 'bg-[#EC4899]/10 text-[#EC4899]',
    'Guide': 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    'Quote': 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    'Right to Rent': 'bg-[#10B981]/10 text-[#10B981]',
    'Maintenance Quote': 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    'Contractor Agreement': 'bg-[#F59E0B]/10 text-[#F59E0B]',
    'Compliance Document': 'bg-[#10B981]/10 text-[#10B981]',
    'Notice': 'bg-[#EF4444]/10 text-[#EF4444]',
    'Addendum': 'bg-[#64748B]/10 text-[#64748B]',
  };
  return map[type] || 'bg-[#F1F5F9] text-[#687068]';
}