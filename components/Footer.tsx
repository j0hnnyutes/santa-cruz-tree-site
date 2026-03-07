import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--header-bg)]">
      <div className="site-container py-12">
        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-lg font-bold text-white tracking-tight">
              Santa Cruz Tree Pros
            </div>
            <p className="text-sm leading-6 text-white/60 max-w-sm">
              Licensed and insured tree care across Santa Cruz County. Safe removals, expert trimming, stump grinding, and emergency response.
            </p>
            <div className="text-sm text-white/50">
              Santa Cruz County, CA
            </div>
          </div>

          {/* Services column */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Services
            </div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/services/tree-removal" className="text-white/70 hover:text-white transition-colors">Tree Removal</Link></li>
              <li><Link href="/services/tree-trimming" className="text-white/70 hover:text-white transition-colors">Tree Trimming</Link></li>
              <li><Link href="/services/stump-grinding-root-removal" className="text-white/70 hover:text-white transition-colors">Stump Grinding</Link></li>
              <li><Link href="/services/emergency-tree-service" className="text-white/70 hover:text-white transition-colors">Emergency Service</Link></li>
              <li><Link href="/services/arborist-consulting" className="text-white/70 hover:text-white transition-colors">Arborist Consulting</Link></li>
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Company
            </div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/service-areas" className="text-white/70 hover:text-white transition-colors">Service Areas</Link></li>
              <li><Link href="/blog" className="text-white/70 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/free-estimate" className="text-white/70 hover:text-white transition-colors">Free Estimate</Link></li>
            </ul>

          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-white/40">
            &copy; {year} Santa Cruz Tree Pros. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-sm text-white/20">·</span>
            <p className="text-sm text-white/30">
              Licensed &amp; Insured · Santa Cruz County, CA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
