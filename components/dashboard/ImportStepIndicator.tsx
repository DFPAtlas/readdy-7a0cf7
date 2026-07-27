"use client";

import { importSteps, type ImportStep } from "@/lib/importSystem";

interface Props {
  currentStep: ImportStep;
  started: boolean;
}

export default function ImportStepIndicator({ currentStep, started }: Props) {
  if (!started) return null;

  const currentIndex = importSteps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {importSteps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = currentIndex > index;
        return (
          <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                isActive
                  ? "bg-[#C28A78] text-white"
                  : isDone
                  ? "bg-[#10B981]/10 text-[#10B981]"
                  : "bg-[#F1F5F9] text-[#94A3B8]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isDone
                    ? "bg-[#10B981] text-white"
                    : "bg-[#E2E8F0] text-[#94A3B8]"
                }`}
              >
                {isDone ? <i className="ri-check-line text-xs"></i> : step.number}
              </div>
              {step.label}
            </div>
            {index < importSteps.length - 1 && (
              <div className={`w-5 h-px flex-shrink-0 ${isDone ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
}