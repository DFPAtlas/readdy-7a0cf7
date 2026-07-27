import { supabase } from '@/lib/supabaseClient';

export interface AcquisitionDeal {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property_address: string;
  property_postcode: string | null;
  property_city: string | null;
  bedrooms: number;
  property_type: string;
  estimated_rent: number;
  estimated_fees: number;
  management_fee_percent: number;
  status: 'prospecting' | 'valuation' | 'negotiation' | 'due_diligence' | 'won' | 'lost';
  crm_lead_id: string | null;
  notes: string | null;
  converted_to_landlord_id: string | null;
  converted_to_property_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcquisitionStats {
  pipelineValue: number;
  pipelineValueFormatted: string;
  monthlyFeesFormatted: string;
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  avgRent: number;
  avgRentFormatted: string;
  totalProperties: number;
  stageBreakdown: { stage: string; count: number; value: number }[];
}

const STATUS_ORDER: Record<string, number> = {
  prospecting: 0,
  valuation: 1,
  negotiation: 2,
  due_diligence: 3,
  won: 4,
  lost: 5,
};

const STATUS_LABELS: Record<string, string> = {
  prospecting: 'Prospecting',
  valuation: 'Valuation',
  negotiation: 'Negotiation',
  due_diligence: 'Due Diligence',
  won: 'Won',
  lost: 'Lost',
};

export const STATUS_COLORS: Record<string, string> = {
  prospecting: 'bg-blue-500',
  valuation: 'bg-indigo-500',
  negotiation: 'bg-amber-500',
  due_diligence: 'bg-orange-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-400',
};

export const STATUS_BG_COLORS: Record<string, string> = {
  prospecting: 'bg-blue-50 text-blue-700 border-blue-200',
  valuation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  negotiation: 'bg-amber-50 text-amber-700 border-amber-200',
  due_diligence: 'bg-orange-50 text-orange-700 border-orange-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: 'House',
  flat: 'Flat',
  hmo: 'HMO',
  bungalow: 'Bungalow',
  maisonette: 'Maisonette',
};

export async function fetchAcquisitionDeals(): Promise<AcquisitionDeal[]> {
  const { data, error } = await supabase
    .from('acquisition_deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching acquisition deals:', error);
    return [];
  }

  return data as AcquisitionDeal[];
}

export async function fetchAcquisitionStats(): Promise<AcquisitionStats> {
  const { data, error } = await supabase
    .from('acquisition_deals')
    .select('*');

  if (error || !data) {
    return {
      pipelineValue: 0, pipelineValueFormatted: '£0', monthlyFeesFormatted: '£0',
      totalDeals: 0, activeDeals: 0, wonDeals: 0, lostDeals: 0,
      avgRent: 0, avgRentFormatted: '£0', totalProperties: 0, stageBreakdown: [],
    };
  }

  const deals = data as AcquisitionDeal[];
  const activeDeals = deals.filter(d => d.status !== 'won' && d.status !== 'lost' && d.is_active);
  const wonDeals = deals.filter(d => d.status === 'won');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.estimated_rent || 0) * 12, 0);
  const monthlyFees = activeDeals.reduce((sum, d) => sum + (d.estimated_fees || 0), 0);
  const avgRent = activeDeals.length > 0 ? activeDeals.reduce((sum, d) => sum + (d.estimated_rent || 0), 0) / activeDeals.length : 0;
  const totalProperties = activeDeals.reduce((sum, d) => sum + (d.bedrooms || 0), 0);

  const stageMap: Record<string, { count: number; value: number }> = {};
  deals.forEach(d => {
    if (!stageMap[d.status]) stageMap[d.status] = { count: 0, value: 0 };
    stageMap[d.status].count += 1;
    stageMap[d.status].value += (d.estimated_rent || 0) * 12;
  });

  return {
    pipelineValue,
    pipelineValueFormatted: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(pipelineValue),
    monthlyFeesFormatted: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(monthlyFees),
    totalDeals: deals.length,
    activeDeals: activeDeals.length,
    wonDeals: wonDeals.length,
    lostDeals: deals.filter(d => d.status === 'lost').length,
    avgRent,
    avgRentFormatted: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(avgRent),
    totalProperties,
    stageBreakdown: Object.entries(stageMap)
      .sort(([a], [b]) => (STATUS_ORDER[a] ?? 99) - (STATUS_ORDER[b] ?? 99))
      .map(([stage, val]) => ({ stage: STATUS_LABELS[stage] || stage, count: val.count, value: val.value })),
  };
}

export async function convertDealToManaged(dealid: string): Promise<{ success: boolean; error?: string; landlordId?: string; propertyId?: string }> {
  const { data: deal, error: fetchError } = await supabase
    .from('acquisition_deals')
    .select('*')
    .eq('id', dealid)
    .single();

  if (fetchError || !deal) {
    return { success: false, error: fetchError?.message || 'Deal not found' };
  }

  const agencyId = deal.agency_id;

  const { data: landlord, error: landlordError } = await supabase
    .from('landlords')
    .insert({
      display_name: deal.name,
      email: deal.email,
      phone: deal.phone,
      managing_agency_id: agencyId,
      is_company: false,
    })
    .select('id')
    .single();

  if (landlordError) {
    return { success: false, error: 'Failed to create landlord: ' + landlordError.message };
  }

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .insert({
      landlord_id: landlord.id,
      line1: deal.property_address,
      postcode: deal.property_postcode || '',
      city: deal.property_city || '',
      bedrooms: deal.bedrooms || 1,
      nation: 'ENG',
      is_hmo: deal.property_type === 'hmo',
      is_furnished: false,
      managing_agency_id: agencyId,
    })
    .select('id')
    .single();

  if (propertyError) {
    return { success: false, error: 'Failed to create property: ' + propertyError.message };
  }

  const { error: updateError } = await supabase
    .from('acquisition_deals')
    .update({
      status: 'won',
      converted_to_landlord_id: landlord.id,
      converted_to_property_id: property.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dealid);

  if (updateError) {
    return { success: false, error: 'Failed to update deal: ' + updateError.message };
  }

  if (deal.crm_lead_id) {
    await supabase
      .from('crm_leads')
      .update({
        pipeline_stage: 'won',
        won_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', deal.crm_lead_id);
  }

  return { success: true, landlordId: landlord.id, propertyId: property.id };
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function getPropertyTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type] || type;
}

export const PIPELINE_STAGES = ['prospecting', 'valuation', 'negotiation', 'due_diligence', 'won', 'lost'] as const;