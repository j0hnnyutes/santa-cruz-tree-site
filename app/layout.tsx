import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import SiteShell from "@/components/SiteShell";
import ErrorBoundary from "@/components/ErrorBoundary";
import SiteAnalytics from "@/components/SiteAnalytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
    <html lang="en">
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
        <ErrorBoundary>
          <SiteShell>{children}</SiteShell>
          <SiteAnalytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}