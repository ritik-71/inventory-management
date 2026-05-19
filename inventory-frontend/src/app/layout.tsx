import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enterprise Inventory Management",
  description: "Advanced, secure, and highly scalable inventory management portal for modern businesses.",
  keywords: ["inventory", "management", "enterprise", "dashboard", "b2b"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enterprise Runtime Environment Validation
  if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
    console.error("FATAL: NEXT_PUBLIC_API_URL is missing in production environment.");
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
