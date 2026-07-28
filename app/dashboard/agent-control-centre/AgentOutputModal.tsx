import type { ControlAgent } from "./AgentControlData";

interface AgentOutputModalProps {
  agent: ControlAgent;
  onClose: () => void;
  onCopy: (agent: ControlAgent) => void;
  generateMockOutput: (agent: ControlAgent) => string;
}

export default function AgentOutputModal({ agent, onClose, onCopy, generateMockOutput }: AgentOutputModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#D5D9D5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
              <i className={`${agent.icon} text-[#3A3F3A] text-base`}></i>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#3A3F3A]">{agent.name} — Output</h3>
              <p className="text-xs text-[#94A3B8]">Last run results</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-[#687068]"></i>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <pre className="bg-[#0F172A] rounded-xl p-4 font-mono text-xs text-[#10B981] overflow-x-auto whitespace-pre-wrap">
            {generateMockOutput(agent)}
          </pre>
        </div>
        <div className="p-4 border-t border-[#D5D9D5] flex gap-3">
          <button
            onClick={() => onCopy(agent)}
            className="flex-1 py-2 bg-[#F1F5F9] text-[#687068] rounded-lg text-sm font-medium hover:bg-[#D5D9D5] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-file-copy-line text-xs mr-1"></i>
            Copy Output
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-[#D5D9D5] text-[#687068] rounded-lg text-sm font-medium hover:bg-[#FBF9F4] transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}