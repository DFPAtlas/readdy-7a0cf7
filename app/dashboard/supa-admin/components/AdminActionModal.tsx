"use client";

export default function AdminActionModal({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-[#111827] rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
          <h2 className="font-semibold text-[#E2E8F0]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1E293B]"
          >
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-[#E2E8F0]">{message}</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-4 border-t border-[#1E293B]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#1E293B] rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              confirmClass || "bg-[#EF4444] hover:bg-[#DC2626]"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}