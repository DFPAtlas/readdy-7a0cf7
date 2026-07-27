'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabaseClient';
import { isDemoAccount } from '@/lib/demoMode';
import { getDocumentStatusConfig } from '@/lib/documentSystem';
import DocumentSummary from '@/components/dashboard/DocumentSummary';
import DocumentActionCentre from '@/components/dashboard/DocumentActionCentre';
import {
  allSignatureDocuments as mockDocs,
  signatureStatusConfig,
  signatureTypeConfig,
  documentTypes as mockDocTypes,
  propertiesForSignatures as mockProps,
  SignatureDocument,
  SignatureParty,
} from './SignatureData';

const statusFilterOptions = ['All', 'Draft', 'Sent', 'Viewed', 'Signed', 'Completed'];

function pad(num: number) { return num < 10 ? `0${num}` : `${num}`; }

function mapDocType(t: string) {
  const l = (t || '').toLowerCase();
  if (l.includes('tenancy') || l.includes('agreement')) return 'Tenancy Agreement';
  if (l.includes('contractor')) return 'Contractor Agreement';
  if (l.includes('compliance') || l.includes('certificate')) return 'Compliance Document';
  if (l.includes('inspection') || l.includes('report')) return 'Inspection Report';
  if (l.includes('inventory')) return 'Inventory Checklist';
  if (l.includes('deposit')) return 'Deposit Certificate';
  if (l.includes('notice')) return 'Notice';
  return 'Addendum';
}

const now = new Date();

