import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyEstimateButton from "@/components/StickyEstimateButton";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <StickyEstimateButton />
      </body>
    </html>
  );
}