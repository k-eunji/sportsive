// src/app/layout.tsx

import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Providers from "./Providers";
import "@/lib/firebase";
import ClientShell from "./ClientShell";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import { Analytics } from "@vercel/analytics/react";
import VisitLogger from "@/app/components/tracking/VisitLogger";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* =========================
   METADATA (SEO + GSC)
========================= */
export const metadata: Metadata = {
  title: "VenueScope",
  description: "Map-based operations and scheduling intelligence for sports leagues and event organisers.",
  manifest: "/manifest.json",

  // ✅ Google Search Console verification
  verification: {
    google: "9OtVcxThar95vmRDQTol9vu8rJzHCq4A3EJ2CHn1Gs4",
  },

  openGraph: {
    title: "VenueScope",
    description: "Sports event operations and venue intelligence platform.",
    siteName: "VenueScope",
    type: "website",
  },

};

/* =========================
   VIEWPORT
========================= */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

/* =========================
   ROOT LAYOUT
========================= */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/* =========================
            PWA / MOBILE WEB APP
        ========================= */}

        {/* App icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* ✅ Standard (Chrome / Android / modern browsers) */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ✅ Apple iOS (still required) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>

      <body className="text-foreground antialiased">
        <Providers>
          <GoogleMapsProvider>
            <VisitLogger />
            <ClientShell>{children}</ClientShell>
          </GoogleMapsProvider>
        </Providers>

        {/* =========================
            ANALYTICS
        ========================= */}

        {/* Google Analytics (GA4) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-1WRHN39RC6"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1WRHN39RC6', {
                debug_mode: true,
              });
            `,
          }}
        />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
