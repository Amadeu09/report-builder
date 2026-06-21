import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font registers @font-face under a hashed name and exposes --font-inter.
// globals.css @theme inline maps --font-report → var(--font-inter) so the
// report always uses the loaded Inter face (preview + print).
// The app UI uses BDO Grotesk (see globals.css @font-face TODO) via --font-sans.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Report Builder — Relats OCF",
  description: "Organisational Carbon Footprint report for Relats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
