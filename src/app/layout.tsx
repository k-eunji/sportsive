// src/app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./Providers";
import "@/lib/firebase";
import ClientShell from "./ClientShell";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import { Analytics } from "@vercel/analytics/react";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Sportsive",
  description: "Discover sports you can actually attend near you",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      
      {/* ✅ 여기 */}
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>

      <body className="text-foreground antialiased">
        <Providers>
          <GoogleMapsProvider>
            <ClientShell>{children}</ClientShell>
          </GoogleMapsProvider>
        </Providers>

        <Analytics />
      </body>
    </html>
  );
}