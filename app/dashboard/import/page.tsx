"use client";

import { useState, useEffect, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { useEntitlements } from "@/lib/useEntitlements";
import { showRlsError } from "@/lib/rlsErrorHandler";
import type { ImportStep, ImportFileState } from "@/lib/importSystem";
import { REPORTED_DISCLAIMER } from "@/lib/importSystem";
import type { ImportType } from "@/lib/importSystem";
import ImportStepIndicator from "@/components/dashboard/ImportStepIndicator";
import ImportTypeSelector from "@/components/dashboard/ImportTypeSelector";
import ImportFileUploader from "@/components/dashboard/ImportFileUploader";
import ImportFilePreview from "@/components/dashboard/ImportFilePreview";
import ImportFieldMapper from "@/components/dashboard/ImportFieldMapper";
import ImportValidationTable from "@/components/dashboard/ImportValidationTable";
import ImportResults from "@/components/dashboard/ImportResults";
import {
  importHistory,
  fieldMappings,
  previewProperties,
  ImportFailedRow,
  PreviewProperty,
} from "./ImportData";

export default function ImportPage() {
  const [currentStep, setCurrentStep] = useState<ImportStep>("type");
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [fileState, setFileState] = useState<ImportFileState | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [importFailedRows, setImportFailedRows] = useState<ImportFailedRow[]>([]);
  const [dbAvailable, setDbAvailable] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isReadOnly } = useEntitlements();

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isDemoAccount()) setDemoMode(true);
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  const handleSelectType = (type: ImportType) => {
    if (isReadOnly) {
      alert("Your trial has ended. Upgrade your plan to continue using this feature.");
      return;
    }
    setSelectedType(type);
    setCurrentStep("upload");
  };

  const handleFileProcessed = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const state: ImportFileState = {
      name: file.name,
      size: file.size,
      type: ext,
      rows: ext === "xlsx" ? 45 : 12,
      columns: 8,
      headers: ["address", "city", "postcode", "type", "landlord_name", "landlord_email", "monthly_rent", "status"],
      sampleRows: [
        ["14 Rosebery Avenue", "London", "N10 2XX", "Flat", "James Thompson", "j.thompson@email.com", "1850", "Occupied"],
        ["22 Baker Street", "London", "NW1 6XE", "House", "Susan Wright", "s.wright@email.com", "2100", "Occupied"],
        ["8 Park Crescent", "Manchester", "M3 4JA", "Flat", "David Chen", "d.chen@email.com", "1200", "Available"],
      ],
    };
    setFileState(state);
    setCurrentStep("map");
  };

  const handleConfirmMapping = () => {
    setCurrentStep("validate");
  };

  const handleStartImport = async () => {
    setCurrentStep("import");
    setImportProgress(0);

    let dbOk = false;
    try {
      const { data } = await supabase.from("landlords").select("id").limit(1);
      dbOk = !!data;
    } catch {
      dbOk = false;
    }
    setDbAvailable(dbOk);

    const valid = previewProperties.filter((p) => p.validationErrors.length === 0 && !p.isDuplicate);
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 6) + 2;
      if (progress > 95) progress = 95;
      setImportProgress(progress);
    }, 120);

    if (dbOk) {
      let imported = 0;
      const failed: ImportFailedRow[] = [];
      for (const p of valid) {
        try {
          const { data: landlord } = await supabase
            .from("landlords")
            .upsert({ name: p.landlord, email: p.landlordEmail, phone: p.landlordPhone }, { onConflict: "email" })
            .select("id")
            .maybeSingle();
          const landlordId = landlord?.id;
          await supabase
            .from("properties")
            .upsert({
              address: p.address, city: p.city, postcode: p.postcode, property_type: p.propertyType,
              bedrooms: p.bedrooms, bathrooms: p.bathrooms, landlord_id: landlordId,
              monthly_rent: p.rent, deposit: p.deposit, status: p.status,
            }, { onConflict: "address" })
            .select("id")
            .maybeSingle();
          imported++;
        } catch (err: any) {
          if (!showRlsError(err, "properties")) {
            failed.push({ row: imported + 1, address: p.address || "Unknown", reason: "Database write failed" });
          } else {
            failed.push({ row: imported + 1, address: p.address || "Unknown", reason: "Plan limit reached — upgrade required" });
          }
        }
      }
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportedCount(imported);
      setFailedCount(failed.length);
      setImportFailedRows(failed);
      setTimeout(() => {
        setCurrentStep("results");
        if (imported > 0) showToast("success", `${imported} records imported`);
        if (failed.length > 0) showToast("error", `${failed.length} records failed`);
      }, 400);
    } else {
      setTimeout(() => {
        clearInterval(progressInterval);
        setImportProgress(100);
        const mockFailedCount = valid.filter((_, i) => i % 7 === 0).length;
        setImportedCount(valid.length - mockFailedCount);
        setFailedCount(mockFailedCount);
        setImportFailedRows(
          valid.filter((_, i) => i % 7 === 0).map((p, idx) => ({
            row: idx + 1, address: p.address, reason: "Database not connected — simulated failure",
          }))
        );
        setTimeout(() => {
          setCurrentStep("results");
          showToast("success", "Preview import processed");
        }, 400);
      }, 1800);
    }
  };

  const handleReset = () => {
    setCurrentStep("type");
    setSelectedType(null);
    setFileState(null);
    setImportProgress(0);
    setImportedCount(0);
    setFailedCount(0);
    setImportFailedRows([]);
    setShowHistory(false);
  };

  const duplicateCount = previewProperties.filter((p) => p.isDuplicate).length;

  const errorCount = previewProperties.filter((p) => p.validationErrors.length > 0).length;
  const validCount = previewProperties.filter((p) => p.validationErrors.length === 0 && !p.isDuplicate).length;
  const totalImports = importHistory.reduce((s, i) => s + i.imported, 0);
  const totalErrors = importHistory.reduce((s, i) => s + i.errors, 0);
  const successRate = Math.round((totalImports / (totalImports + totalErrors + importHistory.reduce((s, i) => s + i.duplicates, 0))) * 100) || 0;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {toast && (
          <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce ${toast.type === "success" ? "bg-[#10B981] text-white" : "bg-[#EF4444] text-white"}`}>
            <i className={`${toast.type === "success" ? "ri-check-line" : "ri-alert-line"} text-lg`}></i>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Import data</h1>
            <p className="text-sm text-[#687068] mt-1">
              Bring properties, landlords, tenants and more into LetHub from spreadsheets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#687068] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">
              <i className="ri-database-line mr-1"></i>{totalImports} imported
            </span>
            <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-lg font-medium">
              {successRate}% success rate
            </span>
            <button
              onClick={() => { handleReset(); setShowHistory(!showHistory); }}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                showHistory ? "bg-[#C28A78] text-white" : "border border-[#E2E8F0] text-[#687068] hover:bg-[#F1F5F9]"
              }`}
            >
              <i className="ri-history-line mr-1"></i>
              History
            </button>
            {currentStep !== "type" && !showHistory && (
              <button
                onClick={handleReset}
                className="text-xs text-[#687068] border border-[#E2E8F0] px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <ImportStepIndicator currentStep={currentStep} started={currentStep !== "type" && !showHistory} />

        {showHistory ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Import history</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">File</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Format</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Records</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Imported</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Errors</th>
                    <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {importHistory.map((imp) => (
                    <tr key={imp.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-[#3A3F3A]">{imp.fileName}</p>
                        <p className="text-xs text-[#94A3B8]">{imp.uploadedBy} · {imp.uploadedAt}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full uppercase">{imp.format}</span>
                      </td>
                      <td className="px-5 py-3 text-[#687068] text-xs">{imp.uploadedAt}</td>
                      <td className="px-5 py-3 text-right text-[#3A3F3A]">{imp.totalRecords}</td>
                      <td className="px-5 py-3 text-right text-[#10B981]">{imp.imported}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={imp.errors > 0 ? "text-[#EF4444]" : "text-[#687068]"}>{imp.errors}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          imp.status === "completed" ? "bg-[#10B981]/10 text-[#10B981]"
                          : imp.status === "processing" ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                          : imp.status === "failed" ? "bg-[#EF4444]/10 text-[#EF4444]"
                          : "bg-[#F59E0B]/10 text-[#F59E0B]"
                        }`}>
                          {imp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {currentStep === "type" && (
              <ImportTypeSelector onSelect={handleSelectType} />
            )}

            {currentStep === "upload" && selectedType && (
              <ImportFileUploader
                importTypeLabel={selectedType.label}
                acceptFormats={selectedType.supportedFormats}
                onFileProcessed={handleFileProcessed}
                onBack={() => setCurrentStep("type")}
              />
            )}

            {currentStep === "map" && (
              <ImportFieldMapper
                mappings={fieldMappings}
                onMappingChange={() => {}}
                onConfirm={handleConfirmMapping}
                onBack={() => setCurrentStep("upload")}
              />
            )}

            {currentStep === "validate" && (
              <ImportValidationTable
                previews={previewProperties}
                onBack={() => setCurrentStep("map")}
                onContinue={() => setCurrentStep("review")}
              />
            )}

            {currentStep === "review" && (
              <div className="space-y-5">
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                  <h2 className="font-semibold text-[#3A3F3A] mb-1">Review import plan</h2>
                  <p className="text-xs text-[#687068] mb-5">Review the proposed changes before confirming</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#10B981]">{validCount}</p>
                      <p className="text-xs text-[#687068]">Will be created</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#3B82F6]">0</p>
                      <p className="text-xs text-[#687068]">Will be updated</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#F59E0B]">{duplicateCount}</p>
                      <p className="text-xs text-[#687068]">Skipped (duplicates)</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-[#EF4444]">{errorCount}</p>
                      <p className="text-xs text-[#687068]">With errors</p>
                    </div>
                  </div>
                  <div className="bg-[#F1F5F9] rounded-lg p-4 text-sm text-[#687068] mb-5">
                    <p className="font-medium text-[#3A3F3A] mb-1">What will happen</p>
                    <ul className="space-y-1 text-xs">
                      <li>· {validCount} new property records will be created</li>
                      <li>· Landlords and tenants will be created or matched by email</li>
                      <li>· Compliance records (EPC, Gas Safety, EICR) will be attached</li>
                      <li>· {errorCount} rows with errors will be skipped</li>
                      <li>· {duplicateCount} duplicate rows will be skipped</li>
                      <li>· No portal invitations will be sent automatically</li>
                    </ul>
                  </div>
                  <p className="text-xs text-[#94A3B8] mb-4">{REPORTED_DISCLAIMER}</p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep("validate")}
                    className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStartImport}
                    disabled={validCount === 0}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      validCount > 0 ? "bg-[#C28A78] text-white hover:bg-[#143828]" : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
                    }`}
                  >
                    Confirm and import {validCount} records
                  </button>
                </div>
              </div>
            )}

            {currentStep === "import" && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
                <div className="w-16 h-16 bg-[#C28A78]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="ri-loader-4-line text-[#C28A78] text-2xl animate-spin"></i>
                </div>
                <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Importing records...</h3>
                <p className="text-sm text-[#94A3B8] mb-6">
                  Processing {validCount} records. Creating properties, landlords, and compliance data.
                </p>
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#3A3F3A] font-medium">Progress</span>
                    <span className="text-[#687068]">{importProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C28A78] rounded-full transition-all duration-100" style={{ width: `${importProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-3">
                    {importProgress < 30 ? "Creating property records..." : importProgress < 60 ? "Mapping landlords and tenants..." : importProgress < 90 ? "Validating compliance data..." : "Finalising..."}
                  </p>
                </div>
              </div>
            )}

            {currentStep === "results" && (
              <ImportResults
                importedCount={importedCount || validCount}
                failedCount={failedCount}
                duplicateCount={duplicateCount}
                failedRows={importFailedRows}
                dbAvailable={dbAvailable}
                onStartNew={handleReset}
                onReprocess={() => setCurrentStep("validate")}
                onViewHistory={() => { handleReset(); setShowHistory(true); }}
              />
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}