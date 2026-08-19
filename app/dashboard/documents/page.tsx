'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabaseClient';
import DemoHelperTip from '@/components/dashboard/DemoHelperTip';
import { isDemoAccount, showDemoBlockedMessage } from '@/lib/demoMode';
import { useEntitlements } from '@/lib/useEntitlements';
import { showRlsError } from '@/lib/rlsErrorHandler';
import { getTypeStyle, getDocumentStatusConfig } from '@/lib/documentSystem';
import DocumentSummary from '@/components/dashboard/DocumentSummary';
import DocumentActionCentre from '@/components/dashboard/DocumentActionCentre';
import { allDocuments, documentFolders, documentTypes, propertiesForDocs, DocumentItem } from './DocumentData';

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadFolder, setUploadFolder] = useState('Tenancy Agreements');
  const [uploadType, setUploadType] = useState('Tenancy Agreement');
  const [uploadProperty, setUploadProperty] = useState('p1');
  const [shareEmail, setShareEmail] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [docToShare, setDocToShare] = useState<DocumentItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const { isReadOnly } = useEntitlements();
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadLinkLandlord, setUploadLinkLandlord] = useState('');
  const [uploadLinkTenant, setUploadLinkTenant] = useState('');
  const [uploadLinkTenancy, setUploadLinkTenancy] = useState('');
  const [uploadLinkCompliance, setUploadLinkCompliance] = useState('');
  const [liveDocuments, setLiveDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveProperties, setLiveProperties] = useState<{ id: string; name: string }[]>([]);
  const [liveLandlords, setLiveLandlords] = useState<{ id: string; name: string; subtitle: string }[]>([]);
  const [liveTenants, setLiveTenants] = useState<{ id: string; name: string; subtitle: string }[]>([]);
  const [liveTenancies, setLiveTenancies] = useState<{ id: string; name: string; subtitle: string }[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [activeActionFilter, setActiveActionFilter] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoAccount()) { setDemoMode(true); setLiveDocuments(allDocuments); setLoading(false); return; }
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true); setError(null);
    try {
      if (demoMode) { setLiveDocuments(allDocuments); setLoading(false); return; }
      const { data: docs, error: docsErr } = await supabase.from('documents').select('id, property_id, tenancy_id, kind, storage_path, issued_on, expires_on, created_at, file_size').order('created_at', { ascending: false });
      if (docsErr) throw docsErr;
      const { data: compDocs, error: compErr } = await supabase.from('compliance_documents').select('id, property_id, document_id, document_type, certificate_number, issued_date, expiry_date, verification_status, uploaded_file_url, created_at, file_size').order('created_at', { ascending: false });
      if (compErr) throw compErr;
      const propIds = [...new Set([...(docs || []).map(d => d.property_id).filter(Boolean), ...(compDocs || []).map(c => c.property_id).filter(Boolean)])] as string[];
      const { data: properties, error: propErr } = await supabase.from('properties').select('id, line1, city, postcode').in('id', propIds.length > 0 ? propIds : ['00000000-0000-0000-0000-000000000000']);
      if (propErr) throw propErr;
      const propMap: Record<string, any> = {};
      (properties || []).forEach(p => { propMap[p.id] = p; });
      setLiveProperties((properties || []).map(p => ({ id: p.id, name: `${p.line1}${p.city ? `, ${p.city}` : ''}` })));
      const kindLabelMap: Record<string, string> = { tenancy_agreement: 'Tenancy Agreement', gas_safety: 'Gas Safety', eicr: 'EICR', epc: 'EPC' };
      const kindFolderMap: Record<string, string> = { tenancy_agreement: 'Tenancy Agreements', gas_safety: 'Compliance Certificates', eicr: 'Compliance Certificates', epc: 'Compliance Certificates' };
      const kindIconMap: Record<string, string> = { tenancy_agreement: 'ri-file-text-line', gas_safety: 'ri-file-shield-line', eicr: 'ri-file-shield-line', epc: 'ri-file-shield-line' };
      const kindColorMap: Record<string, string> = { tenancy_agreement: 'bg-[#3B82F6]', gas_safety: 'bg-[#10B981]', eicr: 'bg-[#10B981]', epc: 'bg-[#10B981]' };
      const formatSize = (bytes: number | null): string => { if (!bytes) return '—'; if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`; return `${(bytes / 1048576).toFixed(1)} MB`; };
      const docItems: DocumentItem[] = (docs || []).map(d => {
        const prop = propMap[d.property_id]; const kind = d.kind || 'other';
        return {
          id: d.id, name: `${kindLabelMap[kind] || kind} - ${prop ? prop.line1 : 'Unknown'}`, type: kindLabelMap[kind] || 'Other', folder: kindFolderMap[kind] || 'Other',
          propertyId: d.property_id || 'all', propertyName: prop ? `${prop.line1}, ${prop.city || ''}` : 'Unknown',
          date: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          size: formatSize(d.file_size), description: d.storage_path || '', fileType: 'pdf', icon: kindIconMap[kind] || 'ri-file-line', color: kindColorMap[kind] || 'bg-[#94A3B8]',
          uploadedBy: 'System', uploadedByRole: 'Agent', versions: [{ version: 1, date: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', uploadedBy: 'System', uploadedByRole: 'Agent', size: '—', notes: '' }], access: ['agent'],
        };
      });
      const compItems: DocumentItem[] = (compDocs || []).map((c: any) => ({
        id: c.id, name: c.document_type || 'Compliance Document', type: c.document_type || 'Other', folder: 'Compliance Certificates',
        propertyId: c.property_id || 'all', propertyName: c.property_id && propMap[c.property_id] ? propMap[c.property_id].line1 : 'Unknown',
        date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        size: formatSize(c.file_size), description: c.verification_status || 'pending', fileType: 'pdf', icon: 'ri-file-shield-line', color: 'bg-[#10B981]',
        uploadedBy: 'System', uploadedByRole: 'Agent', versions: [{ version: 1, date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', uploadedBy: 'System', uploadedByRole: 'Agent', size: '—', notes: '' }], access: ['agent'],
      }));
      setLiveDocuments([...docItems, ...compItems]);
    } catch (err: any) { setError(err.message || 'Failed to load documents'); } finally { setLoading(false); }
  };

  const handleUploadToSupabase = async () => {
    if (!uploadDocName) return; setUploading(true);
    try {
      if (uploadedFile) {
        const bucket = uploadFolder === 'Compliance Certificates' ? 'compliance-documents' : uploadFolder === 'Inspection Reports' ? 'inspection-photos' : 'property-documents';
        const filePath = `${Date.now()}_${uploadedFile.name}`;
        const { error: uploadErr } = await supabase.storage.from(bucket).upload(filePath, uploadedFile);
        if (uploadErr) throw uploadErr;
        const kindMap: Record<string, string> = { 'Tenancy Agreement': 'tenancy_agreement', 'Gas Safety': 'gas_safety', 'EICR': 'eicr', 'EPC': 'epc' };
        await supabase.from('documents').insert({ property_id: uploadProperty !== 'all' ? uploadProperty : null, tenancy_id: uploadLinkTenancy || null, kind: kindMap[uploadType] || 'tenancy_agreement', storage_path: filePath, file_size: uploadedFile.size });
      }
    } catch (err: any) { if (showRlsError(err, 'documents')) { setUploading(false); return; } }
    setUploading(false); setUploadSuccess(true);
    setTimeout(() => { setUploadSuccess(false); setShowUploadModal(false); setUploadDocName(''); setUploadedFile(null); loadDocuments(); }, 1500);
  };

  const handleUploadDragOver = (e: React.DragEvent) => { e.preventDefault(); setUploadDragOver(true); };
  const handleUploadDragLeave = () => { setUploadDragOver(false); };
  const handleUploadDrop = (e: React.DragEvent) => { e.preventDefault(); setUploadDragOver(false); const file = e.dataTransfer.files[0]; if (file) { setUploadedFile(file); if (!uploadDocName) setUploadDocName(file.name.replace(/\.[^/.]+$/, '')); } };

  const displayDocs = demoMode ? allDocuments : liveDocuments;
  const displayFolders = demoMode ? documentFolders : [{ id: 'all', name: 'All Documents', icon: 'ri-folder-line' }, { id: 'Tenancy Agreements', name: 'Tenancy Agreements', icon: 'ri-file-text-line' }, { id: 'Compliance Certificates', name: 'Compliance Certificates', icon: 'ri-file-shield-line' }, { id: 'Other', name: 'Other', icon: 'ri-folder-line' }];
  const displayTypes = demoMode ? documentTypes : ['All', ...new Set(liveDocuments.map(d => d.type))];
  const displayProperties = demoMode ? propertiesForDocs : [{ id: 'all', name: 'All Properties' }, ...liveProperties.map(p => ({ id: p.id, name: p.name }))];

  const filtered = displayDocs.filter(d => {
    const s = search.toLowerCase();
    const matchesSearch = s === '' || d.name.toLowerCase().includes(s) || d.description.toLowerCase().includes(s) || d.type.toLowerCase().includes(s) || d.propertyName.toLowerCase().includes(s);
    return matchesSearch && (selectedFolder === 'all' || d.folder === selectedFolder) && (typeFilter === 'All' || d.type === typeFilter) && (propertyFilter === 'all' || d.propertyId === propertyFilter);
  }).sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : new Date(b.date).getTime() - new Date(a.date).getTime());

  const folderCounts = displayFolders.reduce((acc, f) => { acc[f.id] = f.id === 'all' ? displayDocs.length : displayDocs.filter(d => d.folder === f.id).length; return acc; }, {} as Record<string, number>);

  const summaryCards = [
    { label: 'Total Documents', value: displayDocs.length, icon: 'ri-file-list-3-line', color: 'text-[#C28A78]', bg: 'bg-[#C28A78]/10' },
    { label: 'Compliance Certs', value: displayDocs.filter(d => d.folder === 'Compliance Certificates').length, icon: 'ri-shield-check-line', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', filterKey: 'compliance' },
    { label: 'Tenancy Agreements', value: displayDocs.filter(d => d.folder === 'Tenancy Agreements').length, icon: 'ri-file-text-line', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', filterKey: 'tenancy' },
    { label: 'Expiring or Expired', value: displayDocs.filter(d => d.description?.toLowerCase().includes('expir')).length, icon: 'ri-time-line', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', filterKey: 'expiring' },
    { label: 'Inspections', value: displayDocs.filter(d => d.folder === 'Inspection Reports').length, icon: 'ri-search-eye-line', color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', filterKey: 'inspection' },
  ];

  const documentActions = displayDocs.filter(d => d.description?.toLowerCase().includes('expir') || d.type === 'EPC' && d.description?.includes('2016')).map(d => ({
    id: d.id, documentName: d.name, documentType: d.type, relatedRecord: d.propertyName,
    issue: d.type === 'EPC' && d.description?.includes('2016') ? 'Certificate expired — renewal required' : 'Approaching expiry date',
    responsiblePerson: d.uploadedBy, deadline: d.date,
    priority: (d.type === 'EPC' && d.description?.includes('2016') ? 'critical' : d.description?.includes('Expir') ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
    actionLabel: d.type === 'EPC' ? 'Renew Now' : 'Review',
  })).slice(0, 6);

  const handleDelete = async () => {
    if (demoMode) { showDemoBlockedMessage(); setShowDeleteModal(false); setDocToDelete(null); return; }
    try { await supabase.from('documents').delete().eq('id', docToDelete?.id); } catch (err) { console.error(err); }
    setShowDeleteModal(false); setDocToDelete(null); loadDocuments();
  };
  const handleShare = () => {
    if (!shareEmail) return; setShareSuccess(true);
    setTimeout(() => { setShareSuccess(false); setShowShareModal(false); setShareEmail(''); setDocToShare(null); }, 1500);
  };

  if (loading) {
    return <DashboardShell><div className="flex items-center justify-center py-32"><div className="text-center"><div className="w-10 h-10 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-sm text-[#687068]">Loading documents...</p></div></div></DashboardShell>;
  }
  if (error) {
    return <DashboardShell><div className="flex items-center justify-center py-32"><div className="text-center"><div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line text-[#EF4444] text-xl"></i></div></div><p className="text-sm font-medium text-[#3A3F3A]">Failed to load documents</p><p className="text-xs text-[#94A3B8] mt-1">{error}</p><button onClick={loadDocuments} className="mt-3 text-sm font-medium text-[#C28A78] hover:underline cursor-pointer">Retry</button></div></div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="flex gap-6 h-[calc(100vh-48px)]">
        <aside className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[200px]'} flex-shrink-0 bg-white rounded-xl border border-[#D5D9D5] flex flex-col overflow-hidden`}>
          <div className="flex items-center justify-between px-3 py-3 border-b border-[#D5D9D5]">
            {!sidebarCollapsed && <p className="text-sm font-semibold text-[#3A3F3A]">Folders</p>}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
              <div className="w-4 h-4 flex items-center justify-center"><i className={`${sidebarCollapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'} text-[#94A3B8] text-sm`}></i></div>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {displayFolders.map(f => (
              <button key={f.id} onClick={() => setSelectedFolder(f.id)} className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer ${selectedFolder === f.id ? 'bg-[#C28A78]/5 text-[#C28A78] font-medium' : 'text-[#687068] hover:bg-[#FBF9F4]'} ${sidebarCollapsed ? 'justify-center' : ''}`} title={f.name}>
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0"><i className={`${f.icon} ${selectedFolder === f.id ? 'text-[#C28A78]' : 'text-[#94A3B8]'}`}></i></div>
                {!sidebarCollapsed && <span className="flex-1 text-left truncate text-xs">{f.name}</span>}
                {!sidebarCollapsed && <span className="text-[10px] text-[#94A3B8] font-medium">{folderCounts[f.id] || 0}</span>}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Documents</h1>
              <p className="text-sm text-[#687068] mt-0.5">{filtered.length} documents in {selectedFolder === 'all' ? 'all folders' : selectedFolder}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/document-builder" className="flex items-center gap-1.5 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-add-line text-sm"></i></div>
                Create from Template
              </Link>
              <button
                onClick={() => { if (isReadOnly) { alert('Your trial has ended. Upgrade to continue.'); return; } if (demoMode) { showDemoBlockedMessage(); return; } setShowUploadModal(true); }}
                className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-upload-cloud-line text-sm"></i></div>
                Upload Document
              </button>
            </div>
          </div>

          {demoMode && (
            <DemoHelperTip id="documents-overview" title="Document Management">Upload, organize and share documents across your portfolio. Documents are linked to properties, tenancies and people.</DemoHelperTip>
          )}

          <div className="mb-4">
            <DocumentSummary cards={summaryCards} onCardClick={(key) => { if (key === 'compliance') setSelectedFolder('Compliance Certificates'); if (key === 'tenancy') setSelectedFolder('Tenancy Agreements'); if (key === 'inspection') setSelectedFolder('Inspection Reports'); }} activeFilter={activeActionFilter || undefined} />
          </div>

          {documentActions.length > 0 && (
            <div className="mb-4">
              <DocumentActionCentre actions={documentActions} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-shrink-0">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-search-line text-[#94A3B8] text-sm"></i></div>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
              {search && <button onClick={() => setSearch('')} className="w-4 h-4 flex items-center justify-center cursor-pointer"><i className="ri-close-line text-[#94A3B8] text-xs"></i></button>}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5 border border-[#D5D9D5] rounded-lg bg-white p-0.5">
                <button onClick={() => setViewMode('list')} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#C28A78] text-white' : 'text-[#94A3B8] hover:bg-[#F1F5F9]'}`} title="List"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-list-check text-sm"></i></div></button>
                <button onClick={() => setViewMode('grid')} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#C28A78] text-white' : 'text-[#94A3B8] hover:bg-[#F1F5F9]'}`} title="Grid"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-grid-line text-sm"></i></div></button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#D5D9D5] p-16 text-center">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-folder-line text-[#94A3B8] text-xl"></i></div></div>
                <p className="text-sm text-[#94A3B8] mb-1">No documents uploaded yet</p>
                <p className="text-xs text-[#94A3B8]">Upload your first document to get started</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                        <th className="text-left px-4 py-3 font-medium text-[#687068] w-[320px]">Document</th>
                        <th className="text-left px-4 py-3 font-medium text-[#687068]">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-[#687068] hidden md:table-cell">Property</th>
                        <th className="text-left px-4 py-3 font-medium text-[#687068] hidden lg:table-cell">Date</th>
                        <th className="text-right px-4 py-3 font-medium text-[#687068]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D5D9D5]">
                      {filtered.map(doc => (
                        <tr key={doc.id} className="hover:bg-[#FBF9F4] transition-colors">
                          <td className="px-4 py-3 cursor-pointer" onClick={() => { setSelectedDoc(doc); setShowDetailDrawer(true); }}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}><div className="w-4 h-4 flex items-center justify-center"><i className={`${doc.icon} text-white text-sm`}></i></div></div>
                              <div className="min-w-0"><p className="font-medium text-[#3A3F3A] text-sm truncate">{doc.name}</p><p className="text-xs text-[#94A3B8] truncate">{doc.description}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeStyle(doc.type)}`}>{doc.type}</span></td>
                          <td className="px-4 py-3 text-[#687068] hidden md:table-cell">{doc.propertyName}</td>
                          <td className="px-4 py-3 text-[#687068] hidden lg:table-cell">{doc.date}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title="Download" onClick={e => e.stopPropagation()}><div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line text-[#C28A78] text-sm"></i></div></button>
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title="Share" onClick={e => { e.stopPropagation(); setDocToShare(doc); setShowShareModal(true); }}><div className="w-4 h-4 flex items-center justify-center"><i className="ri-share-line text-[#687068] text-sm"></i></div></button>
                              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" title="Delete" onClick={e => { e.stopPropagation(); setDocToDelete(doc); setShowDeleteModal(true); }}><div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-[#EF4444] text-sm"></i></div></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center"><div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-folder-line text-[#94A3B8] text-xl"></i></div></div><p className="text-sm text-[#94A3B8]">No documents match your filters</p></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl border border-[#D5D9D5] p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setSelectedDoc(doc); setShowDetailDrawer(true); }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}><div className="w-5 h-5 flex items-center justify-center"><i className={`${doc.icon} text-white text-lg`}></i></div></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.name}</p><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${getTypeStyle(doc.type)}`}>{doc.type}</span></div>
                    </div>
                    <p className="text-xs text-[#687068] mb-3 line-clamp-2">{doc.description}</p>
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]"><span>{doc.date}</span><span>{doc.size}</span></div>
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#D5D9D5]">
                      <button className="flex-1 flex items-center justify-center gap-1 text-xs text-[#C28A78] font-medium py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" onClick={e => e.stopPropagation()}><div className="w-3 h-3 flex items-center justify-center"><i className="ri-download-line text-xs"></i></div>Download</button>
                      <button className="flex-1 flex items-center justify-center gap-1 text-xs text-[#687068] font-medium py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer" onClick={e => { e.stopPropagation(); setDocToShare(doc); setShowShareModal(true); }}><div className="w-3 h-3 flex items-center justify-center"><i className="ri-share-line text-xs"></i></div>Share</button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="col-span-full bg-white rounded-xl border border-[#D5D9D5] p-8 text-center"><div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-folder-line text-[#94A3B8] text-xl"></i></div></div><p className="text-sm text-[#94A3B8]">No documents match your filters</p></div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {showDetailDrawer && selectedDoc && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailDrawer(false)}></div>
          <div className="relative bg-white w-full max-w-xl h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5] sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedDoc.color} rounded-lg flex items-center justify-center flex-shrink-0`}><div className="w-5 h-5 flex items-center justify-center"><i className={`${selectedDoc.icon} text-white text-lg`}></i></div></div>
                <div><h2 className="font-semibold text-[#3A3F3A] text-sm">{selectedDoc.name}</h2><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getTypeStyle(selectedDoc.type)}`}>{selectedDoc.type}</span></div>
              </div>
              <button onClick={() => { setShowDetailDrawer(false); setShowVersionDrawer(false); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#687068]"></i></div></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#94A3B8] mb-1">Property</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.propertyName}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Date</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.date}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Folder</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.folder}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Uploaded By</p><p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.uploadedBy}</p></div>
              </div>
              <div><p className="text-xs text-[#94A3B8] mb-1">Description</p><p className="text-sm text-[#3A3F3A]">{selectedDoc.description}</p></div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Access</p>
                <div className="flex items-center gap-2">{selectedDoc.access.map(role => <span key={role} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068] capitalize">{role}</span>)}</div>
              </div>
              <div>
                <button onClick={() => setShowVersionDrawer(!showVersionDrawer)} className="flex items-center gap-2 text-sm font-medium text-[#3A3F3A] mb-3 cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center"><i className={`${showVersionDrawer ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} text-[#94A3B8] text-sm`}></i></div>
                  Version History ({selectedDoc.versions.length})
                </button>
                {showVersionDrawer && (
                  <div className="space-y-2">
                    {selectedDoc.versions.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-[#FBF9F4] rounded-lg">
                        <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-line text-[#C28A78] text-xs"></i></div></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2"><p className="text-sm font-medium text-[#3A3F3A]">Version {v.version}</p>{v.version === selectedDoc.versions.length && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">Current</span>}</div>
                          <p className="text-xs text-[#687068]">{v.date} by {v.uploadedBy}</p>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors flex-shrink-0 cursor-pointer" title="Download"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line text-[#C28A78] text-xs"></i></div></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-line text-sm"></i></div>Download</button>
                <button className="flex items-center gap-1.5 px-4 py-2 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap cursor-pointer" onClick={() => { setDocToShare(selectedDoc); setShowShareModal(true); }}><div className="w-4 h-4 flex items-center justify-center"><i className="ri-share-line text-sm"></i></div>Share</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-[#C28A78] to-[#B87A68] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-upload-cloud-line text-white text-lg"></i></div>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Upload Document</h2>
                    <p className="text-xs text-white/70">Add to your document library</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-white text-base"></i></div>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {uploadSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 flex items-center justify-center"><i className="ri-check-line text-[#10B981] text-2xl"></i></div>
                  </div>
                  <p className="text-sm font-semibold text-[#10B981]">Document uploaded successfully!</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Document Name</label>
                    <input type="text" value={uploadDocName} onChange={e => setUploadDocName(e.target.value)} placeholder="e.g., Tenancy Agreement - John Smith" className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] bg-[#FAFAF8] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Folder</label>
                    <div className="grid grid-cols-2 gap-2">
                      {displayFolders.filter(f => f.id !== 'all').map(f => (
                        <button key={f.id} onClick={() => setUploadFolder(f.id)} className={`text-xs font-semibold px-3 py-2.5 rounded-xl border-2 text-center transition-colors cursor-pointer ${uploadFolder === f.id ? 'bg-[#C28A78] text-white border-[#C28A78]' : 'text-[#687068] border-[#D5D9D5] hover:border-[#C28A78]/50 bg-[#FAFAF8]'}`}>{f.name}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Document Type</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto">
                      {displayTypes.filter(t => t !== 'All').map(t => (
                        <button key={t} onClick={() => setUploadType(t)} className={`text-xs font-semibold px-3 py-2 rounded-xl border-2 text-center transition-colors cursor-pointer ${uploadType === t ? 'bg-[#C28A78] text-white border-[#C28A78]' : 'text-[#687068] border-[#D5D9D5] hover:border-[#C28A78]/50 bg-[#FAFAF8]'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Link to Property</label>
                    <div className="grid grid-cols-2 gap-2">
                      {displayProperties.filter(p => p.id !== 'all').map(p => (
                        <button key={p.id} onClick={() => setUploadProperty(p.id)} className={`text-xs font-semibold px-3 py-2 rounded-xl border-2 text-center transition-colors truncate cursor-pointer ${uploadProperty === p.id ? 'bg-[#C28A78] text-white border-[#C28A78]' : 'text-[#687068] border-[#D5D9D5] hover:border-[#C28A78]/50 bg-[#FAFAF8]'}`}>{p.name}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Select File</label>
                    <div onDragOver={handleUploadDragOver} onDragLeave={handleUploadDragLeave} onDrop={handleUploadDrop} onClick={() => document.getElementById('doc-file-input')?.click()} className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${uploadDragOver ? 'border-[#C28A78] bg-[#C28A78]/5' : 'border-[#D5D9D5] hover:border-[#C28A78]/40 bg-[#FAFAF8]'}`}>
                      <input id="doc-file-input" type="file" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) { setUploadedFile(file); if (!uploadDocName) setUploadDocName(file.name.replace(/\.[^/.]+$/, '')); } }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
                      {uploadedFile ? (
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-file-line text-[#10B981] text-lg"></i></div></div>
                          <div className="text-left"><p className="text-sm font-semibold text-[#3A3F3A]">{uploadedFile.name}</p><p className="text-xs text-[#94A3B8]">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p></div>
                          <button onClick={e => { e.stopPropagation(); setUploadedFile(null); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#FEE2E2] transition-colors cursor-pointer"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-[#EF4444] text-sm"></i></div></button>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-2"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-file-upload-line text-[#94A3B8] text-lg"></i></div></div>
                          <p className="text-sm text-[#687068]">Drag & drop or click to browse</p>
                          <p className="text-xs text-[#94A3B8] mt-1">PDF, JPG, PNG, DOC up to 50MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={() => { setShowUploadModal(false); setUploadedFile(null); }} className="flex-1 px-4 py-3 border-2 border-[#D5D9D5] rounded-xl text-sm font-semibold text-[#687068] hover:bg-[#FBF9F4] hover:border-[#C28A78] transition-colors cursor-pointer">Cancel</button>
                    <button onClick={handleUploadToSupabase} disabled={!uploadDocName || uploading} className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${!uploadDocName || uploading ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed' : 'bg-[#C28A78] text-white hover:bg-[#143828]'}`}>
                      {uploading ? <><div className="w-4 h-4 flex items-center justify-center"><i className="ri-loader-4-line animate-spin text-sm"></i></div>Uploading...</> : <><div className="w-4 h-4 flex items-center justify-center"><i className="ri-upload-cloud-line text-sm"></i></div>Upload</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-delete-bin-line text-white text-lg"></i></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Document</h3>
                    <p className="text-xs text-white/70">This action cannot be undone</p>
                  </div>
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-white text-base"></i></div>
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="bg-[#F8F6F2] rounded-xl p-4 flex items-center gap-3 mb-5">
                <div className={`w-9 h-9 ${docToDelete.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <div className="w-4 h-4 flex items-center justify-center"><i className={`${docToDelete.icon} text-white text-sm`}></i></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A]">{docToDelete.name}</p>
                  <p className="text-xs text-[#687068]">{docToDelete.propertyName}</p>
                </div>
              </div>
              <p className="text-sm text-[#687068] mb-5 text-center">Are you sure you want to permanently delete this document?</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 border-2 border-[#D5D9D5] rounded-xl text-sm font-semibold text-[#687068] hover:bg-[#FBF9F4] hover:border-[#C28A78] transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-[#EF4444] text-white rounded-xl text-sm font-semibold hover:bg-[#DC2626] transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-sm"></i></div>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && docToShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-share-line text-white text-lg"></i></div>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Share Document</h2>
                    <p className="text-xs text-white/70">Send via email to a recipient</p>
                  </div>
                </div>
                <button onClick={() => setShowShareModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line text-white text-base"></i></div>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {shareSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 flex items-center justify-center"><i className="ri-check-line text-[#10B981] text-2xl"></i></div>
                  </div>
                  <p className="text-sm font-semibold text-[#10B981]">Document shared successfully!</p>
                </div>
              ) : (
                <>
                  <div className="bg-[#F8F6F2] rounded-xl p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 ${docToShare.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <div className="w-4 h-4 flex items-center justify-center"><i className={`${docToShare.icon} text-white text-xs`}></i></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#3A3F3A] truncate">{docToShare.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getTypeStyle(docToShare.type)}`}>{docToShare.type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Recipient Email</label>
                    <input type="email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="recipient@example.com" className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#3B82F6] bg-[#FAFAF8] transition-colors" />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={() => setShowShareModal(false)} className="flex-1 px-4 py-3 border-2 border-[#D5D9D5] rounded-xl text-sm font-semibold text-[#687068] hover:bg-[#FBF9F4] transition-colors cursor-pointer">Cancel</button>
                    <button onClick={handleShare} className="flex-1 px-4 py-3 bg-[#3B82F6] text-white rounded-xl text-sm font-semibold hover:bg-[#2563EB] transition-colors cursor-pointer flex items-center justify-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-send-plane-line text-sm"></i></div>
                      Share
                    </button>
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