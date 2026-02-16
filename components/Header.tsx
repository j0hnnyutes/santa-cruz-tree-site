import Link from "next/link";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="bg-black text-white">
      <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="font-semibold tracking-tight text-white">
          Santa Cruz Tree Service
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm hover:underline">
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/contact"
          className="text-sm font-medium bg-white text-black rounded-lg px-4 py-2 hover:bg-gray-200"
        >
          Free Estimate
        </Link>
      </nav>
    </header>
  );
}