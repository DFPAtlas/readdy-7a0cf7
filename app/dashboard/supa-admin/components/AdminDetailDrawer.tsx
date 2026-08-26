"use client";

export default function AdminDetailDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-[#111827] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-[#1E293B]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B] sticky top-0 bg-[#111827] z-10">
          <h2 className="font-semibold text-[#E2E8F0]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1E293B]"
          >
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}