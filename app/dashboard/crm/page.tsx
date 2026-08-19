'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardShell from '@/components/DashboardShell';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(false);
  const [editStage, setEditStage] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLostReason, setShowLostReason] = useState(false);
  const [lostReason, setLostReason] = useState('');

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        l.name.toLowerCase().includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q));
      if (!matches) return false;
    }
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
      <DashboardShell>
        <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500">Loading CRM...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
    <div className="min-h-screen bg-[#FBF9F4]">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 rounded-xl px-5 py-4" style={{background: 'linear-gradient(135deg, #C28A78 0%, #a06b5a 100%)'}}>
          <div>
            <h1 className="text-2xl font-bold text-white">CRM</h1>
            <p className="text-sm text-white/80 mt-0.5">Track leads, pipeline, and conversions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/20 rounded-xl border border-white/30 p-1">
              {(['dashboard', 'pipeline', 'leads'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'bg-white text-[#143828]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {tab === 'dashboard' ? 'Dashboard' : tab === 'pipeline' ? 'Pipeline' : 'All Leads'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#C28A78]/80 transition-colors"
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
                            <span className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                              <span className="w-3 h-3 flex items-center justify-center"><i className="ri-calendar-line"></i></span>
                              {formatDateTime(lead.follow_up_date)}
                            </span>
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
            {/* Search bar */}
            <div className="relative mb-4">
              <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or company..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D5D9D5] rounded-xl text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-[#94A3B8] text-xs"></i>
                </button>
              )}
            </div>
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
                <div className="text-center py-12">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-search-line text-[#94A3B8]"></i>
                  </div>
                  <p className="text-sm font-medium text-[#3A3F3A]">{searchQuery ? `No results for "${searchQuery}"` : 'No leads match your filters'}</p>
                  {searchQuery && <p className="text-xs text-[#94A3B8] mt-1">Try a different name, email, or company</p>}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedLead(null); setEditingLead(false); setConfirmDelete(false); setShowLostReason(false); setLostReason(''); }}>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-3-line text-[#C28A78] text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{selectedLead.name}</h3>
                  {selectedLead.company && <p className="text-xs text-[#687068]">{selectedLead.company}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (editingLead) {
                      setEditingLead(false);
                      setShowStageMenu(false);
                    } else {
                      setEditStage(selectedLead.pipeline_stage);
                      setEditFollowUp(selectedLead.follow_up_date ? new Date(selectedLead.follow_up_date).toISOString().slice(0,16) : '');
                      setEditNotes(selectedLead.notes || '');
                      setEditingLead(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    editingLead ? 'bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]' : 'bg-[#C28A78]/10 text-[#C28A78] hover:bg-[#C28A78]/20'
                  }`}
                >
                  <i className={editingLead ? 'ri-close-line' : 'ri-edit-line'}></i>
                  {editingLead ? 'Cancel' : 'Edit Lead'}
                </button>
                <button onClick={() => { setSelectedLead(null); setEditingLead(false); setConfirmDelete(false); setShowLostReason(false); setLostReason(''); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer">
                  <i className="ri-close-line text-[#94A3B8]"></i>
                </button>
              </div>
            </div>

            {/* Badges bar */}
            <div className="flex items-center gap-2 px-6 py-3 bg-[#FBF9F4] border-b border-[#D5D9D5] flex-wrap flex-shrink-0">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEAD_TYPE_COLORS[selectedLead.lead_type] || 'bg-slate-100 text-slate-600'}`}>
                {getLeadTypeLabel(selectedLead.lead_type)}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STAGE_BG_COLORS[selectedLead.pipeline_stage] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {getStageLabel(selectedLead.pipeline_stage)}
              </span>
              {selectedLead.source && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#D5D9D5] text-[#687068] font-medium">{getSourceLabel(selectedLead.source)}</span>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Contact */}
              <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4 space-y-3">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Contact Details</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {selectedLead.email && (
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">Email</p>
                      <p className="text-sm text-[#3A3F3A] font-medium">{selectedLead.email}</p>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">Phone</p>
                      <p className="text-sm text-[#3A3F3A] font-medium">{selectedLead.phone}</p>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">Company</p>
                      <p className="text-sm text-[#3A3F3A] font-medium">{selectedLead.company}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financials */}
              <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4 space-y-3">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Financials</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg border border-[#D5D9D5] p-3 text-center">
                    <p className="text-xs text-[#94A3B8] mb-1">Est. Value</p>
                    <p className="text-sm font-bold text-[#3A3F3A]">{selectedLead.estimated_value > 0 ? formatCurrency(selectedLead.estimated_value) : '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-[#D5D9D5] p-3 text-center">
                    <p className="text-xs text-[#94A3B8] mb-1">Properties</p>
                    <p className="text-sm font-bold text-[#3A3F3A]">{selectedLead.properties_count > 0 ? selectedLead.properties_count : '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-[#D5D9D5] p-3 text-center">
                    <p className="text-xs text-[#94A3B8] mb-1">Monthly Rent</p>
                    <p className="text-sm font-bold text-[#3A3F3A]">{selectedLead.expected_monthly_rent > 0 ? formatCurrency(selectedLead.expected_monthly_rent) : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4 space-y-3">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Timeline</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-0.5">Created</p>
                    <p className="text-sm text-[#3A3F3A] font-medium">{formatDate(selectedLead.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-0.5">Last Contacted</p>
                    <p className="text-sm text-[#3A3F3A] font-medium">{formatDate(selectedLead.last_contacted_at)}</p>
                  </div>
                  {selectedLead.follow_up_date && (
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">Follow-up</p>
                      <p className="text-sm text-amber-600 font-semibold">{formatDateTime(selectedLead.follow_up_date)}</p>
                    </div>
                  )}
                  {selectedLead.won_date && (
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-0.5">Won Date</p>
                      <p className="text-sm text-emerald-600 font-semibold">{formatDate(selectedLead.won_date)}</p>
                    </div>
                  )}
                </div>
                {selectedLead.lost_reason && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-1">
                    <p className="text-xs text-red-400 mb-0.5">Lost Reason</p>
                    <p className="text-sm text-red-600 font-medium">{selectedLead.lost_reason}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Notes</p>
                  <div className="bg-[#FBF9F4] border border-[#D5D9D5] rounded-xl p-4">
                    <p className="text-sm text-[#3A3F3A] leading-relaxed">{selectedLead.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Edit panel */}
            {editingLead && (
              <div className="px-6 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4] space-y-4 flex-shrink-0">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Edit Lead</p>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={async () => {
                      setEditSaving(true);
                      const { supabase } = await import('@/lib/supabaseClient');
                      await supabase.from('crm_leads').update({
                        pipeline_stage: 'won',
                        won_date: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      }).eq('id', selectedLead.id);
                      setEditSaving(false);
                      setEditingLead(false);
                      setSelectedLead(prev => prev ? { ...prev, pipeline_stage: 'won', won_date: new Date().toISOString() } : null);
                      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, pipeline_stage: 'won', won_date: new Date().toISOString() } : l));
                    }}
                    disabled={editSaving || selectedLead.pipeline_stage === 'won'}
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-40 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-trophy-line text-sm"></i>
                    Mark as Won
                  </button>
                  <button
                    onClick={() => { setShowLostReason(true); setLostReason(''); }}
                    disabled={editSaving || selectedLead.pipeline_stage === 'lost'}
                    className="flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-close-circle-line text-sm"></i>
                    Mark as Lost
                  </button>
                </div>

                {/* Lost reason inline panel */}
                {showLostReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-close-circle-line text-red-500 text-sm"></i>
                      <p className="text-sm font-medium text-red-700">Why did this deal fall through?</p>
                    </div>
                    <input
                      type="text"
                      value={lostReason}
                      onChange={e => setLostReason(e.target.value)}
                      placeholder="e.g. Price too high, went with competitor, unresponsive..."
                      className="w-full px-3 py-2.5 border border-red-200 rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 bg-white"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setShowLostReason(false); setLostReason(''); }}
                        className="flex-1 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setEditSaving(true);
                          const { supabase } = await import('@/lib/supabaseClient');
                          await supabase.from('crm_leads').update({
                            pipeline_stage: 'lost',
                            lost_reason: lostReason.trim() || null,
                            updated_at: new Date().toISOString(),
                          }).eq('id', selectedLead.id);
                          const updatedReason = lostReason.trim() || null;
                          setEditSaving(false);
                          setShowLostReason(false);
                          setEditingLead(false);
                          setLostReason('');
                          setSelectedLead(prev => prev ? { ...prev, pipeline_stage: 'lost', lost_reason: updatedReason } : null);
                          setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, pipeline_stage: 'lost', lost_reason: updatedReason } : l));
                        }}
                        disabled={editSaving}
                        className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                      >
                        {editSaving ? 'Saving...' : 'Confirm Lost'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-t border-[#D5D9D5] pt-4 space-y-4">
                <p className="text-xs font-medium text-[#687068] mb-3">Update Details</p>

                {/* Stage picker */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Pipeline Stage</label>
                  <button
                    type="button"
                    onClick={() => setShowStageMenu(v => !v)}
                    className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] text-left flex items-center justify-between bg-white hover:border-[#C28A78] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${
                        editStage === 'won' ? 'bg-emerald-500' : editStage === 'lost' ? 'bg-red-400' :
                        editStage === 'new' ? 'bg-blue-500' : editStage === 'contacted' ? 'bg-indigo-500' :
                        editStage === 'viewing_booked' ? 'bg-amber-500' : 'bg-orange-500'
                      }`}></span>
                      {getStageLabel(editStage)}
                    </span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                  </button>
                  {showStageMenu && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-20 overflow-hidden">
                      {(['new','contacted','viewing_booked','proposal_sent','won','lost'] as const).map(s => (
                        <button key={s} type="button"
                          onClick={() => { setEditStage(s); setShowStageMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#FBF9F4] transition-colors cursor-pointer ${
                            editStage === s ? 'text-[#C28A78] font-medium' : 'text-[#3A3F3A]'
                          }`}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            s === 'won' ? 'bg-emerald-500' : s === 'lost' ? 'bg-red-400' :
                            s === 'new' ? 'bg-blue-500' : s === 'contacted' ? 'bg-indigo-500' :
                            s === 'viewing_booked' ? 'bg-amber-500' : 'bg-orange-500'
                          }`}></span>
                          {getStageLabel(s)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Follow-up date */}
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Follow-up Date</label>
                  <input
                    type="datetime-local"
                    value={editFollowUp}
                    onChange={e => setEditFollowUp(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Add notes about this lead..."
                    className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white resize-none"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1 text-right">{editNotes.length}/500</p>
                </div>

                <button
                  onClick={async () => {
                    setEditSaving(true);
                    const { supabase } = await import('@/lib/supabaseClient');
                    const updates: Record<string, unknown> = {
                      pipeline_stage: editStage,
                      follow_up_date: editFollowUp ? new Date(editFollowUp).toISOString() : null,
                      notes: editNotes.trim() || null,
                      updated_at: new Date().toISOString(),
                    };
                    await supabase.from('crm_leads').update(updates).eq('id', selectedLead.id);
                    setEditSaving(false);
                    setEditingLead(false);
                    setShowStageMenu(false);
                    setSelectedLead(prev => prev ? { ...prev, pipeline_stage: editStage as CRMLead['pipeline_stage'], follow_up_date: editFollowUp ? new Date(editFollowUp).toISOString() : null, notes: editNotes.trim() || null } : null);
                    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, pipeline_stage: editStage as CRMLead['pipeline_stage'], follow_up_date: editFollowUp ? new Date(editFollowUp).toISOString() : null, notes: editNotes.trim() || null } : l));
                  }}
                  disabled={editSaving}
                  className="w-full py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#D5D9D5] bg-white rounded-b-2xl flex-shrink-0">
              {confirmDelete ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2 text-sm text-red-600 flex-1">
                    <i className="ri-error-warning-line text-red-500"></i>
                    <span className="font-medium">Delete this lead permanently?</span>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 border border-[#D5D9D5] text-[#687068] text-sm font-medium rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      const { supabase } = await import('@/lib/supabaseClient');
                      await supabase.from('crm_leads').delete().eq('id', selectedLead.id);
                      setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
                      setDeleting(false);
                      setConfirmDelete(false);
                      setSelectedLead(null);
                      setEditingLead(false);
                    }}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 border border-red-100 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                    Delete Lead
                  </button>
                  <button
                    onClick={() => { setSelectedLead(null); setEditingLead(false); setConfirmDelete(false); setShowLostReason(false); setLostReason(''); }}
                    className="px-5 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} onAdded={loadData} />}
    </div>
    </DashboardShell>
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
  const [showLeadTypeMenu, setShowLeadTypeMenu] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  const LEAD_TYPE_OPTIONS = [
    { value: 'landlord', label: 'Landlord' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'investor', label: 'Investor' },
    { value: 'business_opportunity', label: 'Business Opportunity' },
  ];

  const SOURCE_OPTIONS = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'google', label: 'Google' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'existing_landlord', label: 'Existing Landlord' },
  ];

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

  const inputCls = "w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white transition-colors";
  const labelCls = "block text-sm font-medium text-[#3A3F3A] mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-user-add-line text-[#C28A78] text-lg"></i>
            </div>
            <div>
              <h3 className="font-semibold text-[#3A3F3A]">Add New Lead</h3>
              <p className="text-xs text-[#687068]">Enter the lead's details below</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-5">
              <i className="ri-error-warning-line text-red-500 text-sm"></i>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Full Name <span className="text-[#C28A78]">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. James Richardson" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7xxx xxxxxx" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Company</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className={labelCls}>Lead Type</label>
                <button
                  type="button"
                  onClick={() => { setShowLeadTypeMenu(v => !v); setShowSourceMenu(false); }}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] text-left flex items-center justify-between hover:border-[#C28A78] transition-colors bg-white cursor-pointer"
                >
                  <span>{LEAD_TYPE_OPTIONS.find(o => o.value === leadType)?.label}</span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                </button>
                {showLeadTypeMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-10 overflow-hidden">
                    {LEAD_TYPE_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => { setLeadType(opt.value); setShowLeadTypeMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#FBF9F4] transition-colors cursor-pointer ${leadType === opt.value ? 'text-[#C28A78] font-medium' : 'text-[#3A3F3A]'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <label className={labelCls}>Source</label>
                <button
                  type="button"
                  onClick={() => { setShowSourceMenu(v => !v); setShowLeadTypeMenu(false); }}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] text-left flex items-center justify-between hover:border-[#C28A78] transition-colors bg-white cursor-pointer"
                >
                  <span>{SOURCE_OPTIONS.find(o => o.value === source)?.label}</span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                </button>
                {showSourceMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5D9D5] rounded-xl shadow-lg z-10 overflow-hidden">
                    {SOURCE_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => { setSource(opt.value); setShowSourceMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#FBF9F4] transition-colors cursor-pointer ${source === opt.value ? 'text-[#C28A78] font-medium' : 'text-[#3A3F3A]'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1 border-t border-[#D5D9D5]">
              <p className="text-xs font-medium text-[#687068] mb-3 mt-3">Financials</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Est. Value (£)</label>
                  <input type="number" value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Properties</label>
                  <input type="number" value={propertiesCount} onChange={e => setPropertiesCount(e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Monthly Rent (£)</label>
                  <input type="number" value={expectedRent} onChange={e => setExpectedRent(e.target.value)} placeholder="0" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-[#D5D9D5]">
              <p className="text-xs font-medium text-[#687068] mb-3 mt-3">Follow-up & Notes</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Follow-up Date</label>
                  <input type="datetime-local" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this lead..." rows={3} maxLength={500} className={`${inputCls} resize-none`} />
                  <p className="text-xs text-[#94A3B8] mt-1 text-right">{notes.length}/500</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#D5D9D5] bg-[#FBF9F4] rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#D5D9D5] text-[#687068] text-sm font-medium rounded-lg hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {saving ? 'Adding...' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}