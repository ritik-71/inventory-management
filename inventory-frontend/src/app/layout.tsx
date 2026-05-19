import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Enterprise Inventory Management",
    template: "%s | Enterprise Inventory",
  },
  description: "Advanced, secure, and highly scalable inventory management portal built with Next.js, Spring Boot, and PostgreSQL. Features real-time notifications, role-based access, and server-side pagination.",
  keywords: ["inventory management", "enterprise dashboard", "spring boot", "next.js", "full-stack", "postgresql", "react"],
  authors: [{ name: "Ritik" }],
  openGraph: {
    title: "Enterprise Inventory Management Platform",
    description: "Full-stack inventory management with real-time analytics, role-based access control, and enterprise-grade security.",
    type: "website",
    locale: "en_US",
    siteName: "Enterprise Inventory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Inventory Management Platform",
    description: "Full-stack inventory management with real-time analytics, role-based access control, and enterprise-grade security.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://inventory-management.vercel.app"),
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
