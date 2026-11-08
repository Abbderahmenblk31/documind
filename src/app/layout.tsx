import type { Metadata } from "next";
import "./globals.css";

/* ── SEO Metadata ───────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "DocuMind - AI Document Analysis",
  description:
    "Upload PDFs and CSVs to get AI-powered insights, summaries, and intelligent Q&A. Analyze your documents in seconds with DocuMind.",
  keywords: ["AI", "document analysis", "PDF", "CSV", "insights", "summary", "Q&A"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
