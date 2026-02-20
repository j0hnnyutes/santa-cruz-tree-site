import "./globals.css";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";

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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}