// src/components/layout/Header.tsx

'use client';

import Link from 'next/link';
import NotificationBell from '@/components/Notification/NotificationBell';
import { MessageSquare } from 'lucide-react';
import { useMessagePopup } from '@/context/MessagePopupContext';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import useScrollDirection from "@/hooks/useScrollDirection";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Header({ showLogo = false, disableHide = false }) {
  const { user } = useUser();
  const { open: openPopup } = useMessagePopup();

  const rightRef = useRef<HTMLDivElement>(null);
  const [rightWidth, setRightWidth] = useState(40);
  const direction = useScrollDirection();

  const pathname = usePathname() || "";
  const segments = pathname.split("/");
  const isLiveChatRoom = segments.length === 4 && segments[1] === "live";
  const shouldHide = !disableHide && direction === "down";

  if (isLiveChatRoom) return null;

  useEffect(() => {
    if (rightRef.current) setRightWidth(rightRef.current.offsetWidth);
  }, [user]);

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-50
        h-[50px]
        flex items-center justify-between
        px-4
        bg-[var(--background)]
        border-b border-[var(--border)]
        transition-transform duration-300
        ${shouldHide ? "-translate-y-full" : "translate-y-0"}
      `}
    >

      {/* LEFT + MENU */}
      <div style={{ width: rightWidth }} className="flex items-center">
        <PlusMenu />
      </div>

      {/* CENTER LOGO */}
      <Link href="/" className="flex items-center select-none">
        {showLogo && (
          <motion.span
            layoutId="header-logo"
            className="font-extrabold text-[1.55rem] leading-none text-black dark:text-white"
          >
            sp
            <span className="inline-block bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-blue-500 text-transparent bg-clip-text">
              o
            </span>
            rtsive
          </motion.span>
        )}
      </Link>

      {/* RIGHT BUTTONS */}
      <div ref={rightRef} className="flex items-center gap-2">
        {user && <NotificationBell />}

        {user && (
          <button
            onClick={() => openPopup()}
            className="
              relative p-2 rounded-full
              text-[var(--foreground)] hover:text-[var(--primary)]
              transition-colors
            "
          >
            <MessageSquare className="w-[19px] h-[19px]" />
          </button>
        )}
      </div>
    </header>
  );
}


/* --------------------------------------------------------- */
/*                       + MENU COMPONENT                    */
/* --------------------------------------------------------- */

function PlusMenu() {
  const { user, authReady, logout } = useUser();
  const [open, setOpen] = useState(false);
  const router = useRouter(); // 🔥 추가

  if (!authReady) return null;

  const toggle = () => setOpen(!open);

  const handleLogout = async () => {
    await logout();        // Firebase signOut
    setOpen(false);        // 메뉴 닫기
    router.replace("/");  // 🔥 메인으로 이동 (히스토리 깔끔)
  };

  return (
    <div className="relative">
      {/* + BUTTON */}
      <button
        onClick={toggle}
        className="
          w-7 h-7 flex items-center justify-center 
          text-xl font-bold rounded-md
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition
        "
      >
        +
      </button>

      {open && (
        <div className="
          absolute left-0 mt-2 w-36
          bg-white dark:bg-gray-900 
          border border-border rounded-lg shadow-lg
          py-2 z-50
        ">
          {authReady && !user && (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                Login
              </Link>
              <Link href="/auth/register" onClick={() => setOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                Register
              </Link>
            </>
          )}

          {authReady && user && (
            <>
              <Link
                href={`/profile/${user.uid}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                My Page
              </Link>

              <button
                onClick={handleLogout}
                className="
                  w-full text-left px-4 py-2
                  text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800
                "
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
