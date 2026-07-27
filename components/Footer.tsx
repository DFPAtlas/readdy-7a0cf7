import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#3A3F3A] text-white py-16 px-6 lg:px-12">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-1">
            <Link href="/" className="font-['Pacifico'] text-2xl text-white inline-block mb-4">
              LetHub
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              The complete cloud-based property management platform for UK estate agents, letting agents, and property managers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <div className="flex flex-col gap-3">
              <Link href="/features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
              <Link href="/integrations" className="text-sm text-white/60 hover:text-white transition-colors">Integrations</Link>
              <Link href="/security" className="text-sm text-white/60 hover:text-white transition-colors">Security</Link>
              <Link href="/property-health-index" className="text-sm text-white/60 hover:text-white transition-colors">Property Health Index</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Resources</h4>
            <div className="flex flex-col gap-3">
              <Link href="/help" className="text-sm text-white/60 hover:text-white transition-colors">Help Centre</Link>
              <Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors">Blog</Link>
              <Link href="/demo" className="text-sm text-white/60 hover:text-white transition-colors">View Demo</Link>
              <Link href="/book-demo" className="text-sm text-white/60 hover:text-white transition-colors">Book a Demo</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <div className="flex flex-col gap-3">
              <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About</Link>
              <Link href="/partners" className="text-sm text-white/60 hover:text-white transition-colors">Partners</Link>
              <Link href="/careers" className="text-sm text-white/60 hover:text-white transition-colors">Careers</Link>
              <Link href="/press" className="text-sm text-white/60 hover:text-white transition-colors">Press</Link>
              <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Portals</h4>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Agency Sign In</Link>
              <Link href="/tenant/login" className="text-sm text-white/60 hover:text-white transition-colors">Tenant Portal</Link>
              <Link href="/owner/login" className="text-sm text-white/60 hover:text-white transition-colors">Owner Portal</Link>
              <Link href="/contractor/login" className="text-sm text-white/60 hover:text-white transition-colors">Contractor Portal</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; 2026 LetHub Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-xs text-white/40 hover:text-white/60 transition-colors">Cookie Policy</Link>
            <Link href="/gdpr" className="text-xs text-white/40 hover:text-white/60 transition-colors">GDPR</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}