'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardShell from '@/components/DashboardShell';
import {
  fetchTemplates,
  extractPlaceholders,
  getPlaceholderLabel,
  getPlaceholderDefault,
  fillTemplate,
  generateDocxDownload,
  printDocument,
  DOCUMENT_TYPE_ICONS,
  DOCUMENT_CATEGORIES,
  type DocumentTemplate,
} from './DocumentBuilderData';

export default function DocumentBuilderPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [filledContent, setFilledContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState<Record<string, boolean>>({});
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTemplates().then(data => {
      setTemplates(data); setLoading(false);
      if (data.length > 0) { const init: Record<string, boolean> = {}; DOCUMENT_CATEGORIES.forEach(c => { init[c.label] = true; }); setCategoryOpen(init); }
    });
  }, []);

  const handleSelectTemplate = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template);
    const ph = extractPlaceholders(template.content); setPlaceholders(ph);
    const defaults: Record<string, string> = {}; ph.forEach(k => { defaults[k] = getPlaceholderDefault(k); }); setValues(defaults);
    setFilledContent(fillTemplate(template.content, defaults));
    setTemplatesOpen(false);
  }, []);

  const handleValueChange = (key: string, value: string) => {
    if (!selectedTemplate) return;
    const newValues = { ...values, [key]: value }; setValues(newValues);
    setFilledContent(fillTemplate(selectedTemplate.content, newValues));
  };

  const handleDownloadDocx = () => {
    if (!selectedTemplate) return;
    generateDocxDownload(filledContent, selectedTemplate.name);
  };

  const toggleCategory = (label: string) => { setCategoryOpen(prev => ({ ...prev, [label]: !prev[label] })); };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#687068]">Loading templates...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-48px)] flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#D5D9D5] px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setTemplatesOpen(true)} className="flex items-center gap-1.5 px-4 py-2 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] whitespace-nowrap hover:bg-[#FBF9F4] transition-colors cursor-pointer flex-shrink-0">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-layout-grid-line text-sm"></i></div>
              Templates
              <span className="ml-1 bg-[#E8EDE8] text-[#687068] text-xs rounded-full px-1.5 py-0.5 font-medium">{templates.length}</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-[#3A3F3A] truncate">{selectedTemplate ? selectedTemplate.name : 'Document Builder'}</h1>
              {selectedTemplate?.description && <p className="text-xs text-[#94A3B8] truncate">{selectedTemplate.description}</p>}
            </div>
          </div>
          {selectedTemplate && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button onClick={() => setFieldsOpen(true)} className="flex items-center gap-1.5 px-4 py-2 border border-[#C28A78] rounded-lg text-sm font-medium text-[#C28A78] whitespace-nowrap hover:bg-[#C28A78]/5 transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-2-line text-sm"></i></div>
                Fill in Details
                {placeholders.length > 0 && <span className="ml-1 bg-[#C28A78] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{placeholders.length}</span>}
              </button>
              <button onClick={() => handleSelectTemplate(selectedTemplate)} className="flex items-center gap-1.5 px-4 py-2 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] whitespace-nowrap hover:bg-[#FBF9F4] transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-refresh-line text-sm"></i></div>
                Reset
              </button>
              <button onClick={handleDownloadDocx} className="flex items-center gap-1.5 px-4 py-2 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] whitespace-nowrap hover:bg-[#FBF9F4] transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-word-2-line text-[#3B82F6] text-sm"></i></div>
                Download DOCX
              </button>
              <button onClick={() => { if (!selectedTemplate) return; printDocument('doc-preview', selectedTemplate.name); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium whitespace-nowrap hover:bg-[#143828] transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-printer-line text-sm"></i></div>
                Print PDF
              </button>
            </div>
          )}
        </div>

        {/* Main Preview Area */}
        {!selectedTemplate ? (
          <div className="flex-1 flex items-center justify-center bg-[#FBF9F4]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4"><div className="w-8 h-8 flex items-center justify-center"><i className="ri-file-text-line text-2xl text-[#C28A78]/40"></i></div></div>
              <h3 className="text-base font-semibold text-[#3A3F3A]">Select a Template</h3>
              <p className="text-sm text-[#94A3B8] mt-1 mb-4">Choose a document template to begin</p>
              <button onClick={() => setTemplatesOpen(true)} className="flex items-center gap-1.5 px-5 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors cursor-pointer whitespace-nowrap mx-auto">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-layout-grid-line text-sm"></i></div>
                Browse Templates
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#F1F5F9] p-5">
            <div className="max-w-[210mm] mx-auto">
              <div id="doc-preview" ref={previewRef} className="bg-white shadow-lg rounded-lg p-10 min-h-[297mm]" style={{ fontFamily: "'Times New Roman', serif", fontSize: '12pt', lineHeight: 1.7, color: '#3A3F3A' }}>
                <pre className="whitespace-pre-wrap" style={{ fontFamily: "'Times New Roman', serif", fontSize: '12pt', lineHeight: 1.7, color: '#3A3F3A', background: 'transparent', border: 'none', padding: 0, margin: 0 }}>{filledContent}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Templates Pop-out Drawer (left) */}
      {templatesOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setTemplatesOpen(false)}></div>
          <div className="relative z-10 w-[300px] h-full bg-white shadow-2xl flex flex-col" style={{ animation: 'slideInLeft 0.2s ease-out' }}>
            <div className="px-4 py-4 border-b border-[#D5D9D5] flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-[#3A3F3A]">Templates</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">{templates.length} available</p>
              </div>
              <button onClick={() => setTemplatesOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#687068] hover:text-[#3A3F3A] transition-colors cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {DOCUMENT_CATEGORIES.map(cat => {
                const catTemplates = templates.filter(t => cat.types.includes(t.document_type));
                if (catTemplates.length === 0) return null;
                const isOpen = categoryOpen[cat.label] !== false;
                return (
                  <div key={cat.label} className="mb-1">
                    <button onClick={() => toggleCategory(cat.label)} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#687068] uppercase hover:text-[#3A3F3A] transition-colors cursor-pointer">
                      <div className={`w-4 h-4 flex items-center justify-center transition-transform ${isOpen ? 'rotate-90' : ''}`}><i className="ri-arrow-right-s-line text-xs"></i></div>
                      {cat.label}
                    </button>
                    {isOpen && catTemplates.map(t => (
                      <button key={t.id} onClick={() => handleSelectTemplate(t)} className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left cursor-pointer ${selectedTemplate?.id === t.id ? 'bg-[#C28A78]/8 text-[#C28A78] border-r-2 border-[#C28A78] font-medium' : 'text-[#687068] hover:bg-[#FBF9F4]'}`}>
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0"><i className={DOCUMENT_TYPE_ICONS[t.document_type] || 'ri-file-line'}></i></div>
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fill in Details Pop-out Drawer (right) */}
      {fieldsOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setFieldsOpen(false)}></div>
          <div className="relative z-10 w-[400px] h-full bg-white shadow-2xl flex flex-col" style={{ animation: 'slideInRight 0.2s ease-out' }}>
            <div className="px-5 py-4 border-b border-[#D5D9D5] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Fill in Details</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">{placeholders.length} field{placeholders.length !== 1 ? 's' : ''} to complete</p>
              </div>
              <button onClick={() => setFieldsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#687068] hover:text-[#3A3F3A] transition-colors cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {placeholders.map(key => {
                const label = getPlaceholderLabel(key);
                const isTextarea = key.includes('description') || key.includes('particulars') || key.includes('highlights') || key.includes('scope_of_work') || key.includes('materials') || key.includes('actions') || key.includes('access_instructions') || key.includes('work_description');
                return (
                  <div key={key}>
                    <label className="text-xs font-medium text-[#687068] mb-1 block">{label}</label>
                    {isTextarea ? (
                      <textarea value={values[key] || ''} onChange={e => handleValueChange(key, e.target.value)} rows={3} maxLength={500} className="w-full px-3 py-2 text-sm rounded-lg border border-[#D5D9D5] focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none resize-none" />
                    ) : (
                      <input type="text" value={values[key] || ''} onChange={e => handleValueChange(key, e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-[#D5D9D5] focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] outline-none" />
                    )}
                  </div>
                );
              })}
              {placeholders.length === 0 && <p className="text-sm text-[#94A3B8] text-center py-8">No editable fields in this template</p>}
            </div>
            <div className="px-4 py-3 border-t border-[#D5D9D5] flex-shrink-0">
              <button onClick={() => setFieldsOpen(false)} className="w-full py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors cursor-pointer whitespace-nowrap">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </DashboardShell>
  );
}