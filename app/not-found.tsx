import Link from "next/link";
import NotFoundTracker from "@/components/NotFoundTracker";

export const metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <NotFoundTracker />
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-6xl font-bold text-green-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-600 mb-8 max-w-sm">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          ← Back to home
        </Link>
      </main>
    </>
  );
}
