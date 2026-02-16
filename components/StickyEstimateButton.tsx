import Link from "next/link";

export default function StickyEstimateButton() {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <Link
        href="/contact"
        className="block text-center font-medium bg-black text-white rounded-xl py-3 shadow"
      >
        Get a Free Estimate
      </Link>
    </div>
  );
}