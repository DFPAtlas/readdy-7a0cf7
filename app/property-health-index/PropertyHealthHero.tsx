import Link from "next/link"

export default function PropertyHealthHero() {
  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-br from-[#0F1A15] via-[#C28A78] to-[#143728]">
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_50%,#FFFFFF_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#10B981]/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#3B82F6]/5 blur-3xl"></div>
      <div className="relative max-w-6xl mx-auto px-6 lg:px-12 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <div className="w-5 h-5 rounded-full bg-[#10B981]/30 flex items-center justify-center">
                <i className="ri-shield-check-line text-[#10B981] text-xs w-4 h-4 flex items-center justify-center"></i>
              </div>
              <span className="text-xs font-medium text-white/80">Industry-First Standard</span>
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Property Health
              <br />
              <span className="text-[#10B981]">Index</span>
              <sup className="text-xl font-bold ml-1">TM</sup>
            </h1>
            <p className="text-lg text-white/60 mt-6 max-w-lg leading-relaxed">
              The definitive scoring system for property portfolio health. Quantify compliance, maintenance, tenancy, inspection, and risk in a single, actionable score.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <Link
                href="#calculator"
                className="text-sm font-semibold text-[#0F1A15] bg-[#10B981] hover:bg-[#059669] transition-colors px-6 py-3.5 rounded-xl whitespace-nowrap flex items-center gap-2 shadow-lg shadow-[#10B981]/20"
              >
                <i className="ri-calculator-line text-lg w-5 h-5 flex items-center justify-center"></i>
                Calculate My Score
              </Link>
              <Link
                href="/demo"
                className="text-sm font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors px-6 py-3.5 rounded-xl whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-play-circle-line text-lg w-5 h-5 flex items-center justify-center"></i>
                View Demo
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#C28A78] flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c }}>
                    {["E", "G", "A", "R"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50">Trusted by 500+ property professionals</p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-6">
                <p className="text-sm text-white/60 mb-1">Portfolio Average</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-bold text-white">82</span>
                  <span className="text-sm text-white/40">/100</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#10B981]/20 rounded-full px-3 py-1 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                  <span className="text-xs font-medium text-[#10B981]">Good</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Compliance", score: 88, color: "#10B981" },
                  { label: "Maintenance", score: 82, color: "#3B82F6" },
                  { label: "Tenancy", score: 86, color: "#8B5CF6" },
                  { label: "Inspection", score: 84, color: "#F59E0B" },
                  { label: "Risk", score: 78, color: "#F97316" },
                ].map((dim) => (
                  <div key={dim.label} className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-24 text-right">{dim.label}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${dim.score}%`, backgroundColor: dim.color }}></div>
                    </div>
                    <span className="text-xs font-semibold text-white w-7">{dim.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#10B981] text-[#0F1A15] rounded-xl px-4 py-3 text-xs font-bold shadow-lg">
              <i className="ri-arrow-up-line mr-1"></i>
              +12% Portfolio health improvement across LetHub users
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}