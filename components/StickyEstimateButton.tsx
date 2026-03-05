import Link from "next/link";

export default function StickyEstimateButton() {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <Link
        href="/free-estimate"
        className="block text-center font-semibold bg-[var(--brand-green)] text-white rounded-xl py-3 shadow-lg hover:bg-[var(--brand-green-dark)] transition-colors"
      >
        Get a Free Estimate
      </Link>
    </div>
  );
}
