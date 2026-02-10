// src/app/ops/layout.tsx

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  const isActive = (href: string) => {
    if (href === "/ops") {
      return pathname === "/ops";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkClass = (href: string) =>
    `
      text-sm transition-colors
      ${
        isActive(href)
          ? "text-foreground font-semibold border-b-2 border-primary"
          : "text-muted-foreground hover:text-foreground"
      }
    `;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">
          <span className="text-sm font-semibold">
            Sports Operations
          </span>

          <div className="flex gap-6 items-center">
            <Link href="/ops" className={linkClass("/ops")}>
              Dashboard
            </Link>
            <Link href="/ops/schedules" className={linkClass("/ops/schedules")}>
              Schedules
            </Link>
            <Link href="/ops/risk" className={linkClass("/ops/risk")}>
              Risk & Impact
            </Link>
            <Link href="/ops/reports" className={linkClass("/ops/reports")}>
              Reports
            </Link>
          </div>
        </nav>
      </header>

      {/* 🔥 스크롤 만들지 말 것 */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
