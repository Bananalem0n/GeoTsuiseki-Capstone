import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'GeoTsuiseki Dashboard',
    template: '%s | GeoTsuiseki',
  },
  description: "Product Tracking & Partner Management Platform",
  keywords: ['product tracking', 'partner management', 'QR codes', 'inventory'],
  authors: [{ name: 'GeoTsuiseki Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'GeoTsuiseki Dashboard',
    description: 'Product Tracking & Partner Management Platform',
    type: 'website',
    siteName: 'GeoTsuiseki',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
