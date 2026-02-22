// src/components/layout/Header.tsx

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import useScrollDirection from '@/hooks/useScrollDirection';
import { usePathname } from 'next/navigation';

export default function Header({
  disableHide = false,
}: {
  disableHide?: boolean;
}) {
  const direction = useScrollDirection();
  const pathname = usePathname() || '';

  const segments = pathname.split('/');
  const isLiveChatRoom =
    segments.length === 4 && segments[1] === 'live';

  const shouldHide = !disableHide && direction === 'down'
  const isOps = pathname.startsWith('/ops');

  if (isLiveChatRoom) return null;

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-50
        h-[64px]
        flex items-center justify-between
        px-6
        bg-[var(--background)]
        border-b border-black/5 dark:border-white/10
        transition-transform duration-300
        ${shouldHide ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      {/* LEFT */}
      <Link href="/" aria-label="VenueScope home" className="select-none">
        <motion.div layoutId="header-logo">
          <span className="text-lg md:text-xl font-semibold tracking-tight text-black dark:text-white">
            Venue<span className="opacity-60">Scope</span>
          </span>
        </motion.div>
      </Link>

      {/* RIGHT */}
      <Link
        href="/ops"
        className="
          text-sm
          font-medium
          px-5 py-2
          rounded-full
          bg-black text-white
          dark:bg-white dark:text-black
          hover:opacity-90
          transition
        "
      >
        Switch to Map →
      </Link>
    </header>

  );
}
