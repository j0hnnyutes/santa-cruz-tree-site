import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-[#F0E8D8] text-[#242008]">
      {/* Top stripe (matches header) */}
      <div className="h-[5px] w-full bg-[#5a4a20]" />

      <div className="mx-auto max-w-[1400px] px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand Section */}
          <div className="space-y-3 max-w-md">
            <div className="text-xl font-bold tracking-tight">
              Santa Cruz Tree Pros
            </div>
            <p className="text-sm leading-6 text-[#4a4018]">
              Professional tree removal, trimming, stump grinding,
              emergency response, and arborist consulting across Santa Cruz County.
            </p>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="space-y-3">
              <div className="font-semibold tracking-wide">Company</div>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/services"
                    className="font-semibold text-[#242008] hover:text-[#5a4a20]"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/service-areas"
                    className="font-semibold text-[#242008] hover:text-[#5a4a20]"
                  >
                    Service Areas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="font-semibold text-[#242008] hover:text-[#5a4a20]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-semibold tracking-wide">Get an Estimate</div>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="font-semibold text-[#242008] hover:text-[#5a4a20]"
                  >
                    Request an Estimate
                  </Link>
                </li>
                <li className="text-[#4a4018]">
                  Santa Cruz County, CA
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider line (matches header subtle line style) */}
        <div className="mt-10 border-t border-[#524820]/40 pt-6 text-sm text-[#4a4018]">
          © {year} Santa Cruz Tree Pros. All rights reserved.
        </div>
      </div>

      {/* Bottom stripe (matches header) */}
      <div className="h-[5px] w-full bg-[#5a4a20]" />
    </footer>
  );
}