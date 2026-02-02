// src/components/layout/Header.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
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

  const shouldHide = !disableHide && direction === 'down';

  if (isLiveChatRoom) return null;

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-50
        h-[64px]
        flex items-center justify-center
        bg-[var(--background)]
        transition-transform duration-300
        ${shouldHide ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <Link
        href="/"
        aria-label="Sportsive home"
        className="select-none"
      >
        <motion.div
          layoutId="header-logo"
          className="leading-none"
        >
          {/* light */}
          <Image
            src="/icons/header-logo.png"
            alt="Sportsive"
            width={200}
            height={200}
            priority
            className="dark:hidden"
          />

          {/* dark */}
          <Image
            src="/icons/header-logo-dark.png"
            alt="Sportsive"
            width={200}
            height={200}
            priority
            className="hidden dark:block"
          />
        </motion.div>
      </Link>
    </header>
  );
}
