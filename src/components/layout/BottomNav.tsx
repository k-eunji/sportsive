// src/components/layout/BottomNav.tsx

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import useScrollDirection from "@/hooks/useScrollDirection";


const navItems = (userId: string | null) => [
  { label: "FanHub", icon: "🥅", href: "/fanhub" },
  { label: "Live", icon: "🗣️", href: "/live" },        // 🔄 자리 변경됨
  { label: "Explore", icon: "🔍", href: "/explore" },  // 🔄 자리 변경됨
  { label: "Meetup", icon: "🤝", href: "/meetups" },
  {
    label: "Profile",
    icon: "👤",
    href: userId ? `/profile/${userId}` : "/auth/login",
  },
];

export default function BottomNav() {
  const { user } = useUser();
  const router = useRouter();
  const direction = useScrollDirection();

  const pathname = usePathname() || "";
  const segments = pathname.split("/");

  const isLiveChatRoom = segments.length === 4 && segments[1] === "live";

  if (isLiveChatRoom) return null;

  return (
    <nav
      className={`
        fixed bottom-0 inset-x-0 z-50 h-[58px]
        flex items-center justify-around
        bg-[var(--background)]
        border-t border-[var(--border)]
        transition-transform duration-300
        ${direction === 'down' ? 'translate-y-full' : 'translate-y-0'}
      `}
    >

      {navItems(user?.userId ?? null).map((item) => {
        const active = (pathname ?? "").startsWith(item.href);

        return (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center gap-0.5"
          >
            <span
              className={`
                text-xl transition-colors
                ${
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground)]/70 hover:text-[var(--primary)]"
                }
              `}
            >
              {item.icon}
            </span>
            <span
              className={`
                text-[11px] font-medium
                ${
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground)]/60"
                }
              `}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
