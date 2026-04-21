import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "CivicSync — Unified Property Transfer Platform",
  description:
    "Digitize and streamline your post-property-purchase ownership transfers across all government departments in one place.",
  keywords: "property transfer, India, GovTech, municipal, ownership, DigiLocker",
  openGraph: {
    title: "CivicSync — Unified Property Transfer",
    description: "One platform for all your property ownership transfer needs.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
