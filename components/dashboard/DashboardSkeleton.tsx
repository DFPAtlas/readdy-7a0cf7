"use client";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <div className="h-7 w-48 bg-[#EBE5DA] rounded mb-2"></div>
          <div className="h-4 w-64 bg-[#EBE5DA] rounded mb-1"></div>
          <div className="h-3 w-40 bg-[#EBE5DA] rounded"></div>
        </div>
        <div className="h-10 w-36 bg-[#EBE5DA] rounded-lg"></div>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="h-5 w-40 bg-[#EBE5DA] rounded"></div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#FBF9F4] rounded-lg"></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#D5D9D5] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-[#EBE5DA] rounded-lg"></div>
              <div className="w-14 h-5 bg-[#EBE5DA] rounded-full"></div>
            </div>
            <div className="h-7 w-16 bg-[#EBE5DA] rounded mb-2"></div>
            <div className="h-4 w-24 bg-[#EBE5DA] rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D5D9D5]">
            <div className="h-5 w-36 bg-[#EBE5DA] rounded"></div>
          </div>
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#EBE5DA] rounded-lg"></div>
                <div className="flex-1 h-2 bg-[#EBE5DA] rounded-full"></div>
                <div className="w-10 h-5 bg-[#EBE5DA] rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D5D9D5]">
            <div className="h-5 w-32 bg-[#EBE5DA] rounded"></div>
          </div>
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-[#FBF9F4] rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="h-5 w-32 bg-[#EBE5DA] rounded"></div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EBE5DA] rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-[#EBE5DA] rounded"></div>
                <div className="h-3 w-1/2 bg-[#EBE5DA] rounded mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}