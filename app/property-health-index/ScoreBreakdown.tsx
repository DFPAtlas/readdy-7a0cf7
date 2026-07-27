const DIMENSIONS = [
  {
    key: "compliance",
    label: "Compliance",
    icon: "ri-shield-check-line",
    color: "#10B981",
    description: "Tracks all statutory obligations — gas safety certificates, EICR reports, EPC ratings, fire risk assessments, legionella testing, and right-to-rent checks. Missing or expired certificates directly lower this score.",
    riskLabel: "Non-compliance can result in fines up to £30,000, invalidated insurance, and possession claims being struck out.",
    checks: ["Gas Safety Certificate (CP12)", "EICR — Electrical Safety", "EPC Minimum Band E", "Fire Risk Assessment", "Legionella Risk Assessment", "Right to Rent Checks", "Smoke & CO Alarms"],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: "ri-tools-line",
    color: "#3B82F6",
    description: "Measures responsiveness to repairs, contractor quality ratings, average resolution time, and frequency of reactive vs planned maintenance. A backlog of open jobs drags this score down.",
    riskLabel: "Delayed maintenance leads to tenant dissatisfaction, Section 11 disrepair claims, and accelerated property deterioration.",
    checks: ["Open repair jobs", "Average resolution time", "Contractor ratings", "Planned vs reactive ratio", "Emergency response SLA", "Damp & mould cases"],
  },
  {
    key: "tenancy",
    label: "Tenancy",
    icon: "ri-user-3-line",
    color: "#8B5CF6",
    description: "Evaluates tenancy stability — rent arrears history, void periods, tenancy deposit protection compliance, tenancy agreement currency, and tenant satisfaction scores.",
    riskLabel: "Unstable tenancies increase turnover costs, void loss, and the likelihood of possession proceedings.",
    checks: ["Rent arrears status", "Deposit protection", "Tenancy agreement currency", "Void period history", "How to Rent guide issued", "Tenant satisfaction"],
  },
  {
    key: "inspection",
    label: "Inspection",
    icon: "ri-clipboard-line",
    color: "#F59E0B",
    description: "Tracks routine inspection frequency, inspection report quality, room-level condition ratings, and follow-through on flagged issues. Properties with gaps between inspections score lower.",
    riskLabel: "Infrequent inspections allow undetected damage to escalate into costly repairs and deposit disputes.",
    checks: ["Inspection frequency", "Last inspection date", "Room condition ratings", "Photo documentation", "Flagged issue resolution", "Mid-term inspections"],
  },
  {
    key: "risk",
    label: "Risk",
    icon: "ri-alert-line",
    color: "#F97316",
    description: "Composite risk indicator combining all dimensions with additional weighting on fire safety, structural hazards, HMO licensing requirements, and insurance compliance gaps.",
    riskLabel: "High risk scores trigger mandatory review workflows and may affect portfolio valuations and insurance premiums.",
    checks: ["Fire safety compliance", "HMO licensing status", "Structural hazards", "Insurance validity", "Flood risk zone", "Health & safety register"],
  },
]

export function ScoreBreakdownSection() {
  return (
    <section className="w-full bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-4 py-1.5 mb-4">
            <i className="ri-pie-chart-2-line text-[#687068] text-sm w-4 h-4 flex items-center justify-center"></i>
            <span className="text-xs font-medium text-[#687068]">Five Dimensions</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#3A3F3A] tracking-tight">
            How the Index Works
          </h2>
          <p className="text-[#687068] text-lg mt-3 max-w-2xl mx-auto">
            The Property Health Index aggregates five weighted dimensions into a single score from 0–100, giving you an instant picture of portfolio health.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-12">
          {DIMENSIONS.map((dim, i) => (
            <div key={dim.key} className="bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl p-5 hover:shadow-lg hover:border-[#C28A78]/20 transition-all group cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: dim.color + "15" }}>
                <i className={`${dim.icon} text-lg`} style={{ color: dim.color }}></i>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-[#3A3F3A]">{dim.label}</h3>
                <span className="text-[10px] text-[#94A3B8]">x{(i === 2 ? 25 : i === 3 ? 25 : i === 0 ? 20 : i === 1 ? 20 : 10)}%</span>
              </div>
              <p className="text-xs text-[#687068] leading-relaxed">{dim.description.slice(0, 130)}...</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#0F1A15] to-[#C28A78] rounded-2xl p-8 lg:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#10B981]/5 blur-3xl"></div>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Weighted Scoring Engine</h3>
              <p className="text-sm text-white/60 mt-3 leading-relaxed">
                Each dimension contributes a percentage to the final score. Gas safety and maintenance carry the highest weight because they represent the greatest regulatory and tenant-welfare risk. The algorithm normalises scores across properties to make benchmarking meaningful.
              </p>
              <div className="flex items-center gap-6 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-white/40">Properties scored</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#10B981]">+12%</p>
                  <p className="text-xs text-white/40">Avg improvement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">82</p>
                  <p className="text-xs text-white/40">Avg PHI score</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {DIMENSIONS.slice(0, 5).map((dim) => {
                const weights = [20, 20, 25, 25, 10]
                const idx = DIMENSIONS.indexOf(dim)
                const sampleScore = [88, 82, 86, 84, 78][idx]
                return (
                  <div key={dim.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }}></div>
                        <span className="text-xs text-white/70">{dim.label}</span>
                        <span className="text-[10px] text-white/30">({weights[idx]}%)</span>
                      </div>
                      <span className="text-xs font-semibold text-white">{sampleScore}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${sampleScore}%`, backgroundColor: dim.color }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function DimensionDetailSection() {
  return (
    <section className="w-full bg-[#FAFBFC] py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-full px-4 py-1.5 mb-4">
            <i className="ri-search-eye-line text-[#687068] text-sm w-4 h-4 flex items-center justify-center"></i>
            <span className="text-xs font-medium text-[#687068]">Deep Dive</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#3A3F3A] tracking-tight">
            What Each Dimension Measures
          </h2>
          <p className="text-[#687068] text-lg mt-3 max-w-2xl mx-auto">
            Every dimension is backed by specific compliance, maintenance, and operational data points from your portfolio.
          </p>
        </div>

        <div className="space-y-6">
          {DIMENSIONS.map((dim, i) => (
            <div key={dim.key} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden group hover:border-[#C28A78]/20 hover:shadow-md transition-all">
              <div className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-72 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: dim.color + "15" }}>
                        <i className={`${dim.icon} text-lg`} style={{ color: dim.color }}></i>
                      </div>
                      <h3 className="text-lg font-bold text-[#3A3F3A]">{dim.label}</h3>
                      <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium">
                        {[20, 20, 25, 25, 10][i]}% weight
                      </span>
                    </div>
                    <p className="text-sm text-[#687068] leading-relaxed">{dim.description}</p>
                    <div className="mt-4 p-3 bg-[#FEF3C7]/40 border border-[#F59E0B]/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <i className="ri-error-warning-line text-[#F59E0B] text-sm mt-0.5 w-4 h-4 flex items-center justify-center"></i>
                        <p className="text-xs text-[#92400E] leading-relaxed">{dim.riskLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 border-t lg:border-t-0 lg:border-l border-[#E2E8F0] lg:pl-8 pt-5 lg:pt-0">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Measured data points</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dim.checks.map((check) => (
                        <div key={check} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dim.color }}></div>
                          <span className="text-xs text-[#475569]">{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}