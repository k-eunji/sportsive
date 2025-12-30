// src/app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./Providers";
import "@/lib/firebase";
import ClientShell from "./ClientShell";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Sportsive",
  description: "Discover sports you can actually attend near you",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="text-foreground antialiased">
        <Providers>

          {/* ⭐ 전역에서 단 한 번만 Google Maps API 로드 */}
          <GoogleMapsProvider>
            <ClientShell>{children}</ClientShell>
          </GoogleMapsProvider>

        </Providers>
      </body>
    </html>
  );
}
