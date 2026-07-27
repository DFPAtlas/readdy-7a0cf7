import Link from "next/link"

export default function PHICTA() {
  return (
    <section className="w-full bg-[#FAFBFC] py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#C28A78]/5 border border-[#C28A78]/10 rounded-full px-4 py-1.5 mb-6">
          <i className="ri-rocket-2-line text-[#C28A78] text-sm w-4 h-4 flex items-center justify-center"></i>
          <span className="text-xs font-medium text-[#C28A78]">Get Started Today</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-[#3A3F3A] tracking-tight">
          Ready to Benchmark Your Portfolio?
        </h2>
        <p className="text-[#687068] text-lg mt-4 max-w-xl mx-auto leading-relaxed">
          Join 500+ property professionals using the Property Health Index to drive portfolio performance, reduce risk, and demonstrate compliance excellence.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/demo"
            className="text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#143828] transition-colors px-8 py-4 rounded-xl whitespace-nowrap flex items-center gap-2 shadow-lg shadow-[#C28A78]/20"
          >
            <i className="ri-play-circle-line text-lg w-5 h-5 flex items-center justify-center"></i>
            View Demo
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#C28A78] border-2 border-[#C28A78]/20 hover:bg-[#C28A78]/5 transition-colors px-8 py-4 rounded-xl whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-rocket-2-line text-lg w-5 h-5 flex items-center justify-center"></i>
            Start Free Trial
          </Link>
        </div>

        <p className="text-xs text-[#94A3B8] mt-5">No credit card required. 14-day free trial.</p>
      </div>
    </section>
  )
}