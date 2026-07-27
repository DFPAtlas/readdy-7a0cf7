'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchCRMLeads,
  fetchCRMDashboardStats,
  fetchCRMUpcomingFollowUps,
  getStageLabel,
  getLeadTypeLabel,
  getSourceLabel,
  STAGE_COLORS,
  STAGE_BG_COLORS,
  LEAD_TYPE_COLORS,
  type CRMLead,
  type CRMDashboardStats,
  type CRMFollowUp,
} from './CRMData';

const PIPELINE_STAGES = ['new', 'contacted', 'viewing_booked', 'proposal_sent', 'won', 'lost'] as const;
const LEAD_TYPES = ['all', 'landlord', 'tenant', 'investor', 'business_opportunity'] as const;

export default function CRMPage() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [stats, setStats] = useState<CRMDashboardStats | null>(null);
  const [followUps, setFollowUps] = useState<CRMFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'leads'>('dashboard');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [allLeads, dashboardStats, upcomingFollowUps] = await Promise.all([
      fetchCRMLeads(),
      fetchCRMDashboardStats(),
      fetchCRMUpcomingFollowUps(),
    ]);
    setLeads(allLeads);
    setStats(dashboardStats);
    setFollowUps(upcomingFollowUps);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLeads = leads.filter(l => {
    if (typeFilter !== 'all' && l.lead_type !== typeFilter) return false;
    if (stageFilter !== 'all' && l.pipeline_stage !== stageFilter) return false;
    return true;
  });

  const leadsByStage = (stage: string) => filteredLeads.filter(l => l.pipeline_stage === stage);

  const stageValue = (stage: string) => {
    return leadsByStage(stage).reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4]">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CRM</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track leads, pipeline, and conversions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              {(['dashboard', 'pipeline', 'leads'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'bg-[#C28A78] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'dashboard' ? 'Dashboard' : tab === 'pipeline' ? 'Pipeline' : 'All Leads'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#143A29] transition-colors"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
              Add Lead
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && stats && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-funds-line"></i></div>
                  Pipeline Value
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.pipelineValueFormatted}</p>
                <p className="text-xs text-slate-400 mt-1">{stats.totalActiveLeads} active leads</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-add-line"></i></div>
                  New Leads
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.newLeadsThisMonth}</p>
                <p className="text-xs text-slate-400 mt-1">this month</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-line-chart-line"></i></div>
                  Conversion Rate
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</p>
                <p className="text-xs text-slate-400 mt-1">{stats.wonThisMonth} won / {stats.lostThisMonth} lost this month</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-check-line"></i></div>
                  Upcoming Follow-ups
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.upcomingFollowUps}</p>
                <p className="text-xs text-slate-400 mt-1">scheduled</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Pipeline Summary */}
              <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Pipeline Summary</h3>
                <div className="space-y-3">
                  {PIPELINE_STAGES.map(stage => {
                    const count = leadsByStage(stage).length;
                    const value = stageValue(stage);
                    const maxValue = Math.max(...PIPELINE_STAGES.map(s => stageValue(s)), 1);
                    const widthPercent = Math.round((value / maxValue) * 100);
                    return (
                      <div key={stage} className="flex items-center gap-4">
                        <span className="w-28 text-sm font-medium text-slate-700 whitespace-nowrap">{getStageLabel(stage)}</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                          <div
                            className={`h-full rounded-lg transition-all duration-500 ${STAGE_COLORS[stage]}`}
                            style={{ width: `${widthPercent}%`, minWidth: count > 0 ? '8px' : '0' }}
                          ></div>
                          <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-white drop-shadow-sm">
                            {count > 0 ? `${count} lead${count !== 1 ? 's' : ''} · ${formatCurrency(value)}` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Follow-ups */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Upcoming Follow-ups</h3>
                {followUps.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No upcoming follow-ups</p>
                ) : (
                  <div className="space-y-3">
                    {followUps.slice(0, 6).map(fu => (
                      <div key={fu.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded-full bg-[#C28A78]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-[#C28A78]">{fu.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{fu.name}</p>
                          <p className="text-xs text-slate-500">{getLeadTypeLabel(fu.lead_type)} · {formatDateTime(fu.follow_up_date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lead Type & Source Breakdowns */}
            <div className="grid grid-cols-3 gap-6 mt-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">By Lead Type</h3>
                <div className="space-y-3">
                  {stats.leadTypeBreakdown.map(item => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{item.type}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">By Source</h3>
                <div className="space-y-3">
                  {stats.sourceBreakdown.map(item => (
                    <div key={item.source} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{item.source}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Total Leads</p>
                    <p className="text-lg font-bold text-slate-900">{leads.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Active Pipeline</p>
                    <p className="text-lg font-bold text-slate-900">{stats.totalActiveLeads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Won (All Time)</p>
                    <p className="text-lg font-bold text-emerald-600">{leads.filter(l => l.pipeline_stage === 'won').length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Lost (All Time)</p>
                    <p className="text-lg font-bold text-red-500">{leads.filter(l => l.pipeline_stage === 'lost').length}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pipeline View */}
        {activeTab === 'pipeline' && (
          <>
            {/* Type Filter */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {LEAD_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
                    typeFilter === t
                      ? 'bg-[#C28A78] text-white border-[#C28A78]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t === 'all' ? 'All Types' : getLeadTypeLabel(t)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-6 gap-4">
              {PIPELINE_STAGES.map(stage => {
                const stageLeads = leadsByStage(stage);
                const totalValue = stageValue(stage);
                return (
                  <div key={stage} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className={`px-4 py-3 border-b ${stage === 'won' ? 'border-emerald-100' : stage === 'lost' ? 'border-red-100' : 'border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-900">{getStageLabel(stage)}</span>
                        <span className="text-xs font-medium text-slate-400">{stageLeads.length}</span>
                      </div>
                      <span className="text-xs text-slate-500">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                      {stageLeads.map(lead => (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                        >
                          <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${LEAD_TYPE_COLORS[lead.lead_type] || 'bg-slate-100 text-slate-600'}`}>
                              {getLeadTypeLabel(lead.lead_type)}
                            </span>
                            {lead.estimated_value > 0 && (
                              <span className="text-[10px] text-slate-500">{formatCurrency(lead.estimated_value)}</span>
                            )}
                          </div>
                          {lead.follow_up_date && stage !== 'won' && stage !== 'lost' && (
                            <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                              <div className="w-3 h-3 flex items-center justify-center"><i className="ri-calendar-line"></i></div>
                              {formatDateTime(lead.follow_up_date)}
                            </p>
                          )}
                        </button>
                      ))}
                      {stageLeads.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-6">No leads</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* All Leads Table */}
        {activeTab === 'leads' && (
          <>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {LEAD_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
                    typeFilter === t
                      ? 'bg-[#C28A78] text-white border-[#C28A78]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t === 'all' ? 'All Types' : getLeadTypeLabel(t)}
                </button>
              ))}
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <button
                onClick={() => setStageFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
                  stageFilter === 'all' ? 'bg-[#C28A78] text-white border-[#C28A78]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                All Stages
              </button>
              {PIPELINE_STAGES.map(stage => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stage)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${
                    stageFilter === stage
                      ? 'bg-[#C28A78] text-white border-[#C28A78]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {getStageLabel(stage)}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Follow-up</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                          {lead.company && <p className="text-xs text-slate-400">{lead.company}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEAD_TYPE_COLORS[lead.lead_type] || 'bg-slate-100 text-slate-600'}`}>
                            {getLeadTypeLabel(lead.lead_type)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STAGE_BG_COLORS[lead.pipeline_stage] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {getStageLabel(lead.pipeline_stage)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{lead.source ? getSourceLabel(lead.source) : '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                          {lead.estimated_value > 0 ? formatCurrency(lead.estimated_value) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.follow_up_date ? formatDate(lead.follow_up_date) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(lead.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLeads.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-12">No leads match your filters</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-200 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-900">{selectedLead.name}</h3>
              <button onClick={() => setSelectedLead(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEAD_TYPE_COLORS[selectedLead.lead_type] || 'bg-slate-100 text-slate-600'}`}>
                  {getLeadTypeLabel(selectedLead.lead_type)}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STAGE_BG_COLORS[selectedLead.pipeline_stage] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {getStageLabel(selectedLead.pipeline_stage)}
                </span>
                {selectedLead.source && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{getSourceLabel(selectedLead.source)}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedLead.email && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Email</p>
                    <p className="text-sm text-slate-900">{selectedLead.email}</p>
                  </div>
                )}
                {selectedLead.phone && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                    <p className="text-sm text-slate-900">{selectedLead.phone}</p>
                  </div>
                )}
                {selectedLead.company && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Company</p>
                    <p className="text-sm text-slate-900">{selectedLead.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Estimated Value</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedLead.estimated_value > 0 ? formatCurrency(selectedLead.estimated_value) : 'N/A'}</p>
                </div>
                {selectedLead.properties_count > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Properties</p>
                    <p className="text-sm text-slate-900">{selectedLead.properties_count}</p>
                  </div>
                )}
                {selectedLead.expected_monthly_rent > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Expected Monthly Rent</p>
                    <p className="text-sm text-slate-900">{formatCurrency(selectedLead.expected_monthly_rent)}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Created</p>
                  <p className="text-sm text-slate-900">{formatDate(selectedLead.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Last Contacted</p>
                  <p className="text-sm text-slate-900">{formatDate(selectedLead.last_contacted_at)}</p>
                </div>
                {selectedLead.follow_up_date && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Follow-up</p>
                    <p className="text-sm text-amber-600 font-medium">{formatDateTime(selectedLead.follow_up_date)}</p>
                  </div>
                )}
                {selectedLead.won_date && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Won Date</p>
                    <p className="text-sm text-emerald-600">{formatDate(selectedLead.won_date)}</p>
                  </div>
                )}
                {selectedLead.lost_reason && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Lost Reason</p>
                    <p className="text-sm text-red-500">{selectedLead.lost_reason}</p>
                  </div>
                )}
              </div>

              {selectedLead.notes && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} onAdded={loadData} />}
    </div>
  );
}

function AddLeadModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [leadType, setLeadType] = useState('landlord');
  const [source, setSource] = useState('website');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [propertiesCount, setPropertiesCount] = useState('');
  const [expectedRent, setExpectedRent] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');

    const { supabase } = await import('@/lib/supabaseClient');
    const { error: insertError } = await supabase.from('crm_leads').insert({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      company: company.trim() || null,
      lead_type: leadType,
      pipeline_stage: 'new',
      source,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : 0,
      properties_count: propertiesCount ? parseInt(propertiesCount) : 0,
      expected_monthly_rent: expectedRent ? parseFloat(expectedRent) : 0,
      notes: notes.trim() || null,
      follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
      is_active: true,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-200 rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-900">Add New Lead</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Lead name" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
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
            <label className="text-xs font-medium text-slate-500 mb-1 block">Company</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Lead Type</label>
              <div className="relative">
                <button
                  onClick={() => {
                    const types = ['landlord', 'tenant', 'investor', 'business_opportunity'];
                    const idx = types.indexOf(leadType);
                    setLeadType(types[(idx + 1) % types.length]);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-left flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <span>{getLeadTypeLabel(leadType)}</span>
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-slate-400"></i></div>
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Source</label>
              <div className="relative">
                <button
                  onClick={() => {
                    const sources = ['website', 'referral', 'facebook', 'google', 'walk_in', 'existing_landlord'];
                    const idx = sources.indexOf(source);
                    setSource(sources[(idx + 1) % sources.length]);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-left flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <span>{getSourceLabel(source)}</span>
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-slate-400"></i></div>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Est. Value (£)</label>
              <input type="number" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} placeholder="0" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Properties</label>
              <input type="number" value={propertiesCount} onChange={e => setPropertiesCount(e.target.value)} placeholder="0" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Monthly Rent (£)</label>
              <input type="number" value={expectedRent} onChange={e => setExpectedRent(e.target.value)} placeholder="0" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Follow-up Date</label>
            <input type="datetime-local" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this lead..." rows={3} maxLength={500} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none resize-none" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#143A29] transition-colors disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}