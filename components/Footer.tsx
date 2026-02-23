import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16">
      {/* Top border stripe */}
      <div className="h-[5px] w-full bg-[var(--header-stripe)]" />

      <div className="bg-[var(--header-bg)] text-[var(--text)]">
        <div className="site-container py-10">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="text-lg font-semibold">Santa Cruz Tree Pros</div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                Professional tree removal, trimming, stump grinding, emergency response, and arborist consulting across Santa Cruz County.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 text-sm">
              <div className="space-y-2">
                <div className="font-semibold">Company</div>
                <ul className="space-y-1">
                  <li>
                    <Link className="font-medium text-[var(--brand-accent)] hover:text-[var(--brand-green)]" href="/services">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link className="font-medium text-[var(--brand-accent)] hover:text-[var(--brand-green)]" href="/service-areas">
                      Service Areas
                    </Link>
                  </li>
                  <li>
                    <Link className="font-medium text-[var(--brand-accent)] hover:text-[var(--brand-green)]" href="/contact">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-semibold">Get a Quote</div>
                <ul className="space-y-1">
                  <li>
                    <Link className="font-medium text-[var(--brand-accent)] hover:text-[var(--brand-green)]" href="/contact">
                      Request an Estimate
                    </Link>
                  </li>
                  <li className="text-[var(--muted)]">Santa Cruz County, CA</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
            © {year} Santa Cruz Tree Pros. All rights reserved.
          </div>
        </div>
      </div>

      {/* Bottom border stripe */}
      <div className="h-[5px] w-full bg-[var(--header-stripe)]" />
    </footer>
  );
}