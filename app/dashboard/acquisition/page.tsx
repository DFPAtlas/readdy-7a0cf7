'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardShell from '@/components/DashboardShell';
import {
  fetchAcquisitionDeals,
  fetchAcquisitionStats,
  convertDealToManaged,
  getStatusLabel,
  getPropertyTypeLabel,
  STATUS_COLORS,
  STATUS_BG_COLORS,
  PIPELINE_STAGES,
  type AcquisitionDeal,
  type AcquisitionStats,
} from './AcquisitionData';

export default function AcquisitionPage() {
  const [deals, setDeals] = useState<AcquisitionDeal[]>([]);
  const [stats, setStats] = useState<AcquisitionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline'>('dashboard');
  const [selectedDeal, setSelectedDeal] = useState<AcquisitionDeal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<AcquisitionDeal | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<{ success: boolean; error?: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [allDeals, dashStats] = await Promise.all([fetchAcquisitionDeals(), fetchAcquisitionStats()]);
    setDeals(allDeals);
    setStats(dashStats);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const dealsByStage = (stage: string) => deals.filter(d => d.status === stage);
  const stageValue = (stage: string) => dealsByStage(stage).reduce((sum, d) => sum + (d.estimated_rent || 0) * 12, 0);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleConvert = async () => {
    if (!showConvertModal) return;
    setConverting(true);
    setConvertResult(null);
    const result = await convertDealToManaged(showConvertModal.id);
    setConvertResult(result);
    setConverting(false);
    if (result.success) {
      await loadData();
      setTimeout(() => { setShowConvertModal(null); setConvertResult(null); }, 2000);
    }
  };

  const activeDeals = deals.filter(d => d.status !== 'won' && d.status !== 'lost' && d.is_active);

  if (loading) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500">Loading acquisition pipeline...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Property Acquisition</h1>
            <p className="text-sm text-slate-500 mt-0.5">Convert landlord prospects into managed properties</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              {(['dashboard', 'pipeline'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#C28A78] text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {tab === 'dashboard' ? 'Dashboard' : 'Pipeline'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#143A29] transition-colors"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
              New Deal
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && stats && (
          <>
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-funds-line"></i></div>
                  Pipeline Value
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.pipelineValueFormatted}</p>
                <p className="text-xs text-slate-400 mt-1">{stats.activeDeals} active deals</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-bank-card-line"></i></div>
                  Monthly Fees
                </div>
                <p className="text-2xl font-bold text-emerald-600">{stats.monthlyFeesFormatted}</p>
                <p className="text-xs text-slate-400 mt-1">projected monthly revenue</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-home-4-line"></i></div>
                  Avg Rent
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.avgRentFormatted}</p>
                <p className="text-xs text-slate-400 mt-1">per property / month</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-double-line"></i></div>
                  Won
                </div>
                <p className="text-2xl font-bold text-emerald-600">{stats.wonDeals}</p>
                <p className="text-xs text-slate-400 mt-1">{stats.totalProperties} bedrooms managed</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-4-line"></i></div>
                  Total Bedrooms
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalProperties}</p>
                <p className="text-xs text-slate-400 mt-1">across pipeline</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Pipeline Summary</h3>
                <div className="space-y-3">
                  {PIPELINE_STAGES.map(stage => {
                    const count = dealsByStage(stage).length;
                    const value = stageValue(stage);
                    const maxValue = Math.max(...PIPELINE_STAGES.map(s => stageValue(s)), 1);
                    const widthPercent = Math.round((value / maxValue) * 100);
                    return (
                      <div key={stage} className="flex items-center gap-4">
                        <span className="w-28 text-sm font-medium text-slate-700 whitespace-nowrap">{getStatusLabel(stage)}</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                          <div className={`h-full rounded-lg transition-all duration-500 ${STATUS_COLORS[stage]}`} style={{ width: `${widthPercent}%`, minWidth: count > 0 ? '8px' : '0' }}></div>
                          <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-white drop-shadow-sm">
                            {count > 0 ? `${count} deal${count !== 1 ? 's' : ''} · ${formatCurrency(value)}` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Active Deals</h3>
                <div className="space-y-3">
                  {activeDeals.slice(0, 6).map(deal => (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className="w-full text-left flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0 hover:opacity-80 transition-opacity"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_COLORS[deal.status]}`}></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{deal.name}</p>
                        <p className="text-xs text-slate-500 truncate">{deal.property_address}{deal.property_city ? `, ${deal.property_city}` : ''}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(deal.estimated_rent)}/mo · {deal.management_fee_percent}% fee</p>
                      </div>
                    </button>
                  ))}
                  {activeDeals.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">No active deals</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-6 gap-4">
            {PIPELINE_STAGES.map(stage => {
              const stageDeals = dealsByStage(stage);
              const totalValue = stageValue(stage);
              return (
                <div key={stage} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className={`px-4 py-3 border-b ${stage === 'won' ? 'border-emerald-100' : stage === 'lost' ? 'border-red-100' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-900">{getStatusLabel(stage)}</span>
                      <span className="text-xs font-medium text-slate-400">{stageDeals.length}</span>
                    </div>
                    <span className="text-xs text-slate-500">{formatCurrency(totalValue)}</span>
                  </div>
                  <div className="p-2 space-y-2 max-h-[520px] overflow-y-auto">
                    {stageDeals.map(deal => (
                      <button
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                      >
                        <p className="text-sm font-medium text-slate-900 truncate">{deal.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{deal.property_address}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                            {getPropertyTypeLabel(deal.property_type)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                            {deal.bedrooms} bed{deal.bedrooms !== 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] text-slate-500">{formatCurrency(deal.estimated_rent)}/mo</span>
                        </div>
                        {(stage === 'due_diligence' || stage === 'won') && !deal.converted_to_landlord_id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowConvertModal(deal); }}
                            className="w-full mt-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium whitespace-nowrap hover:bg-emerald-700 transition-colors"
                          >
                            Convert to Managed
                          </button>
                        )}
                        {deal.converted_to_landlord_id && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600 font-medium">
                            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-check-double-line"></i></div>
                            Converted
                          </div>
                        )}
                      </button>
                    ))}
                    {stageDeals.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No deals</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setSelectedDeal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-200 rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-900">{selectedDeal.name}</h3>
              <button onClick={() => setSelectedDeal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_BG_COLORS[selectedDeal.status]}`}>
                  {getStatusLabel(selectedDeal.status)}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {getPropertyTypeLabel(selectedDeal.property_type)}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {selectedDeal.bedrooms} bed{selectedDeal.bedrooms !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center"><i className="ri-map-pin-line text-slate-400"></i></div>
                  <p className="text-sm text-slate-900">{selectedDeal.property_address}</p>
                </div>
                {(selectedDeal.property_city || selectedDeal.property_postcode) && (
                  <p className="text-sm text-slate-500 pl-7">
                    {[selectedDeal.property_city, selectedDeal.property_postcode].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedDeal.email && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Email</p>
                    <p className="text-sm text-slate-900">{selectedDeal.email}</p>
                  </div>
                )}
                {selectedDeal.phone && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                    <p className="text-sm text-slate-900">{selectedDeal.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Est. Monthly Rent</p>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(selectedDeal.estimated_rent)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Management Fee</p>
                  <p className="text-sm font-semibold text-emerald-600">{selectedDeal.management_fee_percent}% ({formatCurrency(selectedDeal.estimated_fees)}/mo)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Annual Rent</p>
                  <p className="text-sm text-slate-900">{formatCurrency(selectedDeal.estimated_rent * 12)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Annual Fees</p>
                  <p className="text-sm text-emerald-600">{formatCurrency(selectedDeal.estimated_fees * 12)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Created</p>
                  <p className="text-sm text-slate-900">{formatDate(selectedDeal.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Updated</p>
                  <p className="text-sm text-slate-900">{formatDate(selectedDeal.updated_at)}</p>
                </div>
              </div>

              {selectedDeal.notes && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selectedDeal.notes}</p>
                </div>
              )}

              {selectedDeal.converted_to_landlord_id && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-double-line"></i></div>
                    Converted to Managed
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">Landlord and property records created</p>
                </div>
              )}

              {!selectedDeal.converted_to_landlord_id && (selectedDeal.status === 'due_diligence' || selectedDeal.status === 'won') && (
                <button
                  onClick={() => { setSelectedDeal(null); setShowConvertModal(selectedDeal); }}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-emerald-700 transition-colors"
                >
                  Convert to Managed Property
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Convert Confirmation Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => { if (!converting) { setShowConvertModal(null); setConvertResult(null); }}}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Convert to Managed</h3>
              <p className="text-sm text-slate-500 mt-1">This will create a landlord record and property in one click.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Landlord</span>
                  <span className="font-medium text-slate-900">{showConvertModal.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Property</span>
                  <span className="font-medium text-slate-900 truncate max-w-[200px]">{showConvertModal.property_address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monthly Rent</span>
                  <span className="font-medium text-slate-900">{formatCurrency(showConvertModal.estimated_rent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Management Fee</span>
                  <span className="font-medium text-emerald-600">{showConvertModal.management_fee_percent}% ({formatCurrency(showConvertModal.estimated_fees)}/mo)</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Annual Revenue</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(showConvertModal.estimated_fees * 12)}</span>
                </div>
              </div>

              {convertResult && (
                <div className={`rounded-xl p-4 ${convertResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm font-medium ${convertResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                    {convertResult.success ? 'Deal converted successfully! Landlord and property created.' : convertResult.error || 'Conversion failed'}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowConvertModal(null); setConvertResult(null); }}
                  disabled={converting}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 whitespace-nowrap hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={converting || convertResult?.success}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {converting ? 'Converting...' : convertResult?.success ? 'Done!' : 'Confirm Convert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && <AddDealModal onClose={() => setShowAddModal(false)} onAdded={loadData} />}
    </div>
    </DashboardShell>
  );
}

function AddDealModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyPostcode, setPropertyPostcode] = useState('');
  const [propertyCity, setPropertyCity] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [propertyType, setPropertyType] = useState('house');
  const [estimatedRent, setEstimatedRent] = useState('');
  const [managementFee, setManagementFee] = useState('12');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Landlord name is required'); return; }
    if (!propertyAddress.trim()) { setError('Property address is required'); return; }
    setSaving(true);
    setError('');

    const { supabase } = await import('@/lib/supabaseClient');
    const rent = estimatedRent ? parseFloat(estimatedRent) : 0;
    const feePercent = managementFee ? parseFloat(managementFee) : 10;
    const { error: insertError } = await supabase.from('acquisition_deals').insert({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      property_address: propertyAddress.trim(),
      property_postcode: propertyPostcode.trim() || null,
      property_city: propertyCity.trim() || null,
      bedrooms: parseInt(bedrooms) || 1,
      property_type: propertyType,
      estimated_rent: rent,
      estimated_fees: Math.round(rent * (feePercent / 100)),
      management_fee_percent: feePercent,
      status: 'prospecting',
      notes: notes.trim() || null,
      is_active: true,
    });

    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    onAdded();
    onClose();
  };

  const PROPERTY_TYPES = ['house', 'flat', 'hmo', 'bungalow', 'maisonette'];
  const typeIdx = PROPERTY_TYPES.indexOf(propertyType);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-200 rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-slate-900">New Acquisition Deal</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Landlord Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prospect name" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Property Address *</label>
            <input type="text" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="Address line" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">City</label>
              <input type="text" value={propertyCity} onChange={e => setPropertyCity(e.target.value)} placeholder="City" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Postcode</label>
              <input type="text" value={propertyPostcode} onChange={e => setPropertyPostcode(e.target.value)} placeholder="Postcode" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Bedrooms</label>
              <input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} min="1" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
              <button
                onClick={() => setPropertyType(PROPERTY_TYPES[(typeIdx + 1) % PROPERTY_TYPES.length])}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-left flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <span>{getPropertyTypeLabel(propertyType)}</span>
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-slate-400"></i></div>
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Fee %</label>
              <input type="number" value={managementFee} onChange={e => setManagementFee(e.target.value)} min="1" max="30" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Est. Monthly Rent (£)</label>
            <input type="number" value={estimatedRent} onChange={e => setEstimatedRent(e.target.value)} placeholder="0" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes..." rows={3} maxLength={500} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none resize-none" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#143A29] transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Deal'}
          </button>
        </div>
      </div>
    </div>
  );
}