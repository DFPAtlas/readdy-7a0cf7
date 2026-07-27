import { supabase } from '@/lib/supabaseClient';

export interface CRMLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  lead_type: 'landlord' | 'tenant' | 'investor' | 'business_opportunity';
  pipeline_stage: 'new' | 'contacted' | 'viewing_booked' | 'proposal_sent' | 'won' | 'lost';
  source: string | null;
  estimated_value: number;
  notes: string | null;
  follow_up_date: string | null;
  last_contacted_at: string | null;
  properties_count: number;
  expected_monthly_rent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  won_date: string | null;
  lost_reason: string | null;
  assigned_to: string | null;
}

export interface CRMDashboardStats {
  pipelineValue: number;
  pipelineValueFormatted: string;
  newLeadsThisMonth: number;
  totalActiveLeads: number;
  conversionRate: number;
  upcomingFollowUps: number;
  wonThisMonth: number;
  lostThisMonth: number;
  leadTypeBreakdown: { type: string; count: number }[];
  stageBreakdown: { stage: string; count: number; value: number }[];
  sourceBreakdown: { source: string; count: number }[];
}

export interface CRMFollowUp {
  id: string;
  name: string;
  lead_type: string;
  follow_up_date: string;
  pipeline_stage: string;
  notes: string | null;
}

const STAGE_ORDER: Record<string, number> = {
  new: 0,
  contacted: 1,
  viewing_booked: 2,
  proposal_sent: 3,
  won: 4,
  lost: 5,
};

const STAGE_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  viewing_booked: 'Viewing Booked',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  lost: 'Lost',
};

const LEAD_TYPE_LABELS: Record<string, string> = {
  landlord: 'Landlord',
  tenant: 'Tenant',
  investor: 'Investor',
  business_opportunity: 'Business Opportunity',
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  referral: 'Referral',
  facebook: 'Facebook',
  google: 'Google',
  walk_in: 'Walk-in',
  existing_landlord: 'Existing Landlord',
};

export async function fetchCRMLeads(): Promise<CRMLead[]> {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching CRM leads:', error);
    return [];
  }

  return data as CRMLead[];
}

export async function fetchCRMLeadsByType(type: string): Promise<CRMLead[]> {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('lead_type', type)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching CRM leads by type:', error);
    return [];
  }

  return data as CRMLead[];
}

export async function fetchCRMLeadsByStage(stage: string): Promise<CRMLead[]> {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('pipeline_stage', stage)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching CRM leads by stage:', error);
    return [];
  }

  return data as CRMLead[];
}

export async function fetchCRMUpcomingFollowUps(): Promise<CRMFollowUp[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('crm_leads')
    .select('id, name, lead_type, follow_up_date, pipeline_stage, notes')
    .gte('follow_up_date', now)
    .eq('is_active', true)
    .order('follow_up_date', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching upcoming follow-ups:', error);
    return [];
  }

  return data as CRMFollowUp[];
}

export async function fetchCRMDashboardStats(): Promise<CRMDashboardStats> {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*');

  if (error || !data) {
    console.error('Error fetching CRM dashboard stats:', error);
    return {
      pipelineValue: 0,
      pipelineValueFormatted: '£0',
      newLeadsThisMonth: 0,
      totalActiveLeads: 0,
      conversionRate: 0,
      upcomingFollowUps: 0,
      wonThisMonth: 0,
      lostThisMonth: 0,
      leadTypeBreakdown: [],
      stageBreakdown: [],
      sourceBreakdown: [],
    };
  }

  const leads = data as CRMLead[];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const activeLeads = leads.filter(l => l.pipeline_stage !== 'won' && l.pipeline_stage !== 'lost' && l.is_active);
  const pipelineValue = activeLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const newLeadsThisMonth = leads.filter(l => l.created_at >= startOfMonth).length;
  const totalActiveLeads = activeLeads.length;
  const totalWon = leads.filter(l => l.pipeline_stage === 'won').length;
  const totalLost = leads.filter(l => l.pipeline_stage === 'lost').length;
  const conversionRate = totalWon + totalLost > 0 ? Math.round((totalWon / (totalWon + totalLost)) * 100) : 0;
  const wonThisMonth = leads.filter(l => l.pipeline_stage === 'won' && l.won_date && l.won_date >= startOfMonth).length;
  const lostThisMonth = leads.filter(l => l.pipeline_stage === 'lost' && l.updated_at >= startOfMonth).length;

  const upcomingFollowUps = leads.filter(l =>
    l.follow_up_date && l.follow_up_date >= now.toISOString() && l.is_active && l.pipeline_stage !== 'won' && l.pipeline_stage !== 'lost'
  ).length;

  const typeMap: Record<string, number> = {};
  const stageMap: Record<string, { count: number; value: number }> = {};
  const sourceMap: Record<string, number> = {};

  leads.forEach(l => {
    typeMap[l.lead_type] = (typeMap[l.lead_type] || 0) + 1;
    if (!stageMap[l.pipeline_stage]) stageMap[l.pipeline_stage] = { count: 0, value: 0 };
    stageMap[l.pipeline_stage].count += 1;
    stageMap[l.pipeline_stage].value += l.estimated_value || 0;
    if (l.source) sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });

  return {
    pipelineValue,
    pipelineValueFormatted: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(pipelineValue),
    newLeadsThisMonth,
    totalActiveLeads,
    conversionRate,
    upcomingFollowUps,
    wonThisMonth,
    lostThisMonth,
    leadTypeBreakdown: Object.entries(typeMap).map(([type, count]) => ({ type: LEAD_TYPE_LABELS[type] || type, count })),
    stageBreakdown: Object.entries(stageMap)
      .sort(([a], [b]) => (STAGE_ORDER[a] ?? 99) - (STAGE_ORDER[b] ?? 99))
      .map(([stage, val]) => ({ stage: STAGE_LABELS[stage] || stage, count: val.count, value: val.value })),
    sourceBreakdown: Object.entries(sourceMap).map(([source, count]) => ({ source: SOURCE_LABELS[source] || source, count })),
  };
}

export function getStageLabel(stage: string): string {
  return STAGE_LABELS[stage] || stage;
}

export function getLeadTypeLabel(type: string): string {
  return LEAD_TYPE_LABELS[type] || type;
}

export function getSourceLabel(source: string): string {
  return SOURCE_LABELS[source] || source;
}

export const STAGE_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-indigo-500',
  viewing_booked: 'bg-amber-500',
  proposal_sent: 'bg-orange-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-400',
};

export const STAGE_BG_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  viewing_booked: 'bg-amber-50 text-amber-700 border-amber-200',
  proposal_sent: 'bg-orange-50 text-orange-700 border-orange-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
};

export const LEAD_TYPE_COLORS: Record<string, string> = {
  landlord: 'bg-violet-100 text-violet-700',
  tenant: 'bg-sky-100 text-sky-700',
  investor: 'bg-teal-100 text-teal-700',
  business_opportunity: 'bg-rose-100 text-rose-700',
};