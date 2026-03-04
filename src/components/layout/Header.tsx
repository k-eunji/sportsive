// src/components/layout/Header.tsx

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import useScrollDirection from '@/hooks/useScrollDirection';
import { usePathname } from 'next/navigation';
import { getClientId } from "@/lib/clientId";
import { useRef } from "react";

export default function Header({
  disableHide = false,
}: {
  disableHide?: boolean;
}) {
  const direction = useScrollDirection();
  const pathname = usePathname() || '';
  const clickedRef = useRef(false);

  const shouldHide =
    !disableHide && direction === 'down';

  // 🔥 Active detection (겹침 방지 포함)
  const isDate =
    pathname.startsWith('/date') ||
    pathname.startsWith('/uk/football/') ||
    pathname.startsWith('/uk/sports/') ||
    pathname.startsWith('/uk/london/football/') ||
    pathname.startsWith('/uk/london/sports/');
  const isMonth =
    pathname.startsWith('/reports') ||
    pathname.includes('/month');
  const isSport =
    pathname.startsWith('/sport') ||
    (
      pathname.startsWith('/uk/horse-racing') &&
      !pathname.includes('/month')
    ) ||
    (
      pathname.startsWith('/ireland/horse-racing') &&
      !pathname.includes('/month')
    );
  const isMap = pathname.startsWith('/ops');
  const handleMapSwitch = async () => {
    if (clickedRef.current) return;
    clickedRef.current = true;

    try {
      await fetch('/api/log/map-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: getClientId(),
          pathname,
          referrer: document.referrer || null,
        }),
      });
    } catch {}
  };

  const baseClass =
    "px-3 py-1.5 rounded-full transition cursor-pointer";

  const activeClass =
    "bg-black text-white";

  const inactiveClass =
    "hover:bg-gray-100 hover:text-black text-gray-700";

  const mobileBase =
    "flex-1 text-center py-2 rounded-full transition";

  const mobileActive =
    "bg-black text-white";

  const mobileInactive =
    "hover:bg-gray-100 text-gray-600";

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-50
        bg-white border-b border-gray-200
        transition-transform duration-300
        ${shouldHide ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="max-w-6xl mx-auto px-4">

        {/* Desktop */}
        <div className="hidden md:flex h-[64px] items-center relative">

          {/* Logo */}
          <Link href="/" className="select-none absolute left-0">
            <motion.div layoutId="header-logo">
              <span className="text-xl font-semibold tracking-tight">
                Venue<span className="opacity-60">Scope</span>
              </span>
            </motion.div>
          </Link>

          {/* Nav */}
          <nav className="mx-auto flex items-center gap-10 text-sm font-medium">

            <Link
              href="/date"
              className={`${baseClass} ${isDate ? activeClass : inactiveClass}`}
            >
              By Date
            </Link>

            <Link
              href="/reports"
              className={`${baseClass} ${isMonth ? activeClass : inactiveClass}`}
            >
              By Month
            </Link>

            <Link
              href="/sport"
              className={`${baseClass} ${isSport ? activeClass : inactiveClass}`}
            >
              By Sport
            </Link>

            <Link
              href="/ops"
              onClick={handleMapSwitch}
              className={`${baseClass} ${isMap ? activeClass : inactiveClass}`}
            >
              Map View
            </Link>

          </nav>
        </div>

        {/* Mobile */}
        <div className="md:hidden">

          {/* Logo */}
          <div className="h-[56px] flex items-center justify-center">
            <Link href="/" className="select-none">
              <span className="text-lg font-semibold">
                Venue<span className="opacity-60">Scope</span>
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex justify-between px-4 pb-3 text-sm font-medium">

            <Link
              href="/date"
              className={`${mobileBase} ${isDate ? mobileActive : mobileInactive}`}
            >
              By Date
            </Link>

            <Link
              href="/reports"
              className={`${mobileBase} ${isMonth ? mobileActive : mobileInactive}`}
            >
              By Month
            </Link>

            <Link
              href="/sport"
              className={`${mobileBase} ${isSport ? mobileActive : mobileInactive}`}
            >
              By Sport
            </Link>

            <Link
              href="/ops"
              onClick={handleMapSwitch}
              className={`${mobileBase} ${isMap ? mobileActive : mobileInactive}`}
            >
              Map View
            </Link>

          </nav>
        </div>
      </div>
    </header>
  );
}