import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KairosCare — Real-time care visibility for home care agencies",
  description:
    "KairosCare gives families real-time visibility into their loved one's home care visits — and helps agencies reduce communication-driven churn.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "KairosCare",
    description:
      "Real-time care visibility for families and home care agencies.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
