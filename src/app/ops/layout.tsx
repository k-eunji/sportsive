// src/app/ops/layout.tsx
import React from "react";
import Link from "next/link";

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">
          <span className="text-sm font-semibold">
            Sports Operations
          </span>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/ops" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/ops/schedules" className="hover:text-foreground">
              Schedules
            </Link>
            <Link href="/ops/risk" className="hover:text-foreground">
              Risk & Impact
            </Link>
            <Link href="/ops/reports" className="hover:text-foreground">
              Reports
            </Link>
          </div>
        </nav>
      </header>

      {/* Page body */}
      <div className="relative h-[calc(100vh-56px)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
