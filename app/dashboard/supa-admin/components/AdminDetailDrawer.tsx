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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5] sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-[#3A3F3A]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"
          >
            <i className="ri-close-line text-[#687068]"></i>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}