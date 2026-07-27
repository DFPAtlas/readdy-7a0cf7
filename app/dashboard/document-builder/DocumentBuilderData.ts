import { supabase } from '@/lib/supabaseClient';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  document_type: string;
  content: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const DOCUMENT_TYPE_ICONS: Record<string, string> = {
  management_agreement: 'ri-file-text-line',
  tenancy_agreement: 'ri-file-list-3-line',
  inspection_notice: 'ri-search-eye-line',
  section_8_notice: 'ri-scales-3-line',
  deposit_letter: 'ri-safe-2-line',
  rent_review_letter: 'ri-money-pound-circle-line',
  contractor_work_order: 'ri-tools-line',
  owner_report_cover: 'ri-pie-chart-line',
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  management_agreement: 'Management Agreement',
  tenancy_agreement: 'Tenancy Agreement',
  inspection_notice: 'Inspection Notice',
  section_8_notice: 'Section 8 Notice',
  deposit_letter: 'Deposit Letter',
  rent_review_letter: 'Rent Review Letter',
  contractor_work_order: 'Contractor Work Order',
  owner_report_cover: 'Owner Report Cover Letter',
};

export const DOCUMENT_CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'Management', types: ['management_agreement', 'owner_report_cover'] },
  { label: 'Tenancy', types: ['tenancy_agreement', 'deposit_letter', 'rent_review_letter'] },
  { label: 'Legal & Compliance', types: ['section_8_notice', 'inspection_notice'] },
  { label: 'Operations', types: ['contractor_work_order'] },
];

export async function fetchTemplates(): Promise<DocumentTemplate[]> {
  const { data, error } = await supabase
    .from('document_templates')
    .select('*')
    .eq('is_system', true)
    .order('name');

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data as DocumentTemplate[];
}

export function extractPlaceholders(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const placeholders: string[] = [];
  const seen = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1].trim();
    if (key.startsWith('#') || key.startsWith('/') || key.startsWith('each ')) continue;
    if (!seen.has(key)) {
      seen.add(key);
      placeholders.push(key);
    }
  }
  return placeholders;
}

export function getPlaceholderLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function getPlaceholderDefault(key: string): string {
  const defaults: Record<string, string> = {
    agreement_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    notice_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    letter_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    issue_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    start_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    contract_term: '12',
    management_fee_percent: '12',
    maintenance_limit: '£250',
    inspection_interval: '6',
    notice_period: '3 months',
    term_months: '12',
    rent_due_day: '1st',
    deposit_scheme: 'Deposit Protection Service (DPS)',
    council_tax_band: 'C',
    max_occupants: '2',
    pets_allowed: 'not permitted',
    inspection_duration: '30',
    agency_name: 'LetHub Property Management',
    agency_address: '123 High Street, London, WC1A 1AA',
    agency_phone: '020 7946 0000',
    agency_email: 'info@lethub.co.uk',
    priority_level: 'Standard',
    payment_terms: '30 days from invoice',
    variation_limit: '10% of quoted amount',
    report_type: 'Monthly',
    report_period: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    next_report_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    last_review_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    response_deadline: '14',
    response_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    target_start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    completion_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    estimated_duration: '2-3 working days',
    first_payment_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    deposit_deadline: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    deposit_received_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
  return defaults[key] || '';
}

export function fillTemplate(content: string, values: Record<string, string>): string {
  let result = content;

  result = result.replace(/\{\{#if ([^}]+)\}\}/g, (_, key) => {
    const val = values[key.trim()] || '';
    return val ? '' : '<!--HIDE_START-->';
  });
  result = result.replace(/\{\{\/if\}\}/g, (match, offset) => {
    const before = result.substring(0, offset);
    const lastHide = before.lastIndexOf('<!--HIDE_START-->');
    const lastShow = before.lastIndexOf('<!--HIDE_END-->');
    if (lastHide > lastShow) {
      return '<!--HIDE_END-->';
    }
    return '';
  });

  result = result.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const k = key.trim();
    if (k.startsWith('#') || k.startsWith('/')) return '';
    return values[k] || `{{${k}}}`;
  });

  const hideRegex = /<!--HIDE_START-->[\s\S]*?<!--HIDE_END-->/g;
  result = result.replace(hideRegex, '');

  return result;
}

export function generatePDFBlob(html: string): string {
  return html;
}

export function generateDocxDownload(html: string, filename: string): void {
  const docContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${filename}</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; padding: 40px; }
      h1, h2, h3 { font-family: Arial, sans-serif; }
      @page { margin: 2cm; }
    </style></head>
    <body>${html}</body></html>
  `;

  const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printDocument(containerId: string, title: string): void {
  const content = document.getElementById(containerId);
  if (!content) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>${title}</title>${styles}
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; padding: 40px; max-width: 210mm; margin: 0 auto; }
      @media print { body { padding: 0; } @page { margin: 1.5cm; } }
    </style></head>
    <body>${content.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}