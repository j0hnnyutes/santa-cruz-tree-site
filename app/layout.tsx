import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import SiteShell from "@/components/SiteShell";
import ErrorBoundary from "@/components/ErrorBoundary";
import SiteAnalytics from "@/components/SiteAnalytics";
import GlobalErrorTracker from "@/components/GlobalErrorTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://santacruztreepros.com"),
  title: {
    default: "Santa Cruz Tree Pros",
    template: "%s | Santa Cruz Tree Pros",
  },
  description:
    "Tree removal, tree trimming, stump grinding, emergency tree service, and arborist consulting in Santa Cruz County.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[var(--bg-soft)] text-[var(--text)] antialiased">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        {/* Skip to main content — visible on focus for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--brand)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        >
          Skip to main content
        </a>
        <GlobalErrorTracker />
        <ErrorBoundary>
          <SiteShell>{children}</SiteShell>
          <SiteAnalytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}