export default function SignaturesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<SignatureDocument | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showAuditView, setShowAuditView] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<SignatureDocument[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>(mockDocTypes);

  useEffect(() => {
    if (isDemoAccount()) { setDocuments(mockDocs); setProperties(mockProps); setLoading(false); return; }
    async function fetchData() {
      try { setLoading(true);
        const { data: sigs, error: sigErr } = await supabase.from('signatures').select('id, document_name, document_type, property_id, tenancy_id, status, created_by, signed_by, signed_at, created_at, expires_at, storage_path');
        if (sigErr) throw sigErr;
        if (!sigs || sigs.length === 0) { setDocuments([]); setProperties([]); setLoading(false); return; }
        const propIds = [...new Set(sigs.map((s: any) => s.property_id).filter(Boolean))];
        const { data: props } = await supabase.from('properties').select('id, line1, city, postcode').in('id', propIds);
        const propMap = new Map<string, any>(); (props || []).forEach((p: any) => propMap.set(p.id, p));
        const builtProps = [{ id: 'all', name: 'All Properties' }]; propMap.forEach(p => builtProps.push({ id: p.id, name: p.line1 || p.id.slice(0, 8) })); setProperties(builtProps);
        const typeSet = new Set<string>(); typeSet.add('All');
        const built: SignatureDocument[] = (sigs || []).map((s: any) => {
          const prop = propMap.get(s.property_id); const propName = prop ? prop.line1 : s.property_id?.slice(0, 8) || 'Unknown';
          const dt = mapDocType(s.document_type); const ds = ['Draft', 'Sent', 'Viewed', 'Signed', 'Completed'].includes(s.status) ? s.status : 'Draft'; typeSet.add(dt);
          const parties: SignatureParty[] = [];
          if (s.signed_by) parties.push({ id: `p-${s.id}-signer`, name: 'Signer', role: 'Signer', email: '', signed: true, signedAt: s.signed_at ? new Date(s.signed_at).toISOString().replace('T', ' ').slice(0, 16) : null, signatureImage: null, viewedAt: s.signed_at ? new Date(s.signed_at).toISOString().replace('T', ' ').slice(0, 16) : null });
          return { id: s.id, title: s.document_name || 'Untitled', type: dt, status: ds, propertyName: propName, propertyId: s.property_id || '', parties, sentDate: s.status !== 'draft' ? new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null, signedDate: s.signed_at ? new Date(s.signed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null, completedDate: ds === 'Completed' ? new Date(s.signed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null, expiryDate: s.expires_at ? new Date(s.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', fileSize: '—', fileType: 'PDF', createdBy: 'User', createdByRole: 'Agent', createdAt: new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), auditTrail: [], description: '' };
        });
        setDocuments(built); setDocumentTypes(['All', ...Array.from(typeSet).filter(t => t !== 'All').sort()]);
      } catch (err: any) { setError(err.message || 'Failed to load'); } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const filtered = documents.filter(d => {
    const s = search.toLowerCase();
    return (s === '' || d.title.toLowerCase().includes(s) || d.type.toLowerCase().includes(s) || d.propertyName.toLowerCase().includes(s)) && (statusFilter === 'All' || d.status === statusFilter) && (typeFilter === 'All' || d.type === typeFilter) && (propertyFilter === 'all' || d.propertyId === propertyFilter);
  });

  const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const pendingCount = documents.filter(d => d.status === 'Sent' || d.status === 'Viewed').length;
  const signedCount = documents.filter(d => d.status === 'Signed').length;
  const completedCount = documents.filter(d => d.status === 'Completed').length;
  const overdueCount = documents.filter(d => (d.status === 'Sent' || d.status === 'Viewed' || d.status === 'Signed') && d.expiryDate !== '—' && d.expiryDate < nowStr).length;

  const summaryCards = [
    { label: 'All Documents', value: documents.length, icon: 'ri-file-list-3-line', color: 'text-[#C28A78]', bg: 'bg-[#C28A78]/10' },
    { label: 'Pending', value: pendingCount, icon: 'ri-time-line', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
    { label: 'Partially Signed', value: signedCount, icon: 'ri-pen-nib-line', color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10' },
    { label: 'Completed', value: completedCount, icon: 'ri-check-double-line', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
    { label: 'Overdue', value: overdueCount, icon: 'ri-error-warning-line', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
  ];

  const sigActions = documents.filter(d => d.status === 'Sent' || d.status === 'Viewed').slice(0, 6).map(d => ({
    id: d.id, documentName: d.title, documentType: d.type, relatedRecord: d.propertyName,
    issue: d.status === 'Sent' ? 'Awaiting first signature' : 'Viewed but not signed',
    responsiblePerson: d.parties.filter(p => !p.signed).map(p => p.name).join(', '),
    deadline: d.expiryDate, priority: (d.expiryDate !== '—' && d.expiryDate < nowStr ? 'critical' : 'high') as 'critical' | 'high' | 'medium',
    actionLabel: 'Remind',
  }));

  const handleSign = () => { setSignSuccess(true); setTimeout(() => { setSignSuccess(false); setShowSignModal(false); setSelectedDoc(null); }, 1500); };
  const handleSend = () => { setSendSuccess(true); setTimeout(() => { setSendSuccess(false); setShowSendModal(false); }, 1500); };
  const handleCreate = () => { setCreateSuccess(true); setTimeout(() => { setCreateSuccess(false); setShowCreateModal(false); }, 1500); };

  if (loading) return <DashboardShell><div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div><span className="ml-3 text-sm text-[#687068]">Loading signatures...</span></div></DashboardShell>;
  if (error) return <DashboardShell><div className="text-center py-20"><div className="w-14 h-14 mx-auto mb-4 bg-[#FEF2F2] rounded-full flex items-center justify-center"><i className="ri-error-warning-line text-[#C46868] text-2xl"></i></div><p className="text-sm font-medium text-[#C46868]">Failed to load signatures</p><p className="text-xs text-[#687068] mt-1">{error}</p><button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#C28A78] font-medium hover:underline cursor-pointer">Try again</button></div></DashboardShell>;

  return (
    <DashboardShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-[#3A3F3A]">Digital Signatures</h1><p className="text-sm text-[#687068] mt-1">Manage electronic signatures and document workflows</p></div>
          <button onClick={() => setShowCreateModal(true)} className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line text-sm"></i></div>
            New Document
          </button>
        </div>

        <DocumentSummary cards={summaryCards} />

        {sigActions.length > 0 && <DocumentActionCentre actions={sigActions} />}

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-search-line text-[#94A3B8] text-sm"></i></div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
            {search && <button onClick={() => setSearch('')} className="w-4 h-4 flex items-center justify-center cursor-pointer"><i className="ri-close-line text-[#94A3B8] text-xs"></i></button>}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none pr-8 cursor-pointer">
              {statusFilterOptions.map(s => <option key={s} value={s}>{s} ({s === 'All' ? documents.length : documents.filter(d => d.status === s).length})</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] outline-none pr-8 cursor-pointer">
              {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                <th className="text-left px-4 py-3 font-medium text-[#687068]">Document</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068]">Type</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068] hidden md:table-cell">Signers</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068] hidden lg:table-cell">Property</th>
                <th className="text-right px-4 py-3 font-medium text-[#687068]">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {filtered.map(doc => (
                  <tr key={doc.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-4 py-3 cursor-pointer" onClick={() => { setSelectedDoc(doc); setShowAuditView(false); }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-text-line text-[#C28A78] text-sm"></i></div></div>
                        <div className="min-w-0"><p className="font-medium text-[#3A3F3A] text-sm truncate">{doc.title}</p><p className="text-xs text-[#94A3B8]">{doc.fileSize} · {doc.fileType}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${signatureTypeConfig[doc.type]?.bg || 'bg-[#F1F5F9]'} ${signatureTypeConfig[doc.type]?.color || 'text-[#687068]'}`}>{doc.type}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${signatureStatusConfig[doc.status]?.bg || 'bg-[#F1F5F9]'} ${signatureStatusConfig[doc.status]?.color || 'text-[#687068]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${signatureStatusConfig[doc.status]?.dot || 'bg-[#687068]'}`}></span>{doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        {doc.parties.length === 0 ? <span className="text-xs text-[#94A3B8]">—</span> : doc.parties.map((p, idx) => (
                          <div key={p.id} className="flex items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${p.signed ? 'bg-[#7A9A7E]' : 'bg-[#94A3B8]'}`} title={`${p.name} ${p.signed ? 'Signed' : 'Pending'}`}>{p.name.charAt(0)}</div>
                            {idx < doc.parties.length - 1 && <div className={`w-3 h-0.5 ${p.signed ? 'bg-[#7A9A7E]' : 'bg-[#D5D9D5]'}`}></div>}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#687068] hidden lg:table-cell">{doc.propertyName}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedDoc(doc); setShowAuditView(false); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title="View"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line text-[#C28A78] text-sm"></i></div></button>
                        {doc.status !== 'Completed' && doc.status !== 'Draft' && (
                          <button onClick={() => { setSelectedDoc(doc); setShowSendModal(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title="Send Reminder"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-send-plane-line text-[#3B82F6] text-sm"></i></div></button>
                        )}
                        <button onClick={() => { setSelectedDoc(doc); setShowAuditView(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title="Audit Trail"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line text-[#8B5CF6] text-sm"></i></div></button>
                        {doc.status === 'Completed' && <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title="Download"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line text-[#7A9A7E] text-sm"></i></div></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center"><div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-file-list-3-line text-[#94A3B8] text-xl"></i></div></div><p className="text-sm text-[#94A3B8]">{documents.length === 0 ? 'No signature documents yet — create your first above' : 'No documents match your filters'}</p></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedDoc && !showSignModal && !showSendModal && !showAuditView && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedDoc(null)}></div>
          <div className="relative bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-file-text-line text-[#C28A78] text-lg"></i></div></div>
                <div><h2 className="font-semibold text-[#3A3F3A] text-sm">{selectedDoc.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${signatureTypeConfig[selectedDoc.type]?.bg || 'bg-[#F1F5F9]'} ${signatureTypeConfig[selectedDoc.type]?.color || 'text-[#687068]'}`}>{selectedDoc.type}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${signatureStatusConfig[selectedDoc.status]?.bg || 'bg-[#F1F5F9]'} ${signatureStatusConfig[selectedDoc.status]?.color || 'text-[#687068]'}`}><span className={`w-1 h-1 rounded-full ${signatureStatusConfig[selectedDoc.status]?.dot || 'bg-[#687068]'}`}></span>{selectedDoc.status}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#687068]"></i></div></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-6 text-center">
                <div className="w-14 h-14 bg-[#C28A78]/10 rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-7 h-7 flex items-center justify-center"><i className="ri-file-text-line text-[#C28A78] text-xl"></i></div></div>
                <p className="text-sm font-medium text-[#3A3F3A]">{selectedDoc.title}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{selectedDoc.fileSize} · {selectedDoc.fileType}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Signing Parties</h3>
                <div className="space-y-2">
                  {selectedDoc.parties.length === 0 ? <p className="text-xs text-[#94A3B8]">No parties assigned</p> : selectedDoc.parties.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#FBF9F4] rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${p.signed ? 'bg-[#7A9A7E]' : 'bg-[#94A3B8]'}`}>{p.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><p className="text-sm font-medium text-[#3A3F3A]">{p.name}</p><span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{p.role}</span>
                          {p.signed ? <span className="text-[10px] font-medium text-[#7A9A7E] bg-[#7A9A7E]/10 px-2 py-0.5 rounded-full">Signed</span> : <span className="text-[10px] font-medium text-[#D4A85C] bg-[#D4A85C]/10 px-2 py-0.5 rounded-full">Pending</span>}
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{p.email || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#94A3B8] mb-1">Property</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.propertyName}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Created</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.createdAt}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Sent</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.sentDate || 'Not sent'}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Expiry</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.expiryDate}</p></div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setShowAuditView(true)} className="flex items-center gap-2 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line text-sm"></i></div>Audit Trail</button>
                {selectedDoc.status !== 'Completed' && selectedDoc.status !== 'Draft' && (
                  <>
                    <button onClick={() => setShowSendModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] text-white rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-send-plane-line text-sm"></i></div>Send Reminder</button>
                    <button onClick={() => setShowSignModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-pen-nib-line text-sm"></i></div>Sign Document</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit View */}
      {showAuditView && selectedDoc && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAuditView(false)}></div>
          <div className="relative bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center flex-shrink-0"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-shield-check-line text-[#8B5CF6] text-lg"></i></div></div>
                <div><h2 className="font-semibold text-[#3A3F3A] text-sm">Audit Trail</h2><p className="text-xs text-[#94A3B8]">{selectedDoc.title}</p></div>
              </div>
              <button onClick={() => setShowAuditView(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#687068]"></i></div></button>
            </div>
            <div className="p-5">
              {selectedDoc.auditTrail.length === 0 ? <p className="text-center text-sm text-[#94A3B8] py-8">No audit trail available</p> : (
                <div className="space-y-3">
                  {selectedDoc.auditTrail.map((entry, idx) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${entry.action.includes('Signature') ? 'bg-[#14B8A6]/10' : entry.action.includes('Sent') ? 'bg-[#3B82F6]/10' : entry.action.includes('Completed') ? 'bg-[#7A9A7E]/10' : entry.action.includes('Viewed') ? 'bg-[#8B5CF6]/10' : 'bg-[#F1F5F9]'}`}>
                          <div className="w-4 h-4 flex items-center justify-center"><i className={`${entry.action.includes('Signature') ? 'ri-pen-nib-line text-[#14B8A6]' : entry.action.includes('Sent') ? 'ri-send-plane-line text-[#3B82F6]' : entry.action.includes('Completed') ? 'ri-check-double-line text-[#7A9A7E]' : entry.action.includes('Viewed') ? 'ri-eye-line text-[#8B5CF6]' : 'ri-file-text-line text-[#687068]'} text-xs`}></i></div>
                        </div>
                        {idx < selectedDoc.auditTrail.length - 1 && <div className="w-0.5 h-full bg-[#D5D9D5] mt-1"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between"><p className="text-sm font-medium text-[#3A3F3A]">{entry.action}</p><span className="text-xs text-[#94A3B8]">{entry.timestamp}</span></div>
                        <p className="text-xs text-[#687068] mt-0.5">{entry.user} ({entry.userRole})</p><p className="text-xs text-[#94A3B8] mt-0.5">{entry.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sign Modal */}
      {showSignModal && selectedDoc && <SignatureModal doc={selectedDoc} onClose={() => setShowSignModal(false)} onSuccess={handleSign} success={signSuccess} />}

      {/* Send Modal */}
      {showSendModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]"><h2 className="font-semibold text-[#3A3F3A]">Send Reminder</h2><button onClick={() => setShowSendModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#687068]"></i></div></button></div>
            <div className="p-5 space-y-4">
              {sendSuccess ? (
                <div className="text-center py-4"><div className="w-12 h-12 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-check-line text-[#7A9A7E] text-xl"></i></div></div><p className="text-sm font-medium text-[#7A9A7E]">Reminder sent successfully!</p></div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-[#FBF9F4] rounded-lg"><div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-text-line text-[#C28A78] text-xs"></i></div></div><div className="min-w-0"><p className="text-sm font-medium text-[#3A3F3A] truncate">{selectedDoc.title}</p><span className="text-[10px] text-[#94A3B8]">{selectedDoc.type}</span></div></div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Pending Parties</label>
                    <div className="space-y-2">
                      {selectedDoc.parties.filter(p => !p.signed).length === 0 ? <p className="text-xs text-[#94A3B8]">All parties have signed</p> : selectedDoc.parties.filter(p => !p.signed).map(p => (
                        <label key={p.id} className="flex items-center gap-3 p-2 bg-[#FBF9F4] rounded-lg cursor-pointer"><div className="w-5 h-5 rounded border border-[#D5D9D5] bg-[#C28A78] flex items-center justify-center"><i className="ri-check-line text-white text-xs"></i></div><div><p className="text-sm text-[#3A3F3A] font-medium">{p.name}</p><p className="text-xs text-[#94A3B8]">{p.role}</p></div></label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setShowSendModal(false)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors cursor-pointer">Cancel</button>
                    <button onClick={handleSend} className="flex-1 px-4 py-2.5 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors cursor-pointer">Send Reminder</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]"><h2 className="font-semibold text-[#3A3F3A]">New Signature Document</h2><button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#687068]"></i></div></button></div>
            <div className="p-5 space-y-4">
              {createSuccess ? (
                <div className="text-center py-4"><div className="w-12 h-12 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-check-line text-[#7A9A7E] text-xl"></i></div></div><p className="text-sm font-medium text-[#7A9A7E]">Document created successfully!</p></div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Document Type</label>
                    <div className="grid grid-cols-2 gap-2">{documentTypes.filter((t: string) => t !== 'All').slice(0, 8).map((type: string) => (
                      <button key={type} className="text-xs font-medium px-3 py-2 rounded-lg border border-[#D5D9D5] text-center text-[#687068] hover:bg-[#FBF9F4] transition-colors cursor-pointer">{type}</button>
                    ))}</div>
                  </div>
                  <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Document Title</label><input type="text" placeholder="e.g., Tenancy Agreement - 12 Rose Avenue" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" /></div>
                  <div><label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Upload Document</label>
                    <div className="border-2 border-dashed border-[#D5D9D5] rounded-lg p-6 text-center hover:border-[#C28A78]/40 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-2"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-file-upload-line text-[#94A3B8] text-lg"></i></div></div>
                      <p className="text-sm text-[#687068]">Click to upload or drag and drop</p><p className="text-xs text-[#94A3B8] mt-1">PDF up to 50MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors cursor-pointer">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors cursor-pointer">Create & Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function SignatureModal({ doc, onClose, onSuccess, success }: { doc: SignatureDocument; onClose: () => void; onSuccess: () => void; success: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.beginPath(); ctx.moveTo(clientX - rect.left, clientY - rect.top); setIsDrawing(true);
  };
  const draw = (e: any) => {
    if (!isDrawing) return; const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#3A3F3A'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); setHasDrawn(true);
  };
  const stopDrawing = () => { setIsDrawing(false); };
  const clearCanvas = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); setHasDrawn(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]"><h2 className="font-semibold text-[#3A3F3A]">Sign Document</h2><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#687068]"></i></div></button></div>
        <div className="p-5 space-y-4">
          {success ? (
            <div className="text-center py-4"><div className="w-12 h-12 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-check-line text-[#7A9A7E] text-xl"></i></div></div><p className="text-sm font-medium text-[#7A9A7E]">Document signed successfully!</p></div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-[#FBF9F4] rounded-lg"><div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-text-line text-[#C28A78] text-xs"></i></div></div><div className="min-w-0"><p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.title}</p><p className="text-xs text-[#94A3B8]">Sign as: LetHub Agency (Agent)</p></div></div>
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Your Signature</label>
                <div className="border border-[#D5D9D5] rounded-lg bg-white">
                  <canvas ref={canvasRef} width={480} height={160} className="w-full rounded-lg cursor-crosshair touch-none"
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button onClick={clearCanvas} className="text-xs text-[#687068] hover:text-[#3A3F3A] transition-colors flex items-center gap-1 cursor-pointer"><div className="w-3 h-3 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>Clear</button>
                  <p className="text-xs text-[#94A3B8]">Draw your signature above</p>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${agreed ? 'bg-[#C28A78] border-[#C28A78]' : 'border-[#D5D9D5]'}`}>{agreed && <i className="ri-check-line text-white text-xs"></i>}</div>
                <span className="text-sm text-[#687068]">I confirm that I have reviewed this document and agree to sign it electronically.</span>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors cursor-pointer">Cancel</button>
                <button onClick={onSuccess} disabled={!hasDrawn || !agreed} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Sign Document</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}