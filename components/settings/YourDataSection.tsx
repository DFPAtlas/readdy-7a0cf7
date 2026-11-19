"use client";

import { useState } from "react";
import Link from "next/link";
import { isDemoAccount } from "@/lib/demoMode";
import { downloadMyData, requestAccountDeletion, type ExportProgress } from "@/lib/dataExport";

export default function YourDataSection({ onToast }: { onToast: (message: string) => void }) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletionRequestedAt, setDeletionRequestedAt] = useState<string | null>(null);

  const handleExport = async () => {
    if (isDemoAccount()) {
      onToast("Demo mode — exports are disabled.");
      return;
    }
    setExporting(true);
    setExportError(null);
    try {
      const result = await downloadMyData(setProgress);
      onToast(`Downloaded ${result.fileName} (${result.rowCount.toLocaleString("en-GB")} records)`);
      if (result.skippedTables.length > 0) {
        setExportError(`Some sections couldn't be included: ${result.skippedTables.join(", ")}. Try again, or email privacy@lethub.uk.`);
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "The export failed. Please try again.");
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const handleDelete = async () => {
    if (isDemoAccount()) {
      onToast("Demo mode — account deletion is disabled.");
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const result = await requestAccountDeletion(reason);
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.error || "We couldn't record your request.");
      return;
    }
    setDeletionRequestedAt(result.requestedAt || new Date().toISOString());
    setShowDelete(false);
    onToast(result.alreadyRequested ? "You've already asked us to delete your account." : "Deletion request sent");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-download-cloud-2-line text-[#C28A78] text-lg" aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[#3A3F3A]">Export your data</h2>
            <p className="text-sm text-[#687068] mt-1 leading-relaxed">
              Download everything you can access in LetHub as a single JSON file: properties, landlords, tenants, tenancies,
              rent, arrears, maintenance, inspections, compliance records and messages. Agency admins get their whole
              agency&apos;s records. Uploaded files such as certificates and photos are listed but not included.
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="mt-4 inline-flex items-center gap-2 bg-[#C28A78] hover:bg-[#B07A69] text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
            >
              <i className={exporting ? "ri-loader-4-line animate-spin" : "ri-download-line"} aria-hidden="true"></i>
              {exporting
                ? progress && progress.total
                  ? `Exporting… ${Math.round((progress.done / progress.total) * 100)}%`
                  : "Exporting…"
                : "Download my data"}
            </button>
            {exportError && <p role="alert" className="mt-3 text-sm text-[#C46868]">{exportError}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#FECACA] p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-delete-bin-6-line text-[#EF4444] text-lg" aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[#3A3F3A]">Delete your account</h2>
            <p className="text-sm text-[#687068] mt-1 leading-relaxed">
              Ask us to close your account and delete your personal data. We&apos;ll confirm by email and complete the request
              within one month. If you are an agency admin, tell us whether the whole agency is closing. Some records, such as
              invoices, may have to be kept for a period by law; we&apos;ll tell you if that applies. Download your data first if
              you need a copy. See our <Link href="/dpa" className="text-[#C28A78] underline">Data Processing Agreement</Link>{" "}
              for details.
            </p>

            {deletionRequestedAt ? (
              <p className="mt-4 text-sm text-[#3A3F3A] bg-[#FBF9F4] border border-[#D5D9D5] rounded-lg px-3 py-2">
                Deletion requested on{" "}
                {new Date(deletionRequestedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
                We&apos;ll be in touch by email.
              </p>
            ) : !showDelete ? (
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="mt-4 inline-flex items-center gap-2 border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] text-sm font-semibold px-4 py-2.5 rounded-lg"
              >
                Request account deletion
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-[#3A3F3A]">Anything we should know? (optional)</span>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78]"
                    placeholder="For example, whether your whole agency is closing"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#3A3F3A]">Type DELETE to confirm</span>
                  <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm outline-none focus:border-[#C28A78]"
                    autoComplete="off"
                  />
                </label>
                {deleteError && <p role="alert" className="text-sm text-[#C46868]">{deleteError}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={confirmText.trim().toUpperCase() !== "DELETE" || deleting}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50"
                  >
                    {deleting ? "Sending…" : "Send deletion request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDelete(false);
                      setConfirmText("");
                      setDeleteError(null);
                    }}
                    className="border border-[#D5D9D5] text-[#687068] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#FBF9F4]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
